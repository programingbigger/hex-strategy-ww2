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
          y={-10}
          textAnchor="middle"
          fontSize="10"
          fill="#000"
        >
          {tile.hp}/{tile.maxHp}
        </text>
      )}
      
      {unit && (
        <>
          <circle
            cx={0}
            cy={0}
            r={size * 0.6}
            fill={getUnitColor(unit.team)}
            stroke="#000"
            strokeWidth={1}
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fontSize="8"
            fill="#FFF"
            dominantBaseline="middle"
          >
            {unit.type.charAt(0)}
          </text>
          <text
            x={0}
            y={10}
            textAnchor="middle"
            fontSize="6"
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