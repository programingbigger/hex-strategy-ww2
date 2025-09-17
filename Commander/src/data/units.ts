import { Unit, UnitType, Weapon, UnitStats, UnitCategory } from '../types';
import { armyManager, getPlayerStartingUnits as getPlayerStartingUnitsFromArmy, getEnemyStartingUnits as getEnemyStartingUnitsFromArmy } from './armyLoader';

// JSON-based unit and weapon creation functions
const getUnitStatsFromJSON = (type: UnitType, team: 'Blue' | 'Red'): UnitStats => {
  const templates = armyManager.getUnitTemplatesBy(team, '陸');
  const template = templates.find(t => t.type === type);
  
  if (template) {
    return template.stats;
  }
  
  // Fallback for backward compatibility - should not be reached in normal usage
  console.warn(`Unit stats not found in JSON for ${type}, using fallback`);
  return getUnitStatsFallback(type);
};

const getUnitWeaponsFromJSON = (type: UnitType, team: 'Blue' | 'Red'): Weapon[] => {
  try {
    const templates = armyManager.getUnitTemplatesBy(team, '陸');
    const template = templates.find(t => t.type === type);
    
    if (template && template.weapons) {
      // Reset ammunition to max for new units
      return template.weapons.map(weapon => ({
        ...weapon,
        ammunition: weapon.maxAmmunition
      }));
    }
  } catch (error) {
    console.warn(`ArmyManager failed for ${type} (${team}), trying direct JSON access:`, error);
  }
  
  // Fallback: direct JSON access (still JSON-based, not hardcoded)
  return getWeaponsFromJSONDirect(type, team);
};

// Direct JSON access fallback
const getWeaponsFromJSONDirect = (type: UnitType, team: 'Blue' | 'Red'): Weapon[] => {
  try {
    const armyData = require('./armyOrganization.json');
    const faction = team;
    const templates = armyData.factions[faction]?.branches['陸']?.unitCategories || {};
    
    // Search all categories for matching unit type
    for (const categoryData of Object.values(templates)) {
      if (categoryData && typeof categoryData === 'object' && 'units' in categoryData) {
        const template = (categoryData as any).units.find((t: any) => t.type === type);
        if (template && template.weapons) {
          return template.weapons.map((weapon: any) => ({
            ...weapon,
            ammunition: weapon.maxAmmunition // Reset ammunition for new unit
          }));
        }
      }
    }
  } catch (error) {
    console.warn(`Direct JSON access failed for ${type} (${team}):`, error);
  }
  
  // Final emergency fallback: return empty weapons array
  console.error(`All JSON methods failed for ${type} (${team}), returning empty weapons array`);
  return [];
};

export const createUnit = (
  id: string,
  type: UnitType,
  team: 'Blue' | 'Red',
  x: number = 0,
  y: number = 0
): Unit => {
  // Try to get data from JSON first
  try {
    const unitStats = getUnitStatsFromJSON(type, team);
    const weapons = getUnitWeaponsFromJSON(type, team);
    
    return {
      id,
      type,
      team,
      faction: team, // Add faction info for new system
      branch: '陸', // Default to land branch
      category: getUnitCategory(type), // Determine category from type
      x,
      y,
      hp: unitStats.maxHp,
      maxHp: unitStats.maxHp,
      attack: unitStats.attack,
      defense: unitStats.defense,
      movement: unitStats.movement,
      attackRange: unitStats.attackRange,
      moved: false,
      attacked: false,
      canCounterAttack: unitStats.canCounterAttack,
      unitClass: unitStats.unitClass,
      fuel: unitStats.maxFuel,
      maxFuel: unitStats.maxFuel,
      xp: 0,
      weapons
    };
  } catch (error) {
    console.error('Failed to create unit from JSON, using fallback:', error);
    return createUnitFallback(id, type, team, x, y);
  }
};

