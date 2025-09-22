import React, { useState } from 'react';
import { GameScreen, GameMap } from '../types';
import { tutorialMaps } from '../data/maps';
import MapPreview from '../components/ui/MapPreview';

interface TutorialSelectScreenProps {
  onNavigate: (screen: GameScreen, selectedMap?: GameMap) => void;
}

const TutorialSelectScreen: React.FC<TutorialSelectScreenProps> = ({ onNavigate }) => {
  const [selectedMap, setSelectedMap] = useState<GameMap | null>(null);

  const handleMapSelect = (map: GameMap) => {
    setSelectedMap(map);
  };

  const handleStartTutorial = () => {
    if (selectedMap) {
      onNavigate('battle-prep', selectedMap);
    }
  };

  return (
    <div className="screen scenario-select-screen">
      <div className="scenario-header">
        <div style={{ 
          position: 'relative', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginBottom: '20px',
          minHeight: '80px'
        }}>
          {/* Centered Title */}
          <div style={{ textAlign: 'center' }}>
            <h1 className="scenario-title">📚 TUTORIAL</h1>
            <p className="scenario-subtitle">Learn the basics of warfare</p>
          </div>
          
          {/* Bottom-left positioned Back to Menu button */}
          <button
            className="control-button military-button"
            onClick={() => onNavigate('title')}
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              margin: '0',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              background: 'rgba(231, 76, 60, 0.8)',
              border: '2px solid #e74c3c',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              minWidth: '140px'
            }}
          >
            メインメニューに戻る
          </button>
        </div>
      </div>

      <div className="scenario-content">
        {/* Left Panel - Tutorial List (20%) */}
        <div className="scenario-left-panel">
          <div className="panel-header">
            <h3 className="panel-title">チュートリアル一覧</h3>
          </div>
          <div className="map-list">
            {tutorialMaps.map((map) => (
              <div
                key={map.id}
                className={`map-list-item ${selectedMap?.id === map.id ? 'selected' : ''}`}
                onClick={() => handleMapSelect(map)}
              >
                <div className="map-item-header">
                  <div className="map-item-name">{map.name}</div>
                </div>
                <div className="map-item-description">{map.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel - Map Preview (60%) */}
        <div className="scenario-center-panel">
          <div className="panel-header">
            <h3 className="panel-title">マップ プレビュー</h3>
          </div>
          <div className="map-preview-area">
            <MapPreview selectedMap={selectedMap} />
          </div>
        </div>

        {/* Right Panel - Actions & Info (20%) */}
        <div className="scenario-right-panel">
          <div className="panel-header">
            <h3 className="panel-title">学習開始</h3>
          </div>
          <div className="mission-actions">
            {selectedMap ? (
              <>
                <div className="selected-mission-info">
                  <h4>選択されたチュートリアル:</h4>
                  <div className="mission-name">{selectedMap.name}</div>
                </div>

                <div className="tutorial-objectives">
                  <h4>学習目標:</h4>
                  <ul className="objectives-list">
                    <li>ユニットの移動方法</li>
                    <li>敵ユニットへの攻撃</li>
                    <li>地形効果の活用</li>
                    <li>戦術の基本</li>
                  </ul>
                </div>

                <button
                  className="mission-start-button military-button"
                  onClick={handleStartTutorial}
                >
                  チュートリアル開始
                </button>
              </>
            ) : (
              <div className="no-mission-selected">
                <div className="no-mission-icon">🎓</div>
                <div className="no-mission-text">
                  チュートリアルを選択して学習を開始してください
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialSelectScreen;