import { ReinforcementConfig, ReinforcementData } from '../types/reinforcements';

export const loadReinforcementConfig = async (mapId: string): Promise<ReinforcementConfig | null> => {
  try {
    const response = await fetch(`/data/reinforcements/${mapId}.json`);
    if (!response.ok) {
      console.warn(`Reinforcement config not found for map: ${mapId}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to load reinforcement config for ${mapId}:`, error);
    return null;
  }
};

export const getReinforcementsForTurn = (
  reinforcements: ReinforcementData[],
  turn: number
): ReinforcementData[] => {
  return reinforcements.filter(r => r.spawnTurn === turn);
};

export const getSpawnLocations = (reinforcements: ReinforcementData[]) => {
  return reinforcements.map(r => r.spawnLocation);
};

export const hasReinforcementAtLocation = (
  reinforcements: ReinforcementData[],
  x: number,
  y: number
): boolean => {
  return reinforcements.some(r => r.spawnLocation.x === x && r.spawnLocation.y === y);
};