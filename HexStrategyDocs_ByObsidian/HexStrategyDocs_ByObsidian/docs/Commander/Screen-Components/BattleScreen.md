# BattleScreen - 戦闘画面

## 概要
ヘックス戦略ゲームのメイン戦闘画面です。ゲームボード、情報パネル、ヘッダーを統合し、プレイヤーが実際にゲームをプレイする中核画面として機能します。

## ファイル場所
`/Commander/src/screens/BattleScreen.tsx`

## 主要機能

### 画面構成
- **ヘッダー部**: ターン情報、天候、勝利条件の表示
- **メインエリア**: ゲームボードとユニット配置
- **サイドパネル**: 選択ユニット/タイルの詳細情報
- **アクションバー**: 可能な行動の選択UI

### ゲーム操作
- **ユニット選択**: ボード上のユニットクリックで選択
- **移動指示**: 移動可能範囲内のタイルクリックで移動実行  
- **攻撃指示**: 攻撃可能な敵ユニットクリックで攻撃実行
- **ターン終了**: プレイヤーターンの手動終了

### 状態表示
- **ターン表示**: 現在のターン数とプレイヤー
- **天候表示**: 現在の天候とその効果
- **勝利条件**: 残り必要条件の表示

## 実装予定機能（開発計画より）

### 高優先度機能

#### ZOCシステムの修復
```typescript
// Zone of Control の実装
interface ZOCEffect {
  controllingUnit: Unit;
  affectedHexes: Position[];
  movementRestriction: boolean;
}

const calculateZOC = (units: Unit[]): Map<string, ZOCEffect> => {
  // ZOC計算ロジックの実装
};
```

#### ユニット武装システムの充実化
```typescript
interface WeaponSystem {
  primary: Weapon;
  secondary?: Weapon;
  special?: Weapon[];
}

interface Unit {
  // 既存のプロパティ...
  weapons: WeaponSystem;
  ammunition: number;
  fuelLevel: number;
}
```

#### ユニット補給システムの修正
- 都市占領時のHP強制回復問題を解決
- 補給線の概念導入
- 燃料・弾薬管理システム

### 中優先度機能

#### ユニット進化システム
```typescript
interface UnitExperience {
  currentExp: number;
  level: number;
  promotionThreshold: number;
}

const handleCityOccupation = (unit: Unit, city: City) => {
  // 都市占領時の経験値獲得と進化判定
  if (unit.experience.currentExp >= unit.experience.promotionThreshold) {
    promoteUnit(unit);
  }
};
```

#### 新ユニットタイプ
- **工作車**: 都市のHP向上機能
- **輸送ユニット**: 歩兵の迅速移動
- **飛行ユニット**: ZOCの影響を受けない移動
  - 戦闘機、攻撃機、爆撃機、輸送機
- **海軍ユニット**: 海上戦闘用（将来実装）

#### ユニット生産システム
```typescript
interface ProductionCenter {
  position: Position;
  type: 'Capital' | 'Factory' | 'Airfield' | 'Port';
  productionRange: number; // 生産可能範囲（首都から5マス以内）
  availableUnits: UnitType[];
}
```

### 勝利条件の多様化

#### 複数首都占領
```typescript
interface Capital {
  id: number;
  position: Position;
  isOccupied: boolean;
  occupyingPlayer?: Player;
  productionRadius: number;
}

const checkCapitalVictory = (capitals: Capital[]): boolean => {
  // 全首都占領の確認
};
```

#### その他の勝利条件
- **全滅勝利**: 敵ユニットの完全殲滅
- **時間制限勝利**: ターン制限による攻守判定

### 天候システムの拡張

#### 新天候タイプ
```typescript
type WeatherType = 'Clear' | 'Rain' | 'HeavyRain' | 'Fog' | 'Snow' | 'Sandstorm';

interface WeatherEffect {
  visibility: number;        // 視界への影響
  movementModifier: number;  // 移動コストへの影響  
  accuracyModifier: number;  // 命中率への影響
  backgroundEffect: string;  // 背景表示の変更
}
```

#### 天候による戦術変化
- **霧**: 視界制限、奇襲戦術の有効化
- **雪**: 移動コスト増加、防御ボーナス
- **砂嵐**: 全体的な命中率低下

### 低優先度機能

#### 索敵システム
```typescript
interface ReconnaissanceSystem {
  visibilityMap: Map<string, boolean>;
  fogOfWar: boolean;
  scoutingUnits: Unit[];
}
```

#### マップ多様化
- **地形種類の追加**: ぽかージュ、砂漠、海、岩礁、要塞
- **補給拠点**: 港、空港の概念

## Props（引数）

