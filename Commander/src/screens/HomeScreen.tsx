import React from 'react';
import { GameScreen } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="screen home-screen">
      <h1 className="screen-title">Mode Select</h1>
      
      <div className="menu-container">
        <button 
          className="menu-button"
          disabled
        >
          Story Mode (Coming Soon)
        </button>
        
        <button 
          className="menu-button"
          onClick={() => onNavigate('scenario-select')}
        >
          Scenario Mode
        </button>
        
        <button 
          className="menu-button"
          disabled
        >
          Tutorial (Coming Soon)
        </button>
        
        <button 
          className="menu-button"
          disabled
        >
          Settings (Coming Soon)
        </button>
        
        <button 
          className="menu-button menu-button-back"
          onClick={() => onNavigate('title')}
        >
          Back to Title
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;