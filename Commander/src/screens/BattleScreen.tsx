import React, { useEffect } from 'react';
import { GameScreen, GameState, MapData } from '../types';
import { useGameLogic } from '../hooks/useGameLogic';
import GameBoard from '../components/game/GameBoard';
import Header from '../components/game/Header';
import InfoPanel from '../components/game/InfoPanel';
import BattleReportModal from '../components/game/BattleReportModal';
import ActionPanel from '../components/game/ActionPanel';

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
    // Load the test map on component mount
    const loadTestMap = async () => {
      try {
        const response = await fetch('/data/maps/large_map.json');
        if (!response.ok) {
          // Fallback to creating a basic map
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
            units: [
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
          return;
        }
        const mapData: MapData = await response.json();
        loadGame(mapData);
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
          units: [
            {
              id: 'u-0',
              type: 'Tank',
              team: 'Blue',
              x: -6,
              y: -2,
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
              x: -5,
              y: -2,
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
              x: 6,
              y: 2,
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
              x: 5,
              y: 2,
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
    
    loadTestMap();
  }, [loadGame]);

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
      {/* Full-screen game board */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
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
      
      {/* UI overlay elements */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
        <Header
          turn={turn}
          activeTeam={activeTeam}
          weather={weather || 'Clear'}
          blueUnits={blueUnits}
          redUnits={redUnits}
          onEndTurn={handleEndTurn}
        />
      </div>
      
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000 }}>
        <InfoPanel
          selectedUnit={selectedUnit}
          hoveredHex={hoveredHex}
          boardLayout={boardLayout}
          units={units}
        />
      </div>
      
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 1000 }}>
        <ActionPanel
          selectedUnit={selectedUnit}
          selectedUnitTile={selectedUnitTile}
          onAction={handleAction}
        />
      </div>
      
      <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
        <button 
          onClick={() => onNavigate('home')}
          style={{
            padding: '10px 20px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Return to Main Menu
        </button>
      </div>
      
      <BattleReportModal
        battleReport={battleReport}
        onClose={() => setBattleReport(null)}
      />
    </div>
  );
};

export default BattleScreen;