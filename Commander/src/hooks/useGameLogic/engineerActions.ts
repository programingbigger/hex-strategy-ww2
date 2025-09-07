import { useCallback } from 'react';
import {
  Unit,
  BoardLayout,
  Coordinate,
  Tile
} from '../../types';
import { coordToString, getNeighbors } from '../../utils/map';

export interface EngineerActionsHook {
  getAvailableBridgeBuildTargets: (unit: Unit) => Coordinate[];
  getAvailableBridgeDestroyTargets: (unit: Unit) => Coordinate[];
  startEngineerAction: (actionType: 'build_bridge' | 'destroy_bridge') => void;
  handleEngineerTargetSelect: (coord: Coordinate) => void;
  confirmEngineerAction: () => void;
  cancelEngineerAction: () => void;
  cancelEngineerSelectionMode: () => void;
  handleMaterialActionWithTarget: (
    action: 'build_bridge' | 'destroy_bridge',
    targetCoord: Coordinate
  ) => void;
}

interface EngineerActionsDeps {
  selectedUnit: Unit | null;
  boardLayout: BoardLayout;
  units: Unit[];
  engineerActionState: {
    mode: 'none' | 'selecting_bridge_build' | 'selecting_bridge_destroy';
    unit: Unit | null;
    availableTargets: Coordinate[];
  };
  engineerConfirmState: {
    isOpen: boolean;
    actionType: 'build_bridge' | 'destroy_bridge' | null;
    targetCoord: Coordinate | null;
    targetTile: Tile | null;
    materialCost: number;
  };
  setEngineerActionState: (state: {
    mode: 'none' | 'selecting_bridge_build' | 'selecting_bridge_destroy';
    unit: Unit | null;
    availableTargets: Coordinate[];
  }) => void;
  setEngineerConfirmState: (state: {
    isOpen: boolean;
    actionType: 'build_bridge' | 'destroy_bridge' | null;
    targetCoord: Coordinate | null;
    targetTile: Tile | null;
    materialCost: number;
  }) => void;
  setBoardLayout: (layout: BoardLayout) => void;
  setUnits: (units: Unit[]) => void;
  setSelectedUnitId: (id: string | null) => void;
  saveStateToHistory: () => void;
  consumeMaterial: (unit: Unit, amount: number) => Unit | null;
}

