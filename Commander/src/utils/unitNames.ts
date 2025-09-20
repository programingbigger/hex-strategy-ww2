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
 * @param instanceId - The unit instance ID (e.g., "blue-infantry-standard-1")
 * @returns The base unit ID (e.g., "blue-infantry-standard")
 */
export function extractBaseUnitId(instanceId: string): string {
  // Pattern: {base-id}-{number} -> extract {base-id}
  const lastDashIndex = instanceId.lastIndexOf('-');
  if (lastDashIndex !== -1) {
    const afterLastDash = instanceId.substring(lastDashIndex + 1);
    // Check if the part after the last dash is a number
    if (/^\d+$/.test(afterLastDash)) {
      return instanceId.substring(0, lastDashIndex);
    }
  }
  // If no number pattern found, return the original ID
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

  const armyData = armyOrganizationData as ArmyOrganization;

  try {
    // Search through all factions, branches, and categories
    for (const [factionKey, faction] of Object.entries(armyData.factions)) {
      for (const [branchKey, branch] of Object.entries(faction.branches)) {
        for (const [categoryKey, category] of Object.entries(branch.unitCategories)) {
          // Find the unit with matching base ID
          const unit = category.units.find(u => u.id === baseId);
          if (unit) {
            // Cache the result and return the specific name
            unitNameCache.set(baseId, unit.name);
            return unit.name;
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error retrieving unit name for ID "${unitId}" (base: "${baseId}"):`, error);
  }

  // Fallback: return the base unit ID if not found
  console.warn(`Unit name not found for ID "${unitId}" (base: "${baseId}"), using base ID as fallback`);
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