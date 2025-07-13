import { Coordinate, BoardLayout, Unit, Team, MapData } from '../types';
import { TERRAIN_STATS, UNIT_STATS } from '../config/constants';

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
  
  // Load units with full stats
  const units: Unit[] = mapData.units.map(unitData => {
    const stats = UNIT_STATS[unitData.type];
    return {
      ...stats,
      ...unitData,
      maxHp: stats.maxHp,
      attack: stats.attack,
      defense: stats.defense,
      movement: stats.movement,
      attackRange: stats.attackRange,
      canCounterAttack: stats.canCounterAttack,
      unitClass: stats.unitClass,
      maxFuel: stats.maxFuel,
      attackVs: stats.attackVs,
      defenseVs: stats.defenseVs
    };
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

  // Calculate ZOC for enemy units
  const zocTiles: Map<string, Team> = new Map();
  units.forEach(unit => {
    if (unit.team !== currentTeam) {
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
    if (currentNode.key !== startNodeKey) {
      reachable.push(currentCoord);
    }
    
    const neighbors = getNeighbors(currentCoord);
    
    for (const neighborCoord of neighbors) {
      const neighborKey = coordToString(neighborCoord);
      const tile = board.get(neighborKey);
      if (!tile) continue;

      const unitOnTile = units.some(u => u.x === neighborCoord.x && u.y === neighborCoord.y && !(u.x === start.x && u.y === start.y));
      if (unitOnTile) continue;

      const terrainStats = TERRAIN_STATS[tile.terrain];
      let moveCost = terrainStats.movementCost[unitAtStart.type] ?? terrainStats.movementCost.default;

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
            reachable.push(neighborCoord);
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
      const moveCost = terrainStats.movementCost[unitAtStart.type] ?? terrainStats.movementCost.default;
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