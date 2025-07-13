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
        const response = await fetch('/data/maps/test_map_1.json');
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
              tiles: [
                { x: -2, y: -2, terrain: 'Plains' },
                { x: -1, y: -2, terrain: 'Plains' },
                { x: 0, y: -2, terrain: 'Plains' },
                { x: 1, y: -2, terrain: 'Plains' },
                { x: 2, y: -2, terrain: 'Plains' },
                { x: -2, y: -1, terrain: 'Plains' },
                { x: -1, y: -1, terrain: 'Plains' },
                { x: 0, y: -1, terrain: 'Plains' },
                { x: 1, y: -1, terrain: 'Plains' },
                { x: 2, y: -1, terrain: 'Plains' },
                { x: -2, y: 0, terrain: 'Plains' },
                { x: -1, y: 0, terrain: 'Plains' },
                { x: 0, y: 0, terrain: 'Plains' },
                { x: 1, y: 0, terrain: 'Plains' },
                { x: 2, y: 0, terrain: 'Plains' },
                { x: -2, y: 1, terrain: 'Plains' },
                { x: -1, y: 1, terrain: 'Plains' },
                { x: 0, y: 1, terrain: 'Plains' },
                { x: 1, y: 1, terrain: 'Plains' },
                { x: 2, y: 1, terrain: 'Plains' },
                { x: -2, y: 2, terrain: 'Plains' },
                { x: -1, y: 2, terrain: 'Plains' },
                { x: 0, y: 2, terrain: 'Plains' },
                { x: 1, y: 2, terrain: 'Plains' },
                { x: 2, y: 2, terrain: 'Plains' },
              ]
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
            tiles: [
              { x: -2, y: -2, terrain: 'Plains' },
              { x: -1, y: -2, terrain: 'Plains' },
              { x: 0, y: -2, terrain: 'Plains' },
              { x: 1, y: -2, terrain: 'Plains' },
              { x: 2, y: -2, terrain: 'Plains' },
              { x: -2, y: -1, terrain: 'Plains' },
              { x: -1, y: -1, terrain: 'Plains' },
              { x: 0, y: -1, terrain: 'Plains' },
              { x: 1, y: -1, terrain: 'Plains' },
              { x: 2, y: -1, terrain: 'Plains' },
              { x: -2, y: 0, terrain: 'Plains' },
              { x: -1, y: 0, terrain: 'Plains' },
              { x: 0, y: 0, terrain: 'Plains' },
              { x: 1, y: 0, terrain: 'Plains' },
              { x: 2, y: 0, terrain: 'Plains' },
              { x: -2, y: 1, terrain: 'Plains' },
              { x: -1, y: 1, terrain: 'Plains' },
              { x: 0, y: 1, terrain: 'Plains' },
              { x: 1, y: 1, terrain: 'Plains' },
              { x: 2, y: 1, terrain: 'Plains' },
              { x: -2, y: 2, terrain: 'Plains' },
              { x: -1, y: 2, terrain: 'Plains' },
              { x: 0, y: 2, terrain: 'Plains' },
              { x: 1, y: 2, terrain: 'Plains' },
              { x: 2, y: 2, terrain: 'Plains' },
            ]
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
    <div className="screen battle-screen" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        turn={turn}
        activeTeam={activeTeam}
        weather={weather || 'Clear'}
        blueUnits={blueUnits}
        redUnits={redUnits}
        onEndTurn={handleEndTurn}
      />
      
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
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
        
        <InfoPanel
          selectedUnit={selectedUnit}
          hoveredHex={hoveredHex}
          boardLayout={boardLayout}
          units={units}
        />
        
        <ActionPanel
          selectedUnit={selectedUnit}
          selectedUnitTile={selectedUnitTile}
          onAction={handleAction}
        />
        
        <BattleReportModal
          battleReport={battleReport}
          onClose={() => setBattleReport(null)}
        />
      </div>
      
      <div style={{ padding: '10px', textAlign: 'center' }}>
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
    </div>
  );
};

export default BattleScreen;