import React, { useEffect, useState } from 'react';
import { ReinforcementData } from '../../types/reinforcements';
import { loadReinforcementConfig } from '../../utils/reinforcements';

interface ReinforcementPreviewProps {
  mapId: string;
}

const ReinforcementPreview: React.FC<ReinforcementPreviewProps> = ({ mapId }) => {
  const [reinforcements, setReinforcements] = useState<ReinforcementData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReinforcements = async () => {
      try {
        const config = await loadReinforcementConfig(mapId);
        if (config) {
          setReinforcements(config.reinforcements);
        }
      } catch (error) {
        console.error('Failed to load reinforcement preview:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReinforcements();
  }, [mapId]);

  if (loading) {
    return (
      <div style={{ 
        padding: '15px', 
        background: 'rgba(255, 165, 0, 0.1)', 
        borderRadius: '8px', 
        border: '2px solid rgba(255, 165, 0, 0.3)',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#FF8C00', marginBottom: '10px' }}>🪖 Enemy Reinforcements</h3>
        <p>Loading reinforcement data...</p>
      </div>
    );
  }

  if (reinforcements.length === 0) {
    return null; // Don't show anything if no reinforcements
  }

  // Group reinforcements by turn
  const reinforcementsByTurn = reinforcements.reduce((acc, reinforcement) => {
    if (!acc[reinforcement.spawnTurn]) {
      acc[reinforcement.spawnTurn] = [];
    }
    acc[reinforcement.spawnTurn].push(reinforcement);
    return acc;
  }, {} as Record<number, ReinforcementData[]>);

  const sortedTurns = Object.keys(reinforcementsByTurn).map(Number).sort((a, b) => a - b);

  return (
    <div style={{ 
      padding: '15px', 
      background: 'rgba(255, 165, 0, 0.1)', 
      borderRadius: '8px', 
      border: '2px solid rgba(255, 165, 0, 0.3)',
      marginBottom: '20px'
    }}>
      <h3 style={{ color: '#FF8C00', marginBottom: '15px', textAlign: 'center' }}>
        ⚠️ Enemy Reinforcement Intelligence
      </h3>
      <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
        {sortedTurns.map(turn => (
          <div key={turn} style={{ marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', color: '#FFD700' }}>
              Turn {turn}:
            </div>
            <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
              {reinforcementsByTurn[turn].map((reinforcement, index) => (
                <li key={index} style={{ marginBottom: '3px' }}>
                  <span style={{ color: '#FFA500' }}>
                    {reinforcement.team} {reinforcement.unitId}
                  </span>
                  {' at '}
                  <span style={{ color: '#FFD700' }}>
                    ({reinforcement.spawnLocation.x}, {reinforcement.spawnLocation.y})
                  </span>
                  <div style={{ fontSize: '12px', color: '#CCC', fontStyle: 'italic' }}>
                    {reinforcement.description}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ 
        fontSize: '12px', 
        color: '#FFA500', 
        marginTop: '10px', 
        fontStyle: 'italic',
        textAlign: 'center'
      }}>
        Plan your strategy accordingly. Reinforcement spawn locations will be highlighted in yellow during battle.
      </div>
    </div>
  );
};

export default ReinforcementPreview;