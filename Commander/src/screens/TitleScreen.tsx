import React, { useState } from 'react';
import { GameScreen } from '../types';

interface TitleScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onNavigate }) => {
  const [modeSelectExpanded, setModeSelectExpanded] = useState(false);
  return (
    <div className="screen title-screen">
      {/* Title Section (Top) */}
      <div className="title-header">
        <h1 className="screen-title">COMMANDER</h1>
        <p style={{ fontSize: '1.2em', opacity: 0.8 }}>
          Strategic Warfare Simulation
        </p>
      </div>

      {/* Background Video (Center) */}
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
      
      {/* Button Section (Bottom) */}
      <div className="title-footer">
        <div className="menu-container">
        {!modeSelectExpanded ? (
          <>
            <button 
              className="menu-button"
              onClick={() => setModeSelectExpanded(true)}
            >
              Mode Select
            </button>
            
            <button 
              className="menu-button"
              disabled
            >
              Continue (Not Available)
            </button>
            
            <button 
              className="menu-button"
              disabled
            >
              Settings (Not Available)
            </button>
          </>
        ) : (
          <>
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
              Settings (Coming Soon)
            </button>
            
            <button 
              className="menu-button menu-button-back"
              onClick={() => setModeSelectExpanded(false)}
            >
              Back to Title
            </button>
          </>
        )}
        </div>
        
        <div className="copyright-text">
          <p>© 2025 Commander Strategy Game</p>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;