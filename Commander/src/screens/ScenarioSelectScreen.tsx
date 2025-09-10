import React, { useState } from 'react';
import { GameScreen, GameMap } from '../types';
import { availableMaps } from '../data/maps';
import MapPreview from '../components/ui/MapPreview';

interface ScenarioSelectScreenProps {
  onNavigate: (screen: GameScreen, selectedMap?: GameMap) => void;
}

const ScenarioSelectScreen: React.FC<ScenarioSelectScreenProps> = ({ onNavigate }) => {
  const [selectedMap, setSelectedMap] = useState<GameMap | null>(null);

  const handleMapSelect = (map: GameMap) => {
    setSelectedMap(map);
  };

  const handleStartBattle = () => {
    if (selectedMap) {
      onNavigate('battle-prep', selectedMap);
    }
  };

  return (
    <div className="screen scenario-select-screen">
      <div className="scenario-header">
        <h1 className="scenario-title">SELECT MISSION</h1>
        <p className="scenario-subtitle">Choose your battlefield</p>
      </div>
      
      <div className="scenario-content">
        {/* Left Panel - Map List (20%) */}
        <div className="scenario-left-panel">
          <div className="panel-header">
            <h3 className="panel-title">Available Maps</h3>
          </div>
          <div className="map-list">
            {availableMaps.map((map) => (
              <div 
                key={map.id}
                className={`map-list-item ${selectedMap?.id === map.id ? 'selected' : ''}`}
                onClick={() => handleMapSelect(map)}
              >
                <div className="map-item-header">
                  <div className="map-item-name">{map.name}</div>
                  <div className="map-item-difficulty">{map.difficulty}</div>
                </div>
                <div className="map-item-description">{map.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Map Preview (60%) */}
        <div className="scenario-center-panel">
          <div className="panel-header">
            <h3 className="panel-title">Map Preview</h3>
          </div>
          <div className="map-preview-area">
            <MapPreview selectedMap={selectedMap} />
          </div>
        </div>

        {/* Right Panel - Actions & Info (20%) */}
        <div className="scenario-right-panel">
          <div className="panel-header">
            <h3 className="panel-title">Mission Control</h3>
          </div>
          <div className="mission-actions">
            {selectedMap ? (
              <>
                <div className="selected-mission-info">
                  <h4>Selected Mission:</h4>
                  <div className="mission-name">{selectedMap.name}</div>
                  <div className="mission-id">ID: {selectedMap.id}</div>
                </div>
                
                <button 
                  className="mission-start-button military-button"
                  onClick={handleStartBattle}
                >
                  Start Battle
                </button>
              </>
            ) : (
              <div className="no-mission-selected">
                <div className="no-mission-icon">🎯</div>
                <div className="no-mission-text">
                  Select a mission from the list to view details and start battle
                </div>
              </div>
            )}
            
            <div className="mission-controls">
              <button 
                className="control-button military-button"
                onClick={() => onNavigate('title')}
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSelectScreen;