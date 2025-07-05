import React, { useRef, useEffect, useState } from 'react';
import { Hexagon } from './Hexagon';
import { UnitIcon } from './Icons';
import { axialToPixel, coordToString } from '../utils/map';
import { HEX_SIZE, TEAM_COLORS } from '../constants';
import type { BoardLayout, Unit, Coordinate, Team, WeatherType } from '../types';

interface GameBoardProps {
  boardLayout: BoardLayout;
  units: Unit[];
  onHexClick: (coord: Coordinate) => void;
  onHexHover: (coord: Coordinate | null) => void;
  selectedUnit: Unit | null;
  reachableTiles: Coordinate[];
  attackableTiles: Coordinate[];
  activeTeam: Team;
  weather: WeatherType;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  boardLayout,
  units,
  onHexClick,
  onHexHover,
  selectedUnit,
  reachableTiles,
  attackableTiles,
  weather,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1, height: 1 });
  
  const unitMap = new Map<string, Unit>(units.map(u => [coordToString(u), u]));
  const reachableMap = new Map<string, boolean>(reachableTiles.map(c => [coordToString(c), true]));
  const attackableMap = new Map<string, boolean>(attackableTiles.map(c => [coordToString(c), true]));

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleResize = () => {
      const { width, height } = el.getBoundingClientRect();
      setViewBox(prev => {
        // On first run (placeholder width), center the view on origin (0,0)
        if (prev.width === 1) {
            return { x: -width / 2, y: -height / 2, width, height };
        }
        // On subsequent resizes, keep the view centered
        const oldCenterX = prev.x + prev.width / 2;
        const oldCenterY = prev.y + prev.height / 2;
        return {
          width,
          height,
          x: oldCenterX - width / 2,
          y: oldCenterY - height / 2,
        };
      });
    };
    
    handleResize(); // Initial setup
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      setViewBox(prev => {
          const speed = 25;
          switch (e.key) {
              case 'ArrowUp': return { ...prev, y: prev.y - speed };
              case 'ArrowDown': return { ...prev, y: prev.y + speed };
              case 'ArrowLeft': return { ...prev, x: prev.x - speed };
              case 'ArrowRight': return { ...prev, x: prev.x + speed };
              default: return prev;
          }
      });
    };
    
    el.setAttribute('tabindex', '-1');
    el.focus();
    el.addEventListener('keydown', handleKeyDown);

    return () => {
      el.removeEventListener('keydown', handleKeyDown);
    };

  }, []);

  const boardTiles = Array.from(boardLayout.values());

  return (
    <div ref={containerRef} className="w-full h-full bg-gray-800 cursor-pointer focus:outline-none" onMouseLeave={() => onHexHover(null)}>
      <svg
        className="w-full h-full"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      >
        <defs>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feFlood floodColor="#60a5fa" result="flood" />
            <feComposite in="flood" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
           <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feFlood floodColor="#f87171" result="flood" />
            <feComposite in="flood" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g>
          {boardTiles.map(tile => {
            const key = coordToString(tile);
            const isReachable = reachableMap.has(key);
            const isAttackable = attackableMap.has(key);
            const isSelected = selectedUnit ? selectedUnit.x === tile.x && selectedUnit.y === tile.y : false;
            
            return (
              <Hexagon
                key={key}
                coord={tile}
                size={HEX_SIZE}
                terrain={tile.terrain}
                onClick={() => onHexClick(tile)}
                onMouseEnter={() => onHexHover(tile)}
                isReachable={isReachable}
                isAttackable={isAttackable}
                isSelected={isSelected}
              />
            );
          })}
          {units.map(unit => {
            const pixelPos = axialToPixel(unit, HEX_SIZE);
            const isSelected = unit.id === selectedUnit?.id;
            const hasActed = unit.moved && unit.attacked;

            const iconWidth = HEX_SIZE * 1.0;
            const iconHeight = iconWidth * (2/3);
            const hpBarHeight = 7;
            const hpBarWidth = iconWidth;
            
            const hpPercentage = unit.hp / unit.maxHp;
            const hpBarColor = hpPercentage > 0.5 ? '#4ade80' : hpPercentage > 0.2 ? '#facc15' : '#f87171';
            const teamColors = TEAM_COLORS[unit.team];

            return (
              <g
                key={unit.id}
                transform={`translate(${pixelPos.x}, ${pixelPos.y})`}
                onClick={() => onHexClick(unit)}
                onMouseEnter={() => onHexHover(unit)}
                style={{ 
                  pointerEvents: 'none',
                  filter: hasActed ? 'saturate(0.3) brightness(0.6)' : 'none',
                  transition: 'filter 0.3s ease-in-out',
                }}
                filter={isSelected ? teamColors.glow : ''}
              >
                <g transform={`translate(-${iconWidth / 2}, -${iconHeight / 2 + hpBarHeight / 2})`}>
                    <UnitIcon 
                        type={unit.type} 
                        team={unit.team} 
                        width={iconWidth} 
                        height={iconHeight} 
                    />
                    
                    {/* HP Bar */}
                    <g transform={`translate(0, ${iconHeight + 2})`}>
                        <rect 
                            x="0"
                            y="0"
                            width={hpBarWidth} 
                            height={hpBarHeight} 
                            fill="#333"
                            stroke="#111"
                            strokeWidth="1"
                            rx="2"
                        />
                        <rect
                            x="0"
                            y="0"
                            width={hpBarWidth * hpPercentage}
                            height={hpBarHeight}
                            fill={hpBarColor}
                            rx="2"
                            style={{ transition: 'width 0.3s ease' }}
                        />
                    </g>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
      {['Rain', 'HeavyRain', 'Storm'].includes(weather) && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-900 opacity-20"></div>
          {/* A simple rain effect using CSS */}
          <style>{`
            .rain-drop {
              position: absolute;
              bottom: 100%;
              width: 2px;
              height: 80px;
              background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.4));
              animation: fall 0.5s linear infinite;
            }
            @keyframes fall {
              to {
                transform: translateY(100vh);
              }
            }
          `}</style>
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="rain-drop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
