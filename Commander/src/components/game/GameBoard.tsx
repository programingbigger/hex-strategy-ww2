import React from 'react';
import { BoardLayout, Unit, Coordinate } from '../../types';
import { coordToString } from '../../utils/map';
import Hexagon from './Hexagon';
import { HEX_SIZE } from '../../config/constants';

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
  
  return (
    <div className="game-board">
      <svg
        className="hex-grid"
        viewBox="-400 -300 800 600"
        style={{ width: '100%', height: '100%', background: '#f0f8ff' }}
      >
        {renderHexes()}
      </svg>
    </div>
  );
};

export default GameBoard;