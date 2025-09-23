import React from 'react';
import { BoardLayout, Unit, Coordinate } from '../../types';
import { coordToString } from '../../utils/map';
import Hexagon from './Hexagon';
import { HEX_SIZE } from '../../config/constants';
import { useCamera } from '../../contexts/CameraContext';

interface GameBoardProps {
  boardLayout: BoardLayout;
  units: Unit[];
  selectedUnitId: string | null;
  reachableTiles: Coordinate[];
  attackableTiles: Coordinate[];
  engineerTargetTiles: Coordinate[];
  transportTargetTiles: Coordinate[];
  onHexClick: (coord: Coordinate) => void;
  onHexHover: (coord: Coordinate) => void;
  onHexLeave: () => void;
  onUnitDoubleClick?: (unit: Unit) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  boardLayout,
  units,
  selectedUnitId,
  reachableTiles,
  attackableTiles,
  engineerTargetTiles,
  transportTargetTiles,
  onHexClick,
  onHexHover,
  onHexLeave,
  onUnitDoubleClick
}) => {
  const selectedUnit = units.find(u => u.id === selectedUnitId && !u.loaded) || null;
  const { camera } = useCamera();
  
  const renderHexes = () => {
    const hexes: React.ReactElement[] = [];

    // If boardLayout is empty, show loading indicator
    if (boardLayout.size === 0) {
      return [(
        <text
          key="loading"
          x={camera.x}
          y={camera.y}
          textAnchor="middle"
          fill="white"
          fontSize="24"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          マップを読み込み中...
        </text>
      )];
    }

    for (const [, tile] of Array.from(boardLayout.entries())) {
      const unit = units.find(u => u.x === tile.x && u.y === tile.y && !u.loaded);
      const isSelected = !!(selectedUnit && selectedUnit.x === tile.x && selectedUnit.y === tile.y);
      const isReachable = reachableTiles.some(coord => coord.x === tile.x && coord.y === tile.y);
      const isAttackable = attackableTiles.some(coord => coord.x === tile.x && coord.y === tile.y);
      const isEngineerTarget = engineerTargetTiles.some(coord => coord.x === tile.x && coord.y === tile.y);
      const isTransportTarget = transportTargetTiles.some(coord => coord.x === tile.x && coord.y === tile.y);
      
      hexes.push(
        <Hexagon
          key={coordToString(tile)}
          tile={tile}
          unit={unit}
          size={HEX_SIZE}
          isSelected={isSelected}
          isReachable={isReachable}
          isAttackable={isAttackable}
          isEngineerTarget={isEngineerTarget}
          isTransportTarget={isTransportTarget}
          onClick={onHexClick}
          onMouseEnter={onHexHover}
          onMouseLeave={onHexLeave}
          onUnitDoubleClick={onUnitDoubleClick}
        />
      );
    }
    
    return hexes;
  };
  
  // Calculate viewport based on camera position and zoom
  const viewportWidth = 2000 / camera.zoom;
  const viewportHeight = 1200 / camera.zoom;
  const viewportX = camera.x - viewportWidth / 2;
  const viewportY = camera.y - viewportHeight / 2;

  return (
    <div className="game-board" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        className="hex-grid"
        viewBox={`${viewportX} ${viewportY} ${viewportWidth} ${viewportHeight}`}
        style={{ 
          width: '100%', 
          height: '100%', 
          background: 'transparent',
          cursor: 'move'
        }}
      >
        {renderHexes()}
      </svg>
    </div>
  );
};

export default GameBoard;