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
import ShortcutsPanel from '../components/game/ShortcutsPanel';
import BattleReportModal from '../components/game/BattleReportModal';
import RainEffect from '../components/game/RainEffect';
import { WeaponSelectorModal } from '../components/game/WeaponSelectorModal';
import BattleLogPanel from '../components/game/BattleLogPanel';
import { LogPanel } from '../components/debug/LogPanel';

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
  } = useGameLogic();

  // Log panel state
  const [isLogPanelVisible, setIsLogPanelVisible] = useState(false);
  
  // Modal states
  const [isEndTurnConfirmOpen, setIsEndTurnConfirmOpen] = useState(false);
  const [isTurnChangeModalOpen, setIsTurnChangeModalOpen] = useState(false);
  const [lastTurn, setLastTurn] = useState(0);
  const [lastActiveTeam, setLastActiveTeam] = useState<'Blue' | 'Red'>('Blue');

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Cmd+E or Ctrl+E for End Turn
    if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
      event.preventDefault();
      setIsEndTurnConfirmOpen(true);
    }
    
    // Esc to close modals
    if (event.key === 'Escape') {
      if (isEndTurnConfirmOpen) {
        setIsEndTurnConfirmOpen(false);
      }
      if (isTurnChangeModalOpen) {
        setIsTurnChangeModalOpen(false);
      }
    }
    
    // Any key to close turn change modal
    if (isTurnChangeModalOpen) {
      setIsTurnChangeModalOpen(false);
    }
  }, [isEndTurnConfirmOpen, isTurnChangeModalOpen]);

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
      // Only show modal if it's not the first load
      if (lastTurn !== 0) {
        setIsTurnChangeModalOpen(true);
      }
      setLastTurn(turn);
      setLastActiveTeam(activeTeam);
    }
  }, [turn, activeTeam, lastTurn, lastActiveTeam]);

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
      setGameState(prev => ({ ...prev, winner }));
      onNavigate('result');
    }
  }, [battleGameState, winner, setGameState, onNavigate]);

  const blueUnits = units.filter(u => u.team === 'Blue').length;
  const redUnits = units.filter(u => u.team === 'Red').length;

  return (
    <div className="screen battle-screen" style={{ height: '100vh', width: '100vw', position: 'relative' }}>
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
            onEndTurn={() => setIsEndTurnConfirmOpen(true)}
          />
        </div>
      </div>

      {/* Shortcuts Panel */}
      <ShortcutsPanel />

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
    </div>
  );
};

export default BattleScreen;