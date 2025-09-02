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
  findPath,
  getNeighbors
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
import { log, logError, logInfo, logTransportOperation, logInfantryAction, logUnitMovement } from '../utils/logger';
import { logBattle } from '../utils/battleLogger';

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
  const [weather, setWeather] = useState<WeatherType>('Rain'); // Start with Rain for immediate visual feedback
  const [weatherDuration, setWeatherDuration] = useState(0);
  const [history, setHistory] = useState<GameStateSnapshot[]>([]);
  const [weaponSelectionState, setWeaponSelectionState] = useState<{
    isOpen: boolean;
    attacker: Unit | null;
    target: Unit | null;
  }>({ isOpen: false, attacker: null, target: null });

  // Engineer action selection state
  const [engineerActionState, setEngineerActionState] = useState<{
    mode: 'none' | 'selecting_bridge_build' | 'selecting_bridge_destroy';
    unit: Unit | null;
    availableTargets: Coordinate[];
  }>({ mode: 'none', unit: null, availableTargets: [] });

  // Transport unload action selection state
  const [transportActionState, setTransportActionState] = useState<{
    mode: 'none' | 'selecting_unload_position';
    unit: Unit | null;
    availableTargets: Coordinate[];
  }>({ mode: 'none', unit: null, availableTargets: [] });

  // Transport unload action confirmation state
  const [transportConfirmState, setTransportConfirmState] = useState<{
    isOpen: boolean;
    actionType: 'unload' | null;
    targetCoord: Coordinate | null;
    targetTile: Tile | null;
    loadedUnit: Unit | null;
  }>({ isOpen: false, actionType: null, targetCoord: null, targetTile: null, loadedUnit: null });

  // Engineer action confirmation state
  const [engineerConfirmState, setEngineerConfirmState] = useState<{
    isOpen: boolean;
    actionType: 'build_bridge' | 'destroy_bridge' | null;
    targetCoord: Coordinate | null;
    targetTile: Tile | null;
    materialCost: number;
  }>({ 
    isOpen: false, 
    actionType: null, 
    targetCoord: null, 
    targetTile: null, 
    materialCost: 0 
  });

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

  const selectedUnit = useMemo(() => units.find(u => u.id === selectedUnitId && !u.loaded) || null, [units, selectedUnitId]);

  const selectedUnitTile = useMemo(() => {
    if (!selectedUnit) return null;
    return boardLayout.get(coordToString(selectedUnit)) ?? null;
  }, [selectedUnit, boardLayout]);

  const reachableTiles = useMemo(() => {
    if (!selectedUnit || selectedUnit.moved) return [];
    
    // Don't show movement tiles during engineer action selection
    if (engineerActionState.mode !== 'none') return [];
    
    return calculateReachableTiles(
      { x: selectedUnit.x, y: selectedUnit.y }, 
      selectedUnit.movement, 
      selectedUnit.fuel, 
      boardLayout, 
      units, 
      activeTeam
    );
  }, [selectedUnit, boardLayout, units, activeTeam, engineerActionState.mode]);

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

  // Engineer target tiles (for highlighting during selection mode)
  const engineerTargetTiles = useMemo(() => {
    return engineerActionState.availableTargets;
  }, [engineerActionState.availableTargets]);

  // Transport target tiles (for highlighting during selection mode)
  const transportTargetTiles = useMemo(() => {
    return transportActionState.availableTargets;
  }, [transportActionState.availableTargets]);

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
      
      // Weather update logic - Enhanced to include Storm and bias toward weather effects
      const weathers: WeatherType[] = ['Clear', 'Rain', 'Storm', 'Rain', 'Storm'];
      const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
      let newDuration = weatherDuration;
      if (nextWeather === 'Rain') {
        newDuration++;
      } else if (nextWeather === 'Storm') {
        newDuration += 3;
      } else {
        // Clear weather: subtract 2 instead of resetting
        newDuration = Math.max(0, newDuration - 2);
      }
      setWeather(nextWeather);
      setWeatherDuration(newDuration);
      
      // Terrain change logic
      let changed = false;
      if (['Rain', 'Storm'].includes(nextWeather) && newDuration >= 3) {
        newBoardLayout.forEach((tile, key) => {
          if (tile.terrain === 'Plains') {
            newBoardLayout.set(key, { ...tile, terrain: 'Mud' });
            changed = true;
          }
        });
      } else if (newDuration <= 1) {
        // Convert Mud back to Plains when duration is 1 or 0
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

    // Handle engineer action target selection
    if (engineerActionState.mode !== 'none') {
      handleEngineerTargetSelect(coord);
      return;
    }

    // Handle transport action target selection
    if (transportActionState.mode !== 'none') {
      handleTransportTargetSelect(coord);
      return;
    }

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
              let moveCost = terrainStats.movementCost[selectedUnit.type] ?? terrainStats.movementCost.default;
              
              // Special movement costs for Transport units
              if (selectedUnit.type === 'Transport') {
                switch (tile.terrain) {
                  case 'Road':
                  case 'Bridge':
                    moveCost = 1;
                    break;
                  case 'Plains':
                    moveCost = 2;
                    break;
                  case 'Forest':
                  case 'Snow':
                  case 'Desert':
                    moveCost = 3;
                    break;
                  default:
                    // Use default terrain movement cost for other terrains
                    moveCost = terrainStats.movementCost.Vehicle ?? terrainStats.movementCost.default;
                    break;
                }
              }
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

  // Engineer action target selection functions
  const getAvailableBridgeBuildTargets = useCallback((unit: Unit): Coordinate[] => {
    if (!unit || unit.type !== 'Engineer') return [];
    
    const targets: Coordinate[] = [];
    const unitCoord = { x: unit.x, y: unit.y };
    
    // Check current position
    const currentTile = boardLayout.get(coordToString(unitCoord));
    if (currentTile?.terrain === 'River') {
      targets.push(unitCoord);
    }
    
    // Check neighboring positions for Rivers
    const neighbors = getNeighbors(unitCoord);
    for (const coord of neighbors) {
      const tile = boardLayout.get(coordToString(coord));
      if (tile?.terrain === 'River') {
        targets.push(coord);
      }
    }
    
    return targets;
  }, [boardLayout]);

  const getAvailableBridgeDestroyTargets = useCallback((unit: Unit): Coordinate[] => {
    if (!unit || unit.type !== 'Engineer') return [];
    
    const targets: Coordinate[] = [];
    const unitCoord = { x: unit.x, y: unit.y };
    
    // Check current position
    const currentTile = boardLayout.get(coordToString(unitCoord));
    if (currentTile?.terrain === 'Bridge') {
      targets.push(unitCoord);
    }
    
    // Check neighboring positions for Bridges
    const neighbors = getNeighbors(unitCoord);
    for (const coord of neighbors) {
      const tile = boardLayout.get(coordToString(coord));
      if (tile?.terrain === 'Bridge') {
        targets.push(coord);
      }
    }
    
    return targets;
  }, [boardLayout]);

  // Transport unload target functions
  const getAvailableUnloadTargets = useCallback((unit: Unit): Coordinate[] => {
    if (!unit || unit.type !== 'Transport') return [];
    
    const targets: Coordinate[] = [];
    const unitCoord = { x: unit.x, y: unit.y };
    
    // Check neighboring positions for valid unload locations
    const neighbors = getNeighbors(unitCoord);
    for (const coord of neighbors) {
      const tile = boardLayout.get(coordToString(coord));
      if (!tile) continue; // Position doesn't exist on map
      
      // Check if no unit is at this position
      const unitAtPosition = units.find(u => 
        u.x === coord.x && 
        u.y === coord.y && 
        !u.loaded
      );
      
      // Can unload if position is empty and not on sea
      if (!unitAtPosition && tile.terrain !== 'Sea') {
        targets.push(coord);
      }
    }
    
    return targets;
  }, [boardLayout, units]);

  // Engineer action handlers
  const startEngineerAction = useCallback((actionType: 'build_bridge' | 'destroy_bridge') => {
    if (!selectedUnit || selectedUnit.type !== 'Engineer') return;
    
    const materialWeapon = selectedUnit.weapons?.find(w => w.type === '資材');
    const availableMaterials = materialWeapon?.ammunition || 0;
    
    if (availableMaterials < 2) return; // Both actions require 2 materials
    
    let targets: Coordinate[] = [];
    let mode: 'selecting_bridge_build' | 'selecting_bridge_destroy';
    
    if (actionType === 'build_bridge') {
      targets = getAvailableBridgeBuildTargets(selectedUnit);
      mode = 'selecting_bridge_build';
    } else {
      targets = getAvailableBridgeDestroyTargets(selectedUnit);
      mode = 'selecting_bridge_destroy';
    }
    
    if (targets.length === 0) return; // No valid targets
    
    setEngineerActionState({
      mode,
      unit: selectedUnit,
      availableTargets: targets
    });
  }, [selectedUnit, getAvailableBridgeBuildTargets, getAvailableBridgeDestroyTargets]);

  const handleEngineerTargetSelect = useCallback((coord: Coordinate) => {
    if (engineerActionState.mode === 'none' || !engineerActionState.unit) return;
    
    // Check if the clicked coordinate is a valid target
    const isValidTarget = engineerActionState.availableTargets.some(
      target => target.x === coord.x && target.y === coord.y
    );
    
    if (!isValidTarget) {
      // Cancel selection if clicked outside valid targets
      setEngineerActionState({ mode: 'none', unit: null, availableTargets: [] });
      return;
    }
    
    const targetTile = boardLayout.get(coordToString(coord));
    if (!targetTile) return;
    
    // Show confirmation dialog
    const actionType = engineerActionState.mode === 'selecting_bridge_build' ? 'build_bridge' : 'destroy_bridge';
    
    setEngineerConfirmState({
      isOpen: true,
      actionType,
      targetCoord: coord,
      targetTile,
      materialCost: 2
    });
    
    // Reset selection mode
    setEngineerActionState({ mode: 'none', unit: null, availableTargets: [] });
  }, [engineerActionState, boardLayout]);

  const confirmEngineerAction = useCallback(() => {
    if (!engineerConfirmState.isOpen || !engineerConfirmState.targetCoord || !engineerConfirmState.actionType) return;
    
    const { actionType, targetCoord } = engineerConfirmState;
    
    // Execute the action with specific target coordinate
    handleMaterialActionWithTarget(actionType, targetCoord);
    
    // Close confirmation dialog
    setEngineerConfirmState({ 
      isOpen: false, 
      actionType: null, 
      targetCoord: null, 
      targetTile: null, 
      materialCost: 0 
    });
  }, [engineerConfirmState]);

  const cancelEngineerAction = useCallback(() => {
    setEngineerConfirmState({ 
      isOpen: false, 
      actionType: null, 
      targetCoord: null, 
      targetTile: null, 
      materialCost: 0 
    });
    
    // Also cancel any active selection mode
    setEngineerActionState({ 
      mode: 'none', 
      unit: null, 
      availableTargets: [] 
    });
  }, []);

  // Function to cancel engineer selection mode
  const cancelEngineerSelectionMode = useCallback(() => {
    setEngineerActionState({ 
      mode: 'none', 
      unit: null, 
      availableTargets: [] 
    });
  }, []);

  // Transport action handlers
  const startTransportAction = useCallback(() => {
    if (!selectedUnit || selectedUnit.type !== 'Transport') return;
    
    // Check if transport has loaded units
    const loadedUnit = units.find(unit => 
      unit.loaded && 
      unit.transportId === selectedUnit.id
    );
    
    if (!loadedUnit) return; // No loaded units
    
    const targets = getAvailableUnloadTargets(selectedUnit);
    if (targets.length === 0) return; // No valid unload targets
    
    setTransportActionState({
      mode: 'selecting_unload_position',
      unit: selectedUnit,
      availableTargets: targets
    });
  }, [selectedUnit, units, getAvailableUnloadTargets]);

  const handleTransportTargetSelect = useCallback((coord: Coordinate) => {
    if (transportActionState.mode === 'none' || !transportActionState.unit) return;
    
    // Check if the clicked coordinate is a valid target
    const isValidTarget = transportActionState.availableTargets.some(
      target => target.x === coord.x && target.y === coord.y
    );
    
    if (!isValidTarget) {
      // Cancel selection if clicked outside valid targets
      setTransportActionState({ mode: 'none', unit: null, availableTargets: [] });
      return;
    }
    
    // Get the target tile and loaded unit
    const targetTile = boardLayout.get(coordToString(coord));
    const loadedUnit = units.find(unit => 
      unit.loaded && 
      unit.transportId === transportActionState.unit!.id
    );
    
    // Always clear selection mode first to prevent double-click requirement
    setTransportActionState({ mode: 'none', unit: null, availableTargets: [] });
    
    if (!targetTile || !loadedUnit) {
      // If data is invalid, just clear selection mode (already done above)
      return;
    }
    
    // Open confirmation dialog immediately
    setTransportConfirmState({
      isOpen: true,
      actionType: 'unload',
      targetCoord: coord,
      targetTile,
      loadedUnit
    });
  }, [transportActionState, boardLayout, units]);

  const confirmTransportAction = useCallback(() => {
    if (!transportConfirmState.isOpen || !transportConfirmState.targetCoord || !transportConfirmState.loadedUnit) return;
    
    const targetCoord = transportConfirmState.targetCoord;
    const loadedUnit = transportConfirmState.loadedUnit;
    const transportUnit = units.find(u => u.id === loadedUnit.transportId);
    
    if (!transportUnit) return;
    
    // Log the transport operation
    logTransportOperation({
      infantryId: loadedUnit.id,
      infantryName: loadedUnit.name || loadedUnit.type,
      transportId: transportUnit.id,
      transportName: transportUnit.name || transportUnit.type,
      position: targetCoord,
      team: transportUnit.team,
      operation: 'unload'
    });

    // Execute unload
    const updatedUnits = units.map(u => {
      if (u.id === loadedUnit.id) {
        return { 
          ...u, 
          loaded: false, 
          transportId: undefined, 
          x: targetCoord.x, 
          y: targetCoord.y,
          moved: true, 
          attacked: true 
        };
      }
      return u;
    });
    
    setUnits(updatedUnits);
    setSelectedUnitId(null);
    
    // Close confirmation dialog
    setTransportConfirmState({ 
      isOpen: false, 
      actionType: null, 
      targetCoord: null, 
      targetTile: null, 
      loadedUnit: null 
    });
  }, [transportConfirmState, units, setUnits, setSelectedUnitId, logTransportOperation]);

  const cancelTransportAction = useCallback(() => {
    setTransportConfirmState({ 
      isOpen: false, 
      actionType: null, 
      targetCoord: null, 
      targetTile: null, 
      loadedUnit: null 
    });
    
    // Also cancel any active selection mode
    setTransportActionState({ 
      mode: 'none', 
      unit: null, 
      availableTargets: [] 
    });
  }, []);

  const cancelTransportSelectionMode = useCallback(() => {
    setTransportActionState({ 
      mode: 'none', 
      unit: null, 
      availableTargets: [] 
    });
  }, []);

  // Material system for Engineering vehicles
  const consumeMaterial = useCallback((unit: Unit, amount: number): Unit | null => {
    const materialWeapon = unit.weapons?.find(w => w.type === '資材');
    if (!materialWeapon || materialWeapon.ammunition < amount) {
      return null; // Not enough materials
    }
    
    const updatedWeapons = unit.weapons?.map(w => 
      w.type === '資材' 
        ? { ...w, ammunition: w.ammunition - amount }
        : w
    );
    
    return { ...unit, weapons: updatedWeapons };
  }, []);

  const handleMaterialAction = useCallback((
    action: 'enhance_city' | 'build_bridge' | 'build_fortress' | 'destroy_fortress' | 'destroy_bridge', 
    materialAmount?: number
  ) => {
    if (!selectedUnit || selectedUnit.type !== 'Engineer') return;
    
    const currentTile = boardLayout.get(coordToString(selectedUnit));
    if (!currentTile) return;
    
    let requiredMaterials = 0;
    let canPerformAction = false;
    let targetTile = currentTile;
    let targetCoord = { x: selectedUnit.x, y: selectedUnit.y };
    
    switch (action) {
      case 'enhance_city':
        // Check if on capturable terrain owned by same team
        canPerformAction = (currentTile.terrain === 'City' || 
                          currentTile.terrain === 'Capital' || 
                          currentTile.terrain === 'Airport' || 
                          currentTile.terrain === 'Port') && 
                         currentTile.owner === selectedUnit.team;
        requiredMaterials = 1; // Fixed to 1 material
        break;
      case 'build_bridge':
        // Check if there's a River within 1 hex (including current position)
        requiredMaterials = 2;
        if (currentTile.terrain === 'River') {
          canPerformAction = true;
          targetTile = currentTile;
          targetCoord = { x: selectedUnit.x, y: selectedUnit.y };
        } else {
          // Check neighboring tiles for River
          const neighbors = getNeighbors({ x: selectedUnit.x, y: selectedUnit.y });
          for (const coord of neighbors) {
            const tile = boardLayout.get(coordToString(coord));
            if (tile?.terrain === 'River') {
              canPerformAction = true;
              targetTile = tile;
              targetCoord = coord;
              break;
            }
          }
        }
        break;
      case 'build_fortress':
        canPerformAction = currentTile.terrain === 'Plains';
        requiredMaterials = 1;
        break;
      case 'destroy_fortress':
        canPerformAction = currentTile.terrain === 'Fortress';
        requiredMaterials = 2;
        break;
      case 'destroy_bridge':
        // Check if there's a Bridge within 1 hex (including current position)
        requiredMaterials = 2;
        if (currentTile.terrain === 'Bridge') {
          canPerformAction = true;
          targetTile = currentTile;
          targetCoord = { x: selectedUnit.x, y: selectedUnit.y };
        } else {
          // Check neighboring tiles for Bridge
          const neighbors = getNeighbors({ x: selectedUnit.x, y: selectedUnit.y });
          for (const coord of neighbors) {
            const tile = boardLayout.get(coordToString(coord));
            if (tile?.terrain === 'Bridge') {
              canPerformAction = true;
              targetTile = tile;
              targetCoord = coord;
              break;
            }
          }
        }
        break;
    }
    
    if (!canPerformAction) return;
    
    // Check if unit has enough materials
    const materialWeapon = selectedUnit.weapons?.find(w => w.type === '資材');
    if (!materialWeapon || materialWeapon.ammunition < requiredMaterials) {
      return;
    }
    
    saveStateToHistory();
    
    // Consume materials
    const updatedUnit = consumeMaterial(selectedUnit, requiredMaterials);
    if (!updatedUnit) return;
    
    // Apply terrain/building effects
    const newBoardLayout = new Map(boardLayout);
    const tileKey = coordToString(targetCoord);
    
    switch (action) {
      case 'enhance_city':
        // Fixed enhancement: +5 HP for 1 material
        const hpIncrease = 5;
        const newMaxHp = (currentTile.maxHp || CITY_HP) + hpIncrease;
        const newHp = Math.min(newMaxHp, (currentTile.hp || 0) + hpIncrease);
        newBoardLayout.set(tileKey, { 
          ...currentTile, 
          hp: newHp, 
          maxHp: newMaxHp 
        });
        break;
      case 'build_bridge':
        newBoardLayout.set(tileKey, { 
          ...targetTile, 
          terrain: 'Bridge' 
        });
        break;
      case 'build_fortress':
        newBoardLayout.set(tileKey, { 
          ...currentTile, 
          terrain: 'Fortress',
          owner: selectedUnit.team,
          hp: CITY_HP,
          maxHp: CITY_HP
        });
        break;
      case 'destroy_fortress':
        newBoardLayout.set(tileKey, { 
          ...currentTile, 
          terrain: 'Plains',
          owner: undefined,
          hp: undefined,
          maxHp: undefined
        });
        break;
      case 'destroy_bridge':
        newBoardLayout.set(tileKey, { 
          ...targetTile, 
          terrain: 'River'
        });
        break;
    }
    
    setBoardLayout(newBoardLayout);
    setUnits(units.map(u => u.id === selectedUnit.id ? 
      { ...updatedUnit, moved: true, attacked: true } : u
    ));
    setSelectedUnitId(null);
  }, [selectedUnit, boardLayout, units, saveStateToHistory, consumeMaterial]);

  // New material action handler with specific target coordinate
  const handleMaterialActionWithTarget = useCallback((
    action: 'build_bridge' | 'destroy_bridge',
    targetCoord: Coordinate
  ) => {
    if (!selectedUnit || selectedUnit.type !== 'Engineer') return;
    
    const targetTile = boardLayout.get(coordToString(targetCoord));
    if (!targetTile) return;
    
    const requiredMaterials = 2; // Both actions require 2 materials
    
    // Validate action and target terrain
    let canPerformAction = false;
    if (action === 'build_bridge' && targetTile.terrain === 'River') {
      canPerformAction = true;
    } else if (action === 'destroy_bridge' && targetTile.terrain === 'Bridge') {
      canPerformAction = true;
    }
    
    if (!canPerformAction) return;
    
    // Check if unit has enough materials
    const materialWeapon = selectedUnit.weapons?.find(w => w.type === '資材');
    if (!materialWeapon || materialWeapon.ammunition < requiredMaterials) {
      return;
    }
    
    saveStateToHistory();
    
    // Consume materials
    const updatedUnit = consumeMaterial(selectedUnit, requiredMaterials);
    if (!updatedUnit) return;
    
    // Apply terrain changes
    const newBoardLayout = new Map(boardLayout);
    const tileKey = coordToString(targetCoord);
    
    if (action === 'build_bridge') {
      newBoardLayout.set(tileKey, { 
        ...targetTile, 
        terrain: 'Bridge' 
      });
    } else if (action === 'destroy_bridge') {
      newBoardLayout.set(tileKey, { 
        ...targetTile, 
        terrain: 'River'
      });
    }
    
    setBoardLayout(newBoardLayout);
    setUnits(units.map(u => u.id === selectedUnit.id ? 
      { ...updatedUnit, moved: true, attacked: true } : u
    ));
    setSelectedUnitId(null);
  }, [selectedUnit, boardLayout, units, saveStateToHistory, consumeMaterial]);

  const handleAction = useCallback((action: 'wait' | 'undo' | 'capture' | 'enhance_city' | 'build_bridge' | 'build_fortress' | 'destroy_fortress' | 'destroy_bridge' | 'load' | 'unload', materialAmount?: number) => {
    if (!selectedUnit) return;

    if (action === 'wait') {
      // Log infantry wait action if it's an infantry unit
      if (selectedUnit.unitClass === 'Infantry') {
        logInfantryAction({
          infantryId: selectedUnit.id,
          infantryName: selectedUnit.name || selectedUnit.type,
          action: 'wait',
          position: { x: selectedUnit.x, y: selectedUnit.y },
          team: selectedUnit.team
        });
      }

      saveStateToHistory();
      setUnits(units.map(u => u.id === selectedUnit.id ? { ...u, moved: true, attacked: true } : u));
      setSelectedUnitId(null);
    } else if (action === 'capture') {
      if (selectedUnit.unitClass === 'Infantry' && selectedUnitTile && isCapturableTerrain(selectedUnitTile.terrain)) {
        // Log the infantry capture action
        logInfantryAction({
          infantryId: selectedUnit.id,
          infantryName: selectedUnit.name || selectedUnit.type,
          action: 'capture',
          position: { x: selectedUnit.x, y: selectedUnit.y },
          team: selectedUnit.team,
          target: { x: selectedUnit.x, y: selectedUnit.y, type: selectedUnitTile.terrain }
        });

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
    } else if (action === 'load') {
      // Handle loading Infantry, AntiTank, and Artillery units into transport
      const loadableUnitTypes = ['Infantry', 'AntiTank', 'Artillery'];
      if (loadableUnitTypes.includes(selectedUnit.type)) {
        saveStateToHistory();
        
        // Find a nearby transport unit
        const neighbors = getNeighbors({ x: selectedUnit.x, y: selectedUnit.y });
        const allPositions = [{ x: selectedUnit.x, y: selectedUnit.y }, ...neighbors];
        
        const nearbyTransport = units.find(unit => 
          unit.type === 'Transport' && 
          unit.team === selectedUnit.team &&
          allPositions.some(pos => pos.x === unit.x && pos.y === unit.y)
        );
        
        if (nearbyTransport) {
          // Log the transport operation
          logTransportOperation({
            infantryId: selectedUnit.id,
            infantryName: selectedUnit.name || selectedUnit.type,
            transportId: nearbyTransport.id,
            transportName: nearbyTransport.name || nearbyTransport.type,
            position: { x: selectedUnit.x, y: selectedUnit.y },
            team: selectedUnit.team,
            operation: 'load'
          });

          // Log the unit action (keep using infantry action for compatibility)
          logInfantryAction({
            infantryId: selectedUnit.id,
            infantryName: selectedUnit.name || selectedUnit.type,
            action: 'load_transport',
            position: { x: selectedUnit.x, y: selectedUnit.y },
            team: selectedUnit.team,
            target: { x: nearbyTransport.x, y: nearbyTransport.y, type: nearbyTransport.type }
          });

          // Remove the unit from the map and mark as loaded
          const updatedUnits = units.map(u => {
            if (u.id === selectedUnit.id) {
              return { ...u, loaded: true, transportId: nearbyTransport.id, moved: true, attacked: true };
            }
            return u;
          });
          setUnits(updatedUnits);
          setSelectedUnitId(null);
        }
      }
    } else if (action === 'unload') {
      // Handle unloading units from transport
      if (selectedUnit.type === 'Transport') {
        saveStateToHistory();
        
        // Find any loaded unit in this transport (not just infantry)
        const loadedUnit = units.find(unit => 
          unit.loaded && 
          unit.transportId === selectedUnit.id
        );
        
        if (loadedUnit) {
          // Calculate front position for unloading
          const frontPosition = { x: selectedUnit.x + 1, y: selectedUnit.y };
          
          // Check if front position is valid and empty
          const frontTile = boardLayout.get(`${frontPosition.x},${frontPosition.y}`);
          const unitAtFront = units.find(u => 
            u.x === frontPosition.x && 
            u.y === frontPosition.y && 
            !u.loaded
          );
          
          if (frontTile && !unitAtFront && frontTile.terrain !== 'Sea') {
            // Log the transport operation
            logTransportOperation({
              infantryId: loadedUnit.id,
              infantryName: loadedUnit.name || loadedUnit.type,
              transportId: selectedUnit.id,
              transportName: selectedUnit.name || selectedUnit.type,
              position: frontPosition,
              team: selectedUnit.team,
              operation: 'unload'
            });

            // Unload the unit at front position
            const updatedUnits = units.map(u => {
              if (u.id === loadedUnit.id) {
                return { 
                  ...u, 
                  loaded: false, 
                  transportId: undefined, 
                  x: frontPosition.x, 
                  y: frontPosition.y,
                  moved: true, 
                  attacked: true 
                };
              }
              return u;
            });
            setUnits(updatedUnits);
            setSelectedUnitId(null);
          }
        }
      }
    } else if (action === 'build_bridge') {
      // Start bridge building target selection
      startEngineerAction('build_bridge');
    } else if (action === 'destroy_bridge') {
      // Start bridge destruction target selection  
      startEngineerAction('destroy_bridge');
    } else if (action === 'enhance_city' || action === 'build_fortress' || action === 'destroy_fortress') {
      handleMaterialAction(action);
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
    engineerTargetTiles,
    transportTargetTiles,
    selectedUnitTile,
    loadGame,
    handleEndTurn,
    handleHexClick,
    handleAction,
    handleMaterialAction,
    setHoveredHex,
    setBattleReport,
    weaponSelectionState,
    handleWeaponSelect,
    handleWeaponSelectionClose,
    
    // Engineer action system
    engineerActionState,
    engineerConfirmState,
    confirmEngineerAction,
    cancelEngineerAction,
    cancelEngineerSelectionMode,
    
    // Transport action system
    transportActionState,
    transportConfirmState,
    startTransportAction,
    handleTransportTargetSelect,
    confirmTransportAction,
    cancelTransportAction,
    cancelTransportSelectionMode,
    
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
