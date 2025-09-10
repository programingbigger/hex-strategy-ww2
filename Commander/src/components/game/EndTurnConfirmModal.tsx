import React from 'react';
import '../../styles/military-museum-theme.css';

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
      <div className="military-dialog" style={{
        padding: '30px',
        minWidth: '400px',
        textAlign: 'center'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          color: 'var(--museum-wood-dark)',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🔄 END TURN CONFIRMATION
        </h2>
        
        <p style={{
          margin: '0 0 30px 0',
          fontSize: '14px',
          color: 'var(--stencil-text)',
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
            className="military-button"
            style={{
              fontSize: '14px',
              minWidth: '120px'
            }}
          >
            AFFIRMATIVE
          </button>
          
          <button
            onClick={onCancel}
            className="military-button"
            style={{
              fontSize: '14px',
              minWidth: '120px'
            }}
          >
            NEGATIVE
          </button>
        </div>
        
        <div style={{
          marginTop: '20px',
          fontSize: '11px',
          color: 'var(--museum-rust)',
          fontFamily: 'monospace'
        }}>
          TIP: PRESS CMD+E TO OPEN THIS DIALOG
        </div>
      </div>
    </div>
  );
};

export default EndTurnConfirmModal;