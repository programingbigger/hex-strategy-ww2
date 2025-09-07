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
    id: 'short_case_map',
    name: 'ShortCase',
    description: 'ショートマップ',
    difficulty: 'Normal',
    deploymentCenter: { q: -4, r: -2 }
  },
    {
    id: 'large_map',
    name: 'Stage 2',
    description: 'Large Map x: -18_18 y: -6〜6',
    difficulty: 'Normal',
    deploymentCenter: { q: -4, r: -2 }
  }
];