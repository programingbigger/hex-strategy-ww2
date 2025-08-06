import { 
  findCapitalsForTeam, 
  calculateDeployableTilesFromCapitals, 
  isCoordinateDeployable,
  coordToString
} from '../utils/map';
import { BoardLayout } from '../types';

describe('Capital-Based Deployment System', () => {
  let mockBoard: BoardLayout;

  beforeEach(() => {
    // Setup mock board based on test_map_1.json structure
    mockBoard = new Map();
    
    // Add Blue capital at (-5, 0)
    mockBoard.set(coordToString({ x: -5, y: 0 }), {
      x: -5, y: 0, terrain: 'Capital' as const, hp: 10, maxHp: 10, owner: 'Blue'
    });
    
    // Add some surrounding tiles
    const surroundingTiles = [
      { x: -4, y: 0, terrain: 'Plains' as const },
      { x: -3, y: 0, terrain: 'Forest' as const },
      { x: -2, y: 0, terrain: 'Plains' as const },
      { x: -1, y: 0, terrain: 'Plains' as const },
      { x: 0, y: 0, terrain: 'Plains' as const },
      { x: -5, y: 1, terrain: 'Plains' as const },
      { x: -4, y: 1, terrain: 'Snow' as const },
      { x: -3, y: 1, terrain: 'Plains' as const },
      { x: -2, y: 1, terrain: 'Airport' as const },
      // Add tiles at edge of 5-hex radius
      { x: -10, y: 0, terrain: 'Plains' as const }, // 5 hexes away
      { x: -11, y: 0, terrain: 'Plains' as const }, // 6 hexes away (should not be deployable)
    ];
    
    surroundingTiles.forEach(tile => {
      mockBoard.set(coordToString(tile), tile);
    });
  });

  describe('findCapitalsForTeam', () => {
    test('should find capitals for Blue team', () => {
      const capitals = findCapitalsForTeam(mockBoard, 'Blue');
      expect(capitals).toHaveLength(1);
      expect(capitals[0]).toEqual({ x: -5, y: 0 });
    });

    test('should return empty array for Red team (no capitals)', () => {
      const capitals = findCapitalsForTeam(mockBoard, 'Red');
      expect(capitals).toHaveLength(0);
    });

    test('should handle multiple capitals', () => {
      // Add Red capital
      mockBoard.set(coordToString({ x: 5, y: 5 }), {
        x: 5, y: 5, terrain: 'Capital' as const, hp: 10, maxHp: 10, owner: 'Red'
      });
      
      const redCapitals = findCapitalsForTeam(mockBoard, 'Red');
      expect(redCapitals).toHaveLength(1);
      expect(redCapitals[0]).toEqual({ x: 5, y: 5 });
    });
  });

  describe('calculateDeployableTilesFromCapitals', () => {
    test('should calculate deployable tiles within 5-hex radius', () => {
      const deployableTiles = calculateDeployableTilesFromCapitals(mockBoard, 'Blue');
      
      // Should include tiles within 5 hexes of (-5, 0)
      expect(deployableTiles.length).toBeGreaterThan(0);
      
      // Check that (-1, 0) is included (4 hexes from capital)
      const includesNearTile = deployableTiles.some(tile => tile.x === -1 && tile.y === 0);
      expect(includesNearTile).toBe(true);
      
      // Check that (-10, 0) is included (5 hexes from capital)
      const includesEdgeTile = deployableTiles.some(tile => tile.x === -10 && tile.y === 0);
      expect(includesEdgeTile).toBe(true);
      
      // Check that (-11, 0) is NOT included (6 hexes from capital)
      const includesFarTile = deployableTiles.some(tile => tile.x === -11 && tile.y === 0);
      expect(includesFarTile).toBe(false);
    });

    test('should return empty array for team with no capitals', () => {
      const deployableTiles = calculateDeployableTilesFromCapitals(mockBoard, 'Red');
      expect(deployableTiles).toHaveLength(0);
    });
  });

  describe('isCoordinateDeployable', () => {
    test('should return true for coordinates within capital deployment range', () => {
      // Test coordinate 4 hexes from capital (-5, 0)
      const isDeployable = isCoordinateDeployable(mockBoard, 'Blue', { x: -1, y: 0 });
      expect(isDeployable).toBe(true);
    });

    test('should return false for coordinates outside capital deployment range', () => {
      // Test coordinate 6 hexes from capital (-5, 0)
      const isDeployable = isCoordinateDeployable(mockBoard, 'Blue', { x: -11, y: 0 });
      expect(isDeployable).toBe(false);
    });

    test('should return true for coordinates exactly at radius limit', () => {
      // Test coordinate exactly 5 hexes from capital (-5, 0)
      const isDeployable = isCoordinateDeployable(mockBoard, 'Blue', { x: -10, y: 0 });
      expect(isDeployable).toBe(true);
    });

    test('should return false for team with no capitals', () => {
      const isDeployable = isCoordinateDeployable(mockBoard, 'Red', { x: 0, y: 0 });
      expect(isDeployable).toBe(false);
    });

    test('should work with custom radius', () => {
      // Test with radius of 3 instead of default 5
      const isDeployableRadius3 = isCoordinateDeployable(mockBoard, 'Blue', { x: -2, y: 0 }, 3);
      expect(isDeployableRadius3).toBe(true);
      
      const isNotDeployableRadius3 = isCoordinateDeployable(mockBoard, 'Blue', { x: -1, y: 0 }, 3);
      expect(isNotDeployableRadius3).toBe(false); // 4 hexes away, outside radius 3
    });
  });
});

console.log('🧪 Capital-based deployment tests created successfully!');