// Helper function to determine category from type
const getUnitCategory = (type: UnitType): UnitCategory => {
  switch (type) {
    case 'Infantry': return 'infantry';
    case 'Tank': 
    case 'ArmoredCar': return 'armor';
    case 'Artillery': return 'artillery';
    case 'AntiTank': return 'antitank';
    case 'Engineer':
    case 'Transport': return 'support';
    default: return 'infantry';
  }
};

// === FALLBACK FUNCTIONS (for backward compatibility) ===

// 完全JSON参照ベースのフォールバック関数
const createUnitWeaponsFallback = (type: UnitType, team?: 'Blue' | 'Red'): Weapon[] => {
  // この関数は getWeaponsFromJSONDirect を使用（既に実装済み）
  return getWeaponsFromJSONDirect(type, team || 'Blue');
};

const getUnitStatsFallback = (type: UnitType): UnitStats => {
  switch (type) {
    case 'Infantry':
      return {
        maxHp: 10, attack: 4, defense: 2, movement: 3,
        attackRange: { min: 1, max: 1 }, canCounterAttack: true,
        unitClass: 'Infantry', maxFuel: 50, reconnaissance: 2
      };
    case 'Tank':
      return {
        maxHp: 20, attack: 8, defense: 6, movement: 4,
        attackRange: { min: 1, max: 1 }, canCounterAttack: true,
        unitClass: 'Vehicle', maxFuel: 40, reconnaissance: 3
      };
    case 'ArmoredCar':
      return {
        maxHp: 15, attack: 6, defense: 4, movement: 6,
        attackRange: { min: 1, max: 1 }, canCounterAttack: true,
        unitClass: 'Vehicle', maxFuel: 60, reconnaissance: 3
      };
    case 'Artillery':
      return {
        maxHp: 12, attack: 10, defense: 2, movement: 1,
        attackRange: { min: 2, max: 5 }, canCounterAttack: false,
        unitClass: 'Vehicle', maxFuel: 30, reconnaissance: 1
      };
    case 'AntiTank':
      return {
        maxHp: 8, attack: 6, defense: 3, movement: 1,
        attackRange: { min: 1, max: 2 }, canCounterAttack: true,
        unitClass: 'Infantry', maxFuel: 40, reconnaissance: 1
      };
    case 'Engineer':
      return {
        maxHp: 10, attack: 3, defense: 1, movement: 4,
        attackRange: { min: 1, max: 1 }, canCounterAttack: true,
        unitClass: 'Vehicle', maxFuel: 40, reconnaissance: 1
      };
    case 'Transport':
      return {
        maxHp: 15, attack: 5, defense: 4, movement: 8,
        attackRange: { min: 1, max: 1 }, canCounterAttack: true,
        unitClass: 'Vehicle', maxFuel: 60, reconnaissance: 2
      };
  }
};;

const createUnitFallback = (
  id: string,
  type: UnitType,
  team: 'Blue' | 'Red',
  x: number = 0,
  y: number = 0
): Unit => {
  const unitStats = getUnitStatsFallback(type);
  const weapons = createUnitWeaponsFallback(type, team);
  
  return {
    id, type, team, x, y,
    hp: unitStats.maxHp, maxHp: unitStats.maxHp,
    attack: unitStats.attack, defense: unitStats.defense,
    movement: unitStats.movement, attackRange: unitStats.attackRange,
    moved: false, attacked: false, canCounterAttack: unitStats.canCounterAttack,
    unitClass: unitStats.unitClass, fuel: unitStats.maxFuel,
    maxFuel: unitStats.maxFuel, xp: 0, weapons
  };
};

// Export helper functions for external use
export const getUnitStats = (type: UnitType, team: 'Blue' | 'Red' = 'Blue'): UnitStats => {
  return getUnitStatsFromJSON(type, team);
};

