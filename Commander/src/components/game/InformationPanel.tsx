import React from 'react';
import { Unit, Tile, Coordinate } from '../../types';
import { WeaponInfoPanel } from './WeaponInfoPanel';
import { TERRAIN_STATS } from '../../config/constants';

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

  // Progress bar component
  const ProgressBar: React.FC<{ current: number; max: number; color: string }> = ({ current, max, color }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    return (
      <div style={{
        width: '100px',
        height: '6px',
        background: '#ddd',
        borderRadius: '3px',
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


  // Get terrain swatch color
  const getTerrainSwatchColor = (terrain: string): string => {
    const colorMap: { [key: string]: string } = {
      Plains: '#90EE90',
      Forest: '#228B22',
      Mountain: '#8B4513',
      River: '#4682B4',
      Road: '#696969',
      Bridge: '#8FBC8F',
      City: '#FF6347',
      Mud: '#CD853F',
      Sea: '#000080',
      Capital: '#DC143C',
      Airport: '#DAA520',
      Bocage: '#556B2F',
      Snow: '#F0F8FF',
      Desert: '#F4A460',
      Reef: '#20B2AA',
      Fortress: '#2F4F4F',
      Port: '#1E90FF'
    };
    return colorMap[terrain] || '#808080';
  };

  // Get terrain basic effects
  const getTerrainBasicEffects = (terrain: string) => {
    const terrainStats = TERRAIN_STATS[terrain];
    if (!terrainStats) return [];
    
    const effects = [];
    if (terrainStats.defenseBonus !== 0) {
      effects.push(`Defense ${terrainStats.defenseBonus > 0 ? '+' : ''}${terrainStats.defenseBonus}`);
    }
    if (terrainStats.attackBonus !== 0) {
      effects.push(`Attack ${terrainStats.attackBonus > 0 ? '+' : ''}${terrainStats.attackBonus}`);
    }
    return effects;
  };

  // Get movement costs for different unit types
  const getMovementCosts = (terrain: string) => {
    const terrainStats = TERRAIN_STATS[terrain];
    if (!terrainStats) return [];
    
    const costs = [];
    const movementCost = terrainStats.movementCost;
    
    // Get all unit types except default
    const unitTypes = Object.keys(movementCost).filter(key => key !== 'default');
    
    for (const unitType of unitTypes) {
      const cost = movementCost[unitType];
      costs.push({
        unitType,
        cost: cost === Infinity ? 'Impassable' : cost.toString()
      });
    }
    
    // Add default if no specific types found
    if (costs.length === 0) {
      const defaultCost = movementCost.default;
      costs.push({
        unitType: 'Default',
        cost: defaultCost === Infinity ? 'Impassable' : defaultCost.toString()
      });
    }
    
    return costs;
  };

  return (
    <div style={{
      width: '300px',
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
        Information Panel
      </div>

      {/* HOVERED HEX Section */}
      {hoveredTile && (
        <div style={{ 
          padding: '15px',
          borderTop: 'none'
        }}>
          <div style={{
            background: '#f0f8e8',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '15px'
          }}>
            <h4 style={{
              margin: '0 0 10px 0',
              color: '#228b22',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              🌍 [HOVERED HEX]
            </h4>
            
            {/* Terrain Swatch and Name */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: getTerrainSwatchColor(hoveredTile.terrain),
                border: '2px solid #333',
                borderRadius: '4px',
                marginRight: '10px'
              }} />
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: '#333'
              }}>
                {hoveredTile.terrain}
              </div>
            </div>
            
            <div style={{ fontSize: '17px', marginBottom: '8px' }}>
              📍 Position: ({hoveredHex?.x}, {hoveredHex?.y})
            </div>
            
            {/* Basic Effects */}
            {getTerrainBasicEffects(hoveredTile.terrain).length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '16px', marginBottom: '5px', fontWeight: 'bold' }}>
                  Basic Effects:
                </div>
                {getTerrainBasicEffects(hoveredTile.terrain).map((effect, index) => (
                  <div key={index} style={{ 
                    fontSize: '15px',
                    color: '#666',
                    marginLeft: '15px',
                    marginBottom: '2px'
                  }}>
                    • {effect}
                  </div>
                ))}
              </div>
            )}
            
            {/* Unit Movement Costs - Always visible */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#0066cc',
                marginBottom: '8px'
              }}>
                🚶 Unit Movement Costs:
              </div>
              {getMovementCosts(hoveredTile.terrain).map((costInfo, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  padding: '2px 0',
                  color: '#333',
                  marginLeft: '15px'
                }}>
                  <span>{costInfo.unitType}:</span>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: costInfo.cost === 'Impassable' ? '#cc0000' : '#228b22'
                  }}>
                    {costInfo.cost}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Terrain ownership and HP if applicable */}
            {hoveredTile.owner && (
              <div style={{ fontSize: '17px', marginBottom: '5px' }}>
                👑 Owner: <strong>{hoveredTile.owner}</strong>
              </div>
            )}
            
            {hoveredTile.hp !== undefined && (
              <div style={{ fontSize: '17px', marginBottom: '5px' }}>
                ❤️ HP: <strong>{hoveredTile.hp}/{hoveredTile.maxHp}</strong>
              </div>
            )}

            {/* Unit Information Section (if unit exists on hex) */}
            {hoveredUnit && (
              <div style={{
                marginTop: '15px',
                paddingTop: '12px',
                borderTop: '1px solid #ccc',
                background: '#e8f4f8',
                borderRadius: '6px',
                padding: '12px'
              }}>
                <h4 style={{
                  margin: '0 0 10px 0',
                  color: '#0066cc',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '5px',
                  fontSize: '17px',
                  fontWeight: 'bold'
                }}>
                  [HOVERED UNIT]
                </h4>
                
                {/* Unit Name */}
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: hoveredUnit.team === 'Blue' ? '#0066cc' : '#cc0000'
                }}>
                  {hoveredUnit.name || hoveredUnit.type} ({hoveredUnit.team})
                  {hoveredUnit.branch && hoveredUnit.category && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                      {hoveredUnit.branch} • {hoveredUnit.category}
                    </div>
                  )}
                </div>
                
                {/* Separator */}
                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ccc' }} />
                
                {/* Vital Information */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px' }}>✚ HP</span>
                    <ProgressBar current={hoveredUnit.hp} max={hoveredUnit.maxHp} color="#28a745" />
                    <span style={{ marginLeft: '6px', fontSize: '13px' }}>
                      {hoveredUnit.hp}/{hoveredUnit.maxHp}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px' }}>⛽ Fuel</span>
                    <ProgressBar current={hoveredUnit.fuel} max={hoveredUnit.maxFuel} color="#ffc107" />
                    <span style={{ marginLeft: '6px', fontSize: '13px' }}>
                      {hoveredUnit.fuel}/{hoveredUnit.maxFuel}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px' }}>⭐ XP</span>
                    <ProgressBar current={hoveredUnit.xp} max={100} color="#17a2b8" />
                    <span style={{ marginLeft: '6px', fontSize: '13px' }}>
                      {hoveredUnit.xp}/100
                    </span>
                  </div>
                </div>
                
                {/* Separator */}
                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ccc' }} />
                
                {/* Combat Stats */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '4px',
                  marginBottom: '8px',
                  fontSize: '13px'
                }}>
                  <div>💥 Attack: {hoveredUnit.attack}</div>
                  <div>🛡️ Defense: {hoveredUnit.defense}</div>
                  <div>🦾 Movement: {hoveredUnit.movement}</div>
                  <div>🎯 Range: {hoveredUnit.attackRange.min}-{hoveredUnit.attackRange.max}</div>
                </div>
                
                {/* Separator */}
                <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #ccc' }} />
                
                {/* Position and Status */}
                <div style={{ fontSize: '13px' }}>
                  <div style={{ marginBottom: '3px' }}>
                    📍 Position: ({hoveredUnit.x}, {hoveredUnit.y})
                  </div>
                  <div>
                    ⚙️ Status: {
                      hoveredUnit.moved && hoveredUnit.attacked ? 'Done' :
                      hoveredUnit.moved ? 'Moved' :
                      hoveredUnit.attacked ? 'Attacked' : 'Ready'
                    }
                  </div>
                </div>
                
                {/* Weapon Information for Hovered Unit */}
                <WeaponInfoPanel unit={hoveredUnit} />
              </div>
            )}
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