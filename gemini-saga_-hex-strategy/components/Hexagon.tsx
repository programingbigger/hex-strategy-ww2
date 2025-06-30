
import React from 'react';
import type { Coordinate, TerrainType } from '../types';
import { axialToPixel } from '../utils/map';

interface HexagonProps {
  coord: Coordinate;
  size: number;
  terrain: TerrainType;
  onClick: () => void;
  onMouseEnter: () => void;
  isReachable: boolean;
  isAttackable: boolean;
  isSelected: boolean;
}

const TERRAIN_COLORS: Record<TerrainType, string> = {
  Plains: '#86B049',
  Forest: '#1A5D1A',
  Mountain: '#6F6F6F',
  River: '#4A90E2',
  Road: '#A47449',
  Bridge: '#8B572A',
};

export const Hexagon: React.FC<HexagonProps> = ({
  coord,
  size,
  terrain,
  onClick,
  onMouseEnter,
  isReachable,
  isAttackable,
  isSelected,
}) => {
  const center = axialToPixel(coord, size);
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle_deg = 60 * i - 30;
    const angle_rad = Math.PI / 180 * angle_deg;
    const pointX = center.x + size * Math.cos(angle_rad);
    const pointY = center.y + size * Math.sin(angle_rad);
    return `${pointX},${pointY}`;
  }).join(' ');

  const fillColor = TERRAIN_COLORS[terrain] || '#cccccc';

  return (
    <g onClick={onClick} onMouseEnter={onMouseEnter} className="cursor-pointer">
      <polygon points={points} fill={fillColor} stroke="#2d3748" strokeWidth="2" />
      {isReachable && (
        <polygon points={points} className="fill-green-500 opacity-40 pointer-events-none" />
      )}
      {isAttackable && (
        <polygon points={points} className="fill-red-500 opacity-50 pointer-events-none" />
      )}
      {isSelected && (
          <polygon points={points} fill="none" stroke="yellow" strokeWidth="3" className="pointer-events-none" />
      )}
    </g>
  );
};
