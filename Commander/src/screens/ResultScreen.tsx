import React from 'react';
import { GameScreen } from '../types';

interface ResultScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ onNavigate }) => {
  const mockResult = {
    winner: 'Blue' as const,
    turnsToWin: 8,
    unitsLost: 1
  };

  return (
    <div className="screen result-screen">
      <div className="result-content">
        <h1 className={`result-title ${mockResult.winner === 'Blue' ? 'victory' : 'defeat'}`}>
          {mockResult.winner === 'Blue' ? 'VICTORY!' : 'DEFEAT'}
        </h1>
        
        <div className="result-stats">
          <div className="stat-row">
            <span>Battle Duration:</span>
            <span>{mockResult.turnsToWin} turns</span>
          </div>
          <div className="stat-row">
            <span>Units Lost:</span>
            <span>{mockResult.unitsLost}</span>
          </div>
          <div className="stat-row">
            <span>Performance:</span>
            <span>{mockResult.turnsToWin <= 5 ? 'Excellent' : mockResult.turnsToWin <= 10 ? 'Good' : 'Average'}</span>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <button 
            className="menu-button"
            onClick={() => onNavigate('scenario-select')}
            style={{ marginRight: '10px' }}
          >
            Play Again
          </button>
          
          <button 
            className="menu-button"
            onClick={() => onNavigate('home')}
          >
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;