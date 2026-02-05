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
  },
    {
    id: 'expanded_plains_map',
    name: 'Stage 3',
    description: 'テスト用largeマップ'
  },
  {
    id: 'vistula_offensive',
    name: 'ヴィスワ攻勢',
    description: '1939年秋、ヴィスワ川流域で繰り広げられる大規模な攻防戦。広大な平原での機甲部隊による電撃戦と、天然の要害である川の渡河を巡る死闘が展開される。戦略的な渡河地点の確保が勝利の鍵を握る。'
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