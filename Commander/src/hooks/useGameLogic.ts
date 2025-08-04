import { useState, useCallback, useMemo } from 'react';
import {
  Unit,
  Coordinate,
  BoardLayout,
  BattleReport,
  Team,
  WeatherType,
  GameStateSnapshot,
  MapData,
  Weapon,
  Faction,
  MilitaryBranch,
  UnitCategory
} from '../types';
import {
  loadMapFromJSON,
  calculateReachableTiles,
  coordToString,
  getDistance,
  findPath
} from '../utils/map';
import {
  getWeaponsInRange,
  selectCounterAttackWeapon,
  consumeAmmunition,
  getMaxAttackRange,
  getMinAttackRange
} from '../utils/weapons';
import {
  UNIT_STATS,
  TERRAIN_STATS,
  CITY_HP,
  CITY_HEAL_RATE,
  CAPTURE_DAMAGE_HIGH_HP,
  CAPTURE_DAMAGE_LOW_HP,
  UNIT_HEAL_HP,
  UNIT_HEAL_FUEL_FULL
} from '../config/constants';
import { armyManager } from '../data/units';

// Helper function to check if terrain is capturable
const isCapturableTerrain = (terrain: string): boolean => {
  return terrain === 'City' || terrain === 'Capital' || terrain === 'Airport' || terrain === 'Port';
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
  const [turn, setTurn] = useState<number>(1);
  const [activeTeam, setActiveTeam] = useState<Team>('Blue');
  const [boardLayout, setBoardLayout] = useState<BoardLayout>(new Map());
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [hoveredHex, setHoveredHex] = useState<Coordinate | null>(null);
  const [battleReport, setBattleReport] = useState<BattleReport | null>(null);
  const [winner, setWinner] = useState<Team | null>(null);
  const [weather, setWeather] = useState<WeatherType>('Clear');
  const [weatherDuration, setWeatherDuration] = useState(0);
  const [history, setHistory] = useState<GameStateSnapshot[]>([]);
  const [weaponSelectionState, setWeaponSelectionState] = useState<{
    isOpen: boolean;
    attacker: Unit | null;
    target: Unit | null;
  }>({ isOpen: false, attacker: null, target: null });

  const loadGame = useCallback((mapData: MapData) => {
    const { board, units: loadedUnits } = loadMapFromJSON(mapData);
    setBoardLayout(board);
    setUnits(loadedUnits);
    setTurn(mapData.gameStatus.turn);
    setActiveTeam(mapData.gameStatus.activeTeam);
    setGameState(mapData.gameStatus.gameState as 'playing' | 'gameOver');
    setWinner(mapData.gameStatus.winner);
    setWeather(mapData.gameStatus.weather);
    setWeatherDuration(mapData.gameStatus.weatherDuration);
    setSelectedUnitId(null);
    setBattleReport(null);
    setHistory([]);
  }, []);

  const saveStateToHistory = useCallback(() => {
    const snapshot: GameStateSnapshot = {
      units: JSON.parse(JSON.stringify(units)),
      turn,
      activeTeam,
      selectedUnitId,
    };
    setHistory(prevHistory => [...prevHistory, snapshot]);
  }, [units, turn, activeTeam, selectedUnitId]);

  const selectedUnit = useMemo(() => units.find(u => u.id === selectedUnitId), [units, selectedUnitId]);

  const selectedUnitTile = useMemo(() => {
    if (!selectedUnit) return null;
    return boardLayout.get(coordToString(selectedUnit)) ?? null;
  }, [selectedUnit, boardLayout]);

  const reachableTiles = useMemo(() => {
    if (!selectedUnit || selectedUnit.moved) return [];
    return calculateReachableTiles(
      { x: selectedUnit.x, y: selectedUnit.y }, 
      selectedUnit.movement, 
      selectedUnit.fuel, 
      boardLayout, 
      units, 
      activeTeam
    );
  }, [selectedUnit, boardLayout, units, activeTeam]);

  const attackableTiles = useMemo(() => {
    if (!selectedUnit || selectedUnit.attacked) return [];

    // For units with weapon system, use weapon ranges
    if (selectedUnit.weapons && Array.isArray(selectedUnit.weapons) && selectedUnit.weapons.length > 0) {
      const attackRangeMin = getMinAttackRange(selectedUnit);
      const attackRangeMax = getMaxAttackRange(selectedUnit);
      
      if (attackRangeMax === 0) return []; // No available weapons

      const potentialTargets: Coordinate[] = [];
      for (const [, tile] of Array.from(boardLayout.entries())) {
        const distance = getDistance({ x: selectedUnit.x, y: selectedUnit.y }, tile);
        if (distance >= attackRangeMin && distance <= attackRangeMax) {
          potentialTargets.push(tile);
        }
      }
      return potentialTargets.filter(coord =>
        units.some(u => u.x === coord.x && u.y === coord.y && u.team !== selectedUnit.team)
      );
    }

    // Legacy system for units without weapons (like Infantry)
    const attackRangeMin = selectedUnit.attackRange.min;
    const attackRangeMax = selectedUnit.attackRange.max;

    const potentialTargets: Coordinate[] = [];
    for (const [, tile] of Array.from(boardLayout.entries())) {
      const distance = getDistance({ x: selectedUnit.x, y: selectedUnit.y }, tile);
      if (distance >= attackRangeMin && distance <= attackRangeMax) {
        potentialTargets.push(tile);
      }
    }

    return potentialTargets.filter(coord =>
      units.some(u => u.x === coord.x && u.y === coord.y && u.team !== selectedUnit.team)
    );
  }, [selectedUnit, units, boardLayout]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEndTurn = useCallback(() => {
    const nextTeam = activeTeam === 'Blue' ? 'Red' : 'Blue';
    console.log(`🔄 Turn ending: ${activeTeam} -> ${nextTeam}. Checking healing for ${nextTeam} team units...`);
    
    // Debug: Show all cities on the map
    const cities = Array.from(boardLayout.entries()).filter(([, tile]) => isCapturableTerrain(tile.terrain));
    console.log(`🏙️ Cities on map:`, cities.map(([coord, tile]) => ({
      coord: coord,
      terrain: tile.terrain,
      owner: tile.owner,
      hp: tile.hp
    })));
    
    // Reset unit flags for all units
    const unitsWithReset = units.map(u => ({ ...u, moved: false, attacked: false }));
    
    // Unit healing and resupply logic for the NEXT team (at start of their turn)
    const unitsWithHealing = unitsWithReset.map(u => {
      // Only heal units that belong to the next team (starting their turn)
      if (u.team === nextTeam) {
        const unitTile = boardLayout.get(coordToString(u));
        // Debug: Check healing conditions
        const coordString = coordToString(u);
        const isCityAndOwned = unitTile && isCapturableTerrain(unitTile.terrain) && unitTile.owner === u.team;
        console.log(`🔍 Checking unit ${u.type} (${u.id}) at (${u.x}, ${u.y}) for healing:`, {
          unitTeam: u.team,
          nextTeam: nextTeam,
          coordString: coordString,
          unitTile: unitTile?.terrain || 'NOT_FOUND',
          tileOwner: unitTile?.owner || 'NO_OWNER',
          currentHp: u.hp,
          maxHp: u.maxHp,
          currentFuel: u.fuel,
          maxFuel: UNIT_STATS[u.type].maxFuel,
          UNIT_HEAL_HP: UNIT_HEAL_HP,
          UNIT_HEAL_FUEL_FULL: UNIT_HEAL_FUEL_FULL,
          willHeal: isCityAndOwned,
          healingConditions: {
            isCorrectTeam: u.team === nextTeam,
            hasUnitTile: !!unitTile,
            isCity: isCapturableTerrain(unitTile?.terrain || ''),
            isOwnedByUnit: unitTile?.owner === u.team
          }
        });
        
        if (unitTile && isCapturableTerrain(unitTile.terrain) && unitTile.owner === u.team) {
          // Heal HP by UNIT_HEAL_HP amount, capped at maxHp
          const healedHp = Math.min(u.maxHp, u.hp + UNIT_HEAL_HP);
          // Restore fuel to maximum if UNIT_HEAL_FUEL_FULL is true
          const refueledFuel = UNIT_HEAL_FUEL_FULL ? UNIT_STATS[u.type].maxFuel : u.fuel;
          console.log(`✅ HEALING APPLIED to ${u.type} (${u.id}) at (${u.x}, ${u.y}):`, {
            oldHp: u.hp,
            newHp: healedHp,
            hpChange: healedHp - u.hp,
            oldFuel: u.fuel,
            newFuel: refueledFuel,
            fuelChange: refueledFuel - u.fuel,
            healAmount: UNIT_HEAL_HP,
            maxFuelRestored: UNIT_HEAL_FUEL_FULL
          });
          return { ...u, hp: healedHp, fuel: refueledFuel };
        }
      }
      return u;
    });

    setUnits(unitsWithHealing);
    setActiveTeam(nextTeam);

    const newBoardLayout = new Map(boardLayout);

    // City HP recovery logic
    newBoardLayout.forEach((tile, key) => {
      if (isCapturableTerrain(tile.terrain) && tile.owner !== activeTeam) {
        const newHp = Math.min(tile.maxHp || CITY_HP, (tile.hp || 0) + CITY_HEAL_RATE);
        newBoardLayout.set(key, { ...tile, hp: newHp });
      }
    });

    if (nextTeam === 'Blue') {
      setTurn(t => t + 1);
      // Weather update logic
      const weathers: WeatherType[] = ['Clear', 'Rain', 'HeavyRain'];
      const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
      let newDuration = weatherDuration;
      if (nextWeather === 'Rain') {
        newDuration++;
      } else if (nextWeather === 'HeavyRain') {
        newDuration += 2;
      } else {
        newDuration = 0;
      }
      setWeather(nextWeather);
      setWeatherDuration(newDuration);
      
      // Terrain change logic
      let changed = false;
      if (['Rain', 'HeavyRain'].includes(nextWeather) && newDuration >= 3) {
        newBoardLayout.forEach((tile, key) => {
          if (tile.terrain === 'Plains') {
            newBoardLayout.set(key, { ...tile, terrain: 'Mud' });
            changed = true;
          }
        });
      } else if (nextWeather === 'Clear') {
        newBoardLayout.forEach((tile, key) => {
          if (tile.terrain === 'Mud') {
            newBoardLayout.set(key, { ...tile, terrain: 'Plains' });
            changed = true;
          }
        });
      }
      if (changed) {
        setBoardLayout(newBoardLayout);
      }
    }
    setBoardLayout(newBoardLayout);
    setSelectedUnitId(null);
    checkWinCondition(unitsWithHealing, newBoardLayout);
  }, [activeTeam, units, weather, weatherDuration, boardLayout]);

  const checkWinCondition = useCallback((currentUnits: Unit[], currentBoard: BoardLayout) => {
    const blueUnits = currentUnits.filter(u => u.team === 'Blue');
    const redUnits = currentUnits.filter(u => u.team === 'Red');

    if (redUnits.length === 0) {
      setGameState('gameOver');
      setWinner('Blue');
      return;
    }
    if (blueUnits.length === 0) {
      setGameState('gameOver');
      setWinner('Red');
      return;
    }

    const cities = Array.from(currentBoard.values()).filter(t => isCapturableTerrain(t.terrain));
    const blueCities = cities.filter(c => c.owner === 'Blue').length;
    const redCities = cities.filter(c => c.owner === 'Red').length;

    if (cities.length > 0) {
      if (blueCities === cities.length) {
        setGameState('gameOver');
        setWinner('Blue');
      } else if (redCities === cities.length) {
        setGameState('gameOver');
        setWinner('Red');
      }
    }
  }, []);

  const handleAttack = useCallback((attacker: Unit, defender: Unit) => {
    const attackerTile = boardLayout.get(coordToString(attacker));
    const defenderTile = boardLayout.get(coordToString(defender));

    if (!attackerTile || !defenderTile) return;

    const attackerTerrainStats = TERRAIN_STATS[attackerTile.terrain];
    const defenderTerrainStats = TERRAIN_STATS[defenderTile.terrain];

    const attackPower = (attacker.attackVs?.[defender.unitClass] ?? attacker.attack) + attackerTerrainStats.attackBonus;
    let defensePower = (defender.defenseVs?.[attacker.unitClass] ?? defender.defense) + defenderTerrainStats.defenseBonus;

    if (attacker.type === 'Artillery') {
      defensePower = (defender.defenseVs?.[attacker.unitClass] ?? defender.defense);
    }

    const damage = Math.max(1, attackPower - defensePower);

    const reportText = `${attacker.type} attacks ${defender.type} for ${damage} damage!`;

    setBattleReport({
      attacker,
      defender,
      damage,
      report: reportText,
    });

    let updatedUnits = units.map(u => {
      if (u.id === defender.id) {
        return { ...u, hp: Math.max(0, u.hp - damage) };
      }
      if (u.id === attacker.id) {
        const newXp = Math.min(100, u.xp + damage);
        return { ...u, xp: newXp, attacked: true, moved: true };
      }
      return u;
    });

    updatedUnits = updatedUnits.filter(u => u.hp > 0);

    // Counter-attack logic
    const currentDefender = updatedUnits.find(u => u.id === defender.id);
    if (currentDefender && currentDefender.hp > 0 && currentDefender.canCounterAttack && attacker.type !== 'Artillery') {
      const counterAttackerTile = boardLayout.get(coordToString(currentDefender));
      const counterDefenderTile = boardLayout.get(coordToString(attacker));

      if (counterAttackerTile && counterDefenderTile) {
        const counterAttackerTerrainStats = TERRAIN_STATS[counterAttackerTile.terrain];
        const counterDefenderTerrainStats = TERRAIN_STATS[counterDefenderTile.terrain];

        const counterAttackPower = (currentDefender.attackVs?.[attacker.unitClass] ?? currentDefender.attack) + counterAttackerTerrainStats.attackBonus;
        const counterDefensePower = (attacker.defenseVs?.[currentDefender.unitClass] ?? attacker.defense) + counterDefenderTerrainStats.defenseBonus;

        const counterDamage = Math.max(1, counterAttackPower - counterDefensePower);

        const counterReportText = `\n\nCounter-attack! ${currentDefender.type} attacks ${attacker.type} for ${counterDamage} damage!`;

        setBattleReport(prevReport => ({
          ...prevReport!,
          counterDamage,
          report: prevReport!.report + counterReportText,
        }));

        updatedUnits = updatedUnits.map(u => {
          if (u.id === attacker.id) {
            return { ...u, hp: Math.max(0, u.hp - counterDamage) };
          }
          if (u.id === currentDefender.id) {
            const newXp = Math.min(100, u.xp + counterDamage);
            return { ...u, xp: newXp };
          }
          return u;
        }).filter(u => u.hp > 0);
      }
    }

    setUnits(updatedUnits);
    setSelectedUnitId(null);
    checkWinCondition(updatedUnits, boardLayout);
  }, [boardLayout, units, checkWinCondition]);

  // New weapon-based attack handler  
  const handleAttackWithWeapon = useCallback((attacker: Unit, defender: Unit, weapon: Weapon) => {
    const attackerTile = boardLayout.get(coordToString(attacker));
    const defenderTile = boardLayout.get(coordToString(defender));
    if (!attackerTile || !defenderTile) return;

    const attackerTerrainStats = TERRAIN_STATS[attackerTile.terrain];
    const defenderTerrainStats = TERRAIN_STATS[defenderTile.terrain];
    
    // Use weapon attack power
    const baseAttackPower = weapon.effectiveness?.[defender.unitClass] ?? weapon.attack;
    const attackPower = baseAttackPower + attackerTerrainStats.attackBonus;
    
    let defensePower = (defender.defenseVs?.[attacker.unitClass] ?? defender.defense) + defenderTerrainStats.defenseBonus;
    if (attacker.type === 'Artillery') {
      defensePower = (defender.defenseVs?.[attacker.unitClass] ?? defender.defense);
    }
    
    const damage = Math.max(1, attackPower - defensePower);
    const reportText = `${attacker.type}が${weapon.name}で${defender.type}を攻撃！ ${damage}ダメージ！`;
    
    // Debug logging for HP bug investigation
    console.log('=== ATTACK DEBUG ===');
    console.log('Attack damage calculation:', {
      baseAttackPower: weapon.effectiveness?.[defender.unitClass] ?? weapon.attack,
      attackPower,
      defensePower,
      damage,
      attackerType: attacker.type,
      attackerTeam: attacker.team,
      defenderType: defender.type,
      defenderTeam: defender.team,
      weaponUsed: weapon.name
    });

    setBattleReport({
      attacker,
      defender,
      damage,
      report: reportText,
      weaponUsed: weapon,
    });

    // Update units: consume ammunition and apply damage
    let updatedUnits = units.map(u => {
      if (u.id === defender.id) {
        const newHp = Math.max(0, u.hp - damage);
        console.log('Defender HP update:', {
          oldHp: u.hp,
          damage,
          newHp,
          unitId: u.id,
          unitType: u.type,
          unitTeam: u.team
        });
        return { ...u, hp: newHp };
      }
      if (u.id === attacker.id) {
        const newXp = Math.min(100, u.xp + damage);
        const updatedUnit = consumeAmmunition(u, weapon.id);
        
        // RED ARMY TANK HP BUG INVESTIGATION - Check if ammunition consumption corrupts HP
        if (u.team === 'Red' && u.type === 'Tank') {
          console.error('=== RED ARMY TANK AMMUNITION CONSUMPTION CHECK ===');
          console.error('Tank state during attack:', {
            originalTankHp: u.hp,
            updatedTankHp: updatedUnit.hp,
            hpChanged: u.hp !== updatedUnit.hp,
            weaponUsed: weapon.id,
            originalWeapons: u.weapons?.map(w => ({ id: w.id, ammo: w.ammunition })),
            updatedWeapons: updatedUnit.weapons?.map(w => ({ id: w.id, ammo: w.ammunition }))
          });
          
          // POTENTIAL BUG FIX: Ensure HP is not corrupted during ammunition consumption
          if (updatedUnit.hp !== u.hp) {
            console.error('HP CORRUPTION DETECTED during ammunition consumption!');
            return { ...updatedUnit, hp: u.hp, xp: newXp, attacked: true, moved: true };
          }
        }
        
        console.log('Attacker after ammunition consumption:', {
          originalUnit: u.id,
          originalHp: u.hp,
          updatedUnit: updatedUnit.id,
          updatedHp: updatedUnit.hp,
          weaponUsed: weapon.id,
          weaponsAfter: updatedUnit.weapons?.map(w => ({ id: w.id, ammo: w.ammunition }))
        });
        return { ...updatedUnit, xp: newXp, attacked: true, moved: true };
      }
      return u;
    });
    updatedUnits = updatedUnits.filter(u => u.hp > 0);

    // Counter-attack logic with weapon selection
    const currentDefender = updatedUnits.find(u => u.id === defender.id);
    if (currentDefender && currentDefender.hp > 0 && currentDefender.canCounterAttack && attacker.type !== 'Artillery') {
      const counterWeapon = selectCounterAttackWeapon(currentDefender, attacker);
      
      // Check range constraint for counter-attack
      const counterDistance = getDistance(currentDefender, attacker);
      const canPerformCounterAttack = counterWeapon && 
        counterDistance >= counterWeapon.range.min && 
        counterDistance <= counterWeapon.range.max;
      
      if (canPerformCounterAttack) {
        const counterAttackerTile = boardLayout.get(coordToString(currentDefender));
        const counterDefenderTile = boardLayout.get(coordToString(attacker));
        
        if (counterAttackerTile && counterDefenderTile) {
          const counterAttackerTerrainStats = TERRAIN_STATS[counterAttackerTile.terrain];
          const counterDefenderTerrainStats = TERRAIN_STATS[counterDefenderTile.terrain];
          
          const counterBaseAttackPower = counterWeapon.effectiveness?.[attacker.unitClass] ?? counterWeapon.attack;
          const counterAttackPower = counterBaseAttackPower + counterAttackerTerrainStats.attackBonus;
          const counterDefensePower = (attacker.defenseVs?.[currentDefender.unitClass] ?? attacker.defense) + counterDefenderTerrainStats.defenseBonus;
          const counterDamage = Math.max(1, counterAttackPower - counterDefensePower);
          
          // Debug logging for HP bug investigation
          console.log('=== COUNTER-ATTACK DEBUG ===');
          console.log('Attacker before counter:', {
            id: attacker.id,
            type: attacker.type,
            team: attacker.team,
            hp: attacker.hp,
            maxHp: attacker.maxHp
          });
          console.log('Counter damage calculation:', {
            counterBaseAttackPower,
            counterAttackPower,
            counterDefensePower,
            counterDamage,
            attackerUnit: attacker.unitClass,
            defenderUnit: currentDefender.unitClass
          });
          
          const counterReportText = `\n\n反撃！ ${currentDefender.type}が${counterWeapon.name}で${attacker.type}を攻撃！ ${counterDamage}ダメージ！`;
          
          setBattleReport(prevReport => ({
            ...prevReport!,
            counterDamage,
            report: prevReport!.report + counterReportText,
            counterWeaponUsed: counterWeapon,
          }));
          
          updatedUnits = updatedUnits.map(u => {
            if (u.id === attacker.id) {
              const newHp = Math.max(0, u.hp - counterDamage);
              
              // RED ARMY TANK HP BUG INVESTIGATION
              if (u.team === 'Red' && u.type === 'Tank') {
                console.error('=== RED ARMY TANK HP BUG ALERT ===');
                console.error('Tank HP about to be updated:', {
                  tankId: u.id,
                  originalHp: u.hp,
                  maxHp: u.maxHp,
                  counterDamage,
                  calculatedNewHp: newHp,
                  counterWeaponUsed: counterWeapon?.name,
                  counterAttackPower,
                  counterDefensePower,
                  attackerUnit: attacker.unitClass,
                  defenderUnit: currentDefender.unitClass
                });
                
                // POTENTIAL BUG FIX: Prevent HP from dropping too drastically
                if (counterDamage > u.hp - 1 && u.hp > 1) {
                  console.error('SUSPICIOUS DAMAGE DETECTED - Capping damage to prevent HP=1 bug');
                  const safeDamage = Math.min(counterDamage, u.hp - 2);
                  const safeNewHp = Math.max(1, u.hp - safeDamage);
                  console.error('Applying safe damage:', {
                    originalDamage: counterDamage,
                    safeDamage,
                    safeNewHp
                  });
                  return { ...u, hp: safeNewHp };
                }
              }
              
              console.log('Attacker HP update:', {
                oldHp: u.hp,
                counterDamage,
                newHp,
                unitId: u.id,
                unitType: u.type,
                unitTeam: u.team
              });
              return { ...u, hp: newHp };
            }
            if (u.id === currentDefender.id) {
              const newXp = Math.min(100, u.xp + counterDamage);
              const updatedUnit = consumeAmmunition(u, counterWeapon.id);
              console.log('Defender after counter-attack ammunition consumption:', {
                originalUnit: u.id,
                updatedUnit: updatedUnit.id,
                weaponUsed: counterWeapon.id,
                weaponsAfter: updatedUnit.weapons?.map(w => ({ id: w.id, ammo: w.ammunition }))
              });
              return { ...updatedUnit, xp: newXp };
            }
            return u;
          }).filter(u => u.hp > 0);
          console.log('=== END COUNTER-ATTACK DEBUG ===');
        }
      }
    }

    setUnits(updatedUnits);
    setSelectedUnitId(null);
    checkWinCondition(updatedUnits, boardLayout);
  }, [boardLayout, units, checkWinCondition]);

  // Weapon selection handlers
  const handleWeaponSelect = useCallback((weapon: Weapon) => {
    if (weaponSelectionState.attacker && weaponSelectionState.target) {
      handleAttackWithWeapon(weaponSelectionState.attacker, weaponSelectionState.target, weapon);
      setWeaponSelectionState({ isOpen: false, attacker: null, target: null });
    }
  }, [weaponSelectionState, handleAttackWithWeapon]);

  const handleWeaponSelectionClose = useCallback(() => {
    setWeaponSelectionState({ isOpen: false, attacker: null, target: null });
  }, []);

  const handleHexClick = useCallback((coord: Coordinate) => {
    if (gameState === 'gameOver') return;

    const unitOnHex = units.find(u => u.x === coord.x && u.y === coord.y);

    if (selectedUnit) {
      if (unitOnHex && unitOnHex.id === selectedUnit.id) {
        setSelectedUnitId(null);
        return;
      }

      const isAttackable = attackableTiles.some(t => t.x === coord.x && t.y === coord.y);
      if (isAttackable && unitOnHex && unitOnHex.team !== selectedUnit.team) {
        saveStateToHistory();
        
        // Check if unit has weapons and handle weapon selection
        if (selectedUnit.weapons && Array.isArray(selectedUnit.weapons) && selectedUnit.weapons.length > 0) {
          const distance = getDistance(selectedUnit, unitOnHex);
          const availableWeapons = getWeaponsInRange(selectedUnit, distance);
          
          if (availableWeapons.length === 0) {
            console.warn('No weapons available for attack');
            return;
          } else {
            // Always show weapon selection modal regardless of weapon count - this is the core gameplay feature
            if (selectedUnit.team === activeTeam) {
              setWeaponSelectionState({
                isOpen: true,
                attacker: selectedUnit,
                target: unitOnHex
              });
              return;
            } else {
              // For AI/non-active team, use first available weapon as fallback
              handleAttackWithWeapon(selectedUnit, unitOnHex, availableWeapons[0]);
              return;
            }
          }
        } else {
          // Legacy attack for units without weapons
          handleAttack(selectedUnit, unitOnHex);
        }
        return;
      }

      const isReachable = reachableTiles.some(t => t.x === coord.x && t.y === coord.y);
      if (isReachable && !unitOnHex) {
        saveStateToHistory();
        const path = findPath(selectedUnit, coord, boardLayout, units, activeTeam);
        let fuelCost = 0;
        if (path && path.length > 1) {
          for (let i = 1; i < path.length; i++) {
            const tileCoord = path[i];
            const tileKey = coordToString(tileCoord);
            const tile = boardLayout.get(tileKey);
            if (tile) {
              const terrainStats = TERRAIN_STATS[tile.terrain];
              const moveCost = terrainStats.movementCost[selectedUnit.type] ?? terrainStats.movementCost.default;
              if (moveCost !== Infinity) {
                fuelCost += moveCost;
              }
            }
          }
        }
        
        // Artillery cannot attack after moving
        const updatedUnit = selectedUnit.type === 'Artillery' 
          ? { ...selectedUnit, ...coord, moved: true, attacked: true, fuel: selectedUnit.fuel - fuelCost }
          : { ...selectedUnit, ...coord, moved: true, fuel: selectedUnit.fuel - fuelCost };
        
        setUnits(units.map(u => u.id === selectedUnit.id ? updatedUnit : u));
        return;
      }

      setSelectedUnitId(null);
    } else {
      if (unitOnHex && unitOnHex.team === activeTeam && !unitOnHex.moved && !unitOnHex.attacked) {
        setSelectedUnitId(unitOnHex.id);
      }
    }
  }, [gameState, units, selectedUnit, activeTeam, reachableTiles, attackableTiles, handleAttack, handleAttackWithWeapon, saveStateToHistory, boardLayout]);

  const handleAction = useCallback((action: 'wait' | 'undo' | 'capture') => {
    if (!selectedUnit) return;

    if (action === 'wait') {
      saveStateToHistory();
      setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, moved: true, attacked: true } : u));
      setSelectedUnitId(null);
    } else if (action === 'capture') {
      if (selectedUnit.unitClass === 'Infantry' && selectedUnitTile && isCapturableTerrain(selectedUnitTile.terrain)) {
        saveStateToHistory();
        const newBoardLayout = new Map(boardLayout);
        const tileKey = coordToString(selectedUnit);
        const currentTile = newBoardLayout.get(tileKey);

        if (currentTile && currentTile.hp && currentTile.hp > 0) {
          const damageRange = selectedUnit.hp > selectedUnit.maxHp / 2 ? CAPTURE_DAMAGE_HIGH_HP : CAPTURE_DAMAGE_LOW_HP;
          const damage = Math.floor(Math.random() * (damageRange.max - damageRange.min + 1)) + damageRange.min;
          const newHp = Math.max(0, currentTile.hp - damage);

          if (newHp === 0) {
            newBoardLayout.set(tileKey, { ...currentTile, hp: CITY_HP, owner: selectedUnit.team });
          } else {
            newBoardLayout.set(tileKey, { ...currentTile, hp: newHp });
          }
          setBoardLayout(newBoardLayout);
        }
        setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, moved: true, attacked: true } : u));
        setSelectedUnitId(null);
      }
    } else if (action === 'undo') {
      if (history.length > 0) {
        const lastState = history[history.length - 1];
        setUnits(lastState.units);
        setTurn(lastState.turn);
        setActiveTeam(lastState.activeTeam);
        setSelectedUnitId(lastState.selectedUnitId);
        setHistory(prevHistory => prevHistory.slice(0, -1));
      }
    }
  }, [selectedUnit, selectedUnitTile, units, boardLayout, history, saveStateToHistory]);

  // Army organization related functions
  const getUnitsByBranch = useCallback((faction: Faction, branch: MilitaryBranch): Unit[] => {
    return units.filter(unit => unit.faction === faction && unit.branch === branch);
  }, [units]);

  const getUnitsByCategory = useCallback((faction: Faction, category: UnitCategory): Unit[] => {
    return units.filter(unit => unit.faction === faction && unit.category === category);
  }, [units]);

  const getAvailableUnitsFromArmy = useCallback((faction: Faction, branch?: MilitaryBranch, category?: UnitCategory) => {
    return armyManager.getUnitTemplatesBy(faction, branch, category);
  }, []);

  const createUnitFromArmy = useCallback((templateId: string, instanceId: string, x: number, y: number): Unit | null => {
    return armyManager.createUnitFromTemplate(templateId, instanceId, x, y);
  }, []);

  const getBranchesFor = useCallback((faction: Faction): MilitaryBranch[] => {
    return armyManager.getBranches(faction);
  }, []);

  const getCategoriesFor = useCallback((faction: Faction, branch: MilitaryBranch): UnitCategory[] => {
    return armyManager.getCategories(faction, branch);
  }, []);

  const getCommandStructure = useCallback(() => {
    return armyManager.getCommandStructure();
  }, []);

  // Calculate command bonuses for units in proximity
  const calculateCommandBonus = useCallback((unit: Unit): { attack: number; defense: number } => {
    const commandStructure = getCommandStructure();
    const sameUnitBonus = commandStructure.bonuses['同一師団'];
    const commanderBonus = commandStructure.bonuses['指揮官効果'];
    
    // Count nearby same-faction units (simplified implementation)
    const nearbyUnits = units.filter(u => 
      u.faction === unit.faction && 
      u.id !== unit.id &&
      getDistance({x: u.x, y: u.y}, {x: unit.x, y: unit.y}) <= (commanderBonus.範囲 || 2)
    );

    let attackBonus = 0;
    let defenseBonus = 0;

    if (nearbyUnits.length > 0) {
      // Same unit type bonus
      const sameTypeUnits = nearbyUnits.filter(u => u.type === unit.type);
      if (sameTypeUnits.length > 0) {
        attackBonus += sameUnitBonus?.attack || 0;
        defenseBonus += sameUnitBonus?.defense || 0;
      }

      // Commander effect (simplified)
      attackBonus += commanderBonus?.効果 || 0;
      defenseBonus += commanderBonus?.効果 || 0;
    }

    return { attack: attackBonus, defense: defenseBonus };
  }, [units, getCommandStructure]);

  return {
    // Existing properties
    gameState,
    turn,
    activeTeam,
    boardLayout,
    units,
    selectedUnit,
    selectedUnitId,
    hoveredHex,
    battleReport,
    winner,
    weather,
    reachableTiles,
    attackableTiles,
    selectedUnitTile,
    loadGame,
    handleEndTurn,
    handleHexClick,
    handleAction,
    setHoveredHex,
    setBattleReport,
    weaponSelectionState,
    handleWeaponSelect,
    handleWeaponSelectionClose,
    
    // New army organization features
    getUnitsByBranch,
    getUnitsByCategory,
    getAvailableUnitsFromArmy,
    createUnitFromArmy,
    getBranchesFor,
    getCategoriesFor,
    getCommandStructure,
    calculateCommandBonus,
  };
};