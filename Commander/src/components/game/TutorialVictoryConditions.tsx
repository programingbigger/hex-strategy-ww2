import React, { useState, useEffect } from 'react';
import { GameMap } from '../../types';
import '../../styles/military-museum-theme.css';

interface TutorialVictoryConditionsProps {
  selectedMap?: GameMap;
  currentTurn: number;
  turnLimit?: number;
  className?: string;
}

// TypeScript interfaces for the JSON structure (reused from TutorialSelectScreen)
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

const TutorialVictoryConditions: React.FC<TutorialVictoryConditionsProps> = ({
  selectedMap,
  currentTurn,
  turnLimit,
  className
}) => {
  const [tutorialData, setTutorialData] = useState<TutorialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Check if this is a tutorial map
  const isTutorialMap = selectedMap?.id?.startsWith('tutorial_') || false;

  // Fetch tutorial data from JSON file on component mount
  useEffect(() => {
    if (!isTutorialMap) {
      setIsLoading(false);
      return;
    }

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
  }, [isTutorialMap]);

  // Get victory conditions from loaded JSON data
  const getVictoryConditions = (mapId: string): string => {
    if (!tutorialData?.tutorialSelectScreen) {
      return '勝利条件を読み込み中...';
    }

    const tutorial = tutorialData.tutorialSelectScreen[mapId];
    return tutorial?.victoryConditions || '勝利条件が設定されていません';
  };

  // Calculate remaining turns
  const getRemainingTurns = (): number | null => {
    if (!turnLimit) return null;
    return Math.max(0, turnLimit - currentTurn);
  };

  // Determine turn status color
  const getTurnStatusColor = (): string => {
    const remaining = getRemainingTurns();
    if (!remaining && remaining !== 0) return '#3498db'; // Default blue
    if (remaining <= 5) return '#e74c3c'; // Red for urgent
    if (remaining <= 10) return '#f39c12'; // Orange for warning
    return '#27ae60'; // Green for safe
  };

  // Don't render anything if not a tutorial map
  if (!isTutorialMap) {
    return null;
  }

  // Don't render if loading or error (fail silently for better UX)
  if (isLoading || loadError) {
    return null;
  }

  const victoryConditions = selectedMap ? getVictoryConditions(selectedMap.id) : '';
  const remainingTurns = getRemainingTurns();
  const turnStatusColor = getTurnStatusColor();

  return (
    <div
      className={`tutorial-victory-conditions ${className || ''}`}
      style={{
        background: 'rgba(52, 73, 94, 0.95)',
        border: '2px solid #34495e',
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '8px 0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        fontSize: '14px',
        lineHeight: '1.4'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Victory Conditions */}
        <div style={{ flex: 1 }}>
          <h4 style={{
            margin: '0 0 6px 0',
            fontSize: '16px',
            color: '#ecf0f1',
            fontWeight: 'bold'
          }}>
            🎯 勝利条件
          </h4>
          <div style={{
            color: '#bdc3c7',
            fontSize: '14px'
          }}>
            {victoryConditions}
          </div>
        </div>

        {/* Turn Limit (if available) */}
        {turnLimit && (
          <div style={{
            textAlign: 'right',
            minWidth: '120px'
          }}>
            <h4 style={{
              margin: '0 0 6px 0',
              fontSize: '16px',
              color: '#ecf0f1',
              fontWeight: 'bold'
            }}>
              ⏰ 残りターン
            </h4>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: turnStatusColor
            }}>
              {remainingTurns}/{turnLimit}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialVictoryConditions;