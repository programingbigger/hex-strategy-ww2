import type { Coordinate, BoardLayout, Tile, Unit, TerrainType } from '../types';
import { TERRAIN_STATS, INITIAL_UNIT_POSITIONS, MAP_MIN_Q, MAP_MAX_Q, MAP_MIN_R, MAP_MAX_R } from '../constants';

export const coordToString = (coord: Coordinate): string => `${coord.x},${coord.y}`;
export const stringToCoord = (key: string): Coordinate => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
};

/**
 * Converts axial coordinates to pixel coordinates for pointy-top hexagons.
 * @param coord The axial coordinate {x: q, y: r}.
 * @param size The radius of the hexagon (from center to a vertex).
 * @returns The pixel coordinate {x, y} for the center of the hexagon.
 */
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


export function generateBoardLayout(): BoardLayout {
    const layout: BoardLayout = new Map();

    // 1. Initialize with Plains
    for (let x = MAP_MIN_Q; x <= MAP_MAX_Q; x++) {
        for (let y = MAP_MIN_R; y <= MAP_MAX_R; y++) {
            layout.set(coordToString({x, y}), { x, y, terrain: 'Plains' });
        }
    }

    // 2. Place Cities
    const cityCandidates = Array.from(layout.values()).filter(t => t.terrain === 'Plains');
    const cities: Coordinate[] = [];
    const numberOfCities = Math.floor(Math.random() * 3) + 2; // 2 to 4 cities
    for (let i = 0; i < numberOfCities && cityCandidates.length > 0; i++) {
        let placed = false;
        let attempts = 0;
        while(!placed && attempts < 100) {
            const candidateIndex = Math.floor(Math.random() * cityCandidates.length);
            const candidateTile = cityCandidates[candidateIndex];
            
            // Check distance from other cities
            const isFarEnough = cities.every(city => getDistance(city, candidateTile) > 3);

            if (isFarEnough) {
                candidateTile.terrain = 'City';
                cities.push(candidateTile);
                cityCandidates.splice(candidateIndex, 1); // Remove from candidates
                placed = true;
            }
            attempts++;
        }
    }

    // 3. Generate River
    let riverY = Math.floor(Math.random() * (MAP_MAX_R - MAP_MIN_R + 1)) + MAP_MIN_R;
    let riverX = MAP_MIN_Q;
    while(riverX <= MAP_MAX_Q) {
        const coord = {x: riverX, y: riverY};
        if(layout.has(coordToString(coord))) {
            const tile = layout.get(coordToString(coord))!;
            if (tile.terrain === 'Plains') { // Don't overwrite cities with rivers
                tile.terrain = 'River';
            }
        }
        riverX++;
        if (Math.random() > 0.6) {
             riverY += Math.random() > 0.5 ? 1 : -1;
             riverY = Math.max(MAP_MIN_R, Math.min(MAP_MAX_R, riverY));
        }
    }
    
    // 4. Place Mountain Ranges
    for (let i = 0; i < 3; i++) {
        let mx = Math.floor(Math.random() * (MAP_MAX_Q - MAP_MIN_Q + 1)) + MAP_MIN_Q;
        let my = Math.floor(Math.random() * (MAP_MAX_R - MAP_MIN_R + 1)) + MAP_MIN_R;
        for (let j = 0; j < 5 + Math.random() * 5; j++) {
            const coord = { x: mx, y: my };
            if (layout.has(coordToString(coord))) {
                const tile = layout.get(coordToString(coord))!;
                if (tile.terrain !== 'River' && tile.terrain !== 'City') {
                    tile.terrain = 'Mountain';
                }
            }
            const neighbors = getNeighbors(coord).filter(n => layout.has(coordToString(n)));
            if (neighbors.length > 0) {
                 const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                 mx = next.x;
                 my = next.y;
            }
        }
    }

    // 5. Place Forest Clusters
    for (let i = 0; i < 6; i++) {
        let fx = Math.floor(Math.random() * (MAP_MAX_Q - MAP_MIN_Q + 1)) + MAP_MIN_Q;
        let fy = Math.floor(Math.random() * (MAP_MAX_R - MAP_MIN_R + 1)) + MAP_MIN_R;
        for (let j = 0; j < 10 + Math.random() * 10; j++) {
            const coord = { x: fx, y: fy };
            if (layout.has(coordToString(coord)) && layout.get(coordToString(coord))!.terrain === 'Plains') {
                 layout.get(coordToString(coord))!.terrain = 'Forest';
            }
            const neighbors = getNeighbors(coord).filter(n => layout.has(coordToString(n)));
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                fx = next.x;
                fy = next.y;
            }
        }
    }
    
    // 6. Build Roads and Bridges
    const riverTiles = Array.from(layout.values()).filter(t => t.terrain === 'River');
    if(riverTiles.length > 0) {
        // Build 2 bridges
        for(let i=0; i<2; i++) {
            const bridgeTileIndex = Math.floor(Math.random() * riverTiles.length)
            const bridgeTile = riverTiles[bridgeTileIndex];
            if(bridgeTile) {
              bridgeTile.terrain = 'Bridge';
              riverTiles.splice(bridgeTileIndex, 1); // Avoid picking same tile
            
              // Build road from bridge
              const roadLength = Math.max(MAP_MAX_Q - MAP_MIN_Q, MAP_MAX_R - MAP_MIN_R);
              for(let y_dir = -1; y_dir <= 1; y_dir +=2) { // North and South
                  let current: Coordinate = bridgeTile;
                  for(let k=0; k < roadLength; k++) {
                      // Move in a somewhat straight line vertically in axial space
                      const neighbors = getNeighbors(current).filter(n => n.x === current.x || n.x === current.x - y_dir);
                      const next = neighbors[Math.floor(Math.random()*neighbors.length)];
                      if(!next || !layout.has(coordToString(next))) break;
                      current = next;
                      
                      const tile = layout.get(coordToString(current))!;
                      if(tile.terrain === 'Plains' || tile.terrain === 'Forest') {
                          tile.terrain = 'Road';
                      }
                      if(tile.terrain !== 'Road' && tile.terrain !== 'Bridge' && tile.terrain !== 'River') break;
                  }
              }
            }
        }
    }


    // 7. Ensure initial positions are clear
    Object.values(INITIAL_UNIT_POSITIONS).flat().forEach(pos => {
        const key = coordToString(pos);
        if (layout.has(key)) {
            const terrain = layout.get(key)!.terrain;
            if (terrain === 'Mountain' || terrain === 'River') {
                layout.get(key)!.terrain = 'Plains';
            }
        }
    });

    return layout;
}

