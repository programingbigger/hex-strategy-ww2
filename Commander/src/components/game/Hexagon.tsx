import React from 'react';
import { Tile, Unit, Coordinate } from '../../types';
import { axialToPixel } from '../../utils/map';

interface HexagonProps {
  tile: Tile;
  unit?: Unit;
  size: number;
  isSelected?: boolean;
  isReachable?: boolean;
  isAttackable?: boolean;
  isEngineerTarget?: boolean;
  onClick: (coord: Coordinate) => void;
  onMouseEnter: (coord: Coordinate) => void;
  onMouseLeave: () => void;
}

const Hexagon: React.FC<HexagonProps> = ({
  tile,
  unit,
  size,
  isSelected = false,
  isReachable = false,
  isAttackable = false,
  isEngineerTarget = false,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const { x: pixelX, y: pixelY } = axialToPixel(tile, size);
  
  const getTerrainColor = (terrain: string) => {
    switch (terrain) {
      case 'Plains': return '#90EE90';
      case 'Forest': return '#228B22';
      case 'Mountain': return '#8B4513';
      case 'River': return '#4169E1';
      case 'Road': return '#808080'; // 道路は灰色
      case 'Bridge': return '#808080'; // 橋は灰色
      case 'City': return tile.owner === 'Blue' ? '#ADD8E6' : tile.owner === 'Red' ? '#FFB6C1' : '#E6E6E6'; // 都市：青軍=水色、赤軍=薄ピンク、中立=薄灰色
      case 'Capital': return tile.owner === 'Blue' ? '#87CEEB' : tile.owner === 'Red' ? '#F08080' : '#D3D3D3'; // 首都：青軍=空色、赤軍=薄赤、中立=灰色
      case 'Airport': return tile.owner === 'Blue' ? '#B0E0E6' : tile.owner === 'Red' ? '#FFA07A' : '#F0F0F0'; // 空港：青軍=薄青、赤軍=サーモン、中立=薄灰色
      case 'Port': return tile.owner === 'Blue' ? '#AFEEEE' : tile.owner === 'Red' ? '#FF6347' : '#DCDCDC'; // 港：青軍=薄水色、赤軍=トマト色、中立=薄灰色
      case 'Mud': return '#8B4513';
      case 'Bocage': return '#32CD32'; // ボカージュは森林より薄い色
      case 'Snow': return '#F0F8FF';
      case 'Desert': return '#F4A460';
      case 'Sea': return '#006994';
      case 'Reef': return '#4682B4';
      case 'Fortress': return '#696969';
      default: return '#FFFFFF';
    }
  };
  
  const getUnitColor = (team?: string) => {
    switch (team) {
      case 'Blue': return '#0066CC';
      case 'Red': return '#CC0000';
      default: return '#666666';
    }
  };

  // 兵科式マッピング: 地形シンボルを描画
  const renderTerrainSymbol = (terrain: string, size: number) => {
    const symbolSize = size * 0.3;
    const strokeWidth = 2;
    const symbolColor = '#000000'; // 黒色で見分けやすく
    
    switch (terrain) {
      case 'City':
        // 都市: 四角形
        return (
          <rect
            x={-symbolSize * 0.3}
            y={-symbolSize * 0.3}
            width={symbolSize * 0.6}
            height={symbolSize * 0.6}
            stroke={symbolColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        );
      case 'Capital':
        // 首都: 星形（簡略化して菱形）
        return (
          <g>
            <polygon
              points={`0,${-symbolSize * 0.4} ${symbolSize * 0.3},0 0,${symbolSize * 0.4} ${-symbolSize * 0.3},0`}
              stroke={symbolColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </g>
        );
      case 'Airport':
        // 空港: 十字
        return (
          <g>
            <line
              x1={0}
              y1={-symbolSize * 0.4}
              x2={0}
              y2={symbolSize * 0.4}
              stroke={symbolColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <line
              x1={-symbolSize * 0.4}
              y1={0}
              x2={symbolSize * 0.4}
              y2={0}
              stroke={symbolColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </g>
        );
      case 'Port':
        // 港: 円形（船舶の港を表現）
        return (
          <circle
            cx={0}
            cy={0}
            r={symbolSize * 0.3}
            stroke={symbolColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        );
      default:
        return null;
    }
  };
  
  const renderUnitSymbol = (unit: Unit, size: number) => {
    const symbolSize = size * 0.5;
    const strokeWidth = 2;
    const symbolColor = '#FFF';
    
    switch (unit.type) {
      case 'Infantry':
        return (
          <g>
            <line
              x1={-symbolSize * 0.4}
              y1={-symbolSize * 0.4}
              x2={symbolSize * 0.4}
              y2={symbolSize * 0.4}
              stroke={symbolColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <line
              x1={symbolSize * 0.4}
              y1={-symbolSize * 0.4}
              x2={-symbolSize * 0.4}
              y2={symbolSize * 0.4}
              stroke={symbolColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </g>
        );
      case 'Tank':
        return (
          <ellipse
            cx={0}
            cy={0}
            rx={symbolSize * 0.6}
            ry={symbolSize * 0.4}
            stroke={symbolColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        );
      case 'ArmoredCar':
        return (
          <line
            x1={-symbolSize * 0.4}
            y1={symbolSize * 0.4}
            x2={symbolSize * 0.4}
            y2={-symbolSize * 0.4}
            stroke={symbolColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        );
      case 'AntiTank':
        return (
          <g>
            <rect
              x={-symbolSize * 0.3}
              y={-symbolSize * 0.3}
              width={symbolSize * 0.6}
              height={symbolSize * 0.6}
              fill={symbolColor}
            />
            <line
              x1={-symbolSize * 0.4}
              y1={0}
              x2={symbolSize * 0.4}
              y2={0}
              stroke={symbolColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      case 'Artillery':
        return (
          <circle
            cx={0}
            cy={0}
            r={symbolSize * 0.3}
            stroke={symbolColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        );
      case 'Engineer':
        // Engineering symbol: Square with crossed diagonal lines (wrench/gear-like)
        return (
          <g>
            <rect
              x={-symbolSize * 0.3}
              y={-symbolSize * 0.3}
              width={symbolSize * 0.6}
              height={symbolSize * 0.6}
              stroke={symbolColor}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <line
              x1={-symbolSize * 0.2}
              y1={-symbolSize * 0.2}
              x2={symbolSize * 0.2}
              y2={symbolSize * 0.2}
              stroke={symbolColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <line
              x1={symbolSize * 0.2}
              y1={-symbolSize * 0.2}
              x2={-symbolSize * 0.2}
              y2={symbolSize * 0.2}
              stroke={symbolColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </g>
        );
      default:
        return (
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fontSize="12"
            fill={symbolColor}
            dominantBaseline="middle"
          >
            ?
          </text>
        );
    }
  };
  
  const hexPoints = [
    [0, -size],
    [size * Math.sqrt(3) / 2, -size / 2],
    [size * Math.sqrt(3) / 2, size / 2],
    [0, size],
    [-size * Math.sqrt(3) / 2, size / 2],
    [-size * Math.sqrt(3) / 2, -size / 2]
  ].map(([x, y]) => `${x},${y}`).join(' ');
  
  let strokeColor = '#000';
  let strokeWidth = 1;
  
  if (isSelected) {
    strokeColor = '#FFD700';
    strokeWidth = 3;
  } else if (isEngineerTarget) {
    strokeColor = '#FF8C00'; // Orange for engineer targets
    strokeWidth = 3;
  } else if (isReachable) {
    strokeColor = '#00FF00';
    strokeWidth = 2;
  } else if (isAttackable) {
    strokeColor = '#FF0000';
    strokeWidth = 2;
  }
  
  return (
    <g
      transform={`translate(${pixelX}, ${pixelY})`}
      onClick={() => onClick(tile)}
      onMouseEnter={() => onMouseEnter(tile)}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      <polygon
        points={hexPoints}
        fill={getTerrainColor(tile.terrain)}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        opacity={0.8}
      />
      
      {/* 兵科式マッピング: 地形シンボル表示 */}
      {renderTerrainSymbol(tile.terrain, size)}

      {/* HP表示（都市、首都、空港、港） */}
      {(tile.terrain === 'City' || tile.terrain === 'Capital' || tile.terrain === 'Airport' || tile.terrain === 'Port') && tile.hp !== undefined && (
        <text
          x={0}
          y={-16}
          textAnchor="middle"
          fontSize="14"
          fill="#000"
        >
          {tile.hp}/{tile.maxHp}
        </text>
      )}
      
      {unit && (
        <>
          <rect
            x={-size * 0.6}
            y={-size * 0.4}
            width={size * 1.2}
            height={size * 0.8}
            rx={4}
            fill={getUnitColor(unit.team)}
            stroke="#FFF"
            strokeWidth={2}
          />
          {renderUnitSymbol(unit, size)}
          <text
            x={0}
            y={16}
            textAnchor="middle"
            fontSize="10"
            fill="#000"
          >
            {unit.hp}
          </text>
        </>
      )}
      
      {(isReachable || isAttackable) && (
        <circle
          cx={0}
          cy={0}
          r={size * 0.3}
          fill={isAttackable ? 'rgba(255,0,0,0.5)' : 'rgba(0,255,0,0.5)'}
        />
      )}
    </g>
  );
};

export default Hexagon;