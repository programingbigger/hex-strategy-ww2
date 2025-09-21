import armyOrganizationData from '../data/armyOrganization.json';

/**
 * Utility functions for retrieving unit-specific names from army organization data
 */

export interface ArmyOrganization {
  factions: {
    [factionKey: string]: {
      name: string;
      description: string;
      branches: {
        [branchKey: string]: {
          name: string;
          unitCategories: {
            [categoryKey: string]: {
              name: string;
              units: Array<{
                id: string;
                name: string;
                type: string;
                faction: string;
                branch: string;
                category: string;
                [key: string]: any;
              }>;
            };
          };
        };
      };
    };
  };
}

/**
 * Cache for unit names to avoid repeated searches
 */
const unitNameCache = new Map<string, string>();

/**
 * Extract the base unit ID from a unit instance ID with numbering
 * @param instanceId - The unit instance ID (e.g., "blue-infantry-standard-1758359257841" or "blue-tank-panzer_3-123")
 * @returns The base unit ID (e.g., "blue-infantry-standard" or "blue-tank-panzer_3")
 */
export function extractBaseUnitId(instanceId: string): string {
  // Split by hyphens
  const parts = instanceId.split('-');
  
  // Find the last non-numeric part and keep everything up to that point
  let lastNonNumericIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (!/^\d+$/.test(parts[i])) {
      lastNonNumericIndex = i;
      break;
    }
  }

  if (lastNonNumericIndex >= 0) {
    // Return everything from start to last non-numeric part (inclusive)
    return parts.slice(0, lastNonNumericIndex + 1).join('-');
  }

  // If all parts are numeric (shouldn't happen), return original
  return instanceId;
}

/**
 * Retrieve the specific unit name from armyOrganization.json based on unit ID
 * @param unitId - The unique unit ID (e.g., "blue-infantry-standard-1" or "blue-infantry-standard")
 * @returns The specific unit name or fallback to unit type/id
 */
export function getUnitNameById(unitId: string): string {
  // Extract base ID (remove numbering if present)
  const baseId = extractBaseUnitId(unitId);

  // Check cache first
  if (unitNameCache.has(baseId)) {
    return unitNameCache.get(baseId)!;
  }

  // Ensure armyOrganizationData is properly loaded
  if (!armyOrganizationData || typeof armyOrganizationData !== 'object') {
    console.error(`❌ [getUnitNameById] armyOrganizationData not loaded for ID: "${unitId}"`);
    return baseId;
  }

  const armyData = armyOrganizationData as ArmyOrganization;

  // Validate the structure
  if (!armyData.factions || typeof armyData.factions !== 'object') {
    console.error(`❌ [getUnitNameById] Invalid armyData structure for ID: "${unitId}"`);
    return baseId;
  }

  try {
    // Search through all factions, branches, and categories
    for (const [factionKey, faction] of Object.entries(armyData.factions)) {
      if (!faction || !faction.branches) continue;
      
      for (const [branchKey, branch] of Object.entries(faction.branches)) {
        if (!branch || !branch.unitCategories) continue;
        
        for (const [categoryKey, category] of Object.entries(branch.unitCategories)) {
          if (!category || !Array.isArray(category.units)) continue;
          
          // Find the unit with matching base ID
          const unit = category.units.find(u => u && u.id === baseId);
          if (unit && unit.name) {
            // Cache the result and return the specific name
            unitNameCache.set(baseId, unit.name);
            return unit.name;
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error retrieving unit name for ID "${unitId}" (base: "${baseId}"):`, error);
  }

  // Fallback: return the base unit ID if not found
  console.warn(`⚠️ Unit name not found for ID "${unitId}" (base: "${baseId}"), using base ID as fallback`);
  return baseId;
}

/**
 * Get unit information including name, type, faction, etc. by unit ID
 * @param unitId - The unique unit ID
 * @returns Complete unit information or null if not found
 */
export function getUnitInfoById(unitId: string) {
  const armyData = armyOrganizationData as ArmyOrganization;

  try {
    for (const [factionKey, faction] of Object.entries(armyData.factions)) {
      for (const [branchKey, branch] of Object.entries(faction.branches)) {
        for (const [categoryKey, category] of Object.entries(branch.unitCategories)) {
          const unit = category.units.find(u => u.id === unitId);
          if (unit) {
            return {
              ...unit,
              factionName: faction.name,
              branchName: branch.name,
              categoryName: category.name
            };
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error retrieving unit info for ID "${unitId}":`, error);
  }

  return null;
}

/**
 * Clear the unit name cache (useful for testing or when army organization data changes)
 */
export function clearUnitNameCache(): void {
  unitNameCache.clear();
}

/**
 * Get all available unit IDs from the army organization data
 * @param faction - Optional faction filter ("Blue" or "Red")
 * @returns Array of unit IDs
 */
export function getAllUnitIds(faction?: string): string[] {
  const armyData = armyOrganizationData as ArmyOrganization;
  const unitIds: string[] = [];

  try {
    for (const [factionKey, factionData] of Object.entries(armyData.factions)) {
      // Skip if faction filter is specified and doesn't match
      if (faction && factionKey !== faction) {
        continue;
      }

      for (const [branchKey, branch] of Object.entries(factionData.branches)) {
        for (const [categoryKey, category] of Object.entries(branch.unitCategories)) {
          for (const unit of category.units) {
            unitIds.push(unit.id);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error retrieving unit IDs:', error);
  }

  return unitIds;
}