// Legacy unit creation functions - kept for backward compatibility
export const getPlayerStartingUnits = (mapId?: string): Unit[] => {
  // If mapId is provided, try to load map-specific unit configuration
  if (mapId) {
    try {
      // Check for map-specific unit configurations
      if (mapId === 'test_map_1') {
        return getUnitsForTestMap1();
      }
      
      // Fallback to default if map-specific config not found
      console.log(`Map-specific units not configured for ${mapId}, using default`);
    } catch (error) {
      console.error(`Failed to load units for map ${mapId}:`, error);
    }
  }
  
  // Default hardcoded units (fallback)
  return [
    createUnit('player-infantry-1', 'Infantry', 'Blue'),
  ];
};;;

const getUnitsForTestMap1 = (): Unit[] => {
  // Load test_map_1 specific unit configuration
  const mapConfig = {
    "mode": "scenario",
    "map_name": "test_map_1",
    "units": [
      {
        "id": "blue-infantry-standard",
        "faction": "Blue",
        "count": 2,
        "unitId": "player-infantry"
      },
      {
        "id": "blue-tank-medium",
        "faction": "Blue",
        "count": 2,
        "unitId": "player-tank"
      },
      {
        "id": "blue-armored-car",
        "faction": "Blue",
        "count": 2,
        "unitId": "player-armored"
      },
      {
        "id": "blue-artillery-howitzer",
        "faction": "Blue",
        "count": 1,
        "unitId": "player-artillery"
      },
      {
        "id": "blue-antitank-gun",
        "faction": "Blue",
        "count": 1,
        "unitId": "player-antitank"
      },
      {
        "id": "blue-engineer",
        "faction": "Blue",
        "count": 1,
        "unitId": "player-engineer"
      },
      {
        "id": "blue-transport",
        "faction": "Blue",
        "count": 1,
        "unitId": "player-transport"
      }
    ]
  };

  return createUnitsFromConfig(mapConfig.units);
};

const createUnitsFromConfig = (unitConfigs: any[]): Unit[] => {
  const units: Unit[] = [];
  
  unitConfigs.forEach(config => {
    for (let i = 1; i <= config.count; i++) {
      const unitId = `${config.unitId}-${i}`;
      const unitType = getUnitTypeFromArmyId(config.id);
      
      if (unitType) {
        units.push(createUnit(unitId, unitType, config.faction as 'Blue' | 'Red'));
      }
    }
  });
  
  return units;
};

const getUnitTypeFromArmyId = (armyId: string): UnitType | null => {
  // Map army organization IDs to unit types
  const idToTypeMap: { [key: string]: UnitType } = {
    'blue-infantry-standard': 'Infantry',
    'blue-tank-medium': 'Tank',
    'blue-armored-car': 'ArmoredCar',
    'blue-artillery-howitzer': 'Artillery',
    'blue-antitank-gun': 'AntiTank',
    'blue-engineer': 'Engineer',
    'blue-transport': 'Transport'
  };
  
  return idToTypeMap[armyId] || null;
};

// Async version for loading map-specific units dynamically
export const getPlayerStartingUnitsAsync = async (mapId?: string): Promise<Unit[]> => {
  if (mapId) {
    try {
      // Try to fetch the map-specific configuration file
      const response = await fetch(`/src/data/PrepAvailableUnitsByMaps/${mapId}.json`);
      if (response.ok) {
        const mapConfig = await response.json();
        return createUnitsFromConfig(mapConfig.units);
      }
    } catch (error) {
      console.log(`Map-specific config for ${mapId} not found, using fallback`);
    }
  }
  
  // Return the synchronous version as fallback
  return getPlayerStartingUnits(mapId);
};

export const getEnemyStartingUnits = (): Unit[] => {
  // Try to use new army system first, fallback to legacy if needed
  try {
    return getEnemyStartingUnitsFromArmy();
  } catch (error) {
    console.warn('Army system not available, falling back to legacy unit creation:', error);
    return [
      createUnit('enemy-infantry-1', 'Infantry', 'Red'),
      createUnit('enemy-infantry-2', 'Infantry', 'Red'),
      createUnit('enemy-tank-1', 'Tank', 'Red'),
      createUnit('enemy-artillery-1', 'Artillery', 'Red')
    ];
  }
};

// Export the army manager for direct access
export { armyManager };