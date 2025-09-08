export interface ReinforcementData {
  id: string;
  unitId: string;
  spawnTurn: number;
  spawnLocation: {
    x: number;
    y: number;
  };
  team: 'Red' | 'Blue';
  description: string;
}

export interface SpawnLocation {
  x: number;
  y: number;
  description: string;
  allowedTeam: 'Red' | 'Blue';
}

export interface ReinforcementConfig {
  mapId: string;
  description: string;
  reinforcements: ReinforcementData[];
  spawnLocations: SpawnLocation[];
}