import React from 'react';

interface EndTurnConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const EndTurnConfirmModal: React.FC<EndTurnConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '30px',
        minWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '2px solid #3498db'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          color: '#2c3e50',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          🔄 End Turn Confirmation
        </h2>
        
        <p style={{
          margin: '0 0 30px 0',
          fontSize: '18px',
          color: '#34495e',
          lineHeight: '1.5'
        }}>
          Are you sure you want to end your turn?
        </p>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px solid #27ae60',
              borderRadius: '8px',
              background: '#27ae60',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '100px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#219a52';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#27ae60';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Yes
          </button>
          
          <button
            onClick={onCancel}
            style={{
              padding: '12px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px solid #e74c3c',
              borderRadius: '8px',
              background: '#e74c3c',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '100px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#c0392b';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#e74c3c';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            No
          </button>
        </div>
        
        <div style={{
          marginTop: '20px',
          fontSize: '14px',
          color: '#7f8c8d'
        }}>
          Tip: Press Cmd+E to open this dialog
        </div>
      </div>
    </div>
  );
};

export default EndTurnConfirmModal;