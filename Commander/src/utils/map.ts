import { Coordinate, BoardLayout, Unit, Team, MapData } from '../types';
import { TERRAIN_STATS } from '../config/constants';
import { createUnit } from '../data/units';

export const coordToString = (coord: Coordinate): string => `${coord.x},${coord.y}`;
export const stringToCoord = (key: string): Coordinate => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
};

export function axialToPixel(coord: Coordinate, size: number): { x: number; y: number } {
  const x = size * (Math.sqrt(3) * coord.x + Math.sqrt(3) / 2 * coord.y);
  const y = size * (3 / 2 * coord.y);
  return { x, y };
}

export function getNeighbors(coord: Coordinate): Coordinate[] {
  const { x, y } = coord;
  return [
    { x: x + 1, y: y },
    { x: x - 1, y: y },
    { x: x, y: y + 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y: y + 1 },
  ];
}

export function getDistance(a: Coordinate, b: Coordinate): number {
  return (Math.abs(a.x - b.x) + Math.abs(a.x + a.y - b.x - b.y) + Math.abs(a.y - b.y)) / 2;
}

export function loadMapFromJSON(mapData: MapData): { board: BoardLayout; units: Unit[] } {
  const board: BoardLayout = new Map();
  
  // Load tiles
  mapData.board.tiles.forEach(tile => {
    board.set(coordToString(tile), tile);
  });
  
  // Load units with HP corruption prevention
  const units: Unit[] = mapData.units.map(unitData => {
    // Use createUnit to get properly initialized unit with faction-specific weapons
    const baseUnit = createUnit(unitData.id, unitData.type, unitData.team, unitData.x, unitData.y);
    
    // Safely merge unit data while preserving ACTUAL unit state
    const loadedUnit = {
      ...baseUnit,
      ...unitData,
      // CRITICAL FIX: Preserve ACTUAL HP, fuel, and ammunition from unitData
      hp: unitData.hp !== undefined ? unitData.hp : baseUnit.hp,
      maxHp: baseUnit.maxHp, // Keep calculated maxHp from createUnit
      fuel: unitData.fuel !== undefined ? unitData.fuel : baseUnit.fuel,
      // Preserve weapons but keep actual ammunition state
      weapons: unitData.weapons || baseUnit.weapons
    };
    
    // HP validation - only fix truly invalid values
    if (loadedUnit.hp <= 0) {
      console.warn(`Invalid HP in loaded unit ${loadedUnit.id}: ${loadedUnit.hp}/${loadedUnit.maxHp}, correcting to 1`);
      loadedUnit.hp = 1; // Set to 1, not maxHp, to preserve damaged state
    } else if (loadedUnit.hp > loadedUnit.maxHp) {
      console.warn(`HP exceeds max in loaded unit ${loadedUnit.id}: ${loadedUnit.hp}/${loadedUnit.maxHp}, correcting to maxHp`);
      loadedUnit.hp = loadedUnit.maxHp;
    }
    
    // Debug log for HP corruption investigation
    if (unitData.hp && unitData.hp !== baseUnit.hp) {
      console.log(`🔧 HP Correction for ${unitData.type} (${unitData.id}):`, {
        jsonHp: unitData.hp,
        calculatedHp: baseUnit.hp,
        finalHp: loadedUnit.hp,
        maxHp: loadedUnit.maxHp,
        team: unitData.team
      });
    }
    
    return loadedUnit;
  });
  
  return { board, units };
}

