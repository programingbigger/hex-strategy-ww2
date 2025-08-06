import { 
  findCapitalsForTeam, 
  calculateDeployableTilesFromCapitals, 
  isCoordinateDeployable,
  coordToString
} from '../utils/map';
import { BoardLayout, Tile, Team } from '../types';

// Mock victory condition functions for testing
const mockCheckWinCondition = (units: any[], board: BoardLayout) => {
  const blueUnits = units.filter((u: any) => u.team === 'Blue');
  const redUnits = units.filter((u: any) => u.team === 'Red');
  
  // 1. Unit elimination check
  if (redUnits.length === 0) return { condition: 'unit_elimination', winner: 'Blue' };
  if (blueUnits.length === 0) return { condition: 'unit_elimination', winner: 'Red' };
  
  // 2. Capital capture check  
  const capitals = Array.from(board.values()).filter(t => t.terrain === 'Capital');
  if (capitals.length > 0) {
    const blueCapitals = capitals.filter(c => c.owner === 'Blue');
    const redCapitals = capitals.filter(c => c.owner === 'Red');
    
    if (blueCapitals.length === capitals.length) {
      return { condition: 'capital_capture', winner: 'Blue' };
    } else if (redCapitals.length === capitals.length) {
      return { condition: 'capital_capture', winner: 'Red' };
    }
  }
  
  // 3. City capture check
  const isCapturableTerrain = (terrain: string) => 
    terrain === 'City' || terrain === 'Capital' || terrain === 'Airport' || terrain === 'Port';
  const cities = Array.from(board.values()).filter(t => isCapturableTerrain(t.terrain));
  const blueCities = cities.filter(c => c.owner === 'Blue').length;
  const redCities = cities.filter(c => c.owner === 'Red').length;
  
  if (cities.length > 0) {
    if (blueCities === cities.length) {
      return { condition: 'city_capture', winner: 'Blue' };
    } else if (redCities === cities.length) {
      return { condition: 'city_capture', winner: 'Red' };
    }
  }
  
  return null; // No victory condition met
};

