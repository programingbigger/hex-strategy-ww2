import { useCallback, useRef, useEffect } from 'react';
import {
  Unit,
  BoardLayout,
  Team,
  WeatherType,
  EnvironmentalLevels,
  VictoryResult,
  VictoryCondition
} from '../../types';
import { coordToString } from '../../utils/map';
import { CITY_HP, CITY_HEAL_RATE, UNIT_HEAL_HP, UNIT_STATS } from '../../config/constants';
import { log } from '../../utils/logger';
import { calculateIncomeForAllTeams } from '../../utils/incomeManager';
const isCapturableTerrain = (terrain: string): boolean => {
  return terrain === 'City' || terrain === 'Capital' || terrain === 'Airport' || terrain === 'Port';
};

const isSupplyTerrain = (terrain: string): boolean => {
  return terrain === 'City' || terrain === 'Capital';
};

const isCapitalTerrain = (terrain: string): boolean => {
  return terrain === 'Capital';
};

const applySupplyOperations = (unit: Unit, boardLayout: BoardLayout): Unit => {
  const unitTile = boardLayout.get(coordToString(unit));
  
  const hasValidTile = unitTile !== undefined;
  const isValidSupplyTerrain = hasValidTile && (unitTile.terrain === 'City' || unitTile.terrain === 'Capital');
  const hasValidOwner = hasValidTile && unitTile.owner !== undefined && unitTile.owner !== null;
  const isOwnedByUnitTeam = hasValidOwner && unitTile.owner === unit.team;
  
  const canReceiveSupply = hasValidTile && isValidSupplyTerrain && hasValidOwner && isOwnedByUnitTeam;
  
  log(`🔍 SUPPLY CHECK for ${unit.type}(${unit.id}) at (${unit.x},${unit.y}) team=${unit.team}:`);
  log(`   - Tile exists: ${hasValidTile} (${unitTile?.terrain || 'NONE'})`);
  log(`   - Is supply terrain: ${isValidSupplyTerrain} (City/Capital only)`);
  log(`   - Has valid owner: ${hasValidOwner} (owner: ${unitTile?.owner})`);
  log(`   - Owned by unit team: ${isOwnedByUnitTeam}`);
  log(`   - ✅ FINAL RESULT: ${canReceiveSupply ? 'SUPPLY GRANTED' : 'SUPPLY DENIED'}`);
  
  if (canReceiveSupply) {
    const isLandUnit = unit.unitClass === 'Infantry' || unit.unitClass === 'Vehicle';
    
    if (!isLandUnit) {
      log(`❌ SUPPLY DENIED for ${unit.type}(${unit.id}): AIRCRAFT_NOT_SUPPORTED`);
      return unit;
    }
    
    const originalHp = unit.hp;
    const originalFuel = unit.fuel;
    
    const needsHealing = unit.hp < unit.maxHp;
    const newHp = needsHealing ? Math.min(unit.maxHp, unit.hp + UNIT_HEAL_HP) : unit.hp;
    
    const maxFuel = UNIT_STATS[unit.type]?.maxFuel || 60;
    const needsFuel = unit.fuel < maxFuel;
    const newFuel = needsFuel ? maxFuel : unit.fuel;
    
    let resuppliedWeapons = unit.weapons;
    let ammunitionResupplied = false;
    
    if (unit.weapons && Array.isArray(unit.weapons)) {
      resuppliedWeapons = unit.weapons.map(weapon => {
        if (weapon.ammunition < weapon.maxAmmunition) {
          ammunitionResupplied = true;
          return { ...weapon, ammunition: weapon.maxAmmunition };
        }
        return weapon;
      });
    }
    
    const suppliedUnit = {
      ...unit,
      hp: newHp,
      fuel: newFuel,
      weapons: resuppliedWeapons
    };
    
    log(`🚛 SUPPLY APPLIED to ${unit.type}(${unit.id}):`);
    log(`   HP: ${originalHp} → ${newHp} (${needsHealing ? 'HEALED' : 'NO CHANGE'})`);
    log(`   Fuel: ${originalFuel} → ${newFuel} (${needsFuel ? 'RESUPPLIED' : 'NO CHANGE'})`);
    log(`   Ammunition: ${ammunitionResupplied ? 'RESUPPLIED' : 'NO CHANGE'}`);
    
    return suppliedUnit;
  } else {
    const reason = !hasValidTile ? 'TILE_NOT_FOUND' :
                  !isValidSupplyTerrain ? `INVALID_TERRAIN(${unitTile.terrain})` :
                  !hasValidOwner ? `INVALID_OWNER(${unitTile.owner})` :
                  !isOwnedByUnitTeam ? `OWNER_MISMATCH(${unitTile.owner}≠${unit.team})` :
                  'UNKNOWN';
    
    log(`❌ SUPPLY DENIED for ${unit.type}(${unit.id}): ${reason}`);
    return unit;
  }
};

