import { MapData, BoardLayout } from '../types';
import { coordToString } from './map';

/**
 * Loads map data from JSON files
 */
export const loadMapData = async (mapId: string): Promise<MapData> => {
  try {
    // Determine the correct directory based on map ID
    let mapPath: string;

    if (mapId.startsWith('tutorial_')) {
      // Tutorial maps are in /maps/tutorial/
      mapPath = `/maps/tutorial/${mapId}.json`;
    } else {
      // Scenario maps are in /maps/scenario/
      mapPath = `/maps/scenario/${mapId}.json`;
    }

    const response = await fetch(mapPath);
    if (!response.ok) {
      throw new Error(`Failed to load map ${mapId} from ${mapPath}: ${response.statusText}`);
    }
    const mapData = await response.json();

    if (!mapData) {
      throw new Error(`Map data not found for ${mapId}`);
    }

    console.log(`✅ Successfully loaded map: ${mapId} from ${mapPath}`);
    return mapData as MapData;
  } catch (error) {
    console.error('Error loading map data:', error);
    throw error;
  }
};

/**
 * Converts map data to BoardLayout format
 */
export const createBoardLayout = (mapData: MapData): BoardLayout => {
  const boardLayout = new Map();
  
  mapData.board.tiles.forEach(tile => {
    const key = coordToString({ x: tile.x, y: tile.y });
    boardLayout.set(key, tile);
  });
  
  return boardLayout;
};

/**
 * Loads complete game map with board layout and deployment center
 */
export const loadCompleteMap = async (mapId: string): Promise<{
  mapData: MapData;
  boardLayout: BoardLayout;
  deploymentCenter: { q: number; r: number };
  initialCameraPosition?: { x: number; y: number };
}> => {
  const mapData = await loadMapData(mapId);
  const boardLayout = createBoardLayout(mapData);
  const deploymentCenter = mapData.deploymentCenter || { q: 0, r: 0 };
  
  return {
    mapData,
    boardLayout,
    deploymentCenter,
    initialCameraPosition: mapData.initialCameraPosition
  };
};;