import { Team } from '../types';
import { loadMapData } from './mapLoader';

/**
 * Get deployment limit for a specific team from map data
 * Returns the maximum number of units that can be deployed by the team
 *
 * @param mapId Map ID to load deployment limits from
 * @param team Team to get deployment limit for ('Blue' or 'Red')
 * @returns Promise that resolves to deployment limit for the team, defaults to 10 if not specified
 */
export const getDeploymentLimit = async (mapId: string, team: Team): Promise<number> => {
  try {
    // Load map data to get deployment limits
    const mapData = await loadMapData(mapId);

    // Check if map has deployment limits defined
    if (mapData.deploymentLimits && mapData.deploymentLimits[team]) {
      const limit = mapData.deploymentLimits[team];
      if (typeof limit === 'number' && limit > 0) {
        return limit;
      }
    }
  } catch (error) {
    console.warn(`Failed to load deployment limits for map ${mapId}:`, error);
  }

  // Default fallback limit
  return 10;
};

/**
 * Get deployment limits for both teams
 *
 * @param mapId Map ID to load deployment limits from
 * @returns Promise that resolves to object with deployment limits for both teams
 */
export const getDeploymentLimits = async (mapId: string): Promise<{ Blue: number; Red: number }> => {
  try {
    const mapData = await loadMapData(mapId);

    if (mapData.deploymentLimits) {
      return {
        Blue: mapData.deploymentLimits.Blue ?? 10,
        Red: mapData.deploymentLimits.Red ?? 10
      };
    }
  } catch (error) {
    console.warn(`Failed to load deployment limits for map ${mapId}:`, error);
  }

  // Default fallback limits
  return {
    Blue: 10,
    Red: 10
  };
};