export function calculateReachableTiles(start: Coordinate, movement: number, board: BoardLayout, units: Unit[], currentTeam: Team): Coordinate[] {
    const startNodeKey = coordToString(start);
    const costs: Map<string, number> = new Map([[startNodeKey, 0]]);
    const frontier: Array<{ key: string; cost: number }> = [{ key: startNodeKey, cost: 0 }];
    const reachable: Coordinate[] = [];
    
    const unitAtStart = units.find(u => u.x === start.x && u.y === start.y);
    if (!unitAtStart) return [];

    // Calculate ZOC for enemy units
    const zocTiles: Map<string, Team> = new Map();
    units.forEach(unit => {
        if (unit.team !== currentTeam) { // Enemy unit
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
                moveCost += 2; // Movement cost to enter a ZOC hex is terrain cost + 2
            }

            const newCost = currentNode.cost + moveCost;

            if (newCost <= movement) {
                if (!costs.has(neighborKey) || newCost < costs.get(neighborKey)!) {
                    costs.set(neighborKey, newCost);
                    // If entering a ZOC hex, stop movement (do not add to frontier for further exploration)
                    if (!isZocHex) {
                        frontier.push({ key: neighborKey, cost: newCost });
                    } else {
                        reachable.push(neighborCoord); // Add to reachable, but don't explore further
                    }
                }
            }
        }
    }

    return reachable;
}