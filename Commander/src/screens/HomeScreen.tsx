import React from 'react';
import { GameScreen } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: GameScreen) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="screen home-screen">
      {/* Video Background */}
      <video
        className="home-video-background"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/assets/videos/intro/game-introduction.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Overlay */}
      <div className="home-content-overlay">
        <div className="home-content-container">
          <div className="home-header">
            <h1 className="screen-title-home">MODE SELECT</h1>
            <p className="home-subtitle">Choose your battle experience</p>
          </div>

          <div className="home-menu-grid">
            <button
              className="home-mode-button military-button"
              disabled
            >
              <div className="mode-button-icon">📚</div>
              <div className="mode-button-title">Story Mode</div>
              <div className="mode-button-desc">Coming Soon</div>
            </button>

            <button
              className="home-mode-button military-button"
              onClick={() => onNavigate('scenario-select')}
            >
              <div className="mode-button-icon">⚔️</div>
              <div className="mode-button-title">Scenario Mode</div>
              <div className="mode-button-desc">Custom Battles</div>
            </button>

            <button
              className="home-mode-button military-button"
              disabled
            >
              <div className="mode-button-icon">🎓</div>
              <div className="mode-button-title">Tutorial</div>
              <div className="mode-button-desc">Coming Soon</div>
            </button>

            <button
              className="home-mode-button military-button"
              disabled
            >
              <div className="mode-button-icon">⚙️</div>
              <div className="mode-button-title">Settings</div>
              <div className="mode-button-desc">Coming Soon</div>
            </button>
          </div>

          <div className="home-footer">
            <button
              className="menu-button-large military-button menu-button-back"
              onClick={() => onNavigate('title')}
            >
              Back to Title
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;