export interface TurnManagementHook {
  handleEndTurn: () => void;
  checkWinCondition: (currentUnits: Unit[], currentBoard: BoardLayout) => void;
}

interface TurnManagementDeps {
  mapId: string; // Add mapId parameter
  activeTeam: Team;
  units: Unit[];
  weather: WeatherType;
  environmentalLevels: EnvironmentalLevels;
  boardLayout: BoardLayout;
  turn: number;
  month: number;
  year: number;
  day: number;
  turnLimit?: number;
  defendingTeam: Team;
  armyFunds: { [team: string]: number };
  enabledVictoryConditions: VictoryCondition[]; // Add enabled victory conditions
  setUnits: (units: Unit[]) => void;
  setActiveTeam: (team: Team) => void;
  setBoardLayout: (layout: BoardLayout) => void;
  setTurn: (turn: number) => void;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  setDay: (day: number) => void;
  setWeather: (weather: WeatherType) => void;
  setEnvironmentalLevels: (levels: EnvironmentalLevels) => void;
  setSelectedUnitId: (id: string | null) => void;
  setGameState: (state: 'playing' | 'gameOver') => void;
  setWinner: (winner: Team | null) => void;
  setVictoryResult: (result: VictoryResult | null) => void;
  setArmyFunds: (funds: { [team: string]: number }) => void;
}

