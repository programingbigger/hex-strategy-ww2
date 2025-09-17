import { GameMap } from '../types';

export const availableMaps: GameMap[] = [
  {
    id: 'test_map_1',
    name: 'Diverse Terrain Test Map',
    description: 'Testing grounds featuring all terrain types - Capital, Port, Fortress, Desert, Snow, Sea coastline, and strategic locations.'
  },
  {
    id: 'short_case_map',
    name: 'ShortCase',
    description: 'ショートマップ'
  },
    {
    id: 'large_map',
    name: 'Stage 2',
    description: 'Large Map x: -18_18 y: -6〜6'
  },
    {
    id: 'large_map_2',
    name: 'Stage 3',
    description: 'マップ第二弾'
  }
];

export const tutorialMaps: GameMap[] = [
  {
    id: 'tutorial_1',
    name: 'チュートリアル: 基本操作',
    description: '基本的な移動、攻撃、地形効果を学習する初心者向けマップです。'
  }
];