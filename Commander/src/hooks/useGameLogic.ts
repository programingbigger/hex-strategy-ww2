import { useState, useCallback, useMemo } from 'react';
import {
  Unit,
  Coordinate,
  BoardLayout,
  BattleReport,
  Team,
  WeatherType,
  GameStateSnapshot,
  MapData
} from '../types';
import {
  loadMapFromJSON,
  calculateReachableTiles,
  coordToString,
  getDistance,
  findPath
} from '../utils/map';
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

  const handleEndTurn = useCallback(() => {
    const nextTeam = activeTeam === 'Blue' ? 'Red' : 'Blue';
    console.log(`🔄 Turn ending: ${activeTeam} -> ${nextTeam}. Checking healing for ${nextTeam} team units...`);
    
    // Debug: Show all cities on the map
    const cities = Array.from(boardLayout.entries()).filter(([, tile]) => tile.terrain === 'City');
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
        const isCityAndOwned = unitTile && unitTile.terrain === 'City' && unitTile.owner === u.team;
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
            isCity: unitTile?.terrain === 'City',
            isOwnedByUnit: unitTile?.owner === u.team
          }
        });
        
        if (unitTile && unitTile.terrain === 'City' && unitTile.owner === u.team) {
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
      if (tile.terrain === 'City' && tile.owner !== activeTeam) {
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

    const cities = Array.from(currentBoard.values()).filter(t => t.terrain === 'City');
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
        handleAttack(selectedUnit, unitOnHex);
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
        setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, ...coord, moved: true, fuel: u.fuel - fuelCost } : u));
        return;
      }

      setSelectedUnitId(null);
    } else {
      if (unitOnHex && unitOnHex.team === activeTeam && !unitOnHex.moved && !unitOnHex.attacked) {
        setSelectedUnitId(unitOnHex.id);
      }
    }
  }, [gameState, units, selectedUnit, activeTeam, reachableTiles, attackableTiles, handleAttack, saveStateToHistory, boardLayout]);

  const handleAction = useCallback((action: 'wait' | 'undo' | 'capture') => {
    if (!selectedUnit) return;

    if (action === 'wait') {
      saveStateToHistory();
      setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, moved: true, attacked: true } : u));
      setSelectedUnitId(null);
    } else if (action === 'capture') {
      if (selectedUnit.unitClass === 'Infantry' && selectedUnitTile?.terrain === 'City') {
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

  return {
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
  };
};