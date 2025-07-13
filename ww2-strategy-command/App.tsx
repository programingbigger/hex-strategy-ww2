
import React, { useState, useCallback } from 'react';
import { Screen } from './types';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import TutorialScreen from './screens/TutorialScreen';
import StoryScreen from './screens/StoryScreen';
import LoadScreen from './screens/LoadScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Home);

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.Game:
        return <GameScreen onNavigate={navigateTo} />;
      case Screen.Tutorial:
        return <TutorialScreen onNavigate={navigateTo} />;
      case Screen.Story:
        return <StoryScreen onNavigate={navigateTo} />;
      case Screen.Load:
        return <LoadScreen onNavigate={navigateTo} />;
      case Screen.Home:
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white overflow-hidden">
      {renderScreen()}
    </div>
  );
};

export default App;
