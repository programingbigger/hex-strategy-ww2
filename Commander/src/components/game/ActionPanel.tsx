import React from 'react';
import { Unit, Tile } from '../../types';

interface ActionPanelProps {
  selectedUnit: Unit | null | undefined;
  selectedUnitTile: Tile | null;
  onAction: (action: 'wait' | 'undo' | 'capture') => void;
}

const ActionPanel: React.FC<ActionPanelProps> = ({
  selectedUnit,
  selectedUnitTile,
  onAction
}) => {
  if (!selectedUnit) return null;
  
  const canCapture = selectedUnit.unitClass === 'Infantry' && 
                    selectedUnitTile?.terrain === 'City' && 
                    selectedUnitTile?.owner !== selectedUnit.team;
  
  const canWait = !selectedUnit.moved || !selectedUnit.attacked;
  
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #333',
      borderRadius: '10px',
      padding: '20px',
      display: 'flex',
      gap: '10px',
      boxShadow: '0 5px 20px rgba(0,0,0,0.3)'
    }}>
      <h4 style={{ margin: '0 20px 0 0', alignSelf: 'center' }}>Actions:</h4>
      
      {canWait && (
        <button
          onClick={() => onAction('wait')}
          style={{
            padding: '10px 20px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Wait
        </button>
      )}
      
      {canCapture && (
        <button
          onClick={() => onAction('capture')}
          style={{
            padding: '10px 20px',
            background: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Capture
        </button>
      )}
      
      <button
        onClick={() => onAction('undo')}
        style={{
          padding: '10px 20px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Undo
      </button>
    </div>
  );
};

export default ActionPanel;