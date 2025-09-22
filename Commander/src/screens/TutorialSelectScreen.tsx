import React, { useState, useEffect } from 'react';
import { GameScreen, GameMap } from '../types';
import { tutorialMaps } from '../data/maps';
import MapPreview from '../components/ui/MapPreview';

interface TutorialSelectScreenProps {
  onNavigate: (screen: GameScreen, selectedMap?: GameMap) => void;
}

// TypeScript interfaces for the JSON structure
interface TutorialConfig {
  name: string;
  victoryConditions: string;
}

interface TutorialData {
  version: string;
  metadata: {
    lastUpdated: string;
    description: string;
  };
  tutorialSelectScreen: {
    [key: string]: TutorialConfig;
  };
}

const TutorialSelectScreen: React.FC<TutorialSelectScreenProps> = ({ onNavigate }) => {
  const [selectedMap, setSelectedMap] = useState<GameMap | null>(null);
  const [tutorialData, setTutorialData] = useState<TutorialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch tutorial data from JSON file on component mount
  useEffect(() => {
    const fetchTutorialData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const response = await fetch('/tutorial.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch tutorial data: ${response.status} ${response.statusText}`);
        }

        const data: TutorialData = await response.json();
        setTutorialData(data);
      } catch (error) {
        console.error('Error loading tutorial data:', error);
        setLoadError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorialData();
  }, []);

  const handleMapSelect = (map: GameMap) => {
    setSelectedMap(map);
  };

  const handleStartTutorial = () => {
    if (selectedMap) {
      onNavigate('battle-prep', selectedMap);
    }
  };

  // Get victory conditions from loaded JSON data
  const getVictoryConditions = (mapId: string): string => {
    if (!tutorialData?.tutorialSelectScreen) {
      return '勝利条件を読み込み中...';
    }

    const tutorial = tutorialData.tutorialSelectScreen[mapId];
    return tutorial?.victoryConditions || '勝利条件が設定されていません';
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="screen scenario-select-screen">
        <div className="scenario-header">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>チュートリアルデータを読み込み中...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (loadError) {
    return (
      <div className="screen scenario-select-screen">
        <div className="scenario-header">
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>エラーが発生しました</h2>
            <p>チュートリアルデータの読み込みに失敗しました: {loadError}</p>
            <button
              className="military-button"
              onClick={() => window.location.reload()}
              style={{ marginTop: '20px' }}
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <h3 className="panel-title">作戦準備</h3>
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
                  <div className="objectives-content">
                    {selectedMap.description.split('\n').map((line, index) => (
                      <div key={index} className="objective-item">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="victory-conditions">
                  <h4>勝利条件:</h4>
                  <div className="victory-content">
                    {getVictoryConditions(selectedMap.id)}
                  </div>
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