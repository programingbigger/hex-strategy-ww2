import React from 'react';
import { ReinforcementData } from '../../types/reinforcements';

interface ReinforcementNotificationModalProps {
  isOpen: boolean;
  reinforcements: ReinforcementData[];
  onClose: () => void;
}

const ReinforcementNotificationModal: React.FC<ReinforcementNotificationModalProps> = ({
  isOpen,
  reinforcements,
  onClose
}) => {
  if (!isOpen || reinforcements.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reinforcement-notification" onClick={(e) => e.stopPropagation()}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.9) 0%, rgba(178, 34, 34, 0.9) 100%)',
          border: '3px solid #FF4500',
          borderRadius: '15px',
          padding: '30px',
          minWidth: '400px',
          maxWidth: '600px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 0 30px rgba(255, 69, 0, 0.5)',
          animation: 'reinforcementAlert 0.5s ease-in-out'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>
            🚨 <span style={{ fontWeight: 'bold' }}>ENEMY REINFORCEMENTS</span> 🚨
          </div>
          
          <div style={{ fontSize: '18px', marginBottom: '20px', color: '#FFE4E1' }}>
            Enemy forces have arrived on the battlefield!
          </div>

          <div style={{ marginBottom: '20px' }}>
            {reinforcements.map((reinforcement, index) => (
              <div key={index} style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '10px',
                borderRadius: '8px',
                margin: '8px 0',
                border: '1px solid rgba(255, 215, 0, 0.5)'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#FFD700' }}>
                  {reinforcement.team} {reinforcement.unitId}
                </div>
                <div style={{ fontSize: '14px', color: '#FFA500' }}>
                  Deployed at position ({reinforcement.spawnLocation.x}, {reinforcement.spawnLocation.y})
                </div>
                <div style={{ fontSize: '12px', color: '#DDD', fontStyle: 'italic', marginTop: '5px' }}>
                  {reinforcement.description}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            fontSize: '14px',
            color: '#FFE4E1',
            marginBottom: '20px',
            fontStyle: 'italic'
          }}>
            Adjust your tactics accordingly. The enemy has been strengthened.
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
              color: 'white',
              border: '2px solid #32CD32',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            }}
          >
            ACKNOWLEDGED
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes reinforcementAlert {
            0% {
              transform: scale(0.8) rotate(-5deg);
              opacity: 0;
            }
            50% {
              transform: scale(1.1) rotate(2deg);
            }
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ReinforcementNotificationModal;