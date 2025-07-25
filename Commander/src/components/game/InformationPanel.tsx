import React from 'react';
import { Unit, Tile, Coordinate } from '../../types';

interface InformationPanelProps {
  selectedUnit?: Unit;
  selectedUnitTile: Tile | null;
  hoveredHex?: Coordinate | null;
  boardLayout: Map<string, Tile>;
  units: Unit[];
  onAction: (action: 'wait' | 'undo' | 'capture') => void;
}

const InformationPanel: React.FC<InformationPanelProps> = ({
  selectedUnit,
  selectedUnitTile,
  hoveredHex,
  boardLayout,
  units,
  onAction
}) => {
  const coordToString = (coord: Coordinate) => `${coord.x},${coord.y}`;
  
  const hoveredTile = hoveredHex ? boardLayout.get(coordToString(hoveredHex)) : null;
  const hoveredUnit = hoveredHex ? units.find(u => u.x === hoveredHex.x && u.y === hoveredHex.y) : null;

  // Action conditions
  const canCapture = selectedUnit?.unitClass === 'Infantry' && 
                    selectedUnitTile?.terrain === 'City' && 
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

  // Terrain effect descriptions
  const getTerrainEffect = (terrain: string) => {
    switch (terrain) {
      case 'Forest': return '(Defense +2)';
      case 'Mountain': return '(Defense +3)';
      case 'City': return '(Defense +4)';
      case 'River': return '(Movement -1)';
      case 'Road': return '(Movement +1)';
      case 'Bridge': return '(Movement +1)';
      case 'Mud': return '(Movement -2)';
      default: return '';
    }
  };

  return (
    <div style={{
      width: '300px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '2px solid #333',
      borderRadius: '8px',
      fontSize: '14px',
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
        fontSize: '16px'
      }}>
        Information Panel
      </div>

      {/* SELECTED UNIT Section */}
      {selectedUnit && (
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
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              [SELECTED UNIT]
            </h4>
            
            {/* Unit Name */}
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: selectedUnit.team === 'Blue' ? '#0066cc' : '#cc0000'
            }}>
              {selectedUnit.type} ({selectedUnit.team})
            </div>
            
            {/* Separator */}
            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #ccc' }} />
            
            {/* Vital Information */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span>✚ HP</span>
                <ProgressBar current={selectedUnit.hp} max={selectedUnit.maxHp} color="#28a745" />
                <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                  {selectedUnit.hp}/{selectedUnit.maxHp}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span>⛽ Fuel</span>
                <ProgressBar current={selectedUnit.fuel} max={selectedUnit.maxFuel} color="#ffc107" />
                <span style={{ marginLeft: '8px', fontSize: '12px' }}>
                  {selectedUnit.fuel}/{selectedUnit.maxFuel}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span>⭐ XP</span>
                <ProgressBar current={selectedUnit.xp} max={100} color="#17a2b8" />
                <span style={{ marginLeft: '8px', fontSize: '12px' }}>
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
              fontSize: '13px'
            }}>
              <div>💥 Attack: {selectedUnit.attack}</div>
              <div>🛡️ Defense: {selectedUnit.defense}</div>
              <div>🥾 Movement: {selectedUnit.movement}</div>
              <div>🎯 Range: {selectedUnit.attackRange.min}-{selectedUnit.attackRange.max}</div>
            </div>
            
            {/* Separator */}
            <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #ccc' }} />
            
            {/* Position and Status */}
            <div style={{ fontSize: '13px' }}>
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
              fontSize: '14px',
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
                  fontSize: '14px',
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
                  fontSize: '14px',
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
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Capture
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HOVERED HEX Section */}
      {hoveredTile && (
        <div style={{ 
          padding: '15px',
          borderTop: selectedUnit ? '1px solid #ddd' : 'none'
        }}>
          <div style={{
            background: '#f0f8e8',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              color: '#228b22',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              [HOVERED HEX]
            </h4>
            
            <div style={{ fontSize: '13px' }}>
              <div style={{ marginBottom: '5px' }}>
                📍 Position: ({hoveredHex?.x}, {hoveredHex?.y})
              </div>
              <div style={{ marginBottom: '5px' }}>
                🌲 Terrain: {hoveredTile.terrain}
              </div>
              <div style={{ 
                marginLeft: '20px', 
                color: '#666', 
                fontStyle: 'italic',
                marginBottom: '8px' 
              }}>
                {getTerrainEffect(hoveredTile.terrain)}
              </div>
              
              {hoveredTile.owner && (
                <div style={{ marginBottom: '5px' }}>
                  <strong>Owner:</strong> {hoveredTile.owner}
                </div>
              )}
              
              {hoveredTile.hp !== undefined && (
                <div style={{ marginBottom: '5px' }}>
                  <strong>HP:</strong> {hoveredTile.hp}/{hoveredTile.maxHp}
                </div>
              )}
              
              {hoveredUnit && (
                <div style={{ 
                  marginTop: '10px', 
                  paddingTop: '8px', 
                  borderTop: '1px solid #ccc' 
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                    Unit: {hoveredUnit.type} ({hoveredUnit.team})
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    HP: {hoveredUnit.hp}/{hoveredUnit.maxHp} | 
                    Fuel: {hoveredUnit.fuel}/{hoveredUnit.maxFuel} | 
                    XP: {hoveredUnit.xp}/100
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!selectedUnit && !hoveredTile && (
        <div style={{ 
          padding: '30px 15px',
          textAlign: 'center'
        }}>
          <div style={{ 
            padding: '20px', 
            background: '#f5f5f5', 
            borderRadius: '5px',
            color: '#666'
          }}>
            Select a unit or hover over a hex for details
          </div>
        </div>
      )}
    </div>
  );
};

export default InformationPanel;