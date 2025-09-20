import { GameMap } from '../types';

export const availableMaps: GameMap[] = [
  {
    id: 'testdev_map',
    name: '開発用マップ',
    description: '開発者が色々と実験をするためのマップ。プレイ用ではない。'
  },
  {
    id: 'short_case_map',
    name: 'ショートケースマップ',
    description: 'プレイ用マップ。'
  },
    {
    id: 'large_map',
    name: 'Stage 1',
    description: 'Large Map x: -18_18 y: -6〜6'
  },
    {
    id: 'large_map_2',
    name: 'Stage 2',
    description: 'マップ第二弾'
  }
];

export const tutorialMaps: GameMap[] = [
  {
    id: 'tutorial_1',
    name: 'チュートリアル1',
    description: 'ユニットの基本移動操作と都市の占領'
  }
];