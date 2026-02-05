import { useCallback, useRef } from 'react';
import {
  Unit,
  BoardLayout,
  GameStateSnapshot,
  Team
} from '../../types';
import {
  coordToString,
  getNeighbors
} from '../../utils/map';
import { CITY_HP, CAPTURE_DAMAGE_HIGH_HP, CAPTURE_DAMAGE_LOW_HP, TERRAIN_STATS } from '../../config/constants';
import { logInfantryAction, logTransportOperation } from '../../utils/logger';
import {
  processEngineerActionWithCost,
  EngineerActionType,
  DEFAULT_ENGINEER_COST_CONFIG
} from '../../utils/engineerActionCostManager';

// Helper functions
const isCapturableTerrain = (terrain: string): boolean => {
  return terrain === 'City' || terrain === 'Capital' || terrain === 'Airport' || terrain === 'Port';
};

export interface UnitActionsHook {
  handleAction: (
    action: 'wait' | 'undo' | 'capture' | 'enhance_city' | 'build_bridge' | 'build_fortress' | 'destroy_fortress' | 'load' | 'unload' | 'supply'
  ) => void;
  handleMaterialAction: (
    action: 'enhance_city' | 'build_bridge' | 'build_fortress' | 'destroy_fortress'
  ) => void;
  consumeMaterial: (unit: Unit, amount: number) => Unit | null;
  /** 補給アクション実行関数（外部から注入） */
  setSupplyExecutor: (executor: (unit: Unit, allUnits: Unit[]) => Unit[] | null) => void;
}

interface UnitActionsDeps {
  selectedUnit: Unit | null;
  selectedUnitTile: any;
  units: Unit[];
  boardLayout: BoardLayout;
  history: GameStateSnapshot[];
  setUnits: (units: Unit[]) => void;
  setSelectedUnitId: (id: string | null) => void;
  setBoardLayout: (layout: BoardLayout) => void;
  setHistory: (history: GameStateSnapshot[] | ((prevHistory: GameStateSnapshot[]) => GameStateSnapshot[])) => void;
  saveStateToHistory: () => void;
  // Add fund management for engineer action costs
  armyFunds: { [team: string]: number };
  setArmyFunds: (funds: { [team: string]: number }) => void;
}

export const useUnitActions = (deps: UnitActionsDeps): UnitActionsHook => {
  const {
    selectedUnit,
    selectedUnitTile,
    units,
    boardLayout,
    history,
    setUnits,
    setSelectedUnitId,
    setBoardLayout,
    setHistory,
    saveStateToHistory,
    armyFunds,
    setArmyFunds
  } = deps;

  // 補給アクション実行関数のRef（外部から注入される）
  const supplyExecutorRef = useRef<((unit: Unit, allUnits: Unit[]) => Unit[] | null) | null>(null);

  const setSupplyExecutor = useCallback((executor: (unit: Unit, allUnits: Unit[]) => Unit[] | null) => {
    supplyExecutorRef.current = executor;
  }, []);

  const consumeMaterial = useCallback((unit: Unit, amount: number): Unit | null => {
    const materialWeapon = unit.weapons?.find(w => w.type === '資材');
    if (!materialWeapon || materialWeapon.ammunition < amount) {
      return null;
    }
    
    const updatedWeapons = unit.weapons?.map(w => 
      w.type === '資材' 
        ? { ...w, ammunition: w.ammunition - amount }
        : w
    );
    
    return { ...unit, weapons: updatedWeapons };
  }, []);

  const handleMaterialAction = useCallback((
    action: 'enhance_city' | 'build_bridge' | 'build_fortress' | 'destroy_fortress'
  ) => {
    if (!selectedUnit || selectedUnit.type !== 'Engineer') return;

    // Process engineer action costs first
    const costResult = processEngineerActionWithCost(
      action as EngineerActionType,
      selectedUnit,
      { x: selectedUnit.x, y: selectedUnit.y },
      { x: selectedUnit.x, y: selectedUnit.y, terrain: 'Plains' } as any,
      armyFunds,
      DEFAULT_ENGINEER_COST_CONFIG
    );

    if (!costResult.success) {
      console.warn(`Engineer action ${action} failed due to insufficient resources:`, costResult.errors);
      return;
    }

    // Update funds if cost was applied
    if (costResult.fundsCost > 0) {
      setArmyFunds(costResult.updatedFunds);
      console.log(`💰 Engineer Action Cost Applied: ${action} (-${costResult.fundsCost} funds)`);
    }
    
    const currentTile = boardLayout.get(coordToString(selectedUnit));
    if (!currentTile) return;
    
    let requiredMaterials = 0;
    let canPerformAction = false;
    let targetTile = currentTile;
    let targetCoord = { x: selectedUnit.x, y: selectedUnit.y };
    
    switch (action) {
      case 'enhance_city':
        canPerformAction = (currentTile.terrain === 'City' || 
                          currentTile.terrain === 'Capital' || 
                          currentTile.terrain === 'Airport' || 
                          currentTile.terrain === 'Port') && 
                         currentTile.owner === selectedUnit.team;
        requiredMaterials = 1;
        break;
      case 'build_bridge':
        requiredMaterials = 2;
        if (currentTile.terrain === 'River') {
          canPerformAction = true;
          targetTile = currentTile;
          targetCoord = { x: selectedUnit.x, y: selectedUnit.y };
        } else {
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
    }
    
    if (!canPerformAction) return;
    
    const materialWeapon = selectedUnit.weapons?.find(w => w.type === '資材');
    if (!materialWeapon || materialWeapon.ammunition < requiredMaterials) {
      return;
    }
    
    saveStateToHistory();
    
    const updatedUnit = consumeMaterial(selectedUnit, requiredMaterials);
    if (!updatedUnit) return;
    
    const newBoardLayout = new Map(boardLayout);
    const tileKey = coordToString(targetCoord);
    
    switch (action) {
      case 'enhance_city':
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
    }
    
    setBoardLayout(newBoardLayout);
    setUnits(units.map(u => u.id === selectedUnit.id ? 
      { ...updatedUnit, moved: true, attacked: true } : u
    ));
    setSelectedUnitId(null);
  }, [selectedUnit, boardLayout, units, saveStateToHistory, consumeMaterial, setBoardLayout, setUnits, setSelectedUnitId, armyFunds, setArmyFunds]);

  const handleAction = useCallback((action: 'wait' | 'undo' | 'capture' | 'enhance_city' | 'build_bridge' | 'build_fortress' | 'destroy_fortress' | 'load' | 'unload' | 'supply') => {
    if (!selectedUnit) return;

    if (action === 'wait') {
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
      const loadableUnitTypes = ['Infantry', 'AntiTank', 'Artillery'];
      if (loadableUnitTypes.includes(selectedUnit.type)) {
        saveStateToHistory();
        
        const neighbors = getNeighbors({ x: selectedUnit.x, y: selectedUnit.y });
        const allPositions = [{ x: selectedUnit.x, y: selectedUnit.y }, ...neighbors];
        
        const nearbyTransport = units.find(unit => 
          unit.type === 'Transport' && 
          unit.team === selectedUnit.team &&
          allPositions.some(pos => pos.x === unit.x && pos.y === unit.y)
        );
        
        if (nearbyTransport) {
          logTransportOperation({
            infantryId: selectedUnit.id,
            infantryName: selectedUnit.name || selectedUnit.type,
            transportId: nearbyTransport.id,
            transportName: nearbyTransport.name || nearbyTransport.type,
            position: { x: selectedUnit.x, y: selectedUnit.y },
            team: selectedUnit.team,
            operation: 'load'
          });

          logInfantryAction({
            infantryId: selectedUnit.id,
            infantryName: selectedUnit.name || selectedUnit.type,
            action: 'load_transport',
            position: { x: selectedUnit.x, y: selectedUnit.y },
            team: selectedUnit.team,
            target: { x: nearbyTransport.x, y: nearbyTransport.y, type: nearbyTransport.type }
          });

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
      if (selectedUnit.type === 'Transport') {
        saveStateToHistory();
        
        const loadedUnit = units.find(unit => 
          unit.loaded && 
          unit.transportId === selectedUnit.id
        );
        
        if (loadedUnit) {
          const frontPosition = { x: selectedUnit.x + 1, y: selectedUnit.y };
          
          const frontTile = boardLayout.get(`${frontPosition.x},${frontPosition.y}`);
          const unitAtFront = units.find(u => 
            u.x === frontPosition.x && 
            u.y === frontPosition.y && 
            !u.loaded
          );
          
          // 降車対象ユニットのclassに基づき地形制約をチェック
          const frontTerrainStats = frontTile ? TERRAIN_STATS[frontTile.terrain] : null;
          const frontMoveCost = frontTerrainStats
            ? (frontTerrainStats.movementCost[loadedUnit.unitClass] ?? frontTerrainStats.movementCost.default)
            : Infinity;

          if (frontTile && !unitAtFront && frontMoveCost !== Infinity) {
            logTransportOperation({
              infantryId: loadedUnit.id,
              infantryName: loadedUnit.name || loadedUnit.type,
              transportId: selectedUnit.id,
              transportName: selectedUnit.name || selectedUnit.type,
              position: frontPosition,
              team: selectedUnit.team,
              operation: 'unload'
            });

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
    } else if (action === 'supply') {
      // 補給アクション（フリーアクション）
      if (supplyExecutorRef.current && selectedUnit) {
        const updatedUnits = supplyExecutorRef.current(selectedUnit, units);
        if (updatedUnits) {
          saveStateToHistory();
          setUnits(updatedUnits);
          // フリーアクション: selectedUnitId は維持（選択解除しない）
        }
      }
    } else if (['enhance_city', 'build_bridge', 'build_fortress', 'destroy_fortress'].includes(action)) {
      handleMaterialAction(action as 'enhance_city' | 'build_bridge' | 'build_fortress' | 'destroy_fortress');
    } else if (action === 'undo') {
      if (history.length > 0) {
        const lastState = history[history.length - 1];
        setUnits(lastState.units);
        setSelectedUnitId(lastState.selectedUnitId);
        setHistory((prevHistory: GameStateSnapshot[]) => prevHistory.slice(0, -1));
      }
    }
  }, [selectedUnit, selectedUnitTile, units, boardLayout, history, saveStateToHistory, handleMaterialAction, setUnits, setSelectedUnitId, setBoardLayout, setHistory]);

  return {
    handleAction,
    handleMaterialAction,
    consumeMaterial,
    setSupplyExecutor,
  };
};