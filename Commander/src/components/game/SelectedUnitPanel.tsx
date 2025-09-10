import React from 'react';
import { Unit, Tile } from '../../types';
import { WeaponInfoPanel } from './WeaponInfoPanel';
import { getNeighbors } from '../../utils/map';
import { coordToString } from '../../utils/map';
import { armyManager } from '../../data/armyLoader';
import '../../styles/military-museum-theme.css';

interface SelectedUnitPanelProps {
  className?: string;
  selectedUnit: Unit | null;
  selectedUnitTile: Tile | null;
  onAction: (action: 'wait' | 'undo' | 'capture' | 'enhance_city' | 'build_bridge' | 'build_fortress' | 'destroy_fortress' | 'destroy_bridge' | 'load' | 'unload', materialAmount?: number) => void;
  boardLayout: Map<string, Tile>;
  units: Unit[];
  onStartTransportAction?: () => void;
}

const SelectedUnitPanel: React.FC<SelectedUnitPanelProps> = ({
  className,
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
    <div className={className}>
      {/* Header */}
      <div className="panel-header">
        <h3 className="panel-title">選択中ユニット</h3>
      </div>

      {/* SELECTED UNIT Section */}
      {selectedUnit ? (
        <div className="panel-content">
          {/* ユニット情報セクション */}
          <div className="panel-section">
            <h4 className="section-title">ユニット情報</h4>
            <div className="unit-name-plate">
              <span className={selectedUnit.team === 'Blue' ? 'team-blue' : 'team-red'}>
                {selectedUnit.name || selectedUnit.type} ({selectedUnit.team === 'Blue' ? '青軍' : '赤軍'})
              </span>
              <div className="unit-category">
                {selectedUnit.branch} • {selectedUnit.category}
              </div>
            </div>

            <div className="stats-container">
              <div className="stat-item">
                <span>✚ 耐久</span>
                <ProgressBar current={selectedUnit.hp} max={selectedUnit.maxHp} color="var(--earth-success)" />
                <span>{selectedUnit.hp}/{selectedUnit.maxHp}</span>
              </div>
              <div className="stat-item">
                <span>⛽ 燃料</span>
                <ProgressBar current={selectedUnit.fuel} max={selectedUnit.maxFuel} color="var(--earth-warning)" />
                <span>{selectedUnit.fuel}/{selectedUnit.maxFuel}</span>
              </div>
              <div className="stat-item">
                <span>⭐ 経験値</span>
                <ProgressBar current={selectedUnit.xp} max={100} color="var(--earth-khaki-light)" />
                <span>{selectedUnit.xp}/100</span>
              </div>
            </div>

            <div className="stats-grid">
              <div>💥 攻撃: {selectedUnit.attack}</div>
              <div>🛡️ 防御: {selectedUnit.defense}</div>
              <div>🦾 移動: {selectedUnit.movement}</div>
              <div>🎯 射程: {selectedUnit.attackRange.min}-{selectedUnit.attackRange.max}</div>
            </div>

            <div className="unit-status">
              <div>📍 座標: ({selectedUnit.x}, {selectedUnit.y})</div>
              <div>⚙️ 状態: {
                selectedUnit.moved && selectedUnit.attacked ? '行動終了' :
                selectedUnit.moved ? '移動済み' :
                selectedUnit.attacked ? '攻撃済み' : '待機中'
              }</div>
            </div>

            {selectedUnit.type === 'Transport' && (
              <div className="transport-info">
                <h5 className="section-subtitle">🚛 輸送情報</h5>
                {/* ... 輸送関連情報 ... */}
              </div>
            )}

            <WeaponInfoPanel unit={selectedUnit} />
          </div>

          {/* アクションセクション */}
          <div className="panel-section">
            <h4 className="section-title">アクション</h4>
            <div className="actions-grid">
              <button onClick={() => onAction('wait')} className="military-button">待機</button>
              <button onClick={() => onAction('undo')} disabled={!canUndo} className="military-button">待機解除</button>
              {canCapture && <button onClick={() => onAction('capture')} className="military-button">占領</button>}
              {canLoad && <button onClick={() => onAction('load')} className="military-button">📦 搭載</button>}
              {canUnload && <button onClick={() => onStartTransportAction ? onStartTransportAction() : onAction('unload')} className="military-button">📤 降車</button>}
              
              {isEngineer && (
                <>
                  <button onClick={() => onAction('enhance_city')} disabled={!canEnhanceCity} className="military-button">🏗️ 増築 (1資材)</button>
                  <button onClick={() => onAction('build_bridge')} disabled={!canBuildBridge} className="military-button">🌉 架橋 (2資材)</button>
                  <button onClick={() => onAction('build_fortress')} disabled={!canBuildFortress} className="military-button">🏰 要塞化 (1資材)</button>
                  <button onClick={() => onAction('destroy_fortress')} disabled={!canDestroyFortress} className="military-button">💥 要塞無力化 (2資材)</button>
                  <button onClick={() => onAction('destroy_bridge')} disabled={!canDestroyBridge} className="military-button">⛏️ 橋破壊 (2資材)</button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="panel-content">
          <div className="no-unit-selected">
            ユニット未選択
          </div>
        </div>
      )}

      {/* ショートカットセクション */}
      <div className="panel-section">
        <h4 className="section-title">⌨️ ショートカット</h4>
        <div className="shortcuts-list">
          <div className="shortcut-item">
            <span>ターン終了</span>
            <kbd>Cmd+E</kbd>
          </div>
          <div className="shortcut-item">
            <span>選択解除</span>
            <kbd>Esc</kbd>
          </div>
          <div className="shortcut-item">
            <span>選択ユニットへ移動</span>
            <kbd>Space</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedUnitPanel;