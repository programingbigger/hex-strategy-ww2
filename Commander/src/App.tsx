import React, { useState } from 'react';
import { GameScreen, GameState, GameMap, BattlePrepState } from './types';
import TitleScreen from './screens/TitleScreen';
import HomeScreen from './screens/HomeScreen';
import ScenarioSelectScreen from './screens/ScenarioSelectScreen';
import TutorialIntroductionScreen from './screens/TutorialIntroductionScreen';
import TutorialSelectScreen from './screens/TutorialSelectScreen';
import BattlePrepScreen from './screens/BattlePrepScreen';
import UnitDeploymentScreen from './screens/UnitDeploymentScreen';
import BattleScreen from './screens/BattleScreen';
import { CameraProvider } from './contexts/CameraContext';
import './styles/App.css';

import { loadCompleteMap } from './utils/mapLoader';

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
        const { boardLayout, deploymentCenter, initialCameraPosition } = await loadCompleteMap(selectedMap.id);
        
        setGameState(prev => ({
          ...prev,
          previousScreen: prev.currentScreen,
          currentScreen: screen,
          selectedMap: {
            ...selectedMap,
            deploymentCenter,
            initialCameraPosition
          },
          board: boardLayout
        }));
      } catch (error) {
        console.error('Failed to load map:', error);
        // Fallback to basic navigation with empty board to prevent UI issues
        setGameState(prev => ({
          ...prev,
          previousScreen: prev.currentScreen,
          currentScreen: screen,
          selectedMap,
          board: new Map() // Provide empty board as fallback
        }));
      }
    } else {
      setGameState(prev => ({
        ...prev,
        previousScreen: prev.currentScreen,
        currentScreen: screen
      }));
    }
  };;

  const updateBattlePrep = (battlePrep: BattlePrepState, startingMonth?: number) => {
    setGameState(prev => ({
      ...prev,
      battlePrep,
      month: battlePrep.startDate?.month || startingMonth || prev.month || 1,
      year: battlePrep.startDate?.year || prev.year || 1944,
      day: battlePrep.startDate?.day || prev.day || 1
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
      case 'tutorial-intro':
        return <TutorialIntroductionScreen onNavigate={navigateToScreen} />;
      case 'tutorial-select':
        return <TutorialSelectScreen onNavigate={navigateToScreen} />;
      case 'battle-prep':
        return <BattlePrepScreen gameState={gameState} onNavigate={navigateToScreen} onUpdateBattlePrep={updateBattlePrep} />;
      case 'deployment':
        return (
          <CameraProvider>
            <UnitDeploymentScreen gameState={gameState} onNavigate={navigateToScreen} onUpdateBattlePrep={updateBattlePrep} onStartBattle={startBattle} />
          </CameraProvider>
        );
      case 'battle':
        return (
          <CameraProvider>
            <BattleScreen gameState={gameState} setGameState={setGameState} onNavigate={navigateToScreen} />
          </CameraProvider>
        );
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