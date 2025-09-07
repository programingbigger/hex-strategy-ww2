import { useCallback } from 'react';
import {
  Unit,
  BoardLayout,
  Coordinate,
  Tile
} from '../../types';
import { coordToString, getNeighbors } from '../../utils/map';
import { logTransportOperation } from '../../utils/logger';

export interface TransportActionsHook {
  getAvailableUnloadTargets: (unit: Unit) => Coordinate[];
  startTransportAction: () => void;
  handleUnitSelection: (selectedUnit: Unit) => void;
  cancelUnitSelection: () => void;
  handleTransportTargetSelect: (coord: Coordinate) => void;
  confirmTransportAction: () => void;
  cancelTransportAction: () => void;
  cancelTransportSelectionMode: () => void;
}

interface TransportActionsDeps {
  selectedUnit: Unit | null;
  boardLayout: BoardLayout;
  units: Unit[];
  transportActionState: {
    mode: 'none' | 'selecting_unit' | 'selecting_unload_position';
    unit: Unit | null;
    availableTargets: Coordinate[];
    selectedUnitToUnload: Unit | null;
  };
  transportConfirmState: {
    isOpen: boolean;
    actionType: 'unload' | null;
    targetCoord: Coordinate | null;
    targetTile: Tile | null;
    loadedUnit: Unit | null;
  };
  setTransportActionState: (state: {
    mode: 'none' | 'selecting_unit' | 'selecting_unload_position';
    unit: Unit | null;
    availableTargets: Coordinate[];
    selectedUnitToUnload: Unit | null;
  }) => void;
  setTransportConfirmState: (state: {
    isOpen: boolean;
    actionType: 'unload' | null;
    targetCoord: Coordinate | null;
    targetTile: Tile | null;
    loadedUnit: Unit | null;
  }) => void;
  setUnits: (units: Unit[]) => void;
  setSelectedUnitId: (id: string | null) => void;
}

export const useTransportActions = (deps: TransportActionsDeps): TransportActionsHook => {
  const {
    selectedUnit,
    boardLayout,
    units,
    transportActionState,
    transportConfirmState,
    setTransportActionState,
    setTransportConfirmState,
    setUnits,
    setSelectedUnitId
  } = deps;

  const getAvailableUnloadTargets = useCallback((unit: Unit): Coordinate[] => {
    if (!unit || unit.type !== 'Transport') return [];
    
    const targets: Coordinate[] = [];
    const unitCoord = { x: unit.x, y: unit.y };
    
    const neighbors = getNeighbors(unitCoord);
    for (const coord of neighbors) {
      const tile = boardLayout.get(coordToString(coord));
      if (!tile) continue;
      
      const unitAtPosition = units.find(u => 
        u.x === coord.x && 
        u.y === coord.y && 
        !u.loaded
      );
      
      if (!unitAtPosition && tile.terrain !== 'Sea') {
        targets.push(coord);
      }
    }
    
    return targets;
  }, [boardLayout, units]);

  const startTransportAction = useCallback(() => {
    if (!selectedUnit || selectedUnit.type !== 'Transport') return;
    
    const loadedUnits = units.filter(unit => 
      unit.loaded && 
      unit.transportId === selectedUnit.id
    );
    
    if (loadedUnits.length === 0) return;
    
    setTransportActionState({
      mode: 'selecting_unit',
      unit: selectedUnit,
      availableTargets: [],
      selectedUnitToUnload: null
    });
  }, [selectedUnit, units, setTransportActionState]);

  const handleUnitSelection = useCallback((selectedUnit: Unit) => {
    if (transportActionState.mode !== 'selecting_unit' || !transportActionState.unit) return;
    
    const targets = getAvailableUnloadTargets(transportActionState.unit);
    if (targets.length === 0) {
      setTransportActionState({ 
        mode: 'none', 
        unit: null, 
        availableTargets: [], 
        selectedUnitToUnload: null 
      });
      return;
    }
    
    setTransportActionState({
      mode: 'selecting_unload_position',
      unit: transportActionState.unit,
      availableTargets: targets,
      selectedUnitToUnload: selectedUnit
    });
  }, [transportActionState, getAvailableUnloadTargets, setTransportActionState]);

  const cancelUnitSelection = useCallback(() => {
    setTransportActionState({ 
      mode: 'none', 
      unit: null, 
      availableTargets: [], 
      selectedUnitToUnload: null 
    });
  }, [setTransportActionState]);

  const handleTransportTargetSelect = useCallback((coord: Coordinate) => {
    if (transportActionState.mode !== 'selecting_unload_position' || !transportActionState.unit || !transportActionState.selectedUnitToUnload) return;
    
    const isValidTarget = transportActionState.availableTargets.some(
      target => target.x === coord.x && target.y === coord.y
    );
    
    if (!isValidTarget) {
      setTransportActionState({ mode: 'none', unit: null, availableTargets: [], selectedUnitToUnload: null });
      return;
    }
    
    const targetTile = boardLayout.get(coordToString(coord));
    const selectedUnit = transportActionState.selectedUnitToUnload;
    
    setTransportActionState({ mode: 'none', unit: null, availableTargets: [], selectedUnitToUnload: null });
    
    if (!targetTile || !selectedUnit) {
      return;
    }
    
    setTransportConfirmState({
      isOpen: true,
      actionType: 'unload',
      targetCoord: coord,
      targetTile,
      loadedUnit: selectedUnit
    });
  }, [transportActionState, boardLayout, setTransportActionState, setTransportConfirmState]);

  const confirmTransportAction = useCallback(() => {
    if (!transportConfirmState.isOpen || !transportConfirmState.targetCoord || !transportConfirmState.loadedUnit) return;
    
    const targetCoord = transportConfirmState.targetCoord;
    const loadedUnit = transportConfirmState.loadedUnit;
    const transportUnit = units.find(u => u.id === loadedUnit.transportId);
    
    if (!transportUnit) return;
    
    logTransportOperation({
      infantryId: loadedUnit.id,
      infantryName: loadedUnit.name || loadedUnit.type,
      transportId: transportUnit.id,
      transportName: transportUnit.name || transportUnit.type,
      position: targetCoord,
      team: transportUnit.team,
      operation: 'unload'
    });

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
    
    setTransportConfirmState({ 
      isOpen: false, 
      actionType: null, 
      targetCoord: null, 
      targetTile: null, 
      loadedUnit: null 
    });
  }, [transportConfirmState, units, setUnits, setSelectedUnitId, setTransportConfirmState]);

  const cancelTransportAction = useCallback(() => {
    setTransportConfirmState({ 
      isOpen: false, 
      actionType: null, 
      targetCoord: null, 
      targetTile: null, 
      loadedUnit: null 
    });
    
    setTransportActionState({ 
      mode: 'none', 
      unit: null, 
      availableTargets: [],
      selectedUnitToUnload: null
    });
  }, [setTransportConfirmState, setTransportActionState]);

  const cancelTransportSelectionMode = useCallback(() => {
    setTransportActionState({ 
      mode: 'none', 
      unit: null, 
      availableTargets: [],
      selectedUnitToUnload: null
    });
  }, [setTransportActionState]);

  return {
    getAvailableUnloadTargets,
    startTransportAction,
    handleUnitSelection,
    cancelUnitSelection,
    handleTransportTargetSelect,
    confirmTransportAction,
    cancelTransportAction,
    cancelTransportSelectionMode,
  };
};