export function calculateReachableTiles(
  start: Coordinate, 
  movement: number, 
  fuel: number, 
  board: BoardLayout, 
  units: Unit[], 
  currentTeam: Team
): Coordinate[] {
  const startNodeKey = coordToString(start);
  const costs: Map<string, number> = new Map([[startNodeKey, 0]]);
  const frontier: Array<{ key: string; cost: number }> = [{ key: startNodeKey, cost: 0 }];
  const reachable: Coordinate[] = [];
  
  const unitAtStart = units.find(u => u.x === start.x && u.y === start.y);
  if (!unitAtStart) return [];

  // Create unit position map for better performance
  const unitPositionMap = new Map<string, Unit>();
  units.forEach(unit => {
    unitPositionMap.set(coordToString({x: unit.x, y: unit.y}), unit);
  });

  const findUnitAtPosition = (coord: Coordinate): Unit | undefined => {
    const key = coordToString(coord);
    const unit = unitPositionMap.get(key);
    // Exclude the starting unit from blocking logic
    return unit && !(unit.x === start.x && unit.y === start.y) ? unit : undefined;
  };

  // Calculate ZOC for enemy units
  const zocTiles: Map<string, Team> = new Map();
  units.forEach(unit => {
    if (unit.team !== currentTeam && unit.type !== 'Artillery' && unit.type !== 'AntiTank') {
      const neighbors = getNeighbors({ x: unit.x, y: unit.y });
      neighbors.forEach(neighborCoord => {
        const neighborKey = coordToString(neighborCoord);
        if (board.has(neighborKey)) {
          zocTiles.set(neighborKey, unit.team);
        }
      });
    }
  });

  while (frontier.length > 0) {
    frontier.sort((a, b) => a.cost - b.cost);
    const currentNode = frontier.shift();
    if (!currentNode) break;

    const currentCoord = stringToCoord(currentNode.key);
    
    // Add to reachable if not starting position and no unit occupies the tile
    if (currentNode.key !== startNodeKey) {
      const unitOnDestination = findUnitAtPosition(currentCoord);
      if (!unitOnDestination) {
        reachable.push(currentCoord);
      }
    }
    
    const neighbors = getNeighbors(currentCoord);
    
    for (const neighborCoord of neighbors) {
      const neighborKey = coordToString(neighborCoord);
      const tile = board.get(neighborKey);
      if (!tile) continue;

      // Check for units on the tile - Allow movement through friendly units, block enemy units
      const unitOnTile = findUnitAtPosition(neighborCoord);
      if (unitOnTile && unitOnTile.team !== currentTeam) {
        // Block movement through enemy units
        continue;
      }
      // Allow movement through friendly units or empty tiles

      const terrainStats = TERRAIN_STATS[tile.terrain];
      let moveCost = terrainStats.movementCost[unitAtStart.type] ?? terrainStats.movementCost.default;

      // Special movement costs for Transport units
      if (unitAtStart.type === 'Transport') {
        switch (tile.terrain) {
          case 'Road':
          case 'Bridge':
            moveCost = 1;
            break;
          case 'Plains':
            moveCost = 2;
            break;
          case 'Forest':
          case 'Snow':
          case 'Desert':
            moveCost = 3;
            break;
          default:
            // Use default terrain movement cost for other terrains
            moveCost = terrainStats.movementCost.Vehicle ?? terrainStats.movementCost.default;
            break;
        }
      }

      // Check vehicle restrictions for terrain
      if (unitAtStart.unitClass === 'Vehicle') {
        if (tile.terrain === 'River' || tile.terrain === 'Sea' || tile.terrain === 'Mountain') {
          moveCost = Infinity;
        }
      }

      if (moveCost === Infinity) continue;

      // ZOC logic
      const isZocHex = zocTiles.has(neighborKey) && zocTiles.get(neighborKey) !== currentTeam;
      if (isZocHex) {
        moveCost += 2;
      }

      const newCost = currentNode.cost + moveCost;

      if (newCost <= movement && newCost <= fuel) {
        if (!costs.has(neighborKey) || newCost < costs.get(neighborKey)!) {
          costs.set(neighborKey, newCost);
          
          if (!isZocHex) {
            frontier.push({ key: neighborKey, cost: newCost });
          } else {
            // ZOC hexes can be reached but stop further movement
            // Only add if no unit occupies the destination
            const unitOnZocDestination = findUnitAtPosition(neighborCoord);
            if (!unitOnZocDestination) {
              reachable.push(neighborCoord);
            }
          }
        }
      }
    }
  }

  return reachable;
}

export function findPath(
  start: Coordinate, 
  goal: Coordinate, 
  board: BoardLayout, 
  units: Unit[], 
  currentTeam: Team
): Coordinate[] | null {
  const startNodeKey = coordToString(start);
  const goalNodeKey = coordToString(goal);

  const openSet: Set<string> = new Set([startNodeKey]);
  const cameFrom: Map<string, string> = new Map();

  const gScore: Map<string, number> = new Map();
  gScore.set(startNodeKey, 0);

  const fScore: Map<string, number> = new Map();
  fScore.set(startNodeKey, getDistance(start, goal));

  const unitAtStart = units.find(u => u.x === start.x && u.y === start.y);
  if (!unitAtStart) return null;

  while (openSet.size > 0) {
    let currentKey: string | null = null;
    let lowestFScore = Infinity;
    for (const key of Array.from(openSet)) {
      if ((fScore.get(key) ?? Infinity) < lowestFScore) {
        lowestFScore = fScore.get(key)!;
        currentKey = key;
      }
    }

    if (currentKey === null) break;

    if (currentKey === goalNodeKey) {
      const path: Coordinate[] = [];
      let tempKey = currentKey;
      while (tempKey) {
        path.unshift(stringToCoord(tempKey));
        tempKey = cameFrom.get(tempKey)!;
      }
      return path;
    }

    openSet.delete(currentKey);
    const currentCoord = stringToCoord(currentKey);

    for (const neighborCoord of getNeighbors(currentCoord)) {
      const neighborKey = coordToString(neighborCoord);
      const tile = board.get(neighborKey);
      if (!tile) continue;

      const unitOnTile = units.some(u => u.x === neighborCoord.x && u.y === neighborCoord.y && !(u.x === start.x && u.y === start.y));
      if (unitOnTile) continue;

      const terrainStats = TERRAIN_STATS[tile.terrain];
      let moveCost = terrainStats.movementCost[unitAtStart.type] ?? terrainStats.movementCost.default;
      
      // Special movement costs for Transport units
      if (unitAtStart.type === 'Transport') {
        switch (tile.terrain) {
          case 'Road':
          case 'Bridge':
            moveCost = 1;
            break;
          case 'Plains':
            moveCost = 2;
            break;
          case 'Forest':
          case 'Snow':
          case 'Desert':
            moveCost = 3;
            break;
          default:
            // Use default terrain movement cost for other terrains
            moveCost = terrainStats.movementCost.Vehicle ?? terrainStats.movementCost.default;
            break;
        }
      }
      
      if (moveCost === Infinity) continue;

      const tentativeGScore = (gScore.get(currentKey) ?? 0) + moveCost;

      if (tentativeGScore < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + getDistance(neighborCoord, goal));
        if (!openSet.has(neighborKey)) {
          openSet.add(neighborKey);
        }
      }
    }
  }

  return null;
}

