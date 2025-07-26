import React from 'react';
import { GameScreen } from '../types';

interface TitleScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onNavigate }) => {
  return (
    <div className="screen title-screen">
      <video 
        className="title-background-video"
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/assets/videos/intro/game-introduction.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      <div className="title-content">
        <h1 className="screen-title">COMMANDER</h1>
        <p style={{ fontSize: '1.2em', marginBottom: '2rem', opacity: 0.8 }}>
          Strategic Warfare Simulation
        </p>
        
        <div className="menu-container">
        <button 
          className="menu-button"
          onClick={() => onNavigate('home')}
        >
          Mode Select
        </button>
        
        <button 
          className="menu-button"
          style={{ opacity: 0.5, cursor: 'not-allowed' }}
          disabled
        >
          Continue (Not Available)
        </button>
        
        <button 
          className="menu-button"
          style={{ opacity: 0.5, cursor: 'not-allowed' }}
          disabled
        >
          Settings (Not Available)
        </button>
      </div>
        
        <div style={{ position: 'absolute', bottom: '20px', opacity: 0.6 }}>
          <p>© 2025 Commander Strategy Game</p>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;