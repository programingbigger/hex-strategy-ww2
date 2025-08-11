import React from 'react';
import { Unit, Tile } from '../../types';
import { WeaponInfoPanel } from './WeaponInfoPanel';

interface SelectedUnitPanelProps {
  selectedUnit?: Unit;
  selectedUnitTile: Tile | null;
  onAction: (action: 'wait' | 'undo' | 'capture') => void;
}

const SelectedUnitPanel: React.FC<SelectedUnitPanelProps> = ({
  selectedUnit,
  selectedUnitTile,
  onAction
}) => {
  // Helper function to check if terrain is capturable
  const isCapturableTerrain = (terrain: string): boolean => {
    return terrain === 'City' || terrain === 'Capital' || terrain === 'Airport' || terrain === 'Port';
  };

  // Action conditions
  const canCapture = selectedUnit?.unitClass === 'Infantry' && 
                    selectedUnitTile && isCapturableTerrain(selectedUnitTile.terrain) &&
                    selectedUnitTile?.owner !== selectedUnit.team;
  
  const canUndo = selectedUnit?.moved && !selectedUnit?.attacked;

  // Progress bar component
  const ProgressBar: React.FC<{ current: number; max: number; color: string }> = ({ current, max, color }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    return (
      <div style={{
        width: '120px',
        height: '8px',
        background: '#ddd',
        borderRadius: '4px',
        overflow: 'hidden',
        display: 'inline-block',
        marginLeft: '8px'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: color,
          transition: 'width 0.3s ease'
        }} />
      </div>
    );
  };

  return (
    <div style={{
      width: '320px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #333',
      borderRadius: '8px',
      fontSize: '18px',
      color: '#333',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 15px',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: '18px'
      }}>
        Selected Unit
      </div>

      {/* SELECTED UNIT Section */}
      {selectedUnit ? (
        <div style={{ padding: '15px' }}>
          <div style={{
            background: '#e8f4f8',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '15px'
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              color: '#0066cc',
              borderBottom: '1px solid #ccc',
              paddingBottom: '5px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              [SELECTED UNIT]
            </h4>
            
            {/* Unit Name */}
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: selectedUnit.team === 'Blue' ? '#0066cc' : '#cc0000'
            }}>
              {selectedUnit.name || selectedUnit.type} ({selectedUnit.team})
              {selectedUnit.branch && selectedUnit.category && (
                <div className="text-xs text-gray-500 mt-1">
                  {selectedUnit.branch} • {selectedUnit.category}
                </div>
              )}
            </div>
            
            {/* Separator */}
            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #ccc' }} />
            
            {/* Vital Information */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span>✚ HP</span>
                <ProgressBar current={selectedUnit.hp} max={selectedUnit.maxHp} color="#28a745" />
                <span style={{ marginLeft: '8px', fontSize: '16px' }}>
                  {selectedUnit.hp}/{selectedUnit.maxHp}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span>⛽ Fuel</span>
                <ProgressBar current={selectedUnit.fuel} max={selectedUnit.maxFuel} color="#ffc107" />
                <span style={{ marginLeft: '8px', fontSize: '16px' }}>
                  {selectedUnit.fuel}/{selectedUnit.maxFuel}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span>⭐ XP</span>
                <ProgressBar current={selectedUnit.xp} max={100} color="#17a2b8" />
                <span style={{ marginLeft: '8px', fontSize: '16px' }}>
                  {selectedUnit.xp}/100
                </span>
              </div>
            </div>
            
            {/* Separator */}
            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #ccc' }} />
            
            {/* Combat Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '5px',
              marginBottom: '10px',
              fontSize: '17px'
            }}>
              <div>💥 Attack: {selectedUnit.attack}</div>
              <div>🛡️ Defense: {selectedUnit.defense}</div>
              <div>🦾 Movement: {selectedUnit.movement}</div>
              <div>🎯 Range: {selectedUnit.attackRange.min}-{selectedUnit.attackRange.max}</div>
            </div>
            
            {/* Separator */}
            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #ccc' }} />
            
            {/* Position and Status */}
            <div style={{ fontSize: '17px' }}>
              <div style={{ marginBottom: '3px' }}>
                📍 Position: ({selectedUnit.x}, {selectedUnit.y})
              </div>
              <div>
                ⚙️ Status: {
                  selectedUnit.moved && selectedUnit.attacked ? 'Done' :
                  selectedUnit.moved ? 'Moved' :
                  selectedUnit.attacked ? 'Attacked' : 'Ready'
                }
              </div>
            </div>
            
            {/* Weapon Information */}
            <WeaponInfoPanel unit={selectedUnit} />
          </div>

          {/* ACTIONS Section */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '15px'
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              color: '#333',
              textAlign: 'center',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              [ ACTIONS ]
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => onAction('wait')}
                style={{
                  padding: '10px 15px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '500'
                }}
              >
                Wait
              </button>
              
              <button
                onClick={() => onAction('undo')}
                disabled={!canUndo}
                style={{
                  padding: '10px 15px',
                  background: canUndo ? '#dc3545' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: canUndo ? 'pointer' : 'not-allowed',
                  fontSize: '18px',
                  fontWeight: '500',
                  opacity: canUndo ? 1 : 0.6
                }}
              >
                Undo
              </button>
              
              {canCapture && (
                <button
                  onClick={() => onAction('capture')}
                  style={{
                    padding: '10px 15px',
                    background: '#fd7e14',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: '500'
                  }}
                >
                  Capture
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* No selected unit state */
        <div style={{ 
          padding: '30px 15px',
          textAlign: 'center'
        }}>
          <div style={{ 
            padding: '20px', 
            background: '#f5f5f5', 
            borderRadius: '5px',
            color: '#666',
            fontSize: '18px'
          }}>
            No selected Unit
          </div>
        </div>
      )}

      {/* SHORTCUTS Section - Always present in lower half */}
      <div style={{
        background: '#f8f9fa',
        borderTop: '2px solid #ddd',
        padding: '15px'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          color: '#333',
          fontSize: '16px',
          fontWeight: 'bold',
          borderBottom: '1px solid #ddd',
          paddingBottom: '8px'
        }}>
          ⌨️ Keyboard Shortcuts
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <span style={{ fontSize: '14px', color: '#666' }}>End Turn</span>
            <kbd style={{
              background: '#34495e',
              color: '#ecf0f1',
              padding: '3px 6px',
              borderRadius: '3px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '1px solid #2c3e50',
              fontFamily: 'monospace'
            }}>
              Cmd+E
            </kbd>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Cancel Selection</span>
            <kbd style={{
              background: '#34495e',
              color: '#ecf0f1',
              padding: '3px 6px',
              borderRadius: '3px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '1px solid #2c3e50',
              fontFamily: 'monospace'
            }}>
              Esc
            </kbd>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0'
          }}>
            <span style={{ fontSize: '14px', color: '#666' }}>Center on Selected</span>
            <kbd style={{
              background: '#34495e',
              color: '#ecf0f1',
              padding: '3px 6px',
              borderRadius: '3px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: '1px solid #2c3e50',
              fontFamily: 'monospace'
            }}>
              Space
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedUnitPanel;