
import React from 'react';
import type { Coordinate, TerrainType, Team } from '../types';
import { axialToPixel } from '../utils/map';

interface HexagonProps {
  coord: Coordinate;
  size: number;
  terrain: TerrainType;
  owner?: Team | null;
  onClick: () => void;
  onMouseEnter: () => void;
  isReachable: boolean;
  isAttackable: boolean;
  isSelected: boolean;
}

const TERRAIN_COLORS: Record<TerrainType, string> = {
  Plains: '#86B049',
  Forest: '#1A5D1A',
  Mountain: '#A0522D', // Sienna
  River: '#4A90E2',
  Road: '#c0c0c0',     // Silver
  Bridge: '#808080',    // Gray
  City: '#FFFFFF',      // Light Gray
  Mud: '#A1662F',
};

const TEAM_COLORS: Record<Team, string> = {
    Blue: '#3333CC', // 3333CCに変更
    Red: '#D0021B',
};

export const Hexagon: React.FC<HexagonProps> = ({
  coord,
  size,
  terrain,
  owner,
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

  const fillColor = terrain === 'City' && owner ? TEAM_COLORS[owner] : TERRAIN_COLORS[terrain] || '#cccccc';

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
