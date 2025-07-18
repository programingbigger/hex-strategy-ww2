import React, { useState } from 'react';
import { GameScreen, GameState, GameMap, BattlePrepState } from './types';
import TitleScreen from './screens/TitleScreen';
import HomeScreen from './screens/HomeScreen';
import ScenarioSelectScreen from './screens/ScenarioSelectScreen';
import BattlePrepScreen from './screens/BattlePrepScreen';
import UnitDeploymentScreen from './screens/UnitDeploymentScreen';
import BattleScreen from './screens/BattleScreen';
import ResultScreen from './screens/ResultScreen';
import { loadCompleteMap } from './utils/mapLoader';
import './styles/App.css';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentScreen: 'title',
    units: [],
    board: new Map(),
    activeTeam: 'Blue',
    turn: 1
  });

  const navigateToScreen = async (screen: GameScreen, selectedMap?: GameMap) => {
    if (selectedMap) {
      try {
        // Load the complete map data including board layout
        const { boardLayout, deploymentCenter } = await loadCompleteMap(selectedMap.id);
        
        setGameState(prev => ({
          ...prev,
          currentScreen: screen,
          selectedMap: {
            ...selectedMap,
            deploymentCenter
          },
          board: boardLayout
        }));
      } catch (error) {
        console.error('Failed to load map:', error);
        // Fallback to basic navigation without map data
        setGameState(prev => ({
          ...prev,
          currentScreen: screen,
          selectedMap
        }));
      }
    } else {
      setGameState(prev => ({
        ...prev,
        currentScreen: screen
      }));
    }
  };

  const updateBattlePrep = (battlePrep: BattlePrepState) => {
    setGameState(prev => ({
      ...prev,
      battlePrep
    }));
  };

  const startBattle = () => {
    // Convert deployed units to game units and add them to the board
    if (gameState.battlePrep) {
      const deployedUnits = gameState.battlePrep.selectedUnits.map(unit => {
        const deployment = gameState.battlePrep!.deployedUnits.get(unit.id);
        return deployment ? { ...unit, x: deployment.x, y: deployment.y } : unit;
      });
      
      setGameState(prev => ({
        ...prev,
        currentScreen: 'battle',
        units: deployedUnits
      }));
    }
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
        return <BattlePrepScreen gameState={gameState} onNavigate={navigateToScreen} onUpdateBattlePrep={updateBattlePrep} />;
      case 'deployment':
        return <UnitDeploymentScreen gameState={gameState} onNavigate={navigateToScreen} onUpdateBattlePrep={updateBattlePrep} onStartBattle={startBattle} />;
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