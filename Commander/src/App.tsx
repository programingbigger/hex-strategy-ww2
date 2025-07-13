import React, { useState } from 'react';
import { GameScreen, GameState, GameMap } from './types';
import TitleScreen from './screens/TitleScreen';
import HomeScreen from './screens/HomeScreen';
import ScenarioSelectScreen from './screens/ScenarioSelectScreen';
import BattlePrepScreen from './screens/BattlePrepScreen';
import BattleScreen from './screens/BattleScreen';
import ResultScreen from './screens/ResultScreen';
import './styles/App.css';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentScreen: 'title',
    units: [],
    board: new Map(),
    activeTeam: 'Blue',
    turn: 1
  });

  const navigateToScreen = (screen: GameScreen, selectedMap?: GameMap) => {
    setGameState(prev => ({
      ...prev,
      currentScreen: screen,
      ...(selectedMap && { selectedMap })
    }));
  };

  const renderCurrentScreen = () => {
    switch (gameState.currentScreen) {
      case 'title':
        return <TitleScreen onNavigate={navigateToScreen} />;
      case 'home':
        return <HomeScreen onNavigate={navigateToScreen} />;
      case 'scenario-select':
        return <ScenarioSelectScreen onNavigate={navigateToScreen} />;
      case 'battle-prep':
        return <BattlePrepScreen gameState={gameState} onNavigate={navigateToScreen} />;
      case 'battle':
        return <BattleScreen gameState={gameState} setGameState={setGameState} onNavigate={navigateToScreen} />;
      case 'result':
        return <ResultScreen onNavigate={navigateToScreen} />;
      default:
        return <TitleScreen onNavigate={navigateToScreen} />;
    }
  };

  return (
    <div className="app">
      {renderCurrentScreen()}
    </div>
  );
};

export default App;