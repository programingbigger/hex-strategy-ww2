import React from 'react';
import { BoardLayout, Unit, Coordinate } from '../../types';
import { coordToString } from '../../utils/map';
import Hexagon from './Hexagon';
import { HEX_SIZE } from '../../config/constants';
import { useCamera } from '../../hooks/useCamera';

interface GameBoardProps {
  boardLayout: BoardLayout;
  units: Unit[];
  selectedUnitId: string | null;
  reachableTiles: Coordinate[];
  attackableTiles: Coordinate[];
  onHexClick: (coord: Coordinate) => void;
  onHexHover: (coord: Coordinate) => void;
  onHexLeave: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  boardLayout,
  units,
  selectedUnitId,
  reachableTiles,
  attackableTiles,
  onHexClick,
  onHexHover,
  onHexLeave
}) => {
  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const { camera } = useCamera();
  
  const renderHexes = () => {
    const hexes: React.ReactElement[] = [];
    
    for (const [, tile] of Array.from(boardLayout.entries())) {
      const unit = units.find(u => u.x === tile.x && u.y === tile.y);
      const isSelected = selectedUnit && selectedUnit.x === tile.x && selectedUnit.y === tile.y;
      const isReachable = reachableTiles.some(coord => coord.x === tile.x && coord.y === tile.y);
      const isAttackable = attackableTiles.some(coord => coord.x === tile.x && coord.y === tile.y);
      
      hexes.push(
        <Hexagon
          key={coordToString(tile)}
          tile={tile}
          unit={unit}
          size={HEX_SIZE}
          isSelected={isSelected}
          isReachable={isReachable}
          isAttackable={isAttackable}
          onClick={onHexClick}
          onMouseEnter={onHexHover}
          onMouseLeave={onHexLeave}
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
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '14px',
          zIndex: 1000
        }}
      >
        <div>Camera Controls:</div>
        <div>Move: Arrow Keys or WASD</div>
        <div>Zoom: +/- keys</div>
        <div>Reset: R key</div>
        <div>Zoom: {camera.zoom.toFixed(1)}x</div>
      </div>
      <svg
        className="hex-grid"
        viewBox={`${viewportX} ${viewportY} ${viewportWidth} ${viewportHeight}`}
        style={{ 
          width: '100%', 
          height: '100%', 
          background: '#f0f8ff',
          cursor: 'move'
        }}
      >
        {renderHexes()}
      </svg>
    </div>
  );
};

export default GameBoard;