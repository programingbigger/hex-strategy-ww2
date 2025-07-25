import React, { useEffect } from 'react';
import { GameScreen, GameState, MapData } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';
import GameBoard from '../components/game/GameBoard';
import Header from '../components/game/Header';
import InformationPanel from '../components/game/InformationPanel';
import BattleReportModal from '../components/game/BattleReportModal';
import RainEffect from '../components/game/RainEffect';

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
  } = useGameLogic();

  useEffect(() => {
    // Load the battle with units from gameState (deployed units) or fallback to map data
    const loadBattle = async () => {
      try {
        const response = await fetch('data/maps/alpha_ver_stage.json'); //　data/maps/test_map_1.json
        if (!response.ok) {
          throw new Error('Failed to load map');
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
        console.error('Failed to load map:', error);
        // Use fallback map on error
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
            {
              id: 'u-0',
              type: 'Tank',
              team: 'Blue',
              x: -2,
              y: 0,
              hp: 20,
              maxHp: 20,
              attack: 7,
              defense: 5,
              movement: 4,
              attackRange: { min: 1, max: 1 },
              canCounterAttack: true,
              unitClass: 'Vehicle',
              fuel: 40,
              maxFuel: 40,
              xp: 0,
              moved: false,
              attacked: false
            },
            {
              id: 'u-1',
              type: 'Infantry',
              team: 'Blue',
              x: -1,
              y: 0,
              hp: 10,
              maxHp: 10,
              attack: 4,
              defense: 2,
              movement: 3,
              attackRange: { min: 1, max: 1 },
              canCounterAttack: true,
              unitClass: 'Infantry',
              fuel: 60,
              maxFuel: 60,
              xp: 0,
              moved: false,
              attacked: false
            },
            {
              id: 'u-2',
              type: 'Tank',
              team: 'Red',
              x: 2,
              y: 0,
              hp: 20,
              maxHp: 20,
              attack: 7,
              defense: 5,
              movement: 4,
              attackRange: { min: 1, max: 1 },
              canCounterAttack: true,
              unitClass: 'Vehicle',
              fuel: 40,
              maxFuel: 40,
              xp: 0,
              moved: false,
              attacked: false
            },
            {
              id: 'u-3',
              type: 'Infantry',
              team: 'Red',
              x: 1,
              y: 0,
              hp: 10,
              maxHp: 10,
              attack: 4,
              defense: 2,
              movement: 3,
              attackRange: { min: 1, max: 1 },
              canCounterAttack: true,
              unitClass: 'Infantry',
              fuel: 60,
              maxFuel: 60,
              xp: 0,
              moved: false,
              attacked: false
            }
          ]
        };
        loadGame(fallbackMapData);
      }
    };
    
    loadBattle();
  }, [loadGame, gameState.units]);

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
          onEndTurn={handleEndTurn}
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
        {/* Game Board */}
        <div style={{ flex: 1, minWidth: 0 }}>
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
          borderLeft: '1px solid #3498db'
        }}>
          <InformationPanel
            selectedUnit={selectedUnit}
            selectedUnitTile={selectedUnitTile}
            hoveredHex={hoveredHex}
            boardLayout={boardLayout}
            units={units}
            onAction={handleAction}
          />
        </div>
      </div>

      {/* Rain Effect */}
      <RainEffect weather={weather} />

      {/* Battle Report Modal */}
      {battleReport && (
        <BattleReportModal
          battleReport={battleReport}
          onClose={() => setBattleReport(null)}
        />
      )}
    </div>
  );
};

export default BattleScreen;