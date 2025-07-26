import { GameMap } from '../types';

export const availableMaps: GameMap[] = [
  {
    id: 'test_map_1',
    name: 'Test Map',
    description: 'First mission - Secure the battlefield and eliminate enemy forces.',
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