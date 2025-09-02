import React from 'react';
import { Unit, Tile } from '../../types';
import { WeaponInfoPanel } from './WeaponInfoPanel';
import { getNeighbors } from '../../utils/map';
import { coordToString } from '../../utils/map';
import { armyManager } from '../../data/armyLoader';

interface SelectedUnitPanelProps {
  selectedUnit: Unit | null;
  selectedUnitTile: Tile | null;
  onAction: (action: 'wait' | 'undo' | 'capture' | 'enhance_city' | 'build_bridge' | 'build_fortress' | 'destroy_fortress' | 'destroy_bridge' | 'load' | 'unload', materialAmount?: number) => void;
  boardLayout: Map<string, Tile>;
  units: Unit[];
  onStartTransportAction?: () => void;
}

const SelectedUnitPanel: React.FC<SelectedUnitPanelProps> = ({
  selectedUnit,
  selectedUnitTile,
  onAction,
  boardLayout,
  units,
  onStartTransportAction
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
  // Engineer action conditions
  const isEngineer = selectedUnit?.type === 'Engineer';
  const materialWeapon = selectedUnit?.weapons?.find(w => w.type === '資材');
  const availableMaterials = materialWeapon?.ammunition || 0;
  
  const canEnhanceCity = isEngineer && selectedUnitTile && 
    (selectedUnitTile.terrain === 'City' || selectedUnitTile.terrain === 'Capital' || 
     selectedUnitTile.terrain === 'Airport' || selectedUnitTile.terrain === 'Port') &&
    selectedUnitTile.owner === selectedUnit?.team && availableMaterials > 0;
    
  // Helper function to check if there's a specific terrain within 1 hex
  const hasTerrainNearby = (terrainType: string): boolean => {
    if (!selectedUnit || !boardLayout) return false;
    
    // Check current tile first
    if (selectedUnitTile?.terrain === terrainType) return true;
    
    // Check neighboring tiles
    const neighbors = getNeighbors({ x: selectedUnit.x, y: selectedUnit.y });
    return neighbors.some(coord => {
      const tile = boardLayout.get(coordToString(coord));
      return tile?.terrain === terrainType;
    });
  };

  // Helper function to check for nearby transport units
  const hasTransportNearby = (): boolean => {
    if (!selectedUnit || !units) return false;
    
    // Check current position for transport unit
    const currentPositionTransport = units.find(unit => 
      unit.type === 'Transport' && 
      unit.team === selectedUnit.team &&
      unit.x === selectedUnit.x && 
      unit.y === selectedUnit.y &&
      unit.id !== selectedUnit.id
    );
    if (currentPositionTransport) return true;
    
    // Check neighboring positions for transport units
    const neighbors = getNeighbors({ x: selectedUnit.x, y: selectedUnit.y });
    return neighbors.some(coord => {
      return units.some(unit => 
        unit.type === 'Transport' && 
        unit.team === selectedUnit.team &&
        unit.x === coord.x && 
        unit.y === coord.y
      );
    });
  };

  const canBuildBridge = isEngineer && hasTerrainNearby('River') && availableMaterials >= 2;
    
  const canBuildFortress = isEngineer && selectedUnitTile && 
    selectedUnitTile.terrain === 'Plains' && availableMaterials >= 1;
  
  const canDestroyFortress = isEngineer && selectedUnitTile && 
    selectedUnitTile.terrain === 'Fortress' && availableMaterials >= 2;
    
  const canDestroyBridge = isEngineer && hasTerrainNearby('Bridge') && availableMaterials >= 2;

  // Helper function to get transport capacity info
  const getTransportCapacity = (): { capacity: number; unitCapacityCosts: Record<string, number> } | null => {
    if (!selectedUnit || selectedUnit.type !== 'Transport') return null;
    
    try {
      const templates = armyManager.getUnitTemplatesBy(selectedUnit.team as 'Blue' | 'Red', '陸');
      const template = templates.find(t => t.type === selectedUnit.type);
      
      if (template) {
        // Access the transport info from the JSON data directly
        const armyData = require('../../data/armyOrganization.json');
        const factionData = armyData.factions[selectedUnit.team];
        const supportCategory = factionData?.branches?.['陸']?.unitCategories?.support;
        const transportTemplate = supportCategory?.units?.find((u: any) => u.type === 'Transport');
        
        if (transportTemplate?.transport) {
          return {
            capacity: transportTemplate.transport.capacity,
            unitCapacityCosts: transportTemplate.transport.unitCapacityCosts
          };
        }
      }
    } catch (error) {
      console.warn('Failed to get transport capacity info:', error);
    }
    
    return { capacity: 2, unitCapacityCosts: { infantry: 1, antitank: 1, artillery: 2 } }; // fallback
  };

  // Helper function to get loaded units in transport
  const getLoadedUnits = (): Unit[] => {
    if (!selectedUnit || selectedUnit.type !== 'Transport' || !units) return [];
    
    return units.filter(unit => 
      unit.loaded && 
      unit.transportId === selectedUnit.id
    );
  };

  // Helper function to check for loaded units in transport
  const hasLoadedUnits = (): boolean => {
    return getLoadedUnits().length > 0;
  };

  // Helper function to calculate current capacity usage
  const getCurrentCapacityUsage = (): number => {
    const loadedUnits = getLoadedUnits();
    const transportCapacity = getTransportCapacity();
    
    if (!transportCapacity) return 0;
    
    return loadedUnits.reduce((total, unit) => {
      const costKey = unit.category || 'infantry'; // fallback to infantry
      const cost = transportCapacity.unitCapacityCosts[costKey] || 1;
      return total + cost;
    }, 0);
  };

  // Helper function to check if front position is available for unloading
  const canUnloadAtFront = (): boolean => {
    if (!selectedUnit || !boardLayout) return false;
    
    // Calculate front position (for now, we'll use position in front of transport - could be enhanced with direction)
    const frontPosition = { x: selectedUnit.x + 1, y: selectedUnit.y }; // Simple front calculation
    
    // Check if the front position is empty (no units and valid terrain)
    const frontTile = boardLayout.get(`${frontPosition.x},${frontPosition.y}`);
    if (!frontTile) return false; // Position doesn't exist on map
    
    // Check if no unit is at front position
    const unitAtFront = units.find(u => 
      u.x === frontPosition.x && 
      u.y === frontPosition.y && 
      !u.loaded
    );
    
    return !unitAtFront && frontTile.terrain !== 'Sea'; // Can't unload on sea
  };

  // Helper function to check if unit can be loaded into transport
  const canUnitBeLoaded = (): boolean => {
    if (!selectedUnit) return false;
    
    // Check if unit type can be loaded (Infantry, AntiTank, Artillery)
    const loadableUnitTypes = ['Infantry', 'AntiTank', 'Artillery'];
    return loadableUnitTypes.includes(selectedUnit.type);
  };

  // Transport loading conditions - for Infantry, AntiTank, and Artillery units
  const canLoad = canUnitBeLoaded() && hasTransportNearby();

  // Transport unloading conditions - only for Transport units with loaded units
  const isTransport = selectedUnit?.type === 'Transport';
  const canUnload = isTransport && hasLoadedUnits();
  const canEnhancedUnload = canUnload && onStartTransportAction; // Enhanced unload with position selection

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
            
            {/* Transport Capacity Information - Only for Transport units */}
            {selectedUnit.type === 'Transport' && (
              <>
                <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #ccc' }} />
                <div style={{ marginBottom: '10px' }}>
                  <h5 style={{
                    margin: '0 0 8px 0',
                    color: '#0066cc',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    🚛 Transport Capacity
                  </h5>
                  
                  {(() => {
                    const capacity = getTransportCapacity();
                    const currentUsage = getCurrentCapacityUsage();
                    const maxCapacity = capacity?.capacity || 2;
                    
                    return (
                      <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                        <span>Capacity: {currentUsage}/{maxCapacity}</span>
                        <ProgressBar 
                          current={currentUsage} 
                          max={maxCapacity} 
                          color={currentUsage >= maxCapacity ? '#dc3545' : '#28a745'} 
                        />
                      </div>
                    );
                  })()}
                  
                  {/* Loaded Units Display */}
                  {(() => {
                    const loadedUnits = getLoadedUnits();
                    
                    if (loadedUnits.length > 0) {
                      return (
                        <div style={{ marginTop: '8px' }}>
                          <h6 style={{
                            margin: '0 0 5px 0',
                            color: '#666',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            📦 Loaded Units:
                          </h6>
                          <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                            {loadedUnits.map((unit, index) => (
                              <div key={unit.id} style={{
                                padding: '4px 8px',
                                margin: '2px 0',
                                background: '#f0f8ff',
                                borderRadius: '4px',
                                border: '1px solid #e0e0e0'
                              }}>
                                <span style={{ fontWeight: 'bold', color: '#0066cc' }}>
                                  {unit.name || unit.type}
                                </span>
                                <span style={{ marginLeft: '8px', color: '#666' }}>
                                  HP: {unit.hp}/{unit.maxHp}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#999', 
                          fontStyle: 'italic',
                          marginTop: '8px'
                        }}>
                          No units loaded
                        </div>
                      );
                    }
                  })()}
                </div>
              </>
            )}

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

              {canLoad && (
                <button
                  onClick={() => onAction('load')}
                  style={{
                    padding: '10px 15px',
                    background: '#20c997',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    fontWeight: '500'
                  }}
                >
                  📦 搭載
                </button>
              )}

              {canUnload && (
                <button
                  onClick={() => {
                    if (canEnhancedUnload) {
                      // Use enhanced unload with position selection
                      onStartTransportAction!();
                    } else {
                      // Fallback to direct unload
                      onAction('unload');
                    }
                  }}
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
                  📤 降車
                </button>
              )}

              {/* Engineer Actions - Always shown for Engineers */}
              {isEngineer && (
                <>
                  {/* Enhance City Button */}
                  <button
                    onClick={() => onAction('enhance_city')}
                    disabled={!canEnhanceCity}
                    style={{
                      padding: '10px 15px',
                      background: canEnhanceCity ? '#28a745' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: canEnhanceCity ? 'pointer' : 'not-allowed',
                      fontSize: '18px',
                      fontWeight: '500',
                      opacity: canEnhanceCity ? 1 : 0.6
                    }}
                  >
                    🏗️ 増築 (1資材)
                  </button>

                  {/* Build Bridge Button */}
                  <button
                    onClick={() => onAction('build_bridge')}
                    disabled={!canBuildBridge}
                    style={{
                      padding: '10px 15px',
                      background: canBuildBridge ? '#17a2b8' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: canBuildBridge ? 'pointer' : 'not-allowed',
                      fontSize: '18px',
                      fontWeight: '500',
                      opacity: canBuildBridge ? 1 : 0.6
                    }}
                  >
                    🌉 架橋 (2資材)
                  </button>

                  {/* Build Fortress Button */}
                  <button
                    onClick={() => onAction('build_fortress')}
                    disabled={!canBuildFortress}
                    style={{
                      padding: '10px 15px',
                      background: canBuildFortress ? '#6f42c1' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: canBuildFortress ? 'pointer' : 'not-allowed',
                      fontSize: '18px',
                      fontWeight: '500',
                      opacity: canBuildFortress ? 1 : 0.6
                    }}
                  >
                    🏰 要塞化 (1資材)
                  </button>
                  {/* Destroy Fortress Button */}
                  <button
                    onClick={() => onAction('destroy_fortress')}
                    disabled={!canDestroyFortress}
                    style={{
                      padding: '10px 15px',
                      background: canDestroyFortress ? '#dc3545' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: canDestroyFortress ? 'pointer' : 'not-allowed',
                      fontSize: '18px',
                      fontWeight: '500',
                      opacity: canDestroyFortress ? 1 : 0.6
                    }}
                  >
                    💥 要塞無力化 (2資材)
                  </button>

                  {/* Destroy Bridge Button */}
                  <button
                    onClick={() => onAction('destroy_bridge')}
                    disabled={!canDestroyBridge}
                    style={{
                      padding: '10px 15px',
                      background: canDestroyBridge ? '#ffc107' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: canDestroyBridge ? 'pointer' : 'not-allowed',
                      fontSize: '18px',
                      fontWeight: '500',
                      opacity: canDestroyBridge ? 1 : 0.6
                    }}
                  >
                    ⛏️ 橋破壊 (2資材)
                  </button>
                </>
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