import React, { useState } from 'react';
import { GameScreen } from '../types';

interface TitleScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onNavigate }) => {
  const [modeSelectExpanded, setModeSelectExpanded] = useState(false);
  return (
    <div className="screen title-screen">
      <div className="title-content-container">
        {/* Title Section (Center Top) */}
        <div className="title-header-centered">
          <h1 className="screen-title-large">COMMANDER</h1>
          <p className="subtitle-text">
            Strategic Warfare Simulation
          </p>
        </div>

        {/* Background Video (Center) */}
        <div className="title-video-container">
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
        </div>
        
        {/* Button Section (Center Bottom) */}
        <div className="title-menu-centered">
          <div className="menu-container-large">
          {!modeSelectExpanded ? (
            <>
              <button 
                className="menu-button-large military-button"
                onClick={() => setModeSelectExpanded(true)}
              >
                ゲーム開始
              </button>
              
              <button 
                className="menu-button-large military-button"
                disabled
              >
                Continue (Not Available)
              </button>
              
              <button 
                className="menu-button-large military-button"
                disabled
              >
                Settings (Not Available)
              </button>
            </>
          ) : (
            <>
              <button 
                className="menu-button-large military-button"
                disabled
              >
                Tutorial (Coming Soon)
              </button>
              
              <button 
                className="menu-button-large military-button"
                disabled
              >
                Story Mode (Coming Soon)
              </button>
              
              <button 
                className="menu-button-large military-button"
                onClick={() => onNavigate('scenario-select')}
              >
                Scenario Mode
              </button>
              
              <button 
                className="menu-button-large military-button"
                disabled
              >
                Settings (Coming Soon)
              </button>
              
              <button 
                className="menu-button-large military-button menu-button-back"
                onClick={() => setModeSelectExpanded(false)}
              >
                Back to Title
              </button>
            </>
          )}
          </div>
        </div>
      </div>
      
      <div className="copyright-text">
        <p>© 2025 Commander Strategy Game</p>
      </div>
    </div>
  );
};

export default TitleScreen;