/**
 * Find all capitals belonging to a specific team on the board
 * @param board The game board layout
 * @param team The team whose capitals to find
 * @returns Array of capital coordinates
 */
export function findCapitalsForTeam(board: BoardLayout, team: Team): Coordinate[] {
  const capitals: Coordinate[] = [];
  
  for (const [, tile] of board.entries()) {
    if (tile.terrain === 'Capital' && tile.owner === team) {
      capitals.push({ x: tile.x, y: tile.y });
    }
  }
  
  return capitals;
}

/**
 * Calculate deployable tiles within 5-hex radius from all team capitals
 * @param board The game board layout
 * @param team The team whose capitals to use as deployment centers
 * @param radius The deployment radius (default: 5)
 * @returns Array of deployable coordinates
 */
export function calculateDeployableTilesFromCapitals(
  board: BoardLayout, 
  team: Team, 
  radius: number = 5
): Coordinate[] {
  const capitals = findCapitalsForTeam(board, team);
  const deployableTiles: Set<string> = new Set();
  
  // If no capitals found, return empty array
  if (capitals.length === 0) {
    console.warn(`No capitals found for team ${team}`);
    return [];
  }
  
  // For each capital, calculate tiles within radius
  capitals.forEach(capital => {
    for (let q = -radius; q <= radius; q++) {
      for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
        const x = capital.x + q;
        const y = capital.y + r;
        const coordinate: Coordinate = { x, y };
        
        // Check if tile exists in board
        const tileKey = coordToString(coordinate);
        if (board.has(tileKey)) {
          deployableTiles.add(tileKey);
        }
      }
    }
  });
  
  // Convert set back to coordinate array
  return Array.from(deployableTiles).map(stringToCoord);
}

/**
 * Check if a coordinate is deployable for a specific team
 * @param board The game board layout
 * @param team The team to check deployment for
 * @param coord The coordinate to check
 * @param radius The deployment radius (default: 5)
 * @returns True if coordinate is deployable
 */
export function isCoordinateDeployable(
  board: BoardLayout, 
  team: Team, 
  coord: Coordinate, 
  radius: number = 5
): boolean {
  const capitals = findCapitalsForTeam(board, team);
  
  // Check if coord is within radius of any capital
  return capitals.some(capital => getDistance(capital, coord) <= radius);
}

/**
 * Count units within radius of a specific coordinate
 * @param coord The center coordinate
 * @param units Array of all units
 * @param radius The radius to check within
 * @param teamFilter Optional team filter (if provided, only count units from this team)
 * @returns Number of units within radius
 */
export function countUnitsWithinRadius(
  coord: Coordinate, 
  units: Unit[], 
  radius: number, 
  teamFilter?: Team
): number {
  return units.filter(unit => {
    const distance = getDistance(coord, { x: unit.x, y: unit.y });
    const withinRadius = distance <= radius;
    const teamMatches = !teamFilter || unit.team === teamFilter;
    return withinRadius && teamMatches;
  }).length;
}

/**
 * Check if a capital should be moved based on enemy unit proximity
 * Future feature: Move capital if 5+ enemy units are within 5 hexes
 * @param capital The capital coordinate
 * @param units Array of all units
 * @param capitalTeam The team that owns the capital
 * @param threatRadius The radius to check for threats (default: 5)
 * @param threatThreshold Minimum number of enemy units to trigger move (default: 5)
 * @returns True if capital should be moved
 */
