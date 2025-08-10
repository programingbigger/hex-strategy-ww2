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
  UnitCategory,
  VictoryCondition,
  VictoryResult,
  Tile,
  UnitType,
  BattleLogEntry,
  BattleLogState,
  TerrainType
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
import { log, logError, logInfo } from '../utils/logger';
import { logBattle } from '../utils/debugLogger';

// Helper function to check if terrain is capturable
const isCapturableTerrain = (terrain: string): boolean => {
  return terrain === 'City' || terrain === 'Capital' || terrain === 'Airport' || terrain === 'Port';
};;

// ユニット補給が可能な地形かどうかを判定（CityとCapitalのみ）
const isSupplyTerrain = (terrain: string): boolean => {
  return terrain === 'City' || terrain === 'Capital';
};
// 首都識別関数の拡張
const isCapitalTerrain = (terrain: string): boolean => {
  return terrain === 'Capital';
};

const getCapitals = (board: BoardLayout): Tile[] => {
  return Array.from(board.values()).filter(t => isCapitalTerrain(t.terrain));
};

const getCapitalsForTeam = (board: BoardLayout, team: Team): Tile[] => {
  return getCapitals(board).filter(c => c.owner === team);
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
  const [victoryResult, setVictoryResult] = useState<VictoryResult | null>(null);
  const [turnLimit, setTurnLimit] = useState<number | undefined>(undefined);
  const [attackingTeam, setAttackingTeam] = useState<Team>('Blue');
  const [defendingTeam, setDefendingTeam] = useState<Team>('Red');
  const [enabledVictoryConditions, setEnabledVictoryConditions] = useState<VictoryCondition[]>([
    'unit_elimination', 'capital_capture', 'city_capture'
  ]);
  const [weather, setWeather] = useState<WeatherType>('Clear');
  const [weatherDuration, setWeatherDuration] = useState(0);
  const [history, setHistory] = useState<GameStateSnapshot[]>([]);
  const [weaponSelectionState, setWeaponSelectionState] = useState<{
    isOpen: boolean;
    attacker: Unit | null;
    target: Unit | null;
  }>({ isOpen: false, attacker: null, target: null });

  // 🎯 Battle Log State
  const [battleLog, setBattleLog] = useState<BattleLogState>({
    entries: [],
    maxEntries: 50,
    isVisible: true,
    autoScroll: true
  });

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
    
    // Load new victory system settings
    setTurnLimit(mapData.gameStatus.turnLimit);
    setAttackingTeam(mapData.gameStatus.attackingTeam || 'Blue');
    setDefendingTeam(mapData.gameStatus.defendingTeam || 'Red');
    setEnabledVictoryConditions(mapData.gameStatus.enabledVictoryConditions || [
      'unit_elimination', 'capital_capture', 'city_capture'
    ]);
    
    setSelectedUnitId(null);
    setBattleReport(null);
    setVictoryResult(null);
    setHistory([]);
    
    // 🎯 Clear battle log when loading new game
    setBattleLog(prev => ({ ...prev, entries: [] }));
    logBattle('🎮 New game loaded - Battle log cleared');
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

  // 🎯 Battle Log Entry Generation
  const createBattleLogEntry = useCallback((
    attacker: Unit,
    defender: Unit,
    weapon: Weapon | null,
    damage: number,
    counterAttack?: {
      weapon: Weapon;
      damage: number;
      unitDestroyed?: boolean;
    }
  ): BattleLogEntry => {
    const defenderTile = boardLayout.get(coordToString(defender));
    
    const currentPhase: 'Player Phase' | 'Enemy Phase' = activeTeam === 'Blue' ? 'Player Phase' : 'Enemy Phase';
    
    logBattle(`🎯 Creating battle log entry: ${attacker.type} vs ${defender.type}`, {
      attackerTeam: attacker.team,
      defenderTeam: defender.team,
      damage,
      weaponUsed: weapon?.name || 'Legacy Attack',
      counterAttack: counterAttack ? counterAttack.weapon.name : 'None'
    });

    const entry: BattleLogEntry = {
      id: `battle-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      turn,
      phase: currentPhase,
      timestamp: new Date(),
      attacker: {
        team: attacker.team,
        unitName: attacker.name || attacker.type,
        unitType: attacker.type,
        hpBefore: attacker.hp,
        hpAfter: Math.max(0, attacker.hp - (counterAttack?.damage || 0)),
        position: { x: attacker.x, y: attacker.y }
      },
      defender: {
        team: defender.team,
        unitName: defender.name || defender.type,
        unitType: defender.type,
        hpBefore: defender.hp,
        hpAfter: Math.max(0, defender.hp - damage),
        position: { x: defender.x, y: defender.y }
      },
      location: {
        hex: { x: defender.x, y: defender.y },
        terrain: defenderTile?.terrain as TerrainType || 'Plains',
        defenseBonus: defenderTile ? TERRAIN_STATS[defenderTile.terrain]?.defenseBonus : 0
      },
      weapon: {
        name: weapon?.name || 'Legacy Attack',
        type: weapon?.type || '37mm主砲'
      },
      result: {
        damageDealt: damage,
        damageTaken: counterAttack?.damage || 0,
        unitDestroyed: (defender.hp - damage) <= 0
      },
      counterAttack: counterAttack ? {
        weapon: {
          name: counterAttack.weapon.name,
          type: counterAttack.weapon.type
        },
        damageDealt: counterAttack.damage,
        damageTaken: damage,
        unitDestroyed: (attacker.hp - counterAttack.damage) <= 0
      } : undefined
    };

    return entry;
  }, [boardLayout, turn, activeTeam]);

  // 🎯 Add Battle Log Entry
  const addBattleLogEntry = useCallback((entry: BattleLogEntry) => {
    setBattleLog(prevLog => {
      const newEntries = [...prevLog.entries, entry];
      
      // Limit entries to maxEntries
      if (newEntries.length > prevLog.maxEntries) {
        newEntries.shift(); // Remove oldest entry
      }
      
      logBattle(`📝 Added battle log entry (${newEntries.length}/${prevLog.maxEntries})`);
      
      return {
        ...prevLog,
        entries: newEntries
      };
    });
  }, []);

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
    const cities = Array.from(boardLayout.entries()).filter(([, tile]) => isSupplyTerrain(tile.terrain));
    console.log(`🏙️ Cities on map:`, cities.map(([coord, tile]) => ({
      coord: coord,
      terrain: tile.terrain,
      owner: tile.owner,
      hp: tile.hp
    })));
    
    // Reset unit flags for all units
    const unitsWithReset = units.map(u => ({ ...u, moved: false, attacked: false }));
    
    // Unit healing and resupply logic for the NEXT team (at start of their turn) - COMPLETELY REWRITTEN
    const unitsWithHealing = unitsWithReset.map(u => {
      // Only process units that belong to the next team (starting their turn)
      if (u.team !== nextTeam) {
        return u; // Skip units from other teams
      }

      const unitTile = boardLayout.get(coordToString(u));
      
      // STRICT SUPPLY CONDITIONS:
      // 1. Tile must exist
      // 2. Tile must be City or Capital ONLY
      // 3. Tile must be owned by the same team as the unit
      // 4. Owner must not be undefined or null
      
      const hasValidTile = unitTile !== undefined;
      const isValidSupplyTerrain = hasValidTile && (unitTile.terrain === 'City' || unitTile.terrain === 'Capital');
      const hasValidOwner = hasValidTile && unitTile.owner !== undefined && unitTile.owner !== null;
      const isOwnedByUnitTeam = hasValidOwner && unitTile.owner === u.team;
      
      const canReceiveSupply = hasValidTile && isValidSupplyTerrain && hasValidOwner && isOwnedByUnitTeam;
      
      // DETAILED LOGGING FOR DEBUGGING
      log(`🔍 SUPPLY CHECK for ${u.type}(${u.id}) at (${u.x},${u.y}) team=${u.team}:`);
      log(`   - Tile exists: ${hasValidTile} (${unitTile?.terrain || 'NONE'})`);
      log(`   - Is supply terrain: ${isValidSupplyTerrain} (City/Capital only)`);
      log(`   - Has valid owner: ${hasValidOwner} (owner: ${unitTile?.owner})`);
      log(`   - Owned by unit team: ${isOwnedByUnitTeam}`);
      log(`   - ✅ FINAL RESULT: ${canReceiveSupply ? 'SUPPLY GRANTED' : 'SUPPLY DENIED'}`);
      
      if (canReceiveSupply) {
        // Check if unit is land-based (Infantry or Vehicle only - no Aircraft)
        const isLandUnit = u.unitClass === 'Infantry' || u.unitClass === 'Vehicle';
        
        if (!isLandUnit) {
          log(`❌ SUPPLY DENIED for ${u.type}(${u.id}): AIRCRAFT_NOT_SUPPORTED`);
          return u; // Aircraft cannot be resupplied by cities
        }
        
        // Apply supply operations for land units only
        const originalHp = u.hp;
        const originalFuel = u.fuel;
        
        // HP healing (only if needed)
        const needsHealing = u.hp < u.maxHp;
        const newHp = needsHealing ? Math.min(u.maxHp, u.hp + UNIT_HEAL_HP) : u.hp;
        
        // Fuel resupply (only if needed)
        const maxFuel = UNIT_STATS[u.type]?.maxFuel || 60;
        const needsFuel = u.fuel < maxFuel;
        const newFuel = needsFuel ? maxFuel : u.fuel;
        
        // Ammunition resupply (only if needed) - NEW FEATURE
        let resuppliedWeapons = u.weapons;
        let ammunitionResupplied = false;
        
        if (u.weapons && Array.isArray(u.weapons)) {
          resuppliedWeapons = u.weapons.map(weapon => {
            if (weapon.ammunition < weapon.maxAmmunition) {
              ammunitionResupplied = true;
              return { ...weapon, ammunition: weapon.maxAmmunition };
            }
            return weapon;
          });
        }
        
        const suppliedUnit = {
          ...u,
          hp: newHp,
          fuel: newFuel,
          weapons: resuppliedWeapons
        };
        
        // Log supply results
        log(`🚛 SUPPLY APPLIED to ${u.type}(${u.id}):`);
        log(`   HP: ${originalHp} → ${newHp} (${needsHealing ? 'HEALED' : 'NO CHANGE'})`);
        log(`   Fuel: ${originalFuel} → ${newFuel} (${needsFuel ? 'RESUPPLIED' : 'NO CHANGE'})`);
        log(`   Ammunition: ${ammunitionResupplied ? 'RESUPPLIED' : 'NO CHANGE'}`);
        
        return suppliedUnit;
      } else {
        // Log why supply was denied
        const reason = !hasValidTile ? 'TILE_NOT_FOUND' :
                      !isValidSupplyTerrain ? `INVALID_TERRAIN(${unitTile.terrain})` :
                      !hasValidOwner ? `INVALID_OWNER(${unitTile.owner})` :
                      !isOwnedByUnitTeam ? `OWNER_MISMATCH(${unitTile.owner}≠${u.team})` :
                      'UNKNOWN';
        
        log(`❌ SUPPLY DENIED for ${u.type}(${u.id}): ${reason}`);
        return u; // Return unit unchanged
      }
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
      const newTurn = turn + 1;
      setTurn(newTurn);
      
      // ターン制限チェック（最低優先度）
      if (turnLimit && newTurn > turnLimit) {
        setGameState('gameOver');
        // 攻め側が制限ターンで負け、守り側が勝利
        const winner = defendingTeam || 'Red'; // デフォルト：Red軍が守り側
        setWinner(winner);
        setVictoryResult({
          condition: 'turn_limit',
          winner: winner,
          description: `Turn limit reached (${turnLimit} turns). Defending team wins.`,
          turnsElapsed: newTurn
        });
        return;
      }
      
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
  }, [activeTeam, units, weather, weatherDuration, boardLayout, turn, turnLimit, defendingTeam]);

  const checkWinCondition = useCallback((currentUnits: Unit[], currentBoard: BoardLayout) => {
    const blueUnits = currentUnits.filter(u => u.team === 'Blue');
    const redUnits = currentUnits.filter(u => u.team === 'Red');

    // 1. 敵軍全滅チェック（最高優先度）
    if (redUnits.length === 0) {
      setGameState('gameOver');
      setWinner('Blue');
      setVictoryResult({
        condition: 'unit_elimination',
        winner: 'Blue',
        description: 'All Red units eliminated',
        turnsElapsed: turn
      });
      return;
    }
    if (blueUnits.length === 0) {
      setGameState('gameOver');
      setWinner('Red');
      setVictoryResult({
        condition: 'unit_elimination',
        winner: 'Red',
        description: 'All Blue units eliminated',
        turnsElapsed: turn
      });
      return;
    }

    // 2. 首都占領チェック（高優先度）
    const capitals = Array.from(currentBoard.values()).filter(t => t.terrain === 'Capital');
    if (capitals.length > 0) {
      const blueCapitals = capitals.filter(c => c.owner === 'Blue');
      const redCapitals = capitals.filter(c => c.owner === 'Red');
      
      // すべての首都をBlueが占領
      if (blueCapitals.length === capitals.length && capitals.length > 0) {
        setGameState('gameOver');
        setWinner('Blue');
        setVictoryResult({
          condition: 'capital_capture',
          winner: 'Blue',
          description: `All ${capitals.length} capital(s) captured`,
          turnsElapsed: turn
        });
        return;
      } 
      // すべての首都をRedが占領
      else if (redCapitals.length === capitals.length && capitals.length > 0) {
        setGameState('gameOver');
        setWinner('Red');
        setVictoryResult({
          condition: 'capital_capture',
          winner: 'Red',
          description: `All ${capitals.length} capital(s) captured`,
          turnsElapsed: turn
        });
        return;
      }
    }

    // 3. 全都市占領チェック（中優先度）
    const cities = Array.from(currentBoard.values()).filter(t => isCapturableTerrain(t.terrain));
    const blueCities = cities.filter(c => c.owner === 'Blue').length;
    const redCities = cities.filter(c => c.owner === 'Red').length;

    if (cities.length > 0) {
      if (blueCities === cities.length) {
        setGameState('gameOver');
        setWinner('Blue');
        setVictoryResult({
          condition: 'city_capture',
          winner: 'Blue',
          description: `All ${cities.length} capturable terrain(s) occupied`,
          turnsElapsed: turn
        });
      } else if (redCities === cities.length) {
        setGameState('gameOver');
        setWinner('Red');
        setVictoryResult({
          condition: 'city_capture',
          winner: 'Red',
          description: `All ${cities.length} capturable terrain(s) occupied`,
          turnsElapsed: turn
        });
      }
    }

    // 4. ターン制限チェックは handleEndTurn 関数内で実装
  }, [turn, setGameState, setWinner, setVictoryResult]);;

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
        return safeUpdateUnitHP(u, u.hp - damage, 'combat');
      }
      if (u.id === attacker.id) {
        const newXp = Math.min(100, u.xp + damage);
        return { ...u, xp: newXp, attacked: true, moved: true };
      }
      return u;
    });

    updatedUnits = updatedUnits.filter(u => u.hp > 0);

    // Counter-attack logic
    let counterAttackData: {
      weapon: Weapon;
      damage: number;
      unitDestroyed?: boolean;
    } | undefined;

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

        // Create legacy weapon for counter-attack logging
        const legacyCounterWeapon: Weapon = {
          id: 'legacy-counter',
          name: `${currentDefender.type} Counter-Attack`,
          type: '37mm主砲',
          ammunition: 1,
          maxAmmunition: 1,
          range: { min: 1, max: 1 },
          attack: currentDefender.attack
        };

        counterAttackData = {
          weapon: legacyCounterWeapon,
          damage: counterDamage,
          unitDestroyed: (attacker.hp - counterDamage) <= 0
        };

        const counterReportText = `

Counter-attack! ${currentDefender.type} attacks ${attacker.type} for ${counterDamage} damage!`;

        setBattleReport(prevReport => ({
          ...prevReport!,
          counterDamage,
          report: prevReport!.report + counterReportText,
        }));

        updatedUnits = updatedUnits.map(u => {
          if (u.id === attacker.id) {
            return safeUpdateUnitHP(u, u.hp - counterDamage, 'combat');
          }
          if (u.id === currentDefender.id) {
            const newXp = Math.min(100, u.xp + counterDamage);
            return { ...u, xp: newXp };
          }
          return u;
        }).filter(u => u.hp > 0);
      }
    }

    // 🎯 Generate Battle Log Entry
    const legacyWeapon: Weapon = {
      id: 'legacy-attack',
      name: `${attacker.type} Attack`,
      type: '37mm主砲',
      ammunition: 1,
      maxAmmunition: 1,
      range: { min: 1, max: 1 },
      attack: attacker.attack
    };

    const battleLogEntry = createBattleLogEntry(
      attacker,
      defender,
      legacyWeapon,
      damage,
      counterAttackData
    );

    addBattleLogEntry(battleLogEntry);

    setUnits(updatedUnits);
    setSelectedUnitId(null);
    checkWinCondition(updatedUnits, boardLayout);
  }, [boardLayout, units, checkWinCondition, createBattleLogEntry, addBattleLogEntry]);

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
        const updatedUnit = safeUpdateUnitHP(u, u.hp - damage, 'combat');
        console.log('Defender HP update:', {
          oldHp: u.hp,
          damage,
          newHp: updatedUnit.hp,
          unitId: u.id,
          unitType: u.type,
          unitTeam: u.team
        });
        return updatedUnit;
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

    // 🎯 Counter-attack data tracking
    let counterAttackData: {
      weapon: Weapon;
      damage: number;
      unitDestroyed?: boolean;
    } | undefined;

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
          
          // 🎯 Store counter-attack data for battle log
          counterAttackData = {
            weapon: counterWeapon,
            damage: counterDamage,
            unitDestroyed: (attacker.hp - counterDamage) <= 0
          };
          
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
          
          const counterReportText = `

反撃！ ${currentDefender.type}が${counterWeapon.name}で${attacker.type}を攻撃！ ${counterDamage}ダメージ！`;
          
          setBattleReport(prevReport => ({
            ...prevReport!,
            counterDamage,
            report: prevReport!.report + counterReportText,
            counterWeaponUsed: counterWeapon,
          }));
          
          updatedUnits = updatedUnits.map(u => {
            if (u.id === attacker.id) {
              const updatedUnit = safeUpdateUnitHP(u, u.hp - counterDamage, 'combat');
              
              // RED ARMY TANK HP BUG INVESTIGATION
              if (u.team === 'Red' && u.type === 'Tank') {
                console.error('=== RED ARMY TANK HP BUG ALERT ===');
                console.error('Tank HP about to be updated:', {
                  tankId: u.id,
                  originalHp: u.hp,
                  maxHp: u.maxHp,
                  counterDamage,
                  calculatedNewHp: updatedUnit.hp,
                  counterWeaponUsed: counterWeapon?.name,
                  counterAttackPower,
                  counterDefensePower,
                  attackerUnit: attacker.unitClass,
                  defenderUnit: currentDefender.unitClass
                });
              }
              
              console.log('Attacker HP update:', {
                oldHp: u.hp,
                counterDamage,
                newHp: updatedUnit.hp,
                unitId: u.id,
                unitType: u.type,
                unitTeam: u.team
              });
              return updatedUnit;
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

    // 🎯 Generate Battle Log Entry
    const battleLogEntry = createBattleLogEntry(
      attacker,
      defender,
      weapon,
      damage,
      counterAttackData
    );

    addBattleLogEntry(battleLogEntry);

    setUnits(updatedUnits);
    setSelectedUnitId(null);
    checkWinCondition(updatedUnits, boardLayout);
  }, [boardLayout, units, checkWinCondition, createBattleLogEntry, addBattleLogEntry]);

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
        
        // HP CORRUPTION DEBUG - Log unit state BEFORE movement
        logError('🚚 UNIT MOVEMENT DEBUG - BEFORE:');
        logError('Selected unit state:', {
          id: selectedUnit.id,
          type: selectedUnit.type,
          team: selectedUnit.team,
          hp: selectedUnit.hp,
          maxHp: selectedUnit.maxHp,
          position: { x: selectedUnit.x, y: selectedUnit.y },
          targetPosition: coord,
          fuel: selectedUnit.fuel,
          maxFuel: selectedUnit.maxFuel
        });
        
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
          ? { ...selectedUnit, x: coord.x, y: coord.y, moved: true, attacked: true, fuel: selectedUnit.fuel - fuelCost }
          : { ...selectedUnit, x: coord.x, y: coord.y, moved: true, fuel: selectedUnit.fuel - fuelCost };
        
        // HP CORRUPTION DEBUG - Log unit state AFTER creation but BEFORE setState
        logError('🚚 UNIT MOVEMENT DEBUG - AFTER updatedUnit creation:');
        logError('Updated unit state:', {
          id: updatedUnit.id,
          type: updatedUnit.type,
          team: updatedUnit.team,
          hp: updatedUnit.hp,
          maxHp: updatedUnit.maxHp,
          position: { x: updatedUnit.x, y: updatedUnit.y },
          fuel: updatedUnit.fuel,
          maxFuel: updatedUnit.maxFuel,
          moved: updatedUnit.moved,
          attacked: updatedUnit.attacked
        });
        
        // Additional check: Verify destination tile terrain
        const destinationTile = boardLayout.get(coordToString(coord));
        logError('🏙️ DESTINATION TILE INFO:', {
          coord: coord,
          tile: destinationTile,
          terrain: destinationTile?.terrain,
          owner: destinationTile?.owner,
          hp: destinationTile?.hp
        });
        
        // HP CORRUPTION FIX: Only copy position coordinates, not tile properties
        // The fix above ensures unit stats (hp, maxHp) are never overwritten by tile data
        
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
    
    // 🎯 Battle Log System
    battleLog,
    setBattleLog,
    
    // New army organization features
    getUnitsByBranch,
    getUnitsByCategory,
    getAvailableUnitsFromArmy,
    createUnitFromArmy,
    getBranchesFor,
    getCategoriesFor,
    getCommandStructure,
    calculateCommandBonus,
    
    // Victory system exports
    turnLimit,
    attackingTeam,
    defendingTeam,
    enabledVictoryConditions,
    victoryResult,
    isCapitalTerrain,
    getCapitals,
    getCapitalsForTeam,
  };
};
// HP Change Tracking System
interface HPChangeEvent {
  unitId: string;
  unitType: UnitType;
  oldHp: number;
  newHp: number;
  maxHp: number;
  cause: 'combat' | 'healing' | 'initialization' | 'movement' | 'capture' | 'unknown';
  timestamp: number;
  location: { x: number; y: number };
}

const HPChangeLogger = {
  changes: [] as HPChangeEvent[],
  
  log: (event: HPChangeEvent) => {
    console.log(`🩹 HP Change: ${event.unitType}(${event.unitId}) ${event.oldHp}->${event.newHp}/${event.maxHp} [${event.cause}] at (${event.location.x}, ${event.location.y})`);
    HPChangeLogger.changes.push(event);
    
    // Detect suspicious changes
    if (HPChangeLogger.detectSuspiciousChange(event)) {
      console.error(`🚨 SUSPICIOUS HP CHANGE DETECTED:`, event);
    }
  },
  
  detectSuspiciousChange: (event: HPChangeEvent): boolean => {
    // Detect HP being forced to specific values like 10
    const isForcedTo10 = event.newHp === 10 && event.oldHp !== 10 && event.cause !== 'initialization';
    const isInvalidChange = event.newHp > event.maxHp || event.newHp < 0;
    const isUnexpectedIncrease = event.newHp > event.oldHp && event.cause !== 'healing';
    
    return isForcedTo10 || isInvalidChange || isUnexpectedIncrease;
  },
  
  getChangesFor: (unitId: string) => {
    return HPChangeLogger.changes.filter(c => c.unitId === unitId);
  },
  
  clear: () => {
    HPChangeLogger.changes = [];
  }
};

// Safe HP update function
const safeUpdateUnitHP = (unit: Unit, newHp: number, cause: HPChangeEvent['cause']): Unit => {
  // Validation
  const validatedHp = Math.max(0, Math.min(newHp, unit.maxHp));
  
  if (validatedHp !== newHp) {
    console.warn(`HP value clamped for unit ${unit.id}: requested ${newHp} -> validated ${validatedHp}`);
  }
  
  // Log the change
  HPChangeLogger.log({
    unitId: unit.id,
    unitType: unit.type,
    oldHp: unit.hp,
    newHp: validatedHp,
    maxHp: unit.maxHp,
    cause,
    timestamp: Date.now(),
    location: { x: unit.x, y: unit.y }
  });
  
  return { ...unit, hp: validatedHp };
};

// Safe healing function with conditional logic
const applySafeHealing = (unit: Unit, healAmount: number): Unit => {
  // 補給条件チェック：HPが最大値未満の場合のみ回復
  if (unit.hp >= unit.maxHp) {
    console.log(`Unit ${unit.id} already at max HP (${unit.hp}/${unit.maxHp}), skipping HP healing`);
    return unit; // HP回復不要
  }
  
  const healedHp = Math.min(unit.maxHp, unit.hp + healAmount);
  
  // 異常値チェック
  if (healedHp < unit.hp) {
    console.error(`Healing calculation error for unit ${unit.id}`);
    return unit;
  }
  
  return safeUpdateUnitHP(unit, healedHp, 'healing');
};

// 燃料補給処理
const applySafeFuelResupply = (unit: Unit): Unit => {
  const maxFuel = UNIT_STATS[unit.type].maxFuel;
  
  // 燃料が最大値未満の場合のみ補給
  if (unit.fuel >= maxFuel) {
    console.log(`Unit ${unit.id} already at max fuel (${unit.fuel}/${maxFuel}), skipping fuel resupply`);
    return unit;
  }
  
  return { ...unit, fuel: maxFuel };
};

// 統合補給処理
const applySupplyOperations = (unit: Unit): Unit => {
  let updatedUnit = unit;
  
  // HP回復（必要な場合のみ）
  if (unit.hp < unit.maxHp) {
    updatedUnit = applySafeHealing(updatedUnit, UNIT_HEAL_HP);
  }
  
  // 燃料補給（必要な場合のみ）
  if (UNIT_HEAL_FUEL_FULL && unit.fuel < UNIT_STATS[unit.type].maxFuel) {
    updatedUnit = applySafeFuelResupply(updatedUnit);
  }
  
  return updatedUnit;
};
