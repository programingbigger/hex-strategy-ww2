import { Unit, UnitType, Weapon, UnitStats, UnitCategory } from '../types';
import { armyManager, getEnemyStartingUnits as getEnemyStartingUnitsFromArmy } from './armyLoader';
import { ProducibleUnit } from '../components/game/ProductionModal';

// JSON-based unit and weapon creation functions
const getUnitStatsByIdOrType = (unitId: string, type: UnitType, team: 'Blue' | 'Red'): UnitStats => {
  const templates = armyManager.getUnitTemplatesBy(team, '陸');

  // 1. First try to find by exact unit ID
  let template = templates.find(t => t.id === unitId);

  // 2. If not found by ID, fallback to type search (for backward compatibility)
  if (!template) {
    template = templates.find(t => t.type === type);
    if (template) {
      console.warn(`Unit ID '${unitId}' not found, using type '${type}' fallback for stats`);
    }
  }

  if (template) {
    return template.stats;
  }

  // Fallback for backward compatibility - should not be reached in normal usage
  console.warn(`Unit stats not found in JSON for ${unitId}/${type}, using fallback`);
  return getUnitStatsFallback(type);
};

// Legacy function for backward compatibility
const getUnitStatsFromJSON = (type: UnitType, team: 'Blue' | 'Red'): UnitStats => {
  return getUnitStatsByIdOrType('', type, team);
};

const getUnitWeaponsByIdOrType = (unitId: string, type: UnitType, team: 'Blue' | 'Red'): Weapon[] => {
  try {
    const templates = armyManager.getUnitTemplatesBy(team, '陸');

    // 1. First try to find by exact unit ID
    let template = templates.find(t => t.id === unitId);

    // 2. If not found by ID, fallback to type search (for backward compatibility)
    if (!template) {
      template = templates.find(t => t.type === type);
      if (template) {
        console.warn(`Unit ID '${unitId}' not found, using type '${type}' fallback`);
      }
    }

    if (template && template.weapons) {
      // Reset ammunition to max for new units
      return template.weapons.map(weapon => ({
        ...weapon,
        ammunition: weapon.maxAmmunition
      }));
    }
  } catch (error) {
    console.warn(`ArmyManager failed for ${unitId}/${type} (${team}), trying direct JSON access:`, error);
  }

  // Fallback: direct JSON access (still JSON-based, not hardcoded)
  return getWeaponsFromJSONDirect(type, team);
};

