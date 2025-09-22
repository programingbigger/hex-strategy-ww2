import React from 'react';
import { Coordinate, Tile } from '../../types';

interface EngineerActionConfirmModalProps {
  isOpen: boolean;
  actionType: 'build_bridge' | null;
  targetCoord: Coordinate | null;
  targetTile: Tile | null;
  materialCost: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const EngineerActionConfirmModal: React.FC<EngineerActionConfirmModalProps> = ({
  isOpen,
  actionType,
  targetCoord,
  targetTile,
  materialCost,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !actionType || !targetCoord || !targetTile) return null;

  const getActionText = () => {
    switch (actionType) {
      case 'build_bridge':
        return {
          title: '架橋確認',
          message: `座標 (${targetCoord.x}, ${targetCoord.y}) の${targetTile.terrain}に橋を架けますか？`,
          action: '架橋実行',
          icon: '🌉'
        };
      default:
        return {
          title: '確認',
          message: 'アクションを実行しますか？',
          action: '実行',
          icon: '⚙️'
        };
    }
  };

  const actionInfo = getActionText();

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
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '30px',
        minWidth: '400px',
        maxWidth: '500px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '2px solid #3498db'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '25px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '10px'
          }}>
            {actionInfo.icon}
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            {actionInfo.title}
          </h3>
        </div>

        {/* Message */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '18px',
          color: '#34495e',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: 0, marginBottom: '15px' }}>
            {actionInfo.message}
          </p>
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '16px',
            color: '#6c757d'
          }}>
            💎 資材消費: {materialCost}個
          </div>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: '2px solid #95a5a6',
              borderRadius: '8px',
              backgroundColor: '#ecf0f1',
              color: '#2c3e50',
              cursor: 'pointer',
              minWidth: '100px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#bdc3c7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ecf0f1';
            }}
          >
            キャンセル
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: '2px solid #e74c3c',
              borderRadius: '8px',
              backgroundColor: '#e74c3c',
              color: 'white',
              cursor: 'pointer',
              minWidth: '100px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#c0392b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#e74c3c';
            }}
          >
            {actionInfo.action}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EngineerActionConfirmModal;