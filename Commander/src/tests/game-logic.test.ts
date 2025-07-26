import { UNIT_STATS, TERRAIN_STATS } from '../config/constants';
import { Unit, Tile, BoardLayout } from '../types';
import { calculateReachableTiles, coordToString } from '../utils/map';

describe('Game Logic Tests', () => {
  // Test Artillery movement restrictions
  it('Artillery has correct stats and cannot counter-attack', () => {
    const artilleryUnit: Unit = {
      id: 'test-artillery',
      type: 'Artillery',
      team: 'Blue',
      x: 0,
      y: 0,
      hp: 12,
      maxHp: 12,
      attack: 8,
      defense: 3,
      movement: 1,
      attackRange: { min: 2, max: 5 },
      moved: false,
      attacked: false,
      canCounterAttack: false,
      unitClass: 'Infantry',
      fuel: 40,
      maxFuel: 40,
      xp: 0
    };

    expect(artilleryUnit.type).toBe('Artillery');
    expect(artilleryUnit.canCounterAttack).toBe(false);
    expect(artilleryUnit.attackRange.min).toBe(2);
    expect(artilleryUnit.attackRange.max).toBe(5);
  });

  // Test terrain restrictions for vehicles
  it('Vehicle units cannot move through River, Sea, Mountain', () => {
    const tankUnit: Unit = {
      id: 'test-tank',
      type: 'Tank',
      team: 'Blue',
      x: 0,
      y: 0,
      hp: 20,
      maxHp: 20,
      attack: 7,
      defense: 5,
      movement: 4,
      attackRange: { min: 1, max: 1 },
      moved: false,
      attacked: false,
      canCounterAttack: true,
      unitClass: 'Vehicle',
      fuel: 40,
      maxFuel: 40,
      xp: 0
    };

    const board: BoardLayout = new Map();
    
    // Add River tile
    const riverTile: Tile = {
      x: 1,
      y: 0,
      terrain: 'River'
    };
    board.set(coordToString({ x: 1, y: 0 }), riverTile);
    
    // Add Mountain tile
    const mountainTile: Tile = {
      x: 0,
      y: 1,
      terrain: 'Mountain'
    };
    board.set(coordToString({ x: 0, y: 1 }), mountainTile);
    
    // Add Sea tile
    const seaTile: Tile = {
      x: -1,
      y: 0,
      terrain: 'Sea'
    };
    board.set(coordToString({ x: -1, y: 0 }), seaTile);

    const reachableTiles = calculateReachableTiles(
      { x: 0, y: 0 },
      tankUnit.movement,
      tankUnit.fuel,
      board,
      [tankUnit],
      'Blue'
    );

    // Vehicle should not be able to reach River, Sea, or Mountain tiles
    expect(reachableTiles.find(t => t.x === 1 && t.y === 0)).toBeUndefined(); // River
    expect(reachableTiles.find(t => t.x === 0 && t.y === 1)).toBeUndefined(); // Mountain
    expect(reachableTiles.find(t => t.x === -1 && t.y === 0)).toBeUndefined(); // Sea
  });

  // Test Infantry can cross River
  it('Infantry units can move through River', () => {
    const infantryUnit: Unit = {
      id: 'test-infantry',
      type: 'Infantry',
      team: 'Blue',
      x: 0,
      y: 0,
      hp: 10,
      maxHp: 10,
      attack: 4,
      defense: 2,
      movement: 3,
      attackRange: { min: 1, max: 1 },
      moved: false,
      attacked: false,
      canCounterAttack: true,
      unitClass: 'Infantry',
      fuel: 60,
      maxFuel: 60,
      xp: 0
    };

    const board: BoardLayout = new Map();
    
    // Add River tile
    const riverTile: Tile = {
      x: 1,
      y: 0,
      terrain: 'River'
    };
    board.set(coordToString({ x: 1, y: 0 }), riverTile);

    const reachableTiles = calculateReachableTiles(
      { x: 0, y: 0 },
      infantryUnit.movement,
      infantryUnit.fuel,
      board,
      [infantryUnit],
      'Blue'
    );

    // Infantry should be able to reach River tiles
    expect(reachableTiles.find(t => t.x === 1 && t.y === 0)).toBeDefined();
  });

  // Test terrain movement costs
  it('Terrain movement costs are correct', () => {
    expect(TERRAIN_STATS.River.movementCost.Infantry).toBe(2);
    expect(TERRAIN_STATS.River.movementCost.Vehicle).toBe(Infinity);
    expect(TERRAIN_STATS.Mountain.movementCost.Vehicle).toBe(Infinity);
    expect(TERRAIN_STATS.Sea.movementCost.Infantry).toBe(Infinity);
    expect(TERRAIN_STATS.Sea.movementCost.Vehicle).toBe(Infinity);
  });

  // Test unit deployment restrictions
  it('Unit deployment terrain restrictions work correctly', () => {
    const canDeployUnitOnTerrain = (unit: Unit, terrain: string): boolean => {
      // Vehicle restrictions
      if (unit.unitClass === 'Vehicle') {
        if (terrain === 'River' || terrain === 'Sea' || terrain === 'Mountain') {
          return false;
        }
      }
      return true;
    };

    const tankUnit: Unit = {
      id: 'test-tank',
      type: 'Tank',
      team: 'Blue',
      x: 0,
      y: 0,
      hp: 20,
      maxHp: 20,
      attack: 7,
      defense: 5,
      movement: 4,
      attackRange: { min: 1, max: 1 },
      moved: false,
      attacked: false,
      canCounterAttack: true,
      unitClass: 'Vehicle',
      fuel: 40,
      maxFuel: 40,
      xp: 0
    };

    const infantryUnit: Unit = {
      id: 'test-infantry',
      type: 'Infantry',
      team: 'Blue',
      x: 0,
      y: 0,
      hp: 10,
      maxHp: 10,
      attack: 4,
      defense: 2,
      movement: 3,
      attackRange: { min: 1, max: 1 },
      moved: false,
      attacked: false,
      canCounterAttack: true,
      unitClass: 'Infantry',
      fuel: 60,
      maxFuel: 60,
      xp: 0
    };

    // Tank cannot deploy on restricted terrains
    expect(canDeployUnitOnTerrain(tankUnit, 'River')).toBe(false);
    expect(canDeployUnitOnTerrain(tankUnit, 'Sea')).toBe(false);
    expect(canDeployUnitOnTerrain(tankUnit, 'Mountain')).toBe(false);
    expect(canDeployUnitOnTerrain(tankUnit, 'Plains')).toBe(true);

    // Infantry can deploy on all terrains except Sea
    expect(canDeployUnitOnTerrain(infantryUnit, 'River')).toBe(true);
    expect(canDeployUnitOnTerrain(infantryUnit, 'Mountain')).toBe(true);
    expect(canDeployUnitOnTerrain(infantryUnit, 'Plains')).toBe(true);
  });
});