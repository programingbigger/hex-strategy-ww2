import React from 'react';
import { Unit, Tile, Coordinate } from '../../types';
import { WeaponInfoPanel } from './WeaponInfoPanel';
import { TERRAIN_STATS } from '../../config/constants';
import '../../styles/military-museum-theme.css';

interface InformationPanelProps {
  className?: string;
  selectedUnit?: Unit;
  selectedUnitTile: Tile | null;
  hoveredHex?: Coordinate | null;
  boardLayout: Map<string, Tile>;
  units: Unit[];
  onAction: (action: 'wait' | 'undo' | 'capture') => void;
}

const InformationPanel: React.FC<InformationPanelProps> = ({
  className,
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

  const ProgressBar: React.FC<{ current: number; max: number; color: string }> = ({ current, max, color }) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));
    return (
      <div className="progress-bar">
        <div style={{ width: `${percentage}%`, backgroundColor: color }} className="progress-bar-inner" />
      </div>
    );
  };

  const getTerrainSwatchColor = (terrain: string): string => {
    const colorMap: { [key: string]: string } = {
      Plains: '#90EE90', Forest: '#228B22', Mountain: '#BDB76B', River: '#4682B4',
      Road: '#696969', Bridge: '#8FBC8F', City: '#FF6347', Mud: '#CD853F',
      Sea: '#000080', Capital: '#DC143C', Airport: '#DAA520', Bocage: '#556B2F',
      Snow: '#F0F8FF', Desert: '#F4A460', Reef: '#20B2AA', Fortress: '#A0A0A0', Port: '#1E90FF'
    };
    return colorMap[terrain] || '#808080';
  };

  const getTerrainBasicEffects = (terrain: string) => {
    const terrainStats = TERRAIN_STATS[terrain];
    if (!terrainStats) return [];
    const effects = [];
    if (terrainStats.defenseBonus !== 0) {
      effects.push(`防御 ${terrainStats.defenseBonus > 0 ? '+' : ''}${terrainStats.defenseBonus}`);
    }
    if (terrainStats.attackBonus !== 0) {
      effects.push(`攻撃 ${terrainStats.attackBonus > 0 ? '+' : ''}${terrainStats.attackBonus}`);
    }
    return effects;
  };

  const getMovementCosts = (terrain: string) => {
    const terrainStats = TERRAIN_STATS[terrain];
    if (!terrainStats) return [];
    const costs = [];
    const movementCost = terrainStats.movementCost;
    const unitTypes = Object.keys(movementCost).filter(key => key !== 'default');
    for (const unitType of unitTypes) {
      const cost = movementCost[unitType];
      costs.push({ unitType, cost: cost === Infinity ? '通行不可' : cost.toString() });
    }
    if (costs.length === 0) {
      const defaultCost = movementCost.default;
      costs.push({ unitType: 'Default', cost: defaultCost === Infinity ? '通行不可' : defaultCost.toString() });
    }
    return costs;
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="panel-header">
        <h3 className="panel-title">地形情報</h3>
      </div>

      {/* HOVERED HEX Section */}
      {hoveredTile ? (
        <div className="panel-content">
          <div className="panel-section">
            <h4 className="section-title">🌍 カーソル位置</h4>
            <div className="terrain-info">
              <div className="terrain-swatch" style={{ backgroundColor: getTerrainSwatchColor(hoveredTile.terrain) }} />
              <span className="terrain-name">{hoveredTile.terrain}</span>
            </div>
            <div className="unit-status">
              <div>📍 座標: ({hoveredHex?.x}, {hoveredHex?.y})</div>
              {hoveredTile.owner && <div>👑 所有: <strong>{hoveredTile.owner}</strong></div>}
              {hoveredTile.hp !== undefined && <div>❤️ 耐久: <strong>{hoveredTile.hp}/{hoveredTile.maxHp}</strong></div>}
            </div>

            <div className="stat-list">
              <h5 className="section-subtitle">基本効果</h5>
              {getTerrainBasicEffects(hoveredTile.terrain).map((effect, index) => (
                <div key={index} className="stat-list-item">• {effect}</div>
              ))}
            </div>

            <div className="stat-list">
              <h5 className="section-subtitle">🚶 移動コスト</h5>
              {getMovementCosts(hoveredTile.terrain).map((costInfo, index) => (
                <div key={index} className="stat-list-item spread">
                  <span>{costInfo.unitType}:</span>
                  <span className={costInfo.cost === 'Impassable' ? 'cost-impassable' : ''}>{costInfo.cost}</span>
                </div>
              ))}
            </div>
          </div>

          {hoveredUnit && (
            <div className="panel-section">
              <h4 className="section-title">ユニット情報</h4>
              {/* ... (SelectedUnitPanelと同様のスタイルを適用) ... */}
            </div>
          )}
        </div>
      ) : (
        <div className="panel-content">
          <div className="no-unit-selected">
            ヘクスにカーソルを合わせると詳細が表示されます
          </div>
        </div>
      )}
    </div>
  );
};
export default InformationPanel;
