import { MapData, BoardLayout } from '../types';
import { coordToString } from './map';

/**
 * Loads map data from JSON files
 */
export const loadMapData = async (mapId: string): Promise<MapData> => {
  try {
    const response = await fetch(`/data/maps/${mapId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load map ${mapId}: ${response.statusText}`);
    }
    const mapData: MapData = await response.json();
    return mapData;
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
}> => {
  const mapData = await loadMapData(mapId);
  const boardLayout = createBoardLayout(mapData);
  const deploymentCenter = mapData.deploymentCenter || { q: 0, r: 0 };
  
  return {
    mapData,
    boardLayout,
    deploymentCenter
  };
};