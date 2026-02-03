import React from 'react';
import { Unit, Tile, Team } from '../../types';
import { getNeighbors, coordToString, axialToPixel } from '../../utils/map';
import {
  EngineerActionType,
  getEngineerActionCost,
  getMaterialCostForAction,
  validateEngineerAction,
  DEFAULT_ENGINEER_COST_CONFIG
} from '../../utils/engineerActionCostManager';
import { HEX_SIZE } from '../../config/constants';

interface ActionPopupProps {
  selectedUnit: Unit | null;
  selectedUnitTile: Tile | null;
  onAction: (action: 'wait' | 'undo' | 'capture' | 'enhance_city' | 'build_bridge' | 'build_fortress' | 'destroy_fortress' | 'load' | 'unload', materialAmount?: number) => void;
  boardLayout: Map<string, Tile>;
  units: Unit[];
  onStartTransportAction?: () => void;
  onStartEngineerAction?: (actionType: 'build_bridge') => void;
  /** 移動モードを開始するコールバック */
  onStartMovementAction?: () => void;
  currentFunds?: { [team: string]: number };
  activeTeam?: Team;
  /** Camera state from CameraContext: { x, y, zoom } */
  camera: { x: number; y: number; zoom: number };
  /** The bounding rect of the game-board-area container (in viewport pixels) */
  boardRect: DOMRect | null;
}

