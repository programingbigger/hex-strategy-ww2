import { useCallback, useRef, useEffect } from 'react';
import {
  Unit,
  BoardLayout,
  Team,
  WeatherType,
  VictoryResult
} from '../../types';
import { coordToString } from '../../utils/map';
import { CITY_HP, CITY_HEAL_RATE, UNIT_HEAL_HP, UNIT_STATS } from '../../config/constants';
import { log } from '../../utils/logger';
import { loadReinforcementConfig, getReinforcementsForTurn } from '../../utils/reinforcements';
import { ReinforcementConfig } from '../../types/reinforcements';
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
  weatherDuration: number;
  boardLayout: BoardLayout;
  turn: number;
  turnLimit?: number;
  defendingTeam: Team;
  setUnits: (units: Unit[]) => void;
  setActiveTeam: (team: Team) => void;
  setBoardLayout: (layout: BoardLayout) => void;
  setTurn: (turn: number) => void;
  setWeather: (weather: WeatherType) => void;
  setWeatherDuration: (duration: number) => void;
  setSelectedUnitId: (id: string | null) => void;
  setGameState: (state: 'playing' | 'gameOver') => void;
  setWinner: (winner: Team | null) => void;
  setVictoryResult: (result: VictoryResult | null) => void;
}

export const useTurnManagement = (deps: TurnManagementDeps): TurnManagementHook => {
  const {
    mapId, // Extract mapId from deps
    activeTeam,
    units,
    weather,
    weatherDuration,
    boardLayout,
    turn,
    turnLimit,
    defendingTeam,
    setUnits,
    setActiveTeam,
    setBoardLayout,
    setTurn,
    setWeather,
    setWeatherDuration,
    setSelectedUnitId,
    setGameState,
    setWinner,
    setVictoryResult
  } = deps;

  // Store reinforcement config to avoid repeated loading
  const reinforcementConfigRef = useRef<ReinforcementConfig | null>(null);
  const mapIdRef = useRef<string>(mapId); // Use mapId from props instead of hardcoded value

  // Update mapIdRef when mapId changes
  useEffect(() => {
    if (mapIdRef.current !== mapId) {
      mapIdRef.current = mapId;
      // Reset reinforcement config when map changes
      reinforcementConfigRef.current = null;
    }
  }, [mapId]);

  const checkWinCondition = useCallback((currentUnits: Unit[], currentBoard: BoardLayout) => {
    const blueUnits = currentUnits.filter(u => u.team === 'Blue');
    const redUnits = currentUnits.filter(u => u.team === 'Red');

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
  }, [turn, setGameState, setWinner, setVictoryResult]);

  // Function to spawn reinforcements
  const spawnReinforcements = useCallback(async (currentTurn: number, currentUnits: Unit[]): Promise<Unit[]> => {
    try {
      // Load reinforcement config if not already loaded
      if (!reinforcementConfigRef.current) {
        reinforcementConfigRef.current = await loadReinforcementConfig(mapIdRef.current);
        if (!reinforcementConfigRef.current) {
          console.log('🪖 No reinforcement config found for map:', mapIdRef.current, '- skipping reinforcement spawn');
          return currentUnits;
        }
        console.log('🪖 Loaded reinforcement config for map:', mapIdRef.current, reinforcementConfigRef.current);
      }

      const reinforcementsToSpawn = getReinforcementsForTurn(
        reinforcementConfigRef.current.reinforcements, 
        currentTurn
      );

      if (reinforcementsToSpawn.length === 0) {
        return currentUnits;
      }

      console.log(`🪖 Spawning ${reinforcementsToSpawn.length} reinforcement(s) on turn ${currentTurn} for map ${mapIdRef.current}:`);
      
      const newUnits = [...currentUnits];
      
      for (const reinforcement of reinforcementsToSpawn) {
        // Check if spawn location is occupied
        const isOccupied = currentUnits.some(u => 
          u.x === reinforcement.spawnLocation.x && u.y === reinforcement.spawnLocation.y
        );

        if (isOccupied) {
          console.warn(`⚠️ Reinforcement spawn location (${reinforcement.spawnLocation.x}, ${reinforcement.spawnLocation.y}) is occupied, skipping reinforcement ${reinforcement.id}`);
          continue;
        }

        // Create the new unit using army organization data
        const { createUnitFromArmy } = await import('../../data/armyLoader');
        const newUnit = createUnitFromArmy(
          reinforcement.unitId,
          `reinforcement-${reinforcement.id}-turn-${currentTurn}`,
          reinforcement.spawnLocation.x,
          reinforcement.spawnLocation.y
        );

        if (!newUnit) {
          console.error(`❌ Failed to create reinforcement unit with ID: ${reinforcement.unitId}`);
          continue;
        }

        // Ensure unit is assigned to correct team from reinforcement config
        newUnit.team = reinforcement.team;

        newUnits.push(newUnit);
        console.log(`✅ Spawned reinforcement: ${reinforcement.description} at (${reinforcement.spawnLocation.x}, ${reinforcement.spawnLocation.y})`);
      }

      return newUnits;
    } catch (error) {
      console.error('❌ Error spawning reinforcements:', error);
      return currentUnits;
    }
  }, []);

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
      
      // Check for reinforcements at the start of Blue's turn (beginning of new turn)
      finalUnits = await spawnReinforcements(newTurn, unitsWithHealing);
      if (finalUnits !== unitsWithHealing) {
        setUnits(finalUnits);
      }
      
      const weathers: WeatherType[] = ['Clear', 'Cloudy', 'Rain', 'Storm'];
      const nextWeather = weathers[Math.floor(Math.random() * weathers.length)];
      let newDuration = weatherDuration;
      if (nextWeather === 'Rain') {
        newDuration++;
      } else if (nextWeather === 'Storm') {
        newDuration += 3;
      } else if (nextWeather === 'Cloudy') {
        newDuration = 0; // Cloudy weather resets duration to 0
      } else {
        newDuration = Math.max(0, newDuration - 2);
      }
      setWeather(nextWeather);
      setWeatherDuration(newDuration);
      
      let changed = false;
      if (['Rain', 'Storm'].includes(nextWeather) && newDuration >= 3) {
        newBoardLayout.forEach((tile, key) => {
          if (tile.terrain === 'Plains') {
            newBoardLayout.set(key, { ...tile, terrain: 'Mud' });
            changed = true;
          }
        });
      } else if (newDuration <= 1) {
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
    } else {
      // Check for reinforcements at the start of Red's turn (enemy turn)
      finalUnits = await spawnReinforcements(turn, unitsWithHealing);
      if (finalUnits !== unitsWithHealing) {
        setUnits(finalUnits);
      }
    }
    
    setBoardLayout(newBoardLayout);
    setSelectedUnitId(null);
    checkWinCondition(finalUnits, newBoardLayout);
  }, [activeTeam, units, weather, weatherDuration, boardLayout, turn, turnLimit, defendingTeam, setUnits, setActiveTeam, setBoardLayout, setTurn, setWeather, setWeatherDuration, setSelectedUnitId, checkWinCondition, setGameState, setWinner, setVictoryResult, spawnReinforcements]);

  return {
    handleEndTurn,
    checkWinCondition,
  };
};;