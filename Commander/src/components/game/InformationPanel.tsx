import React, { useState } from 'react';
import { Unit, Tile, Coordinate } from '../../types';
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

  // Available terrain images in the assets folder
  const availableTerrainImages = [
    'Bocage', 'Forest', 'Fortress', 'Mountain', 'Mud', 'Plains', 'River', 'Road', 'Sea'
  ];

  const TerrainImage: React.FC<{ terrain: string }> = ({ terrain }) => {
    const [imageError, setImageError] = useState(false);
    const imagePath = `/assets/images/maps/${terrain}.png`;
    const hasImage = availableTerrainImages.includes(terrain);

    if (!hasImage || imageError) {
      return (
        <div style={{
          width: '100px',
          height: '100px',
          backgroundColor: 'rgba(128, 128, 128, 0.2)',
          border: '2px dashed #666',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          No Image
        </div>
      );
    }

    return (
      <img
        src={imagePath}
        alt={terrain}
        onError={() => setImageError(true)}
        style={{
          width: '200px',
          height: '200px',
          objectFit: 'cover',
          borderRadius: '8px',
          border: '2px solid #3498db',
          marginBottom: '10px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
        }}
      />
    );
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
            
            {/* Terrain Image Display */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '22px' }}>
              <TerrainImage terrain={hoveredTile.terrain} />
            </div>
            
            <div className="terrain-info">
              <div className="terrain-swatch" style={{ backgroundColor: getTerrainSwatchColor(hoveredTile.terrain) }} />
              <span className="terrain-name" style={{ fontSize: '18px', fontWeight: 'bold' }}>{hoveredTile.terrain}</span>
            </div>
            <div className="unit-status">
              <div style={{ fontSize: '22px' }}>📍 座標: ({hoveredHex?.x}, {hoveredHex?.y})</div>
              {hoveredTile.owner && <div style={{ fontSize: '22px' }}>👑 所有: <strong>{hoveredTile.owner}</strong></div>}
              {hoveredTile.hp !== undefined && <div style={{ fontSize: '22px' }}>❤️ 耐久: <strong>{hoveredTile.hp}/{hoveredTile.maxHp}</strong></div>}
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