const ActionPopup: React.FC<ActionPopupProps> = ({
  selectedUnit,
  selectedUnitTile,
  onAction,
  boardLayout,
  units,
  onStartTransportAction,
  onStartEngineerAction,
  onStartMovementAction,
  currentFunds,
  camera,
  boardRect
}) => {
  if (!selectedUnit || !boardRect) return null;

  // --- Action availability logic (mirrored from SelectedUnitPanel) ---

  const isCapturableTerrain = (terrain: string): boolean => {
    return terrain === 'City' || terrain === 'Capital' || terrain === 'Airport' || terrain === 'Port';
  };

  const canCapture =
    selectedUnit.unitClass === 'Infantry' &&
    selectedUnitTile &&
    isCapturableTerrain(selectedUnitTile.terrain) &&
    selectedUnitTile.owner !== selectedUnit.team;

  const canUndo = selectedUnit.moved && !selectedUnit.attacked;

  // Engineer checks
  const isEngineer = selectedUnit.type === 'Engineer';
  const materialWeapon = selectedUnit.weapons?.find(w => w.type === '資材');
  const availableMaterials = materialWeapon?.ammunition || 0;

  const canEnhanceCity =
    isEngineer &&
    selectedUnitTile &&
    (selectedUnitTile.terrain === 'City' ||
      selectedUnitTile.terrain === 'Capital' ||
      selectedUnitTile.terrain === 'Airport' ||
      selectedUnitTile.terrain === 'Port') &&
    selectedUnitTile.owner === selectedUnit.team &&
    availableMaterials > 0;

  const hasTerrainNearby = (terrainType: string): boolean => {
    if (!selectedUnit || !boardLayout) return false;
    if (selectedUnitTile?.terrain === terrainType) return true;
    const neighbors = getNeighbors({ x: selectedUnit.x, y: selectedUnit.y });
    return neighbors.some(coord => {
      const tile = boardLayout.get(coordToString(coord));
      return tile?.terrain === terrainType;
    });
  };

  const hasTransportNearby = (): boolean => {
    if (!selectedUnit || !units) return false;
    const currentPositionTransport = units.find(
      unit =>
        unit.type === 'Transport' &&
        unit.team === selectedUnit.team &&
        unit.x === selectedUnit.x &&
        unit.y === selectedUnit.y &&
        unit.id !== selectedUnit.id
    );
    if (currentPositionTransport) return true;
    const neighbors = getNeighbors({ x: selectedUnit.x, y: selectedUnit.y });
    return neighbors.some(coord =>
      units.some(
        unit =>
          unit.type === 'Transport' &&
          unit.team === selectedUnit.team &&
          unit.x === coord.x &&
          unit.y === coord.y
      )
    );
  };

  const canBuildBridge = isEngineer && hasTerrainNearby('River') && availableMaterials >= 2;
  const canBuildFortress = isEngineer && selectedUnitTile && selectedUnitTile.terrain === 'Plains' && availableMaterials >= 1;
  const canDestroyFortress = isEngineer && selectedUnitTile && selectedUnitTile.terrain === 'Fortress' && availableMaterials >= 2;

  // Engineer action cost validation
  const getEngineerActionInfo = (actionType: EngineerActionType) => {
    if (!selectedUnit || !currentFunds) {
      return {
        fundsCost: 0,
        materialCost: 0,
        canAfford: false,
        buttonLabel: `${actionType} (0資材/0資金)`,
        validation: { errors: [], canPerform: false, fundsCost: 0, materialCost: 0 }
      };
    }

    const fundsCost = getEngineerActionCost(actionType, DEFAULT_ENGINEER_COST_CONFIG);
    const materialCost = getMaterialCostForAction(actionType);
    const validation = validateEngineerAction(actionType, selectedUnit, currentFunds, DEFAULT_ENGINEER_COST_CONFIG);

    const actionLabels: { [key in EngineerActionType]: string } = {
      enhance_city: '増築',
      build_bridge: '架橋',
      build_fortress: '要塞化',
      destroy_fortress: '要塞無力化'
    };

    return {
      fundsCost,
      materialCost,
      canAfford: validation.canPerform,
      buttonLabel: `${actionLabels[actionType]} (${materialCost}資材/${fundsCost}資金)`,
      validation
    };
  };

  const enhancedCanEnhanceCity = canEnhanceCity && getEngineerActionInfo('enhance_city').canAfford;
  const enhancedCanBuildBridge = canBuildBridge && getEngineerActionInfo('build_bridge').canAfford;
  const enhancedCanBuildFortress = canBuildFortress && getEngineerActionInfo('build_fortress').canAfford;
  const enhancedCanDestroyFortress = canDestroyFortress && getEngineerActionInfo('destroy_fortress').canAfford;

  // Transport checks
  const canUnitBeLoaded = (): boolean => {
    if (!selectedUnit) return false;
    const loadableUnitTypes = ['Infantry', 'AntiTank', 'Artillery'];
    return loadableUnitTypes.includes(selectedUnit.type);
  };

  const getLoadedUnits = (): Unit[] => {
    if (!selectedUnit || selectedUnit.type !== 'Transport' || !units) return [];
    return units.filter(unit => unit.loaded && unit.transportId === selectedUnit.id);
  };

  const canLoad = canUnitBeLoaded() && hasTransportNearby();
  const isTransport = selectedUnit.type === 'Transport';
  const canUnload = isTransport && getLoadedUnits().length > 0;

  // --- Position calculation ---
  // SVG pixel coords for the selected unit
  const { x: svgX, y: svgY } = axialToPixel(selectedUnit, HEX_SIZE);

  // ViewBox dimensions (same logic as GameBoard)
  const viewportWidth = 2000 / camera.zoom;
  const viewportHeight = 1200 / camera.zoom;
  const viewportX = camera.x - viewportWidth / 2;
  const viewportY = camera.y - viewportHeight / 2;

  // Convert SVG coords to fraction of the SVG viewBox [0..1]
  const fracX = (svgX - viewportX) / viewportWidth;
  const fracY = (svgY - viewportY) / viewportHeight;

  // Convert to pixel position relative to the game-board-area container
  const boardW = boardRect.width;
  const boardH = boardRect.height;
  const unitScreenX = fracX * boardW; // px from left edge of board container
  const unitScreenY = fracY * boardH; // px from top edge of board container

  // Popup width is approximately 150px. Place it to the left of the unit.
  const POPUP_WIDTH = 150;
  const OFFSET_LEFT = 24; // gap between unit and popup right edge
  const popupX = unitScreenX - POPUP_WIDTH - OFFSET_LEFT;
  const popupY = unitScreenY - 40; // vertically center-ish relative to unit

  // --- Determine if the unit has already acted (moved AND attacked) ---
  const hasActed = selectedUnit.moved && selectedUnit.attacked;

  return (
    <div
      className="action-popup"
      style={{
        left: `${popupX}px`,
        top: `${popupY}px`,
        width: `${POPUP_WIDTH}px`
      }}
    >
      <div className="action-popup-header">
        <span>アクション</span>
      </div>
      <div className="action-popup-body">
        <button
          className="military-button action-popup-btn"
          onClick={() => onStartMovementAction && onStartMovementAction()}
          disabled={selectedUnit.moved}
        >
          移動
        </button>
        <button
          className="military-button action-popup-btn"
          onClick={() => onAction('wait')}
          disabled={hasActed}
        >
          待機
        </button>
        <button
          className="military-button action-popup-btn"
          onClick={() => onAction('undo')}
          disabled={!canUndo}
        >
          待機解除
        </button>
        {canCapture && (
          <button
            className="military-button action-popup-btn"
            onClick={() => onAction('capture')}
            disabled={hasActed}
          >
            占領
          </button>
        )}
        {canLoad && (
          <button
            className="military-button action-popup-btn"
            onClick={() => onAction('load')}
            disabled={hasActed}
          >
            搭載
          </button>
        )}
        {canUnload && (
          <button
            className="military-button action-popup-btn"
            onClick={() => (onStartTransportAction ? onStartTransportAction() : onAction('unload'))}
            disabled={hasActed}
          >
            降車
          </button>
        )}
        {isEngineer && (
          <>
            <button
              className="military-button action-popup-btn"
              onClick={() => onAction('enhance_city')}
              disabled={!enhancedCanEnhanceCity}
              title={enhancedCanEnhanceCity ? '' : getEngineerActionInfo('enhance_city').validation.errors.join(', ')}
            >
              {getEngineerActionInfo('enhance_city').buttonLabel}
            </button>
            <button
              className="military-button action-popup-btn"
              onClick={() =>
                onStartEngineerAction ? onStartEngineerAction('build_bridge') : onAction('build_bridge')
              }
              disabled={!enhancedCanBuildBridge}
              title={enhancedCanBuildBridge ? '' : getEngineerActionInfo('build_bridge').validation.errors.join(', ')}
            >
              {getEngineerActionInfo('build_bridge').buttonLabel}
            </button>
            <button
              className="military-button action-popup-btn"
              onClick={() => onAction('build_fortress')}
              disabled={!enhancedCanBuildFortress}
              title={enhancedCanBuildFortress ? '' : getEngineerActionInfo('build_fortress').validation.errors.join(', ')}
            >
              {getEngineerActionInfo('build_fortress').buttonLabel}
            </button>
            <button
              className="military-button action-popup-btn"
              onClick={() => onAction('destroy_fortress')}
              disabled={!enhancedCanDestroyFortress}
              title={enhancedCanDestroyFortress ? '' : getEngineerActionInfo('destroy_fortress').validation.errors.join(', ')}
            >
              {getEngineerActionInfo('destroy_fortress').buttonLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionPopup;
