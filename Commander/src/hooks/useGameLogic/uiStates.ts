import { useState } from 'react';
import {
  Unit,
  Coordinate,
  BattleReport,
  Weapon,
  Tile,
  BattleLogState
} from '../../types';
import { ProducibleUnit } from '../../components/game/ProductionModal';

export interface UIStatesHook {
  hoveredHex: Coordinate | null;
  battleReport: BattleReport | null;
  weaponSelectionState: {
    isOpen: boolean;
    attacker: Unit | null;
    target: Unit | null;
  };
  productionState: {
    isOpen: boolean;
    capital: Coordinate | null;
    producibleUnits: ProducibleUnit[];
  };
  engineerActionState: {
    mode: 'none' | 'selecting_bridge_build';
    unit: Unit | null;
    availableTargets: Coordinate[];
  };
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
  engineerConfirmState: {
    isOpen: boolean;
    actionType: 'build_bridge' | null;
    targetCoord: Coordinate | null;
    targetTile: Tile | null;
    materialCost: number;
  };
  battleLog: BattleLogState;
  
  setHoveredHex: (hex: Coordinate | null) => void;
  setBattleReport: (report: BattleReport | null | ((prev: BattleReport | null) => BattleReport | null)) => void;
  setWeaponSelectionState: (state: { isOpen: boolean; attacker: Unit | null; target: Unit | null }) => void;
  setProductionState: (state: { isOpen: boolean; capital: Coordinate | null; producibleUnits: ProducibleUnit[] }) => void;
  setEngineerActionState: (state: { mode: 'none' | 'selecting_bridge_build'; unit: Unit | null; availableTargets: Coordinate[] }) => void;
  setTransportActionState: (state: { mode: 'none' | 'selecting_unit' | 'selecting_unload_position'; unit: Unit | null; availableTargets: Coordinate[]; selectedUnitToUnload: Unit | null }) => void;
  setTransportConfirmState: (state: { isOpen: boolean; actionType: 'unload' | null; targetCoord: Coordinate | null; targetTile: Tile | null; loadedUnit: Unit | null }) => void;
  setEngineerConfirmState: (state: { isOpen: boolean; actionType: 'build_bridge' | null; targetCoord: Coordinate | null; targetTile: Tile | null; materialCost: number }) => void;
  setBattleLog: (log: BattleLogState | ((prev: BattleLogState) => BattleLogState)) => void;
}

export const useUIStates = (): UIStatesHook => {
  const [hoveredHex, setHoveredHex] = useState<Coordinate | null>(null);
  const [battleReport, setBattleReport] = useState<BattleReport | null>(null);
  const [weaponSelectionState, setWeaponSelectionState] = useState<{
    isOpen: boolean;
    attacker: Unit | null;
    target: Unit | null;
  }>({ isOpen: false, attacker: null, target: null });

  const [productionState, setProductionState] = useState<{
    isOpen: boolean;
    capital: Coordinate | null;
    producibleUnits: ProducibleUnit[];
  }>({ isOpen: false, capital: null, producibleUnits: [] });

  const [engineerActionState, setEngineerActionState] = useState<{
    mode: 'none' | 'selecting_bridge_build';
    unit: Unit | null;
    availableTargets: Coordinate[];
  }>({ mode: 'none', unit: null, availableTargets: [] });

  const [transportActionState, setTransportActionState] = useState<{
    mode: 'none' | 'selecting_unit' | 'selecting_unload_position';
    unit: Unit | null;
    availableTargets: Coordinate[];
    selectedUnitToUnload: Unit | null;
  }>({ mode: 'none', unit: null, availableTargets: [], selectedUnitToUnload: null });

  const [transportConfirmState, setTransportConfirmState] = useState<{
    isOpen: boolean;
    actionType: 'unload' | null;
    targetCoord: Coordinate | null;
    targetTile: Tile | null;
    loadedUnit: Unit | null;
  }>({ isOpen: false, actionType: null, targetCoord: null, targetTile: null, loadedUnit: null });

  const [engineerConfirmState, setEngineerConfirmState] = useState<{
    isOpen: boolean;
    actionType: 'build_bridge' | null;
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

  const [battleLog, setBattleLog] = useState<BattleLogState>({
    entries: [],
    maxEntries: 50,
    isVisible: true,
    autoScroll: true
  });

  return {
    hoveredHex,
    battleReport,
    weaponSelectionState,
    productionState,
    engineerActionState,
    transportActionState,
    transportConfirmState,
    engineerConfirmState,
    battleLog,
    
    setHoveredHex,
    setBattleReport,
    setWeaponSelectionState,
    setProductionState,
    setEngineerActionState,
    setTransportActionState,
    setTransportConfirmState,
    setEngineerConfirmState,
    setBattleLog,
  };
};