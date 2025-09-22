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
    description: '・ユニットの基本移動操作\n・都市の占領\n・ユニットの生産'
  },
  {
    id: 'tutorial_2',
    name: 'チュートリアル2',
    description: '・ユニットへの攻撃\n・ユニット特性'
  },
  {
    id: 'tutorial_3',
    name: 'チュートリアル3',
    description: '・ユニットの輸送\n・複数の首都占領'
  },
    {
    id: 'tutorial_4',
    name: 'チュートリアル4',
    description: '・工作車の使い方を学ぶ'
  },
    {
    id: 'tutorial_5',
    name: 'チュートリアル5',
    description: '・Zocの概念'
  },
    {
    id: 'tutorial_6',
    name: 'チュートリアル6',
    description: '・総合演習'
  }
];