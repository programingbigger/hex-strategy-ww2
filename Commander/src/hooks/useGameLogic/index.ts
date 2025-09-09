import { useMemo, useCallback } from 'react';
import {
  Unit,
  Coordinate,
  BoardLayout,
  Team,
  Tile
} from '../../types';
import {
  calculateReachableTiles,
  coordToString,
  getDistance,
  findPath,
} from '../../utils/map';
import {
  getWeaponsInRange,
  getMaxAttackRange,
  getMinAttackRange
} from '../../utils/weapons';
import { TERRAIN_STATS } from '../../config/constants';
import { armyManager } from '../../data/units';
import { ProducibleUnit } from '../../components/game/ProductionModal';
import { logError } from '../../utils/logger';
import { 
  canProduceUnitsAtLocation,
  getActiveProductionCapital,
  getActiveProductionCapitalCoord,
  getProductionCapitals
} from '../../utils/productionOrder';

import { useGameState } from './gameState';
import { useUIStates } from './uiStates';
import { useBattleSystem } from './battleSystem';
import { useTurnManagement } from './turnManagement';
import { useUnitActions } from './unitActions';
import { useEngineerActions } from './engineerActions';
import { useTransportActions } from './transportActions';
import { useArmyManagement } from './armyManagement';
import { useReinforcements } from './reinforcements';

// Helper functions
const isCapitalTerrain = (terrain: string): boolean => {
  return terrain === 'Capital';
};

const getCapitals = (board: BoardLayout): Tile[] => {
  return Array.from(board.values()).filter(t => isCapitalTerrain(t.terrain));
};

const getCapitalsForTeam = (board: BoardLayout, team: Team): Tile[] => {
  return getCapitals(board).filter(c => c.owner === team);
};

