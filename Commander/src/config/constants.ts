import { UnitStats, TerrainStats, UnitType, Team } from '../types';
import { armyManager } from '../data/units';

// JSON-based unit stats retrieval
const getUnitStatsFromArmyJSON = (type: UnitType, faction: 'Blue' | 'Red' = 'Blue'): UnitStats => {
  try {
    const templates = armyManager.getUnitTemplatesBy(faction, '陸');
    const template = templates.find(t => t.type === type);
    
    if (template) {
      return template.stats;
    }
  } catch (error) {
    console.warn(`Could not load unit stats from JSON for ${type}, using fallback`);
  }
  
  // Fallback stats
  return getUnitStatsFallback(type);
};

// Create dynamic UNIT_STATS object that references JSON data
export const UNIT_STATS: { [key in UnitType]: UnitStats } = {
  Infantry: getUnitStatsFromArmyJSON('Infantry'),
  Tank: getUnitStatsFromArmyJSON('Tank'),
  ArmoredCar: getUnitStatsFromArmyJSON('ArmoredCar'),
  AntiTank: getUnitStatsFromArmyJSON('AntiTank'),
  Artillery: getUnitStatsFromArmyJSON('Artillery')
};

// Helper function to get unit stats for a specific faction
export const getUnitStatsByFaction = (type: UnitType, faction: 'Blue' | 'Red'): UnitStats => {
  return getUnitStatsFromArmyJSON(type, faction);
};

// Fallback unit stats (for backward compatibility)
const getUnitStatsFallback = (type: UnitType): UnitStats => {
  switch (type) {
    case 'Infantry':
      return {
        maxHp: 10, attack: 4, defense: 2, movement: 3,
        attackRange: { min: 1, max: 1 }, canCounterAttack: true,
        unitClass: 'Infantry', maxFuel: 60,
        attackVs: { Vehicle: 4, Infantry: 4 },
        defenseVs: { Vehicle: 2, Infantry: 2 }
      };
    case 'Tank':
      return {
        maxHp: 20, attack: 7, defense: 5, movement: 4,
        attackRange: { min: 1, max: 1 }, canCounterAttack: true,
        unitClass: 'Vehicle', maxFuel: 40,
        attackVs: { Vehicle: 7, Infantry: 7 },
        defenseVs: { Vehicle: 5, Infantry: 5 }
      };
    case 'ArmoredCar':
      return {
        maxHp: 15, attack: 5, defense: 4, movement: 6,
        attackRange: { min: 1, max: 1 }, canCounterAttack: true,
        unitClass: 'Vehicle', maxFuel: 60,
        attackVs: { Vehicle: 5, Infantry: 5 },
        defenseVs: { Vehicle: 4, Infantry: 4 }
      };
    case 'AntiTank':
      return {
        maxHp: 10, attack: 8, defense: 6, movement: 1,
        attackRange: { min: 1, max: 1 }, canCounterAttack: true,
        unitClass: 'Infantry', maxFuel: 40,
        attackVs: { Vehicle: 8, Infantry: 4 },
        defenseVs: { Vehicle: 6, Infantry: 2 }
      };
    case 'Artillery':
      return {
        maxHp: 12, attack: 8, defense: 3, movement: 1,
        attackRange: { min: 2, max: 5 }, canCounterAttack: false,
        unitClass: 'Infantry', maxFuel: 40,
        attackVs: { Vehicle: 8, Infantry: 8 },
        defenseVs: { Vehicle: 3, Infantry: 3 },
        isArtillery: true
      };
  }
};

export const TERRAIN_STATS: { [key: string]: TerrainStats } = {
  Plains: {
    defenseBonus: 0,
    attackBonus: 0,
    movementCost: { Infantry: 1, Vehicle: 1, default: 1 }
  },
  Forest: {
    defenseBonus: 2,
    attackBonus: 0,
    movementCost: { Infantry: 1, Vehicle: 2, default: 1 }
  },
  Mountain: {
    defenseBonus: 3,
    attackBonus: 2,
    movementCost: { Infantry: 2, Vehicle: Infinity, default: 2 }
  },
  River: {
    defenseBonus: -2,
    attackBonus: -1,
    movementCost: { Infantry: 2, Vehicle: Infinity, default: 2 }
  },
  Road: {
    defenseBonus: -1,
    attackBonus: 0,
    movementCost: { Infantry: 1, Vehicle: 1, default: 1 }
  },
  Bridge: {
    defenseBonus: -1,
    attackBonus: 0,
    movementCost: { Infantry: 1, Vehicle: 1, default: 1 }
  },
  City: {
    defenseBonus: 3,
    attackBonus: 1,
    movementCost: { Infantry: 1, Vehicle: 1, default: 1 }
  },
  Mud: {
    defenseBonus: -1,
    attackBonus: 0,
    movementCost: { Infantry: 2, Vehicle: 3, default: 2 }
  },
  Sea: {
    defenseBonus: 0,
    attackBonus: 0,
    movementCost: { Infantry: Infinity, Vehicle: Infinity, default: Infinity }
  },
  Capital: {
    defenseBonus: 3,
    attackBonus: 1,
    movementCost: { Infantry: 1, Vehicle: 1, default: 1 }
  },
  Airport: {
    defenseBonus: 3,
    attackBonus: 1,
    movementCost: { Infantry: 1, Vehicle: 1, default: 1 }
  },
  Bocage: {
    defenseBonus: 0,
    attackBonus: 0,
    movementCost: { Infantry: 1, Vehicle: 1, default: 1 }
  },
  Snow: {
    defenseBonus: 0,
    attackBonus: 0,
    movementCost: { Infantry: 2, Vehicle: 2, default: 2 }
  },
  Desert: {
    defenseBonus: 0,
    attackBonus: 0,
    movementCost: { Infantry: 1, Vehicle: 1, default: 1 }
  },
  Reef: {
    defenseBonus: 2,
    attackBonus: 0,
    movementCost: { Infantry: Infinity, Vehicle: Infinity, default: Infinity }
  },
  Fortress: {
    defenseBonus: 3,
    attackBonus: 1,
    movementCost: { Infantry: 1, Vehicle: 2, default: 1 }
  },
  Port: {
    defenseBonus: 2,
    attackBonus: 0,
    movementCost: { Infantry: 1, Vehicle: 1, default: 1 }
  }
};

// Dynamic unit positions based on JSON data
const generateUnitPositionsFromJSON = (): { [key in Team]: Array<{ x: number; y: number; type: UnitType }> } => {
  try {
    // This could be extended to read positions from JSON in the future
    // For now, we use the template-based approach with strategic positioning
    const blueTemplates = armyManager.getUnitTemplatesBy('Blue', '陸');
    const redTemplates = armyManager.getUnitTemplatesBy('Red', '陸');
    
    const bluePositions: Array<{ x: number; y: number; type: UnitType }> = [];
    const redPositions: Array<{ x: number; y: number; type: UnitType }> = [];
    
    // Generate positions based on available templates
    let blueX = -5, blueY = -2;
    let redX = 5, redY = 2;
    
    blueTemplates.slice(0, 5).forEach((template, index) => {
      bluePositions.push({
        x: blueX + (index % 3),
        y: blueY + Math.floor(index / 3) * 3,
        type: template.type
      });
    });
    
    redTemplates.slice(0, 5).forEach((template, index) => {
      redPositions.push({
        x: redX - (index % 3),
        y: redY - Math.floor(index / 3) * 3,
        type: template.type
      });
    });
    
    return { Blue: bluePositions, Red: redPositions };
  } catch (error) {
    console.warn('Could not generate positions from JSON, using fallback');
    return getInitialUnitPositionsFallback();
  }
};

export const INITIAL_UNIT_POSITIONS: { [key in Team]: Array<{ x: number; y: number; type: UnitType }> } = generateUnitPositionsFromJSON();

// Fallback positions for backward compatibility
const getInitialUnitPositionsFallback = (): { [key in Team]: Array<{ x: number; y: number; type: UnitType }> } => ({
  Blue: [
    { x: -5, y: -2, type: 'Tank' },
    { x: -4, y: -2, type: 'Infantry' },
    { x: -3, y: -2, type: 'ArmoredCar' },
    { x: -5, y: 1, type: 'Artillery' },
    { x: -4, y: 1, type: 'AntiTank' }
  ],
  Red: [
    { x: 5, y: 2, type: 'Tank' },
    { x: 4, y: 2, type: 'Infantry' },
    { x: 3, y: 2, type: 'AntiTank' },
    { x: 5, y: -1, type: 'Artillery' },
    { x: 4, y: -1, type: 'ArmoredCar' }
  ]
});

export const MAP_MIN_Q = -12;
export const MAP_MAX_Q = 12;
export const MAP_MIN_R = -10;
export const MAP_MAX_R = 10;

export const CITY_HP = 10;
export const CITY_HEAL_RATE = 1; // 首都含む占領可能地形の回復レートを+2から+1に変更
export const CAPTURE_DAMAGE_HIGH_HP = { min: 6, max: 8 };
export const CAPTURE_DAMAGE_LOW_HP = { min: 3, max: 5 };

// Unit healing constants
export const UNIT_HEAL_HP = 2;
export const UNIT_HEAL_FUEL_FULL = true;

export const HEX_SIZE = 40;
export const HEX_WIDTH = HEX_SIZE * Math.sqrt(3);
export const HEX_HEIGHT = HEX_SIZE * 2;