```typescript
interface BattleScreenProps {
  gameData: GameData;           // ゲーム初期データ
  onGameEnd: (result: GameResult) => void;  // ゲーム終了時の処理
  onPause: () => void;          // ポーズ機能
  onSave: (saveData: SaveData) => void;     // セーブ機能
}
```

## 画面レイアウト

```
┌─────────────────────────────────────────┐
│ Header: Turn 5 | Weather: Fog | Blue    │
├─────────────────────┬───────────────────┤
│                     │ Information Panel │
│    Game Board       │ ┌─────────────────┤
│   (Hex Grid)        │ │ Selected Unit   │
│                     │ │ HP: 8/10        │
│                     │ │ Attack: 4       │
│                     │ │ Defense: 2      │
│                     │ │ Exp: 15/50      │
│                     │ │ Fuel: 80/100    │
│                     │ │                 │
│                     │ │ Actions:        │
│                     │ │ [Move][Attack]  │
│                     │ │ [Supply][Scout] │
├─────────────────────┴───────────────────┤
│ Action Bar: [End Turn] [Menu] [Save]    │
└─────────────────────────────────────────┘
```

## ゲームフロー制御

### ターン管理
```typescript
const handleTurnEnd = () => {
  // 1. プレイヤーターン終了処理
  // 2. 補給フェーズ（燃料・弾薬の消費）
  // 3. 天候変化の判定
  // 4. 敵AIターン実行
  // 5. 経験値・レベルアップ処理
  // 6. 勝利条件チェック
  // 7. 次ターン開始
}
```

### 拡張された勝利判定
```typescript
const checkVictoryConditions = (): VictoryResult => {
  // 1. 首都占領チェック
  if (allCapitalsOccupied()) return 'CapitalVictory';
  
  // 2. 全滅チェック
  if (noEnemyUnitsRemaining()) return 'AnnihilationVictory';
  
  // 3. ターン制限チェック
  if (turnLimitReached()) return 'TimeVictory';
  
  return 'Ongoing';
}
```

## ユーザーインタラクション

### 拡張された操作シーケンス
1. **ユニット選択**: 自軍ユニットをクリック
2. **行動選択**: 移動/攻撃/補給/特殊能力の選択
3. **対象選択**: 移動先/攻撃対象/補給対象の指定
4. **ZOC確認**: 移動経路のZOC制約チェック
5. **実行確認**: アクションの確定と結果予測表示
6. **結果表示**: 戦闘結果、経験値獲得、レベルアップの表示

### 拡張されたキーボードショートカット
- **スペース**: ターン終了
- **Esc**: 選択解除
- **Tab**: 次のユニット選択
- **Shift+Tab**: 前のユニット選択
- **Ctrl+S**: ゲーム保存
- **Ctrl+L**: ゲーム読み込み
- **R**: ユニット補給
- **S**: 索敵行動

## パフォーマンス最適化

### レンダリング最適化
```typescript
// 大規模マップでのレンダリング最適化
const useViewportCulling = (mapSize: number, viewportSize: ViewportRect) => {
  return useMemo(() => {
    // 視界内のヘックスのみを描画対象とする
  }, [mapSize, viewportSize]);
};
```

### メモリ管理
- ユニット数増加に対応したメモリ効率化
- 大規模戦闘での状態管理最適化

## エラーハンドリング

### 新規エラーケース
- **ZOC違反**: 不正な移動経路の検出と修正
- **補給切れ**: 燃料・弾薬不足時の行動制限
- **天候制約**: 天候による行動不可の通知

## 依存関係
- [[GameBoard]] - メインゲーム表示エリア
- [[InformationPanel]] - 詳細情報表示（経験値、燃料表示を追加）
- [[Header]] - ゲーム状況表示（天候表示の拡張）
- [[useGameLogic]] - ゲームロジック処理（ZOC、補給、進化システム）
- [[BattleReportModal]] - 戦闘結果詳細表示（経験値獲得表示）
- [[RainEffect]] - 天候エフェクト（新天候タイプ対応）

## 関連画面
- [[UnitDeploymentScreen]] - 戦闘前のユニット配置
- [[ResultScreen]] - 戦闘終了後の結果表示
- [[BattlePrepScreen]] - 戦闘準備画面

## 関連ドキュメント
- [[開発計画・実装リスト]] - 実装予定機能の詳細
- [[UI改善計画]] - UI/UX改善項目
- [[useGameLogic]] - 拡張されるゲームロジック

## タグ
#BattleScreen #MainGame #UI #TacticalGameplay #UserInterface #GameFlow #ZOC #SupplySystem #UnitEvolution #WeatherSystem
EOF < /dev/null