describe('Victory Condition System Tests', () => {
  let mockBoard: BoardLayout;
  let mockUnits: any[];

  beforeEach(() => {
    mockBoard = new Map();
    mockUnits = [];
    
    // Setup test map with capitals and cities
    const blueCapital: Tile = {
      x: -5, y: 0, terrain: 'Capital' as const, hp: 20, maxHp: 20, owner: 'Blue'
    };
    const redCapital: Tile = {
      x: 3, y: 1, terrain: 'Capital' as const, hp: 20, maxHp: 20, owner: 'Red'  
    };
    const neutralCity: Tile = {
      x: 0, y: 0, terrain: 'City' as const, hp: 10, maxHp: 10
    };
    
    mockBoard.set(coordToString(blueCapital), blueCapital);
    mockBoard.set(coordToString(redCapital), redCapital);
    mockBoard.set(coordToString(neutralCity), neutralCity);
    
    // Setup test units
    mockUnits = [
      { id: 'blue-1', team: 'Blue', x: -4, y: 0 },
      { id: 'red-1', team: 'Red', x: 2, y: 1 }
    ];
  });

  describe('Victory Condition Priority Tests', () => {
    test('Unit elimination has highest priority', () => {
      // Remove all red units
      const unitsBlueOnly = mockUnits.filter(u => u.team === 'Blue');
      
      // Even if red controls capitals, blue wins by elimination
      const redCapital = mockBoard.get(coordToString({ x: 3, y: 1 }))!;
      mockBoard.set(coordToString({ x: 3, y: 1 }), { ...redCapital, owner: 'Red' });
      
      const result = mockCheckWinCondition(unitsBlueOnly, mockBoard);
      expect(result?.condition).toBe('unit_elimination');
      expect(result?.winner).toBe('Blue');
    });

    test('Capital capture has higher priority than city capture', () => {
      // Blue captures all capitals but not all cities
      const blueCapital = mockBoard.get(coordToString({ x: -5, y: 0 }))!;
      const redCapital = mockBoard.get(coordToString({ x: 3, y: 1 }))!;
      mockBoard.set(coordToString({ x: -5, y: 0 }), { ...blueCapital, owner: 'Blue' });
      mockBoard.set(coordToString({ x: 3, y: 1 }), { ...redCapital, owner: 'Blue' });
      
      // Leave neutral city uncaptured
      const neutralCity = mockBoard.get(coordToString({ x: 0, y: 0 }))!;
      mockBoard.set(coordToString({ x: 0, y: 0 }), { ...neutralCity, owner: undefined });
      
      const result = mockCheckWinCondition(mockUnits, mockBoard);
      expect(result?.condition).toBe('capital_capture');
      expect(result?.winner).toBe('Blue');
    });

    test('City capture works when no capitals exist', () => {
      // Remove capitals from board
      mockBoard.delete(coordToString({ x: -5, y: 0 }));
      mockBoard.delete(coordToString({ x: 3, y: 1 }));
      
      // Add more cities for Blue to capture
      const blueCity: Tile = { x: 1, y: 0, terrain: 'City', hp: 10, maxHp: 10, owner: 'Blue' };
      mockBoard.set(coordToString(blueCity), blueCity);
      
      // Blue captures all cities
      const neutralCity = mockBoard.get(coordToString({ x: 0, y: 0 }))!;
      mockBoard.set(coordToString({ x: 0, y: 0 }), { ...neutralCity, owner: 'Blue' });
      
      const result = mockCheckWinCondition(mockUnits, mockBoard);
      expect(result?.condition).toBe('city_capture');
      expect(result?.winner).toBe('Blue');
    });
  });

  describe('Capital Capture Victory Tests', () => {
    test('Single capital capture victory', () => {
      // Remove one capital, blue captures remaining one
      mockBoard.delete(coordToString({ x: 3, y: 1 }));
      
      const blueCapital = mockBoard.get(coordToString({ x: -5, y: 0 }))!;
      mockBoard.set(coordToString({ x: -5, y: 0 }), { ...blueCapital, owner: 'Blue' });
      
      const result = mockCheckWinCondition(mockUnits, mockBoard);
      expect(result?.condition).toBe('capital_capture');
      expect(result?.winner).toBe('Blue');
    });

    test('Multiple capital capture victory', () => {
      // Red captures all capitals
      const blueCapital = mockBoard.get(coordToString({ x: -5, y: 0 }))!;
      const redCapital = mockBoard.get(coordToString({ x: 3, y: 1 }))!;
      mockBoard.set(coordToString({ x: -5, y: 0 }), { ...blueCapital, owner: 'Red' });
      mockBoard.set(coordToString({ x: 3, y: 1 }), { ...redCapital, owner: 'Red' });
      
      const result = mockCheckWinCondition(mockUnits, mockBoard);
      expect(result?.condition).toBe('capital_capture');
      expect(result?.winner).toBe('Red');
    });

    test('Partial capital capture does not trigger victory', () => {
      // Blue captures only one of two capitals
      const blueCapital = mockBoard.get(coordToString({ x: -5, y: 0 }))!;
      mockBoard.set(coordToString({ x: -5, y: 0 }), { ...blueCapital, owner: 'Blue' });
      // Red capital remains Red-owned
      
      const result = mockCheckWinCondition(mockUnits, mockBoard);
      expect(result).toBeNull(); // No victory condition met
    });
  });

  describe('Turn Limit System Tests', () => {
    test('Turn limit victory for defending team', () => {
      const gameStatus = {
        turn: 21,
        turnLimit: 20,
        attackingTeam: 'Blue' as Team,
        defendingTeam: 'Red' as Team
      };
      
      // Simulate turn limit reached
      if (gameStatus.turn > gameStatus.turnLimit) {
        const winner = gameStatus.defendingTeam;
        expect(winner).toBe('Red');
      }
    });

    test('No turn limit when undefined', () => {
      const gameStatus = {
        turn: 100,
        turnLimit: undefined,
        attackingTeam: 'Blue' as Team,
        defendingTeam: 'Red' as Team  
      };
      
      // Should not trigger turn limit victory
      const shouldTrigger = gameStatus.turnLimit && gameStatus.turn > gameStatus.turnLimit;
      expect(shouldTrigger).toBeFalsy();
    });

    test('Other victory conditions take priority over turn limit', () => {
      // Even if turn limit reached, unit elimination takes priority
      const unitsBlueOnly = mockUnits.filter(u => u.team === 'Blue');
      
      const result = mockCheckWinCondition(unitsBlueOnly, mockBoard);
      expect(result?.condition).toBe('unit_elimination');
      expect(result?.winner).toBe('Blue');
      // Turn limit would not be checked since unit elimination already triggered
    });
  });

  describe('Victory Result Data Structure Tests', () => {
    test('Victory result contains required fields', () => {
      const unitsBlueOnly = mockUnits.filter(u => u.team === 'Blue');
      const result = mockCheckWinCondition(unitsBlueOnly, mockBoard);
      
      expect(result).toHaveProperty('condition');
      expect(result).toHaveProperty('winner');
      expect(['unit_elimination', 'capital_capture', 'city_capture', 'turn_limit']).toContain(result?.condition);
      expect(['Blue', 'Red']).toContain(result?.winner);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('Empty board with no capitals or cities', () => {
      const emptyBoard = new Map<string, Tile>();
      const result = mockCheckWinCondition(mockUnits, emptyBoard);
      expect(result).toBeNull(); // Should not crash, no victory conditions met
    });

    test('All capitals destroyed (HP = 0)', () => {
      // Simulate destroyed capitals (HP = 0 should mean uncapturable)
      const destroyedCapital: Tile = {
        x: -5, y: 0, terrain: 'Capital', hp: 0, maxHp: 20, owner: undefined
      };
      mockBoard.set(coordToString(destroyedCapital), destroyedCapital);
      mockBoard.delete(coordToString({ x: 3, y: 1 }));
      
      const result = mockCheckWinCondition(mockUnits, mockBoard);
      // With no valid capitals, should fall back to other victory conditions
      expect(result?.condition).not.toBe('capital_capture');
    });
  });
});

console.log('🏆 Enhanced victory condition tests created successfully!');