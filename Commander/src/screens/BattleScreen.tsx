import React, { useEffect, useState, useCallback } from 'react';
import { GameScreen, GameState, MapData } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';
import { createUnit } from '../data/units';
import GameBoard from '../components/game/GameBoard';
import Header from '../components/game/Header';
import SelectedUnitPanel from '../components/game/SelectedUnitPanel';
import InformationPanel from '../components/game/InformationPanel';
import EndTurnConfirmModal from '../components/game/EndTurnConfirmModal';
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
    activeTeam,
    boardLayout,
    units,
    selectedUnit,
    selectedUnitId,
    hoveredHex,
    battleReport,
    winner,
    weather,
    reachableTiles,
    attackableTiles,
    engineerTargetTiles,
    transportTargetTiles,
    selectedUnitTile,
    loadGame,
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
          const response = await fetch(`data/maps/${gameState.selectedMap.id}.json`);
          if (!response.ok) {
            throw new Error(`Failed to load map ${gameState.selectedMap.id}`);
          }
          const mapData: MapData = await response.json();
          
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
          weatherDuration: 0
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
    };
    
    loadBattle();
  }, [loadGame, gameState.units, gameState.selectedMap]);

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

  // Get weather-based background gradient 天候による背景グラデーション
  const getWeatherBackground = (): string => {
    switch (weather) {
      case 'Clear':
        return 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 50%, #B0E0E6 100%)';
      case 'Rain':
        return 'linear-gradient(135deg, #708090 0%, #A9A9A9 50%, #C0C0C0 100%)';
      case 'Storm':
        return 'linear-gradient(135deg, #2F4F4F 0%, #4B0082 30%, #191970 60%, #000000 100%)';
      case 'Cloudy':
        return 'linear-gradient(135deg, #D3D3D3 0%, #C0C0C0 30%, #A9A9A9 60%, #808080 100%)';
      default:
        return 'linear-gradient(135deg, #2a2a2a, #3a3a3a)';
    }
  };;

  return (
    <div className="screen battle-screen" style={{ 
      height: '100vh', 
      width: '100vw', 
      position: 'relative',
      background: getWeatherBackground()
    }}>
      {/* Fixed Header at top of window */}
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        zIndex: 1000,
        background: 'rgba(52, 73, 94, 0.9)',
        backdropFilter: 'blur(5px)',
        borderBottom: '1px solid #3498db'
      }}>
        <Header 
          turn={turn} 
          activeTeam={activeTeam} 
          weather={weather} 
          blueUnits={blueUnits}
          redUnits={redUnits}
        />
      </div>

      {/* Main game area with top margin for header */}
      <div style={{ 
        height: '100vh', 
        display: 'flex',
        paddingTop: '60px' 
      }}>
        {/* Game Board - with left margin for SelectedUnitPanel */}
        <div style={{ flex: 1, minWidth: 0, marginLeft: '320px', marginRight: '350px' }}>
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

        {/* Fixed Selected Unit Panel on the left */}
        <div style={{ 
          position: 'fixed',
          left: 0,
          top: '60px',
          width: '320px',
          height: 'calc(100vh - 60px)',
          zIndex: 1000,
          background: 'rgba(52, 73, 94, 0.9)',
          backdropFilter: 'blur(5px)',
          borderRight: '1px solid #3498db',
          overflowY: 'auto'
        }}>
          <SelectedUnitPanel
            selectedUnit={selectedUnit}
            selectedUnitTile={selectedUnitTile}
            onAction={handleAction}
            boardLayout={boardLayout}
            units={units}
            onStartTransportAction={startTransportAction}
          />
        </div>

        {/* Fixed Information Panel on the right */}
        <div style={{ 
          position: 'fixed',
          right: 0,
          top: '60px',
          width: '350px',
          height: 'calc(100vh - 60px)',
          zIndex: 1000,
          background: 'rgba(52, 73, 94, 0.9)',
          backdropFilter: 'blur(5px)',
          borderLeft: '1px solid #3498db',
          overflowY: 'auto'
        }}>
          <InformationPanel
            selectedUnit={undefined}
            selectedUnitTile={null}
            hoveredHex={hoveredHex}
            boardLayout={boardLayout}
            units={units}
            onAction={handleAction}
          />
        </div>
      </div>


      {/* 🎯 Battle Log Panel */}
      <BattleLogPanel
        battleLog={battleLog}
        currentTurn={turn}
        currentPhase={activeTeam === 'Blue' ? 'Player Phase' : 'Enemy Phase'}
      />

      {/* Rain Effect */}
      <RainEffect weather={weather} />

      {/* Battle Report Modal */}
      {battleReport && (
        <BattleReportModal
          battleReport={battleReport}
          onClose={() => setBattleReport(null)}
        />
      )}

      {/* Weapon Selection Modal */}
      {weaponSelectionState.attacker && weaponSelectionState.target && (
        <WeaponSelectorModal
          isOpen={weaponSelectionState.isOpen}
          attacker={weaponSelectionState.attacker}
          target={weaponSelectionState.target}
          onWeaponSelect={handleWeaponSelect}
          onClose={handleWeaponSelectionClose}
        />
      )}

      {/* Engineer Action Confirmation Modal */}
      <EngineerActionConfirmModal
        isOpen={engineerConfirmState.isOpen}
        actionType={engineerConfirmState.actionType}
        targetCoord={engineerConfirmState.targetCoord}
        targetTile={engineerConfirmState.targetTile}
        materialCost={engineerConfirmState.materialCost}
        onConfirm={confirmEngineerAction}
        onCancel={cancelEngineerAction}
      />

      {/* Unit Selection Modal for Transport */}
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

      {/* Transport Action Confirmation Modal */}
      <TransportActionConfirmModal
        isOpen={transportConfirmState.isOpen}
        actionType={transportConfirmState.actionType}
        targetCoord={transportConfirmState.targetCoord}
        targetTile={transportConfirmState.targetTile}
        loadedUnit={transportConfirmState.loadedUnit}
        onConfirm={confirmTransportAction}
        onCancel={cancelTransportAction}
      />

      {/* Production Modal */}
      <ProductionModal
        isOpen={productionState.isOpen}
        producibleUnits={productionState.producibleUnits}
        onUnitSelect={handleUnitProduction}
        onClose={handleProductionClose}
      />

      {/* Debug Log Panel */}
      <LogPanel
        isVisible={isLogPanelVisible}
        onToggle={() => setIsLogPanelVisible(!isLogPanelVisible)}
      />

      {/* End Turn Confirmation Modal */}
      <EndTurnConfirmModal
        isOpen={isEndTurnConfirmOpen}
        onConfirm={handleEndTurnConfirm}
        onCancel={handleEndTurnCancel}
      />

      {/* Turn Change Notification Modal */}
      <TurnChangeModal
        isOpen={isTurnChangeModalOpen}
        turn={turn}
        activeTeam={activeTeam}
        weather={weather}
        onClose={handleTurnChangeClose}
      />

      {/* Victory Modal */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        defeatedArmy={victoryInfo.defeatedArmy}
        winnerArmy={victoryInfo.winnerArmy}
        onClose={handleVictoryModalClose}
      />

      {/* Reinforcement Notification Modal */}
      <ReinforcementNotificationModal
        isOpen={isReinforcementNotificationOpen}
        reinforcements={currentReinforcements}
        onClose={handleReinforcementNotificationClose}
      />
    </div>
  );
};

export default BattleScreen;