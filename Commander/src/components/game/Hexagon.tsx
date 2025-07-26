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
      case 'Road': return '#D2691E';
      case 'Bridge': return '#B8860B';
      case 'City': return tile.owner === 'Blue' ? '#87CEEB' : tile.owner === 'Red' ? '#FFB6C1' : '#C0C0C0';
      case 'Mud': return '#8B4513';
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
      
      {tile.terrain === 'City' && (
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