export const useGameLogic = (mapId: string = 'test_map_1') => {
  // Initialize all sub-hooks
  const gameState = useGameState();
  const uiStates = useUIStates();
  
  // Initialize reinforcement system with dynamic mapId
  const reinforcements = useReinforcements({ mapId });
  
  const battleSystem = useBattleSystem({
    boardLayout: gameState.boardLayout,
    units: gameState.units,
    turn: gameState.turn,
    activeTeam: gameState.activeTeam,
    weaponSelectionState: uiStates.weaponSelectionState,
    setUnits: gameState.setUnits,
    setSelectedUnitId: gameState.setSelectedUnitId,
    setBattleReport: uiStates.setBattleReport,
    setWeaponSelectionState: uiStates.setWeaponSelectionState,
    setBattleLog: uiStates.setBattleLog,
    checkWinCondition: () => {} // Will be set after turnManagement is created
  });

  const turnManagement = useTurnManagement({
    mapId, // Pass mapId to turnManagement
    activeTeam: gameState.activeTeam,
    units: gameState.units,
    weather: gameState.weather,
    weatherDuration: gameState.weatherDuration,
    boardLayout: gameState.boardLayout,
    turn: gameState.turn,
    turnLimit: gameState.turnLimit,
    defendingTeam: gameState.defendingTeam,
    setUnits: gameState.setUnits,
    setActiveTeam: gameState.setActiveTeam,
    setBoardLayout: gameState.setBoardLayout,
    setTurn: gameState.setTurn,
    setWeather: gameState.setWeather,
    setWeatherDuration: gameState.setWeatherDuration,
    setSelectedUnitId: gameState.setSelectedUnitId,
    setGameState: gameState.setGameState,
    setWinner: gameState.setWinner,
    setVictoryResult: gameState.setVictoryResult,
  });

  // Update battleSystem with checkWinCondition reference
  const battleSystemWithWinCheck = useBattleSystem({
    boardLayout: gameState.boardLayout,
    units: gameState.units,
    turn: gameState.turn,
    activeTeam: gameState.activeTeam,
    weaponSelectionState: uiStates.weaponSelectionState,
    setUnits: gameState.setUnits,
    setSelectedUnitId: gameState.setSelectedUnitId,
    setBattleReport: uiStates.setBattleReport,
    setWeaponSelectionState: uiStates.setWeaponSelectionState,
    setBattleLog: uiStates.setBattleLog,
    checkWinCondition: turnManagement.checkWinCondition
  });

  const unitActions = useUnitActions({
    selectedUnit: gameState.units.find(u => u.id === gameState.selectedUnitId && !u.loaded) || null,
    selectedUnitTile: gameState.boardLayout.get(
      coordToString(gameState.units.find(u => u.id === gameState.selectedUnitId && !u.loaded) || { x: 0, y: 0 })
    ),
    units: gameState.units,
    boardLayout: gameState.boardLayout,
    history: gameState.history,
    setUnits: gameState.setUnits,
    setSelectedUnitId: gameState.setSelectedUnitId,
    setBoardLayout: gameState.setBoardLayout,
    setHistory: gameState.setHistory,
    saveStateToHistory: gameState.saveStateToHistory,
  });

  const engineerActions = useEngineerActions({
    selectedUnit: gameState.units.find(u => u.id === gameState.selectedUnitId && !u.loaded) || null,
    boardLayout: gameState.boardLayout,
    units: gameState.units,
    engineerActionState: uiStates.engineerActionState,
    engineerConfirmState: uiStates.engineerConfirmState,
    setEngineerActionState: uiStates.setEngineerActionState,
    setEngineerConfirmState: uiStates.setEngineerConfirmState,
    setBoardLayout: gameState.setBoardLayout,
    setUnits: gameState.setUnits,
    setSelectedUnitId: gameState.setSelectedUnitId,
    saveStateToHistory: gameState.saveStateToHistory,
    consumeMaterial: unitActions.consumeMaterial,
  });

  const transportActions = useTransportActions({
    selectedUnit: gameState.units.find(u => u.id === gameState.selectedUnitId && !u.loaded) || null,
    boardLayout: gameState.boardLayout,
    units: gameState.units,
    transportActionState: uiStates.transportActionState,
    transportConfirmState: uiStates.transportConfirmState,
    setTransportActionState: uiStates.setTransportActionState,
    setTransportConfirmState: uiStates.setTransportConfirmState,
    setUnits: gameState.setUnits,
    setSelectedUnitId: gameState.setSelectedUnitId,
  });

  const armyManagement = useArmyManagement({
    units: gameState.units,
    productionState: uiStates.productionState,
    setUnits: gameState.setUnits,
    setProductionState: uiStates.setProductionState,
  });

  // Computed values
  const selectedUnit = useMemo(() => 
    gameState.units.find(u => u.id === gameState.selectedUnitId && !u.loaded) || null, 
    [gameState.units, gameState.selectedUnitId]
  );

  const selectedUnitTile = useMemo(() => {
    if (!selectedUnit) return null;
    return gameState.boardLayout.get(coordToString(selectedUnit)) ?? null;
  }, [selectedUnit, gameState.boardLayout]);

  const reachableTiles = useMemo(() => {
    if (!selectedUnit || selectedUnit.moved) return [];
    
    if (uiStates.engineerActionState.mode !== 'none') return [];
    
    return calculateReachableTiles(
      { x: selectedUnit.x, y: selectedUnit.y }, 
      selectedUnit.movement, 
      selectedUnit.fuel, 
      gameState.boardLayout, 
      gameState.units, 
      gameState.activeTeam
    );
  }, [selectedUnit, gameState.boardLayout, gameState.units, gameState.activeTeam, uiStates.engineerActionState.mode]);

  const attackableTiles = useMemo(() => {
    if (!selectedUnit || selectedUnit.attacked) return [];

    if (selectedUnit.weapons && Array.isArray(selectedUnit.weapons) && selectedUnit.weapons.length > 0) {
      const attackRangeMin = getMinAttackRange(selectedUnit);
      const attackRangeMax = getMaxAttackRange(selectedUnit);
      
      if (attackRangeMax === 0) return [];

      const potentialTargets: Coordinate[] = [];
      for (const [, tile] of Array.from(gameState.boardLayout.entries())) {
        const distance = getDistance({ x: selectedUnit.x, y: selectedUnit.y }, tile);
        if (distance >= attackRangeMin && distance <= attackRangeMax) {
          potentialTargets.push(tile);
        }
      }
      return potentialTargets.filter(coord =>
        gameState.units.some(u => u.x === coord.x && u.y === coord.y && u.team !== selectedUnit.team)
      );
    }

    const attackRangeMin = selectedUnit.attackRange.min;
    const attackRangeMax = selectedUnit.attackRange.max;

    const potentialTargets: Coordinate[] = [];
    for (const [, tile] of Array.from(gameState.boardLayout.entries())) {
      const distance = getDistance({ x: selectedUnit.x, y: selectedUnit.y }, tile);
      if (distance >= attackRangeMin && distance <= attackRangeMax) {
        potentialTargets.push(tile);
      }
    }

    return potentialTargets.filter(coord =>
      gameState.units.some(u => u.x === coord.x && u.y === coord.y && u.team !== selectedUnit.team)
    );
  }, [selectedUnit, gameState.units, gameState.boardLayout]);

  const engineerTargetTiles = useMemo(() => {
    return uiStates.engineerActionState.availableTargets;
  }, [uiStates.engineerActionState.availableTargets]);

  const transportTargetTiles = useMemo(() => {
    return uiStates.transportActionState.availableTargets;
  }, [uiStates.transportActionState.availableTargets]);

  // Main hex click handler
  const handleHexClick = useCallback((coord: Coordinate) => {
    if (gameState.gameState === 'gameOver') return;

    if (uiStates.engineerActionState.mode !== 'none') {
      engineerActions.handleEngineerTargetSelect(coord);
      return;
    }

    if (uiStates.transportActionState.mode !== 'none') {
      transportActions.handleTransportTargetSelect(coord);
      return;
    }

    const unitOnHex = gameState.units.find(u => u.x === coord.x && u.y === coord.y);

    if (selectedUnit) {
      if (unitOnHex && unitOnHex.id === selectedUnit.id) {
        gameState.setSelectedUnitId(null);
        return;
      }

      const isAttackable = attackableTiles.some(t => t.x === coord.x && t.y === coord.y);
      if (isAttackable && unitOnHex && unitOnHex.team !== selectedUnit.team) {
        gameState.saveStateToHistory();
        
        if (selectedUnit.weapons && Array.isArray(selectedUnit.weapons) && selectedUnit.weapons.length > 0) {
          const distance = getDistance(selectedUnit, unitOnHex);
          const availableWeapons = getWeaponsInRange(selectedUnit, distance);
          
          if (availableWeapons.length === 0) {
            console.warn('No weapons available for attack');
            return;
          } else {
            if (selectedUnit.team === gameState.activeTeam) {
              uiStates.setWeaponSelectionState({
                isOpen: true,
                attacker: selectedUnit,
                target: unitOnHex
              });
              return;
            } else {
              battleSystemWithWinCheck.handleAttackWithWeapon(selectedUnit, unitOnHex, availableWeapons[0]);
              return;
            }
          }
        } else {
          battleSystemWithWinCheck.handleAttack(selectedUnit, unitOnHex);
        }
        return;
      }

      const isReachable = reachableTiles.some(t => t.x === coord.x && t.y === coord.y);
      if (isReachable && !unitOnHex) {
        gameState.saveStateToHistory();
        
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
        
        const path = findPath(selectedUnit, coord, gameState.boardLayout, gameState.units, gameState.activeTeam);
        let fuelCost = 0;
        if (path && path.length > 1) {
          for (let i = 1; i < path.length; i++) {
            const tileCoord = path[i];
            const tileKey = coordToString(tileCoord);
            const tile = gameState.boardLayout.get(tileKey);
            if (tile) {
              const terrainStats = TERRAIN_STATS[tile.terrain];
              let moveCost = terrainStats.movementCost[selectedUnit.type] ?? terrainStats.movementCost.default;
              
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
        
        const updatedUnit = selectedUnit.type === 'Artillery' 
          ? { ...selectedUnit, x: coord.x, y: coord.y, moved: true, attacked: true, fuel: selectedUnit.fuel - fuelCost }
          : { ...selectedUnit, x: coord.x, y: coord.y, moved: true, fuel: selectedUnit.fuel - fuelCost };
        
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
        
        const destinationTile = gameState.boardLayout.get(coordToString(coord));
        logError('🏙️ DESTINATION TILE INFO:', {
          coord: coord,
          tile: destinationTile,
          terrain: destinationTile?.terrain,
          owner: destinationTile?.owner,
          hp: destinationTile?.hp
        });
        
        gameState.setUnits(gameState.units.map(u => u.id === selectedUnit.id ? updatedUnit : u));
        return;
      }

      gameState.setSelectedUnitId(null);
    } else {
      if (unitOnHex && unitOnHex.team === gameState.activeTeam && !unitOnHex.moved && !unitOnHex.attacked) {
        gameState.setSelectedUnitId(unitOnHex.id);
      } else {
        const clickedTile = gameState.boardLayout.get(coordToString(coord));
        if (clickedTile && clickedTile.owner === gameState.activeTeam && !unitOnHex) {
          // Use the new production order system to determine if production is allowed
          const canProduce = canProduceUnitsAtLocation(gameState.boardLayout, coord, gameState.activeTeam);

          if (canProduce) {
            const faction = gameState.activeTeam === 'Blue' ? 'Blue' : 'Red';
            const producibleUnits = armyManager.getUnitTemplatesBy(faction);
            uiStates.setProductionState({
              isOpen: true,
              capital: coord,
              producibleUnits: producibleUnits as ProducibleUnit[],
            });
          } else {
            gameState.setSelectedUnitId(null);
          }
        } else {
          gameState.setSelectedUnitId(null);
        }
      }
    }
  }, [
    gameState,
    uiStates,
    selectedUnit,
    attackableTiles,
    reachableTiles,
    engineerActions,
    transportActions,
    battleSystemWithWinCheck
  ]);

  // Return the complete API
  return {
    // Game state
    gameState: gameState.gameState,
    turn: gameState.turn,
    activeTeam: gameState.activeTeam,
    boardLayout: gameState.boardLayout,
    units: gameState.units,
    selectedUnit,
    selectedUnitId: gameState.selectedUnitId,
    selectedUnitTile,
    winner: gameState.winner,
    weather: gameState.weather,
    weatherDuration: gameState.weatherDuration,
    turnLimit: gameState.turnLimit,
    attackingTeam: gameState.attackingTeam,
    defendingTeam: gameState.defendingTeam,
    enabledVictoryConditions: gameState.enabledVictoryConditions,
    victoryResult: gameState.victoryResult,
    
    // UI states
    hoveredHex: uiStates.hoveredHex,
    battleReport: uiStates.battleReport,
    weaponSelectionState: uiStates.weaponSelectionState,
    productionState: uiStates.productionState,
    engineerActionState: uiStates.engineerActionState,
    transportActionState: uiStates.transportActionState,
    transportConfirmState: uiStates.transportConfirmState,
    engineerConfirmState: uiStates.engineerConfirmState,
    battleLog: uiStates.battleLog,
    
    // Computed tiles
    reachableTiles,
    attackableTiles,
    engineerTargetTiles,
    transportTargetTiles,
    
    // Reinforcement system
    reinforcementSpawnLocations: reinforcements.reinforcementSpawnLocations,
    isReinforcementSpawnLocation: reinforcements.isReinforcementSpawnLocation,
    getReinforcementsForPreview: reinforcements.getReinforcementsForPreview,
    
    // Game state methods
    loadGame: gameState.loadGame,
    saveStateToHistory: gameState.saveStateToHistory,
    
    // UI state setters
    setHoveredHex: uiStates.setHoveredHex,
    setBattleReport: uiStates.setBattleReport,
    setBattleLog: uiStates.setBattleLog,
    
    // Turn management
    handleEndTurn: turnManagement.handleEndTurn,
    checkWinCondition: turnManagement.checkWinCondition,
    
    // Battle system
    createBattleLogEntry: battleSystemWithWinCheck.createBattleLogEntry,
    addBattleLogEntry: battleSystemWithWinCheck.addBattleLogEntry,
    handleAttack: battleSystemWithWinCheck.handleAttack,
    handleAttackWithWeapon: battleSystemWithWinCheck.handleAttackWithWeapon,
    handleWeaponSelect: battleSystemWithWinCheck.handleWeaponSelect,
    handleWeaponSelectionClose: battleSystemWithWinCheck.handleWeaponSelectionClose,
    
    // Unit actions
    handleAction: unitActions.handleAction,
    handleMaterialAction: unitActions.handleMaterialAction,
    
    // Engineer actions
    startEngineerAction: engineerActions.startEngineerAction,
    confirmEngineerAction: engineerActions.confirmEngineerAction,
    cancelEngineerAction: engineerActions.cancelEngineerAction,
    cancelEngineerSelectionMode: engineerActions.cancelEngineerSelectionMode,
    
    // Transport actions
    startTransportAction: transportActions.startTransportAction,
    handleUnitSelection: transportActions.handleUnitSelection,
    cancelUnitSelection: transportActions.cancelUnitSelection,
    confirmTransportAction: transportActions.confirmTransportAction,
    cancelTransportAction: transportActions.cancelTransportAction,
    cancelTransportSelectionMode: transportActions.cancelTransportSelectionMode,
    
    // Army management
    getUnitsByBranch: armyManagement.getUnitsByBranch,
    getUnitsByCategory: armyManagement.getUnitsByCategory,
    getAvailableUnitsFromArmy: armyManagement.getAvailableUnitsFromArmy,
    createUnitFromArmy: armyManagement.createUnitFromArmy,
    getBranchesFor: armyManagement.getBranchesFor,
    getCategoriesFor: armyManagement.getCategoriesFor,
    getCommandStructure: armyManagement.getCommandStructure,
    calculateCommandBonus: armyManagement.calculateCommandBonus,
    handleUnitProduction: armyManagement.handleUnitProduction,
    handleProductionClose: armyManagement.handleProductionClose,
    
    // Main interaction handler
    handleHexClick,
    
    // Helper functions for victory system
    isCapitalTerrain,
    getCapitals,
    getCapitalsForTeam,
    
    // Production order system
    getActiveProductionCapital: (team: Team) => getActiveProductionCapital(gameState.boardLayout, team),
    getActiveProductionCapitalCoord: (team: Team) => getActiveProductionCapitalCoord(gameState.boardLayout, team),
    getProductionCapitals: (team: Team) => getProductionCapitals(gameState.boardLayout, team),
    canProduceUnitsAtLocation: (coord: Coordinate, team: Team) => canProduceUnitsAtLocation(gameState.boardLayout, coord, team),
  };
};;