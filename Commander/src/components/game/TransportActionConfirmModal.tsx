import React from 'react';
import { Coordinate, Tile, Unit } from '../../types';

interface TransportActionConfirmModalProps {
  isOpen: boolean;
  actionType: 'unload' | null;
  targetCoord: Coordinate | null;
  targetTile: Tile | null;
  loadedUnit: Unit | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const TransportActionConfirmModal: React.FC<TransportActionConfirmModalProps> = ({
  isOpen,
  actionType,
  targetCoord,
  targetTile,
  loadedUnit,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !actionType || !targetCoord || !targetTile || !loadedUnit) return null;

  const getActionText = () => {
    switch (actionType) {
      case 'unload':
        return {
          title: '降車確認',
          message: `座標 (${targetCoord.x}, ${targetCoord.y}) の${targetTile.terrain}に${loadedUnit.name || loadedUnit.type}を降車させますか？`,
          action: '降車実行',
          icon: '📤'
        };
      default:
        return {
          title: '確認',
          message: 'アクションを実行しますか？',
          action: '実行',
          icon: '🚛'
        };
    }
  };

  const { title, message, action, icon } = getActionText();

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onCancel}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          minWidth: '400px',
          maxWidth: '500px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '12px'
        }}>
          <span style={{ fontSize: '24px', marginRight: '12px' }}>{icon}</span>
          <h3 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            {title}
          </h3>
        </div>

        {/* Content */}
        <div style={{
          marginBottom: '24px',
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#555'
        }}>
          {message}
        </div>

        {/* Unit Info */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '24px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            降車するユニット:
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
            {loadedUnit.name || loadedUnit.type} ({loadedUnit.team})
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            HP: {loadedUnit.hp}/{loadedUnit.maxHp} | 燃料: {loadedUnit.fuel}/{loadedUnit.maxFuel}
          </div>
        </div>

        {/* Target Info */}
        <div style={{
          background: '#f8f9fa',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '24px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
            降車位置:
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
            ({targetCoord.x}, {targetCoord.y}) - {targetTile.terrain}
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              border: '2px solid #6c757d',
              borderRadius: '6px',
              background: 'white',
              color: '#6c757d',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = '#6c757d';
              target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = 'white';
              target.style.color = '#6c757d';
            }}
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              border: '2px solid #fd7e14',
              borderRadius: '6px',
              background: '#fd7e14',
              color: 'white',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = '#e8711a';
              target.style.borderColor = '#e8711a';
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background = '#fd7e14';
              target.style.borderColor = '#fd7e14';
            }}
          >
            {action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportActionConfirmModal;