import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GameScreen, GameState, MapData, Unit } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';
import { useCamera } from '../contexts/CameraContext';
import { createUnit } from '../data/units';
import GameBoard from '../components/game/GameBoard';
import Header from '../components/game/Header';
import SelectedUnitPanel from '../components/game/SelectedUnitPanel';
import ActionPopup from '../components/game/ActionPopup';
import InformationPanel from '../components/game/InformationPanel';
import UnitDetailsDialog from '../components/game/UnitDetailsDialog';
import EndTurnConfirmModal from '../components/game/EndTurnConfirmModal';
import ZoomControls from '../components/ui/ZoomControls';
import EnvironmentalLevelsDisplay from '../components/ui/EnvironmentalLevelsDisplay';
import TurnChangeModal from '../components/game/TurnChangeModal';

import BattleReportModal from '../components/game/BattleReportModal';
import VictoryModal from '../components/game/VictoryModal';
import RainEffect from '../components/game/RainEffect';
import { WeaponSelectorModal } from '../components/game/WeaponSelectorModal';
import BattleLogPanel from '../components/game/BattleLogPanel';
import { LogPanel } from '../components/debug/LogPanel';
import EngineerActionConfirmModal from '../components/game/EngineerActionConfirmModal';
import TransportActionConfirmModal from '../components/game/TransportActionConfirmModal';
import UnitSelectionModal from '../components/game/UnitSelectionModal';
import { ProductionModal } from '../components/game/ProductionModal';
import { getDeploymentLimits } from '../utils/deploymentLimits';
import TutorialVictoryConditions from '../components/game/TutorialVictoryConditions';

interface BattleScreenProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onNavigate: (screen: GameScreen) => void;
}

