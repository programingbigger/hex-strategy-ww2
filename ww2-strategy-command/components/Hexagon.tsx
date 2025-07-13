
import React from 'react';
import { Terrain } from '../types';

interface HexagonProps {
  terrain: Terrain;
  isHighlighted: boolean;
  isReachable: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const HEX_SIZE = 60; // Size of the hexagon
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;

const terrainColors: Record<Terrain, string> = {
  [Terrain.Plains]: 'fill-green-700 hover:fill-green-600',
  [Terrain.Forest]: 'fill-green-900 hover:fill-green-800',
  [Terrain.Mountain]: 'fill-gray-600 hover:fill-gray-500',
  [Terrain.Water]: 'fill-blue-700',
};

const Hexagon: React.FC<HexagonProps> = ({ terrain, isHighlighted, isReachable, onClick, children }) => {
  const points = [
    [HEX_SIZE * Math.sqrt(3) / 2, HEX_SIZE / 2],
    [HEX_SIZE * Math.sqrt(3), HEX_SIZE],
    [HEX_SIZE * Math.sqrt(3) / 2, HEX_SIZE * 3 / 2],
    [0, HEX_SIZE],
    [0, 0], // not used, just to close path, but svg path d attribute does it
  ].map(p => `${p[0]},${p[1]}`).join(' ');

  const hexPoints = `M${HEX_SIZE * Math.sqrt(3) / 2},0 L${HEX_SIZE * Math.sqrt(3)},${HEX_SIZE / 2} L${HEX_SIZE * Math.sqrt(3)},${HEX_SIZE * 1.5} L${HEX_SIZE * Math.sqrt(3) / 2},${HEX_SIZE * 2} L0,${HEX_SIZE * 1.5} L0,${HEX_SIZE / 2} Z`;

  const terrainClass = terrainColors[terrain];
  let overlayClass = '';
  if (isHighlighted) {
    overlayClass = 'fill-yellow-400 opacity-50';
  } else if (isReachable) {
    overlayClass = 'fill-blue-400 opacity-40';
  }
  
  const strokeClass = isHighlighted ? 'stroke-yellow-300' : 'stroke-green-900/50';

  return (
    <div 
      className="relative cursor-pointer" 
      style={{ width: `${HEX_WIDTH}px`, height: `${HEX_HEIGHT}px` }}
      onClick={onClick}
    >
      <svg viewBox={`0 0 ${HEX_WIDTH} ${HEX_HEIGHT}`} className="absolute inset-0 w-full h-full">
        <path d={hexPoints} className={`${terrainClass} transition-colors duration-200`} strokeWidth="2" stroke={strokeClass} />
        { (isHighlighted || isReachable) && <path d={hexPoints} className={overlayClass} /> }
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default Hexagon;
