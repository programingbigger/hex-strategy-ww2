import { BoardLayout, Team, Coordinate, Tile } from '../types';
import { coordToString, getDistance } from './map';

/**
 * Get all Capital tiles from the board layout
 */
export const getCapitals = (board: BoardLayout): Tile[] => {
  return Array.from(board.values()).filter(tile => tile.terrain === 'Capital');
};

/**
 * Get all Capital tiles owned by a specific team
 */
export const getCapitalsForTeam = (board: BoardLayout, team: Team): Tile[] => {
  return getCapitals(board).filter(capital => capital.owner === team);
};

/**
 * Get the active production capital for a team based on production order
 * Returns the capital with the lowest order value that is owned by the team
 */
export const getActiveProductionCapital = (board: BoardLayout, team: Team): Tile | null => {
  const teamCapitals = getCapitalsForTeam(board, team);
  
  if (teamCapitals.length === 0) {
    return null;
  }
  
  // Find capitals with order property and sort by order
  const capitalsWithOrder = teamCapitals
    .filter(capital => typeof capital.order === 'number')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  if (capitalsWithOrder.length > 0) {
    return capitalsWithOrder[0];
  }
  
  // Fallback: return first capital if no order is defined
  return teamCapitals[0];
};

/**
 * Get the coordinate of the active production capital for a team
 */
export const getActiveProductionCapitalCoord = (board: BoardLayout, team: Team): Coordinate | null => {
  const activeCapital = getActiveProductionCapital(board, team);
  if (!activeCapital) {
    return null;
  }
  
  // Find the coordinate of this capital tile
  for (const [coordString, tile] of board.entries()) {
    if (tile === activeCapital) {
      const [x, y] = coordString.split(',').map(Number);
      return { x, y };
    }
  }
  
  return null;
};

/**
 * Check if a capital can produce units based on the production order system
 * A capital can produce units if:
 * 1. It's the active production capital (lowest order), OR
 * 2. It's within 5 tiles of the active production capital
 */
export const canCapitalProduceUnits = (
  board: BoardLayout, 
  capitalCoord: Coordinate, 
  team: Team
): boolean => {
  const capitalTile = board.get(coordToString(capitalCoord));
  
  // Must be a capital owned by the team
  if (!capitalTile || capitalTile.terrain !== 'Capital' || capitalTile.owner !== team) {
    return false;
  }
  
  const activeProductionCapitalCoord = getActiveProductionCapitalCoord(board, team);
  
  // If no active production capital exists, no production is possible
  if (!activeProductionCapitalCoord) {
    return false;
  }
  
  // Check if this is the active production capital
  if (capitalCoord.x === activeProductionCapitalCoord.x && 
      capitalCoord.y === activeProductionCapitalCoord.y) {
    return true;
  }
  
  // Check if within 5 tiles of the active production capital
  const distance = getDistance(capitalCoord, activeProductionCapitalCoord);
  return distance <= 5;
};

/**
 * Get all capitals that can currently produce units for a team
 */
export const getProductionCapitals = (board: BoardLayout, team: Team): Coordinate[] => {
  const productionCapitals: Coordinate[] = [];
  
  for (const [coordString, tile] of board.entries()) {
    if (tile.terrain === 'Capital' && tile.owner === team) {
      const [x, y] = coordString.split(',').map(Number);
      const coord = { x, y };
      
      if (canCapitalProduceUnits(board, coord, team)) {
        productionCapitals.push(coord);
      }
    }
  }
  
  return productionCapitals;
};

/**
 * Check if a coordinate represents a valid production location
 * This includes both Capitals that can produce and Cities within range of production capitals
 */
export const canProduceUnitsAtLocation = (
  board: BoardLayout,
  coord: Coordinate,
  team: Team
): boolean => {
  const tile = board.get(coordToString(coord));
  
  if (!tile || tile.owner !== team) {
    return false;
  }
  
  // If it's a Capital, check if it can produce based on order system
  if (tile.terrain === 'Capital') {
    return canCapitalProduceUnits(board, coord, team);
  }
  
  // If it's a City, check if it's within 5 tiles of any production capital
  if (tile.terrain === 'City') {
    const productionCapitals = getProductionCapitals(board, team);
    
    for (const productionCapital of productionCapitals) {
      const distance = getDistance(coord, productionCapital);
      if (distance <= 5) {
        return true;
      }
    }
  }
  
  return false;
};