export function shouldMoveCapital(
  capital: Coordinate,
  units: Unit[],
  capitalTeam: Team,
  threatRadius: number = 5,
  threatThreshold: number = 5
): boolean {
  const enemyTeam = capitalTeam === 'Blue' ? 'Red' : 'Blue';
  const enemyUnitsNearby = countUnitsWithinRadius(capital, units, threatRadius, enemyTeam);
  const friendlyUnitsNearby = countUnitsWithinRadius(capital, units, threatRadius, capitalTeam);
  
  // Consider moving if enemies outnumber friendly units significantly
  return enemyUnitsNearby >= threatThreshold && enemyUnitsNearby > friendlyUnitsNearby;
}

/**
 * Find potential new capital locations
 * Future feature: Suggest alternative capital positions
 * @param board The game board layout
 * @param currentCapital Current capital position
 * @param team The team looking for new capital location
 * @param minDistance Minimum distance from current capital
 * @returns Array of potential new capital coordinates
 */
export function findPotentialCapitalLocations(
  board: BoardLayout,
  currentCapital: Coordinate,
  team: Team,
  minDistance: number = 3
): Coordinate[] {
  const potentialLocations: Coordinate[] = [];
  
  // Look for City or other capturable terrains that could become capitals
  for (const [, tile] of board.entries()) {
    if (tile.terrain === 'City' && (!tile.owner || tile.owner === team)) {
      const coord = { x: tile.x, y: tile.y };
      const distance = getDistance(currentCapital, coord);
      
      if (distance >= minDistance) {
        potentialLocations.push(coord);
      }
    }
  }
  
  return potentialLocations;
}

/**
 * Check if Cities or Capitals exist within specified radius of any team's Capital
 * Used for unit production logic validation
 * @param board The game board
 * @param team The team whose capitals to check from
 * @param radius The search radius (default: 5)
 * @returns True if at least one City or Capital is found within radius
 */
export function hasCitiesOrCapitalsNearCapitals(
  board: BoardLayout,
  team: Team,
  radius: number = 5
): boolean {
  const capitals = findCapitalsForTeam(board, team);
  
  // If no capitals found, return false
  if (capitals.length === 0) {
    return false;
  }
  
  // Check all tiles on the board
  for (const [, tile] of board.entries()) {
    // Only consider City or Capital terrains
    if (tile.terrain === 'City' || tile.terrain === 'Capital') {
      const tileCoord = { x: tile.x, y: tile.y };
      
      // Check if this tile is within radius of any capital
      const isWithinRange = capitals.some(capital => 
        getDistance(capital, tileCoord) <= radius
      );
      
      if (isWithinRange) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Checks if a specific coordinate has a supply source (City or Capital) within a given radius.
 * @param board The game board layout
 * @param checkCoord The coordinate to check from
 * @param radius The search radius (default: 5)
 * @returns True if a supply source is found within the radius
 */
export function hasSupplySourceInRange(
  board: BoardLayout,
  checkCoord: Coordinate,
  radius: number = 5
): boolean {
  for (const [, tile] of board.entries()) {
    // Only consider City or Capital terrains as supply sources
    if (tile.terrain === 'City' || tile.terrain === 'Capital') {
      const tileCoord = { x: tile.x, y: tile.y };

      // Don't check the source tile against itself
      if (tileCoord.x === checkCoord.x && tileCoord.y === checkCoord.y) {
        continue;
      }

      if (getDistance(checkCoord, tileCoord) <= radius) {
        return true; // Found a supply source within range
      }
    }
  }
  return false; // No supply sources found
}

/**
 * Find coordinates with order=1 from the board layout for camera positioning
 * @param board The game board layout
 * @returns Array of coordinates that have order=1 attribute
 */
export function findOrder1Coordinates(board: BoardLayout): Coordinate[] {
  const order1Coords: Coordinate[] = [];
  
  for (const [, tile] of board.entries()) {
    if (tile.order === 1) {
      order1Coords.push({ x: tile.x, y: tile.y });
    }
  }
  
  return order1Coords;
}

/**
 * Get the primary deployment focus coordinate (first order=1 coordinate found)
 * @param board The game board layout
 * @returns The coordinate to focus camera on, or null if none found
 */
export function getDeploymentFocusCoordinate(board: BoardLayout): Coordinate | null {
  const order1Coords = findOrder1Coordinates(board);
  return order1Coords.length > 0 ? order1Coords[0] : null;
}

export function getInitialCameraPosition(gameState: any): Coordinate | null {
  // Try to get from selected map first
  if (gameState.selectedMap?.initialCameraPosition) {
    return gameState.selectedMap.initialCameraPosition;
  }
  
  // Fallback to order=1 coordinates for backward compatibility
  const order1Coords = findOrder1Coordinates(gameState.board);
  return order1Coords.length > 0 ? order1Coords[0] : null;
}