const BattleScreen: React.FC<BattleScreenProps> = ({ gameState, setGameState, onNavigate }) => {
  const {
    gameState: battleGameState,
    turn,
    month,
    year,
    day,
    activeTeam,
    boardLayout,
    units,
    selectedUnit,
    selectedUnitId,
    hoveredHex,
    battleReport,
    winner,
    weather,
    environmentalLevels,
    armyFunds,
    reachableTiles,
    attackableTiles,
    engineerTargetTiles,
    transportTargetTiles,
    selectedUnitTile,
    loadGame,
    setYear,
    setMonth,
    setDay,
    setWeather,
    handleEndTurn,
    handleHexClick,
    handleAction,
    setHoveredHex,
    setBattleReport,
    weaponSelectionState,
    handleWeaponSelect,
    handleWeaponSelectionClose,
    battleLog,
    engineerConfirmState,
    confirmEngineerAction,
    cancelEngineerAction,
    engineerActionState,
    cancelEngineerSelectionMode,
    startEngineerAction,
    
    // Transport action system
    transportActionState,
    transportConfirmState,
    startTransportAction,
    handleUnitSelection,
    cancelUnitSelection,
    confirmTransportAction,
    cancelTransportAction,
    cancelTransportSelectionMode,

    // Production
    productionState,
    handleUnitProduction,
    handleProductionClose,

    // Movement action
    movementMode,
    startMovementAction,
    cancelMovementMode,

    // Attack action
    attackMode,
    startAttackAction,
    cancelAttackMode,

    // Supply action
    canSupply,

  } = useGameLogic(gameState.selectedMap?.id || 'test_map_1');

  // Camera controls for zoom functionality
  const { camera, zoomCamera, resetCamera } = useCamera();

  // Log panel state
  const [isLogPanelVisible, setIsLogPanelVisible] = useState(false);
  
  // Modal states
  const [isEndTurnConfirmOpen, setIsEndTurnConfirmOpen] = useState(false);
  const [isTurnChangeModalOpen, setIsTurnChangeModalOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [victoryInfo, setVictoryInfo] = useState<{defeatedArmy?: string; winnerArmy?: string}>({});
  const [lastTurn, setLastTurn] = useState(0);
  const [lastActiveTeam, setLastActiveTeam] = useState<'Blue' | 'Red'>('Blue');

  // Deployment limits state
  const [deploymentLimits, setDeploymentLimits] = useState<{Blue: number; Red: number}>({Blue: 10, Red: 10});

  // Game board container ref and bounding rect (for ActionPopup positioning)
  const gameBoardRef = useRef<HTMLDivElement>(null);
  const [boardRect, setBoardRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const el = gameBoardRef.current;
    if (!el) return;

    const updateRect = () => setBoardRect(el.getBoundingClientRect());
    updateRect();

    const observer = new ResizeObserver(updateRect);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Tutorial turn limit state
  const [turnLimit, setTurnLimit] = useState<number | undefined>(undefined);

  // Unit details dialog state
  const [isUnitDetailsOpen, setIsUnitDetailsOpen] = useState(false);
  const [detailsUnit, setDetailsUnit] = useState<Unit | null>(null);

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Cmd+E or Ctrl+E for End Turn
    if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
      event.preventDefault();
      setIsEndTurnConfirmOpen(true);
    }
    
    // Esc to close modals and cancel engineer selection
    if (event.key === 'Escape') {
      if (isEndTurnConfirmOpen) {
        setIsEndTurnConfirmOpen(false);
      } else if (isTurnChangeModalOpen) {
        setIsTurnChangeModalOpen(false);
      } else if (engineerActionState.mode !== 'none') {
        // Cancel engineer selection mode
        cancelEngineerSelectionMode();
      } else if (transportActionState.mode !== 'none') {
        // Cancel transport selection mode
        cancelTransportSelectionMode();
      } else if (movementMode !== 'none') {
        // Cancel movement selection mode
        cancelMovementMode();
      } else if (attackMode !== 'none') {
        // Cancel attack selection mode
        cancelAttackMode();
      }
    }

    // Any key to close turn change modal
    if (isTurnChangeModalOpen) {
      setIsTurnChangeModalOpen(false);
    }
  }, [isEndTurnConfirmOpen, isTurnChangeModalOpen, engineerActionState.mode, cancelEngineerSelectionMode, transportActionState.mode, cancelTransportSelectionMode, movementMode, cancelMovementMode, attackMode, cancelAttackMode]);

  // Add keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Detect turn changes
  useEffect(() => {
    if (turn !== lastTurn || activeTeam !== lastActiveTeam) {
      // Show modal for all turn changes, including the first turn
      setIsTurnChangeModalOpen(true);
      setLastTurn(turn);
      setLastActiveTeam(activeTeam);
    }
  }, [turn, activeTeam, lastTurn, lastActiveTeam]);

  // Load deployment limits when map changes
  useEffect(() => {
    const loadDeploymentLimits = async () => {
      if (gameState.selectedMap?.id) {
        try {
          const limits = await getDeploymentLimits(gameState.selectedMap.id);
          setDeploymentLimits(limits);
        } catch (error) {
          console.error('Failed to load deployment limits:', error);
          setDeploymentLimits({Blue: 10, Red: 10}); // Fallback to defaults
        }
      }
    };

    loadDeploymentLimits();
  }, [gameState.selectedMap?.id]);
  

  // Handle end turn confirmation
  const handleEndTurnConfirm = useCallback(() => {
    setIsEndTurnConfirmOpen(false);
    cancelMovementMode();
    cancelAttackMode();
    handleEndTurn();
  }, [handleEndTurn, cancelMovementMode, cancelAttackMode]);

  const handleEndTurnCancel = useCallback(() => {
    setIsEndTurnConfirmOpen(false);
  }, []);

  const handleTurnChangeClose = useCallback(() => {
    setIsTurnChangeModalOpen(false);
  }, []);

  const handleVictoryModalClose = useCallback(() => {
    setIsVictoryModalOpen(false);
    onNavigate('title');
  }, [onNavigate]);

  const handleReturnToTutorialSelect = useCallback(() => {
    setIsVictoryModalOpen(false);
    onNavigate('tutorial-select');
  }, [onNavigate]);

  const isTutorialMap = gameState.selectedMap?.id?.startsWith('tutorial_') ?? false;

  const handleShowUnitDetails = useCallback((unit: Unit) => {
    setDetailsUnit(unit);
    setIsUnitDetailsOpen(true);
  }, []);

  const handleCloseUnitDetails = useCallback(() => {
    setIsUnitDetailsOpen(false);
    setDetailsUnit(null);
  }, []);
  


  useEffect(() => {
    const loadBattle = async () => {
      if (gameState.selectedMap) {
        try {
          // Use the selected map from gameState instead of hardcoded map
          const { loadMapData } = await import('../utils/mapLoader');
          const mapData: MapData = await loadMapData(gameState.selectedMap.id);

          // Extract turn limit for tutorial maps
          if (gameState.selectedMap.id.startsWith('tutorial_') && mapData.gameStatus?.turnLimit) {
            setTurnLimit(mapData.gameStatus.turnLimit);
          } else {
            setTurnLimit(undefined);
          }

          // If we have deployed units from gameState, use them instead of map units
          if (gameState.units && gameState.units.length > 0) {
            // Use the map data for board and enemy units, but replace player units with deployed ones
            const enemyUnits = mapData.units.filter(unit => unit.team === 'Red');
            const allUnits = [...gameState.units, ...enemyUnits];
            
            const customMapData: MapData = {
              ...mapData,
              units: allUnits
            };
            loadGame(customMapData);
          } else {
            // No deployed units, use default map data
            loadGame(mapData);
          }

          // Apply date from battlePrep if available
          if (gameState.battlePrep?.startDate) {
            setYear(gameState.battlePrep.startDate.year);
            setMonth(gameState.battlePrep.startDate.month);
            setDay(gameState.battlePrep.startDate.day);
          } else if (gameState.year && gameState.day) {
            setYear(gameState.year);
            setDay(gameState.day);
          }

          // チュートリアル1〜5では初期天候も Clear に強制設定する
          const isTutorialAlwaysClear =
            gameState.selectedMap.id.startsWith('tutorial_') && gameState.selectedMap.id !== 'tutorial_6';
          if (isTutorialAlwaysClear) {
            setWeather('Clear');
          }
        } catch (error) {
          console.error(`Failed to load map ${gameState.selectedMap.id}:`, error);
          // Use fallback map on error
          loadFallbackMap();
        }
      } else {
        // No selected map available, use fallback
        console.warn('No selected map found, using fallback map');
        loadFallbackMap();
      }
    };

    const loadFallbackMap = () => {
      const fallbackMapData: MapData = {
        gameStatus: {
          gameState: 'playing',
          turn: 1,
          activeTeam: 'Blue',
          winner: null,
          weather: 'Clear',
          environmentalLevels: { wetness: 0, snow: 0 }
        },
        board: {
          tiles: Array.from({ length: 25 }, (_, i) => {
            const x = (i % 5) - 2;
            const y = Math.floor(i / 5) - 2;
            return { x, y, terrain: 'Plains' as any };
          }).concat([
            { x: -8, y: -5, terrain: 'City', owner: 'Blue', hp: 10, maxHp: 10 } as any,
            { x: 8, y: 5, terrain: 'City', owner: 'Red', hp: 10, maxHp: 10 } as any
          ])
        },
        units: gameState.units && gameState.units.length > 0 ? gameState.units : [
          createUnit('u-0', 'Tank', 'Blue', -2, 0),
          createUnit('u-1', 'Infantry', 'Blue', -1, 0),
          createUnit('u-2', 'Tank', 'Red', 2, 0),
          createUnit('u-3', 'Infantry', 'Red', 1, 0)
        ]
      };
      loadGame(fallbackMapData);

      // Apply date from battlePrep if available
      if (gameState.battlePrep?.startDate) {
        setYear(gameState.battlePrep.startDate.year);
        setMonth(gameState.battlePrep.startDate.month);
        setDay(gameState.battlePrep.startDate.day);
      } else if (gameState.year && gameState.day) {
        setYear(gameState.year);
        setDay(gameState.day);
      }
    };
    
    loadBattle();
  }, [loadGame, gameState.units, gameState.selectedMap, gameState.battlePrep, gameState.year, gameState.day, setYear, setMonth, setDay, setWeather]);

  useEffect(() => {
    if (battleGameState === 'gameOver' && winner) {
      // Determine defeated army and winner
      const defeatedArmy = winner === 'Blue' ? 'Red' : 'Blue';
      const winnerArmy = winner;
      
      setVictoryInfo({ defeatedArmy, winnerArmy });
      setIsVictoryModalOpen(true);
      setGameState(prev => ({ ...prev, winner }));
    }
  }, [battleGameState, winner, setGameState]);

  const blueUnits = units.filter(u => u.team === 'Blue').length;
  const redUnits = units.filter(u => u.team === 'Red').length;


  return (
    <div className="battle-screen-grid">
      <div className="header-area military-header">
        <Header
          turn={turn}
          month={month}
          year={year}
          day={day}
          activeTeam={activeTeam}
          weather={weather}
          blueUnits={blueUnits}
          redUnits={redUnits}
          blueFunds={armyFunds?.Blue || 0}
          redFunds={armyFunds?.Red || 0}
          blueMaxUnits={deploymentLimits.Blue}
          redMaxUnits={deploymentLimits.Red}
        />
        <TutorialVictoryConditions
          selectedMap={gameState.selectedMap}
          currentTurn={turn}
          turnLimit={turnLimit}
        />
      </div>

      <div className="left-panel-area">
        <SelectedUnitPanel
          className="military-crt-monitor"
          selectedUnit={selectedUnit}
          units={units}
          onShowUnitDetails={handleShowUnitDetails}
        />
        <div className="battle-log-area">
          <BattleLogPanel
            className="military-battle-log"
            battleLog={battleLog}
            currentTurn={turn}
            currentPhase={activeTeam === 'Blue' ? 'プレイヤー フェーズ' : '敵 フェーズ'}
          />
        </div>
      </div>

      <div className="game-board-area" ref={gameBoardRef}>
        <GameBoard
          boardLayout={boardLayout}
          units={units}
          selectedUnitId={selectedUnitId}
          reachableTiles={reachableTiles}
          attackableTiles={attackableTiles}
          engineerTargetTiles={engineerTargetTiles}
          transportTargetTiles={transportTargetTiles}
          onHexClick={handleHexClick}
          onHexHover={setHoveredHex}
          onHexLeave={() => setHoveredHex(null)}
          onUnitDoubleClick={handleShowUnitDetails}
        />
        {movementMode !== 'selecting_destination' &&
         attackMode !== 'selecting_target' &&
         engineerActionState.mode === 'none' &&
         transportActionState.mode === 'none' && (
          <ActionPopup
            selectedUnit={selectedUnit}
            selectedUnitTile={selectedUnitTile}
            onAction={handleAction}
            boardLayout={boardLayout}
            units={units}
            onStartTransportAction={startTransportAction}
            onStartEngineerAction={startEngineerAction}
            onStartMovementAction={startMovementAction}
            onStartAttackAction={startAttackAction}
            canSupply={canSupply}
            currentFunds={armyFunds}
            activeTeam={activeTeam}
            camera={camera}
            boardRect={boardRect}
          />
        )}
      </div>

      <div className="right-panel-area">
        <InformationPanel
          className="military-crt-monitor"
          selectedUnit={undefined}
          selectedUnitTile={null}
          hoveredHex={hoveredHex}
          boardLayout={boardLayout}
          units={units}
          onAction={handleAction}
        />
      </div>

      <RainEffect weather={weather} />

      {battleReport && (
        <BattleReportModal
          battleReport={battleReport}
          onClose={() => setBattleReport(null)}
        />
      )}

      {weaponSelectionState.attacker && weaponSelectionState.target && (
        <WeaponSelectorModal
          isOpen={weaponSelectionState.isOpen}
          attacker={weaponSelectionState.attacker}
          target={weaponSelectionState.target}
          onWeaponSelect={handleWeaponSelect}
          onClose={handleWeaponSelectionClose}
        />
      )}

      <EngineerActionConfirmModal
        isOpen={engineerConfirmState.isOpen}
        actionType={engineerConfirmState.actionType}
        targetCoord={engineerConfirmState.targetCoord}
        targetTile={engineerConfirmState.targetTile}
        materialCost={engineerConfirmState.materialCost}
        onConfirm={confirmEngineerAction}
        onCancel={cancelEngineerAction}
      />

      <UnitSelectionModal
        isOpen={transportActionState.mode === 'selecting_unit'}
        transportUnit={transportActionState.unit}
        loadedUnits={transportActionState.unit ? units.filter(unit => 
          unit.loaded && 
          unit.transportId === transportActionState.unit!.id
        ) : []}
        onUnitSelect={handleUnitSelection}
        onCancel={cancelUnitSelection}
      />

      <TransportActionConfirmModal
        isOpen={transportConfirmState.isOpen}
        actionType={transportConfirmState.actionType}
        targetCoord={transportConfirmState.targetCoord}
        targetTile={transportConfirmState.targetTile}
        loadedUnit={transportConfirmState.loadedUnit}
        onConfirm={confirmTransportAction}
        onCancel={cancelTransportAction}
      />

      <ProductionModal
        isOpen={productionState.isOpen}
        producibleUnits={productionState.producibleUnits}
        onUnitSelect={handleUnitProduction}
        onClose={handleProductionClose}
        currentFunds={armyFunds?.[activeTeam] || 0}
        activeTeam={activeTeam}
      />

      <LogPanel
        isVisible={isLogPanelVisible}
        onToggle={() => setIsLogPanelVisible(!isLogPanelVisible)}
      />

      <EndTurnConfirmModal
        isOpen={isEndTurnConfirmOpen}
        onConfirm={handleEndTurnConfirm}
        onCancel={handleEndTurnCancel}
        title="ターン終了"
        confirmText="はい"
        cancelText="いいえ"
      />

      <TurnChangeModal
        isOpen={isTurnChangeModalOpen}
        turn={turn}
        activeTeam={activeTeam}
        weather={weather}
        onClose={handleTurnChangeClose}
      />

      <VictoryModal
        isOpen={isVictoryModalOpen}
        defeatedArmy={victoryInfo.defeatedArmy}
        winnerArmy={victoryInfo.winnerArmy}
        onClose={handleVictoryModalClose}
        onReturnToTutorialSelect={isTutorialMap ? handleReturnToTutorialSelect : undefined}
      />

      <UnitDetailsDialog
        isOpen={isUnitDetailsOpen}
        unit={detailsUnit}
        onClose={handleCloseUnitDetails}
      />


      {/* Zoom Controls */}
      <ZoomControls
        currentZoom={camera.zoom}
        onZoomIn={() => zoomCamera(1)}
        onZoomOut={() => zoomCamera(-1)}
        onResetZoom={resetCamera}
        minZoom={0.5}
        maxZoom={3}
      />

      {/* Environmental Levels Display */}
      <EnvironmentalLevelsDisplay environmentalLevels={environmentalLevels} />
    </div>
  );
};

export default BattleScreen;