export const useTurnManagement = (deps: TurnManagementDeps): TurnManagementHook => {
  const {
    mapId, // Extract mapId from deps
    activeTeam,
    units,
    weather,
    environmentalLevels,
    boardLayout,
    turn,
    month,
    year,
    day,
    turnLimit,
    defendingTeam,
    armyFunds,
    enabledVictoryConditions, // Extract enabled victory conditions
    setUnits,
    setActiveTeam,
    setBoardLayout,
    setTurn,
    setMonth,
    setYear,
    setDay,
    setWeather,
    setEnvironmentalLevels,
    setSelectedUnitId,
    setGameState,
    setWinner,
    setVictoryResult,
    setArmyFunds
  } = deps;

  const mapIdRef = useRef<string>(mapId); // Use mapId from props instead of hardcoded value

  // Update mapIdRef when mapId changes
  useEffect(() => {
    if (mapIdRef.current !== mapId) {
      mapIdRef.current = mapId;
    }
  }, [mapId]);

  const checkWinCondition = useCallback((currentUnits: Unit[], currentBoard: BoardLayout) => {
    const blueUnits = currentUnits.filter(u => u.team === 'Blue');
    const redUnits = currentUnits.filter(u => u.team === 'Red');

    // Only check unit elimination if it's enabled
    if (enabledVictoryConditions.includes('unit_elimination')) {
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
    }

    // Only check capital capture if it's enabled
    if (enabledVictoryConditions.includes('capital_capture')) {
      const capitals = Array.from(currentBoard.values()).filter(t => t.terrain === 'Capital');
      if (capitals.length > 0) {
        const blueCapitals = capitals.filter(c => c.owner === 'Blue');
        const redCapitals = capitals.filter(c => c.owner === 'Red');

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
    }

    // Only check city capture if it's enabled
    if (enabledVictoryConditions.includes('city_capture')) {
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
    }
  }, [turn, enabledVictoryConditions, setGameState, setWinner, setVictoryResult]);


  const handleEndTurn = useCallback(async () => {
    const nextTeam = activeTeam === 'Blue' ? 'Red' : 'Blue';
    console.log(`🔄 Turn ending: ${activeTeam} -> ${nextTeam}. Checking healing for ${nextTeam} team units...`);
    
    const cities = Array.from(boardLayout.entries()).filter(([, tile]) => isSupplyTerrain(tile.terrain));
    console.log(`🏙️ Cities on map:`, cities.map(([coord, tile]) => ({
      coord: coord,
      terrain: tile.terrain,
      owner: tile.owner,
      hp: tile.hp
    })));
    
    const unitsWithReset = units.map(u => ({ ...u, moved: false, attacked: false }));
    
    const unitsWithHealing = unitsWithReset.map(u => {
      if (u.team !== nextTeam) {
        return u;
      }

      return applySupplyOperations(u, boardLayout);
    });

    setUnits(unitsWithHealing);
    setActiveTeam(nextTeam);

    const newBoardLayout = new Map(boardLayout);

    newBoardLayout.forEach((tile, key) => {
      if (isCapturableTerrain(tile.terrain) && tile.owner !== activeTeam) {
        const newHp = Math.min(tile.maxHp || CITY_HP, (tile.hp || 0) + CITY_HEAL_RATE);
        newBoardLayout.set(key, { ...tile, hp: newHp });
      }
    });

    let finalUnits = unitsWithHealing;
    if (nextTeam === 'Blue') {
      const newTurn = turn + 1;
      setTurn(newTurn);
      
      if (turnLimit && newTurn > turnLimit) {
        setGameState('gameOver');
        const winner = defendingTeam || 'Red';
        setWinner(winner);
        setVictoryResult({
          condition: 'turn_limit',
          winner: winner,
          description: `Turn limit reached (${turnLimit} turns). Defending team wins.`,
          turnsElapsed: newTurn
        });
        return;
      }
      
      // Calculate and apply income at the start of new turn
      try {
        const updatedFunds = await calculateIncomeForAllTeams(newBoardLayout, armyFunds);
        setArmyFunds(updatedFunds);
        console.log('💰 Income calculated and applied for new turn:', newTurn);
      } catch (error) {
        console.error('❌ Error calculating income:', error);
      }

      // Monthly weather probability system
      const { generateWeatherForMonth, getMonthFromTurn } = await import('../../data/weatherConfig');
      const currentMonth = getMonthFromTurn(newTurn);
      const nextWeather = generateWeatherForMonth(currentMonth);
      
      // Update month if it changed
      if (currentMonth !== month) {
        setMonth(currentMonth);
      }
      
      // Calculate new environmental levels based on weather (with null safety)
      const newEnvironmentalLevels = environmentalLevels 
        ? { ...environmentalLevels } 
        : { wetness: 0, snow: 0 };
      
      // Update wetness levels
      if (nextWeather === 'Rain') {
        newEnvironmentalLevels.wetness++;
      } else if (nextWeather === 'Storm') {
        newEnvironmentalLevels.wetness += 3;
      } else if (nextWeather === 'Clear') {
        newEnvironmentalLevels.wetness = Math.max(0, newEnvironmentalLevels.wetness - 2);
      } else if (nextWeather === 'Cloudy') {
        // Cloudy weather doesn't change wetness
      } else if (nextWeather === 'Fog') {
        // Fog weather doesn't change wetness (placeholder weather)
      }
      
      // Update snow levels  
      if (nextWeather === 'Snow') {
        newEnvironmentalLevels.snow++;
      } else if (nextWeather === 'Blizzard') {
        newEnvironmentalLevels.snow += 3;
      } else if (nextWeather === 'Clear') {
        // Clear weather reduces snow gradually
        newEnvironmentalLevels.snow = Math.max(0, newEnvironmentalLevels.snow - 1);
      }
      
      setWeather(nextWeather);
      setEnvironmentalLevels(newEnvironmentalLevels);
      
      // Debug: Log environmental levels for terrain change debugging (with null safety)
      log(`🌡️ ENVIRONMENTAL LEVELS DEBUG - Turn ${turn + 1}:`);
      log(`   📅 Weather: ${weather} → ${nextWeather}`);
      
      // Null safety checks for environmental levels
      const currentWetness = environmentalLevels?.wetness ?? 0;
      const currentSnow = environmentalLevels?.snow ?? 0;
      const newWetness = newEnvironmentalLevels?.wetness ?? 0;
      const newSnow = newEnvironmentalLevels?.snow ?? 0;
      
      log(`   💧 Wetness: ${currentWetness} → ${newWetness} (change: ${newWetness - currentWetness})`);
      log(`   ❄️ Snow: ${currentSnow} → ${newSnow} (change: ${newSnow - currentSnow})`);
      log(`   🗺️ Terrain changes triggered: Wetness≥3=${newWetness >= 3}, Snow≥3=${newSnow >= 3}, Snow≥5=${newSnow >= 5}, Snow≥8=${newSnow >= 8}`);
      
      // Apply terrain changes based on environmental levels
      let changed = false;
      
      // Priority system: Snow effects override wetness effects
      // Phase 2-B: Snow accumulation terrain changes (highest priority)
      if (newEnvironmentalLevels.snow >= 8) {
        log(`🧊 FREEZING SEAS: Snow level ${newEnvironmentalLevels.snow} ≥ 8, converting Sea → FrozenSea`);
        // Snow level 8+: Sea → FrozenSea
        let seaCount = 0;
        newBoardLayout.forEach((tile, key) => {
          if (tile.terrain === 'Sea') {
            newBoardLayout.set(key, { ...tile, terrain: 'FrozenSea' });
            changed = true;
            seaCount++;
          }
        });
        log(`   ✅ Converted ${seaCount} Sea tiles to FrozenSea`);
      }
      
      if (newEnvironmentalLevels.snow >= 5) {
        log(`🧊 FREEZING RIVERS: Snow level ${newEnvironmentalLevels.snow} ≥ 5, converting River → FrozenRiver`);
        // Snow level 5+: River → FrozenRiver
        let riverCount = 0;
        newBoardLayout.forEach((tile, key) => {
          if (tile.terrain === 'River') {
            newBoardLayout.set(key, { ...tile, terrain: 'FrozenRiver' });
            changed = true;
            riverCount++;
          }
        });
        log(`   ✅ Converted ${riverCount} River tiles to FrozenRiver`);
      }
      
      if (newEnvironmentalLevels.snow >= 3) {
        log(`❄️ HEAVY SNOW: Snow level ${newEnvironmentalLevels.snow} ≥ 3, converting Plains/Mud → Snow`);
        // Snow level 3+: Plains → Snow, Mud → Snow (snow overrides wetness)
        let plainsCount = 0;
        let mudCount = 0;
        newBoardLayout.forEach((tile, key) => {
          if (tile.terrain === 'Plains') {
            newBoardLayout.set(key, { ...tile, terrain: 'Snow' });
            changed = true;
            plainsCount++;
          } else if (tile.terrain === 'Mud') {
            newBoardLayout.set(key, { ...tile, terrain: 'Snow' });
            changed = true;
            mudCount++;
          }
        });
        log(`   ✅ Converted ${plainsCount} Plains + ${mudCount} Mud tiles to Snow`);
      }
      
      // Phase 2-C: Snow melting terrain changes 
      if (newEnvironmentalLevels.snow <= 2) {
        // Snow level 2 or lower: FrozenSea → Sea
        newBoardLayout.forEach((tile, key) => {
          if (tile.terrain === 'FrozenSea') {
            newBoardLayout.set(key, { ...tile, terrain: 'Sea' });
            changed = true;
          }
        });
      }
      
      if (newEnvironmentalLevels.snow <= 1) {
        // Snow level 1 or lower: FrozenRiver → River
        newBoardLayout.forEach((tile, key) => {
          if (tile.terrain === 'FrozenRiver') {
            newBoardLayout.set(key, { ...tile, terrain: 'River' });
            changed = true;
          }
        });
      }
      
      if (newEnvironmentalLevels.snow === 0) {
        // Snow level 0: Snow → Mud (intermediate step)
        newBoardLayout.forEach((tile, key) => {
          if (tile.terrain === 'Snow') {
            newBoardLayout.set(key, { ...tile, terrain: 'Mud' });
            changed = true;
          }
        });
      }
      
      // Rain/Storm effects - only apply if snow level is low (< 3)
      if (newEnvironmentalLevels.snow < 3) {
        log(`🌧️ RAIN/STORM EFFECTS: Snow level ${newEnvironmentalLevels.snow} < 3, wetness effects can apply`);
        if (newEnvironmentalLevels.wetness >= 3) {
          log(`💧 WET GROUND: Wetness level ${newEnvironmentalLevels.wetness} ≥ 3, converting Plains → Mud`);
          // Wetness level 3+: Plains → Mud (only if not frozen)
          let plainsToMudCount = 0;
          newBoardLayout.forEach((tile, key) => {
            if (tile.terrain === 'Plains') {
              newBoardLayout.set(key, { ...tile, terrain: 'Mud' });
              changed = true;
              plainsToMudCount++;
            }
          });
          log(`   ✅ Converted ${plainsToMudCount} Plains tiles to Mud`);
        } else if (newEnvironmentalLevels.wetness <= 1) {
          log(`☀️ DRY GROUND: Wetness level ${newEnvironmentalLevels.wetness} ≤ 1, converting Mud → Plains`);
          // Low wetness: Mud → Plains (only if not frozen)
          let mudToPlainsCount = 0;
          newBoardLayout.forEach((tile, key) => {
            if (tile.terrain === 'Mud') {
              newBoardLayout.set(key, { ...tile, terrain: 'Plains' });
              changed = true;
              mudToPlainsCount++;
            }
          });
          log(`   ✅ Converted ${mudToPlainsCount} Mud tiles to Plains`);
        } else {
          log(`🌤️ STABLE WETNESS: Wetness level ${newEnvironmentalLevels.wetness} in stable range (2), no wetness terrain changes`);
        }
      } else {
        log(`❄️ FROZEN CONDITIONS: Snow level ${newEnvironmentalLevels.snow} ≥ 3, rain/storm wetness effects suppressed`);
      }
      
      if (changed) {
        setBoardLayout(newBoardLayout);
        log(`🗺️ TERRAIN CHANGES APPLIED: Board layout updated due to environmental effects`);
      } else {
        log(`🗺️ NO TERRAIN CHANGES: Environmental levels did not trigger any terrain modifications`);
      }
    }

    finalUnits = unitsWithHealing;
    
    setBoardLayout(newBoardLayout);
    setSelectedUnitId(null);
    checkWinCondition(finalUnits, newBoardLayout);
  }, [activeTeam, units, weather, environmentalLevels, boardLayout, turn, month, turnLimit, defendingTeam, armyFunds, setUnits, setActiveTeam, setBoardLayout, setTurn, setMonth, setWeather, setEnvironmentalLevels, setSelectedUnitId, checkWinCondition, setGameState, setWinner, setVictoryResult, setArmyFunds]);

  return {
    handleEndTurn,
    checkWinCondition,
  };
};;