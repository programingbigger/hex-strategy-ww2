import React from 'react';
import { GameScreen, GameMap } from '../types';
import { availableMaps } from '../data/maps';

interface ScenarioSelectScreenProps {
  onNavigate: (screen: GameScreen, selectedMap?: GameMap) => void;
}

const ScenarioSelectScreen: React.FC<ScenarioSelectScreenProps> = ({ onNavigate }) => {
  const handleMapSelect = (map: GameMap) => {
    onNavigate('battle-prep', map);
  };

  return (
    <div className="screen scenario-select-screen">
      <h1 className="screen-title">Select Mission</h1>
      
      <div className="map-grid">
        {availableMaps.map((map) => (
          <div 
            key={map.id}
            className="map-card"
            onClick={() => handleMapSelect(map)}
          >
            <div className="map-name">{map.name}</div>
            <div className="map-description">{map.description}</div>
          </div>
        ))}
      </div>
      
      <button 
        className="menu-button"
        onClick={() => onNavigate('home')}
        style={{ marginTop: '2rem', background: 'rgba(231, 76, 60, 0.2)' }}
      >
        Back to Mode Select
      </button>
    </div>
  );
};

export default ScenarioSelectScreen;