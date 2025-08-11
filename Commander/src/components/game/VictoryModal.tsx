import React from 'react';

interface VictoryModalProps {
  isOpen: boolean;
  defeatedArmy?: string;
  winnerArmy?: string;
  onClose: () => void;
}

const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, defeatedArmy, winnerArmy, onClose }) => {
  if (!isOpen) return null;

  const getMessage = () => {
    if (!defeatedArmy) return '';
    
    let message = `${defeatedArmy}軍が降伏しました。`;
    
    // Only show victory message if there's a definitive winner
    if (winnerArmy) {
      message += `${winnerArmy}軍が勝利です。`;
    }
    
    return message;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
        border: '3px solid #333',
        borderRadius: '15px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '500px',
        minWidth: '300px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        animation: 'victoryModalSlide 0.4s ease-out'
      }}>
        {/* Header */}
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#2c3e50',
          marginBottom: '20px',
          padding: '0 0 15px 0',
          borderBottom: '2px solid #e0e0e0'
        }}>
          {winnerArmy ? '🏆 戦闘結果' : '⚔️ 戦況報告'}
        </div>

        {/* Message */}
        <div style={{
          fontSize: '20px',
          color: '#34495e',
          marginBottom: '30px',
          lineHeight: '1.6',
          padding: '20px',
          background: winnerArmy ? 
            'linear-gradient(135deg, #d5f4e6 0%, #ffeaa7 100%)' : 
            'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
          borderRadius: '10px',
          border: '2px solid #ddd'
        }}>
          {getMessage()}
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            fontWeight: 'bold',
            background: winnerArmy ? 
              'linear-gradient(135deg, #00b894 0%, #00cec9 100%)' : 
              'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            minWidth: '150px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
          }}
        >
          タイトルへ戻る
        </button>

        {/* Animation CSS */}
        <style>{`
          @keyframes victoryModalSlide {
            from {
              opacity: 0;
              transform: translateY(-50px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default VictoryModal;