export const useEngineerActions = (deps: EngineerActionsDeps): EngineerActionsHook => {
  const {
    selectedUnit,
    boardLayout,
    units,
    engineerActionState,
    engineerConfirmState,
    setEngineerActionState,
    setEngineerConfirmState,
    setBoardLayout,
    setUnits,
    setSelectedUnitId,
    saveStateToHistory,
    consumeMaterial
  } = deps;

  const getAvailableBridgeBuildTargets = useCallback((unit: Unit): Coordinate[] => {
    if (!unit || unit.type !== 'Engineer') return [];
    
    const targets: Coordinate[] = [];
    const unitCoord = { x: unit.x, y: unit.y };
    
    const currentTile = boardLayout.get(coordToString(unitCoord));
    if (currentTile?.terrain === 'River') {
      targets.push(unitCoord);
    }
    
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
    
    const currentTile = boardLayout.get(coordToString(unitCoord));
    if (currentTile?.terrain === 'Bridge') {
      targets.push(unitCoord);
    }
    
    const neighbors = getNeighbors(unitCoord);
    for (const coord of neighbors) {
      const tile = boardLayout.get(coordToString(coord));
      if (tile?.terrain === 'Bridge') {
        targets.push(coord);
      }
    }
    
    return targets;
  }, [boardLayout]);

  const startEngineerAction = useCallback((actionType: 'build_bridge' | 'destroy_bridge') => {
    if (!selectedUnit || selectedUnit.type !== 'Engineer') return;
    
    const materialWeapon = selectedUnit.weapons?.find(w => w.type === '資材');
    const availableMaterials = materialWeapon?.ammunition || 0;
    
    if (availableMaterials < 2) return;
    
    let targets: Coordinate[] = [];
    let mode: 'selecting_bridge_build' | 'selecting_bridge_destroy';
    
    if (actionType === 'build_bridge') {
      targets = getAvailableBridgeBuildTargets(selectedUnit);
      mode = 'selecting_bridge_build';
    } else {
      targets = getAvailableBridgeDestroyTargets(selectedUnit);
      mode = 'selecting_bridge_destroy';
    }
    
    if (targets.length === 0) return;
    
    setEngineerActionState({
      mode,
      unit: selectedUnit,
      availableTargets: targets
    });
  }, [selectedUnit, getAvailableBridgeBuildTargets, getAvailableBridgeDestroyTargets, setEngineerActionState]);

  const handleEngineerTargetSelect = useCallback((coord: Coordinate) => {
    if (engineerActionState.mode === 'none' || !engineerActionState.unit) return;
    
    const isValidTarget = engineerActionState.availableTargets.some(
      target => target.x === coord.x && target.y === coord.y
    );
    
    if (!isValidTarget) {
      setEngineerActionState({ mode: 'none', unit: null, availableTargets: [] });
      return;
    }
    
    const targetTile = boardLayout.get(coordToString(coord));
    if (!targetTile) return;
    
    const actionType = engineerActionState.mode === 'selecting_bridge_build' ? 'build_bridge' : 'destroy_bridge';
    
    setEngineerConfirmState({
      isOpen: true,
      actionType,
      targetCoord: coord,
      targetTile,
      materialCost: 2
    });
    
    setEngineerActionState({ mode: 'none', unit: null, availableTargets: [] });
  }, [engineerActionState, boardLayout, setEngineerActionState, setEngineerConfirmState]);

  const handleMaterialActionWithTarget = useCallback((
    action: 'build_bridge' | 'destroy_bridge',
    targetCoord: Coordinate
  ) => {
    if (!selectedUnit || selectedUnit.type !== 'Engineer') return;
    
    const targetTile = boardLayout.get(coordToString(targetCoord));
    if (!targetTile) return;
    
    const requiredMaterials = 2;
    
    let canPerformAction = false;
    if (action === 'build_bridge' && targetTile.terrain === 'River') {
      canPerformAction = true;
    } else if (action === 'destroy_bridge' && targetTile.terrain === 'Bridge') {
      canPerformAction = true;
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
  }, [selectedUnit, boardLayout, units, saveStateToHistory, consumeMaterial, setBoardLayout, setUnits, setSelectedUnitId]);

  const confirmEngineerAction = useCallback(() => {
    if (!engineerConfirmState.isOpen || !engineerConfirmState.targetCoord || !engineerConfirmState.actionType) return;
    
    const { actionType, targetCoord } = engineerConfirmState;
    
    handleMaterialActionWithTarget(actionType, targetCoord);
    
    setEngineerConfirmState({ 
      isOpen: false, 
      actionType: null, 
      targetCoord: null, 
      targetTile: null, 
      materialCost: 0 
    });
  }, [engineerConfirmState, handleMaterialActionWithTarget, setEngineerConfirmState]);

  const cancelEngineerAction = useCallback(() => {
    setEngineerConfirmState({ 
      isOpen: false, 
      actionType: null, 
      targetCoord: null, 
      targetTile: null, 
      materialCost: 0 
    });
    
    setEngineerActionState({ 
      mode: 'none', 
      unit: null, 
      availableTargets: [] 
    });
  }, [setEngineerConfirmState, setEngineerActionState]);

  const cancelEngineerSelectionMode = useCallback(() => {
    setEngineerActionState({ 
      mode: 'none', 
      unit: null, 
      availableTargets: [] 
    });
  }, [setEngineerActionState]);

  return {
    getAvailableBridgeBuildTargets,
    getAvailableBridgeDestroyTargets,
    startEngineerAction,
    handleEngineerTargetSelect,
    confirmEngineerAction,
    cancelEngineerAction,
    cancelEngineerSelectionMode,
    handleMaterialActionWithTarget,
  };
};