// Legacy function for backward compatibility
const getUnitWeaponsFromJSON = (type: UnitType, team: 'Blue' | 'Red'): Weapon[] => {
  return getUnitWeaponsByIdOrType('', type, team);
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
  // Try to get data from JSON first using ID-based lookup
  try {
    // Extract unit ID base from the full ID (remove instance suffixes like "-1", "-2")
    const unitIdBase = id.replace(/-\d+$/, '');

    const unitStats = getUnitStatsByIdOrType(unitIdBase, type, team);
    const weapons = getUnitWeaponsByIdOrType(unitIdBase, type, team);
    
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
export const getPlayerStartingUnits = async (mapId?: string): Promise<Unit[]> => {
  // If mapId is provided, try to load map-specific unit configuration
  if (mapId) {
    try {
      // Use generic map loader for any map ID
      const mapUnits = await getUnitsForMap(mapId);
      if (mapUnits.length > 0) {
        return mapUnits;
      }
      
      // Fallback to default if map-specific config not found or empty
      console.log(`Map-specific units not configured for ${mapId}, using default`);
    } catch (error) {
      console.error(`Failed to load units for map ${mapId}:`, error);
    }
  }
  
  // Default hardcoded units (fallback)
  return [
    createUnit('blue-infantry-standard-1', 'Infantry', 'Blue'),
  ];
};;

// Cache for available map IDs to improve performance
let cachedMapIds: string[] | null = null;

// Helper function to dynamically discover available map IDs
const getAvailableMapIds = async (): Promise<string[]> => {
  // Return cached result if available
  if (cachedMapIds) {
    return cachedMapIds;
  }

  try {
    // Import maps data to get all available maps
    const { availableMaps, tutorialMaps } = await import('./maps');

    // Combine all map IDs from different sources
    const allMapIds: string[] = [];

    // Add scenario maps
    if (availableMaps && Array.isArray(availableMaps)) {
      allMapIds.push(...availableMaps.map(map => map.id));
    }

    // Add tutorial maps
    if (tutorialMaps && Array.isArray(tutorialMaps)) {
      allMapIds.push(...tutorialMaps.map(map => map.id));
    }

    // Remove duplicates, cache, and return
    cachedMapIds = [...new Set(allMapIds)];
    return cachedMapIds;
  } catch (error) {
    console.warn('Failed to dynamically load map IDs, using fallback:', error);
    // Fallback to known maps based on actual file structure
    const fallbackMaps = [
      'tutorial_1',
      'test_map_1',
      'large_map',
      'large_map_2',
      'large_map_only_Plains',
      'short_case_map'
    ];
    cachedMapIds = fallbackMaps;
    return fallbackMaps;
  }
};

// Export the generic map unit loader for external use
export const getUnitsForMap = async (mapId: string): Promise<Unit[]> => {
  try {
    // Dynamically discover available maps instead of hardcoded allowedMapIds
    const availableMaps = await getAvailableMapIds();
    
    if (!availableMaps.includes(mapId)) {
      console.error(`Invalid mapId: ${mapId}. Available maps: ${availableMaps.join(', ')}`);
      return [];
    }

    // Load map data using the map loader to get availableUnits from embedded data
    const { loadMapData } = await import('../utils/mapLoader');
    const mapData = await loadMapData(mapId);
    
    // Check if map has embedded availableUnits
    if (mapData.availableUnits && Array.isArray(mapData.availableUnits)) {
      console.log(`✅ Using embedded availableUnits from map: ${mapId}`);
      return createUnitsFromConfig(mapData.availableUnits);
    }

    // If no embedded units, return empty array with warning
    console.warn(`⚠️ Map ${mapId} doesn't have embedded availableUnits. Please add availableUnits field to the map JSON file.`);
    return [];
  } catch (error) {
    console.error(`Failed to load unit configuration for ${mapId}:`, error);
    
    // Return empty array if map config not found
    console.warn(`Unit configuration not found for ${mapId}, returning empty unit array`);
    return [];
  }
};;;
// Get producible unit templates from map data
export const getProducibleUnitsForMap = async (mapId: string, faction: 'Blue' | 'Red'): Promise<ProducibleUnit[]> => {
  try {
    // Load map data using the map loader to get producibleUnits from embedded data
    const { loadMapData } = await import('../utils/mapLoader');
    const mapData = await loadMapData(mapId);
    
    // Check if map has embedded producibleUnits
    if (mapData.producibleUnits && mapData.producibleUnits[faction] && Array.isArray(mapData.producibleUnits[faction])) {
      console.log(`✅ Using embedded producibleUnits from map: ${mapId} for faction: ${faction}`);
      const producibleUnitIds = mapData.producibleUnits[faction];
      
      // Get unit templates from armyOrganization.json based on the producible unit IDs
      const { armyManager } = await import('./armyLoader');
      const allUnits = armyManager.getUnitTemplatesBy(faction);
      
      // Filter units based on producibleUnits list
      const producibleUnits = allUnits.filter(unit => producibleUnitIds.includes(unit.id));
      
      return producibleUnits as ProducibleUnit[];
    }

    // If no embedded producibleUnits, fall back to all units for that faction
    console.warn(`⚠️ Map ${mapId} doesn't have embedded producibleUnits for ${faction}. Using all available units.`);
    const { armyManager } = await import('./armyLoader');
    const allUnits = armyManager.getUnitTemplatesBy(faction);
    return allUnits as ProducibleUnit[];
  } catch (error) {
    console.error(`Failed to load producible units for ${mapId}:`, error);
    
    // Fallback to all units if map config not found
    console.warn(`Producible units configuration not found for ${mapId}, returning all units for ${faction}`);
    const { armyManager } = await import('./armyLoader');
    const allUnits = armyManager.getUnitTemplatesBy(faction);
    return allUnits as ProducibleUnit[];
  }
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
    // Blue army units from armyOrganization.json
    'blue-infantry-standard': 'Infantry',
    'blue-infantry-motorized': 'Infantry',
    'blue-infantry-mg_squad': 'Infantry',
    'blue-tank-panzer_1': 'Tank',
    'blue-tank-panzer_2': 'Tank',
    'blue-tank-panzer_3': 'Tank',
    'blue-tank-medium': 'Tank',
    'blue-armored-car': 'ArmoredCar',
    'blue-artillery-howitzer': 'Artillery',
    'blue-antitank-gun_37mm': 'AntiTank',
    'blue-antitank-gun_pak_40': 'AntiTank',
    'blue-engineer-engineer': 'Engineer',
    'blue-transport-transport': 'Transport',
    
    // Legacy mappings (kept for backward compatibility)
    'blue-antitank-gun': 'AntiTank',
    'blue-engineer': 'Engineer',
    'blue-transport': 'Transport'
  };
  
  return idToTypeMap[armyId] || null;
};;;;

// Async version for loading map-specific units dynamically
export const getPlayerStartingUnitsAsync = async (mapId?: string): Promise<Unit[]> => {
  if (mapId) {
    try {
      // Use the new embedded availableUnits approach first
      const mapUnits = await getUnitsForMap(mapId);
      if (mapUnits.length > 0) {
        return mapUnits;
      }
    } catch (error) {
      console.log(`Map-specific config for ${mapId} not found, using fallback`);
    }
  }
  
  // Return the synchronous version as fallback
  return await getPlayerStartingUnits(mapId);
};;

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