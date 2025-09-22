import React, { useEffect, useState, useCallback } from 'react';
import { GameScreen, GameState, MapData } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';
import { useCamera } from '../contexts/CameraContext';
import { createUnit } from '../data/units';
import GameBoard from '../components/game/GameBoard';
import Header from '../components/game/Header';
import SelectedUnitPanel from '../components/game/SelectedUnitPanel';
import InformationPanel from '../components/game/InformationPanel';
import EndTurnConfirmModal from '../components/game/EndTurnConfirmModal';
import ZoomControls from '../components/ui/ZoomControls';
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
import ReinforcementNotificationModal from '../components/game/ReinforcementNotificationModal';
import { ReinforcementData } from '../types/reinforcements';

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
    armyFunds,
    reachableTiles,
    attackableTiles,
    engineerTargetTiles,
    transportTargetTiles,
    selectedUnitTile,
    loadGame,
    setYear,
    setDay,
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
    
    // Reinforcement system
    isReinforcementSpawnLocation,
    getReinforcementsForPreview,
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
  
  // Reinforcement notification state
  const [isReinforcementNotificationOpen, setIsReinforcementNotificationOpen] = useState(false);
  const [currentReinforcements, setCurrentReinforcements] = useState<ReinforcementData[]>([]);

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
      }
    }
    
    // Any key to close turn change modal
    if (isTurnChangeModalOpen) {
      setIsTurnChangeModalOpen(false);
    }
  }, [isEndTurnConfirmOpen, isTurnChangeModalOpen, engineerActionState.mode, cancelEngineerSelectionMode, transportActionState.mode, cancelTransportSelectionMode]);

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
  
  // Detect reinforcement spawns and show notifications
  useEffect(() => {
    const checkForReinforcements = async () => {
      if (turn > 0) { // Only check after first turn
        const reinforcementPreview = getReinforcementsForPreview();
        const currentTurnReinforcements = reinforcementPreview.filter(r => r.spawnTurn === turn);
        
        if (currentTurnReinforcements.length > 0) {
          setCurrentReinforcements(currentTurnReinforcements);
          // Delay notification to show after turn change modal
          setTimeout(() => {
            setIsReinforcementNotificationOpen(true);
          }, 1500);
        }
      }
    };

    checkForReinforcements();
  }, [turn, getReinforcementsForPreview]);

  // Handle end turn confirmation
  const handleEndTurnConfirm = useCallback(() => {
    setIsEndTurnConfirmOpen(false);
    handleEndTurn();
  }, [handleEndTurn]);

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
  
  const handleReinforcementNotificationClose = useCallback(() => {
    setIsReinforcementNotificationOpen(false);
    setCurrentReinforcements([]);
  }, []);


  useEffect(() => {
    const loadBattle = async () => {
      if (gameState.selectedMap) {
        try {
          // Use the selected map from gameState instead of hardcoded map
          const { loadMapData } = await import('../utils/mapLoader');
          const mapData: MapData = await loadMapData(gameState.selectedMap.id);
          
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
            setDay(gameState.battlePrep.startDate.day);
          } else if (gameState.year && gameState.day) {
            setYear(gameState.year);
            setDay(gameState.day);
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
        setDay(gameState.battlePrep.startDate.day);
      } else if (gameState.year && gameState.day) {
        setYear(gameState.year);
        setDay(gameState.day);
      }
    };
    
    loadBattle();
  }, [loadGame, gameState.units, gameState.selectedMap, gameState.battlePrep, gameState.year, gameState.day, setYear, setDay]);

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
        />
      </div>

      <div className="left-panel-area">
        <SelectedUnitPanel
          className="military-crt-monitor"
          selectedUnit={selectedUnit}
          selectedUnitTile={selectedUnitTile}
          onAction={handleAction}
          boardLayout={boardLayout}
          units={units}
          onStartTransportAction={startTransportAction}
          currentFunds={armyFunds}
          activeTeam={activeTeam}
        />
      </div>

      <div className="game-board-area">
        <GameBoard
          boardLayout={boardLayout}
          units={units}
          selectedUnitId={selectedUnitId}
          reachableTiles={reachableTiles}
          attackableTiles={attackableTiles}
          engineerTargetTiles={engineerTargetTiles}
          transportTargetTiles={transportTargetTiles}
          isReinforcementSpawnLocation={isReinforcementSpawnLocation}
          onHexClick={handleHexClick}
          onHexHover={setHoveredHex}
          onHexLeave={() => setHoveredHex(null)}
        />
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
        <BattleLogPanel
          className="military-battle-log"
          battleLog={battleLog}
          currentTurn={turn}
          currentPhase={activeTeam === 'Blue' ? 'プレイヤー フェーズ' : '敵 フェーズ'}
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
      />

      <ReinforcementNotificationModal
        isOpen={isReinforcementNotificationOpen}
        reinforcements={currentReinforcements}
        onClose={handleReinforcementNotificationClose}
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
    </div>
  );
};

export default BattleScreen;