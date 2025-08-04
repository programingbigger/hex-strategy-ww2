import { GameMap } from '../types';

export const availableMaps: GameMap[] = [
  {
    id: 'test_map_1',
    name: 'Diverse Terrain Test Map',
    description: 'Testing grounds featuring all terrain types - Capital, Port, Fortress, Desert, Snow, Sea coastline, and strategic locations.',
    difficulty: 'Normal',
    deploymentCenter: { q: -4, r: -2 }
  },
  {
    id: 'alpha_ver_stage',
    name: 'Stage 1',
    description: 'Advanced battlefield with varied terrain and strategic positions.',
    difficulty: 'Normal',
    deploymentCenter: { q: -4, r: -2 }
  }
];