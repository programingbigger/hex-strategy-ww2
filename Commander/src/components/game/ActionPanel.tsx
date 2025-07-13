import React from 'react';
import { Unit, Tile } from '../../types';

interface ActionPanelProps {
  selectedUnit: Unit | null | undefined;
  selectedUnitTile: Tile | null;
  onAction: (action: 'wait' | 'undo' | 'capture') => void;
  unitScreenPosition?: { x: number; y: number } | null;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  selectedUnit,
  selectedUnitTile,
  onAction,
  unitScreenPosition
}) => {
  if (!selectedUnit || !unitScreenPosition) return null;
  
  const canCapture = selectedUnit.unitClass === 'Infantry' && 
                    selectedUnitTile?.terrain === 'City' && 
                    selectedUnitTile?.owner !== selectedUnit.team;
  
  const canWait = !selectedUnit.moved || !selectedUnit.attacked;
  
  return (
    <div style={{
      position: 'fixed',
      left: unitScreenPosition.x + 60,
      top: unitScreenPosition.y - 30,
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #333',
      borderRadius: '10px',
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
      zIndex: 1500,
      minWidth: '120px'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px', textAlign: 'center' }}>Actions</h4>
      
      {canWait && (
        <button
          onClick={() => onAction('wait')}
          style={{
            padding: '8px 12px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Wait
        </button>
      )}
      
      {canCapture && (
        <button
          onClick={() => onAction('capture')}
          style={{
            padding: '8px 12px',
            background: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Capture
        </button>
      )}
      
      <button
        onClick={() => onAction('undo')}
        style={{
          padding: '8px 12px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        Undo
      </button>
    </div>
  );
};

export default ActionPanel;