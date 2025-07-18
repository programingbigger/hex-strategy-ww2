# types/index - 型定義システム

## 概要
TypeScriptによる型安全性を確保するための型定義ファイルです。ゲーム内で使用される全てのデータ構造、インターフェース、列挙型を定義し、開発効率と品質向上を支援します。

## ファイル場所
`/Commander/src/types/index.ts`

## 主要型定義

### 基本ゲーム型
```typescript
// 座標システム
export interface Position {
  x: number;
  y: number;
}

// ゲーム状態
export type GameState = 
  | 'title' 
  | 'home' 
  | 'scenario-select' 
  | 'battle-prep' 
  | 'deployment' 
  | 'battle' 
  | 'result';

// プレイヤー/チーム
export type Team = 'blue' | 'red';

// ターンフェーズ
export type TurnPhase = 
  | 'player-turn' 
  | 'enemy-turn' 
  | 'turn-end';
```

### ユニット型定義
```typescript
// ユニットタイプ
export type UnitType = 
  | 'Infantry' 
  | 'Tank' 
  | 'Artillery' 
  | 'ArmoredCar' 
  | 'AntiTank';

// ユニット詳細情報
export interface Unit {
  id: string;
  type: UnitType;
  team: Team;
  position: Position;
  hp: number;
  maxHp: number;
  fuel: number;
  maxFuel: number;
  experience: number;
  hasActed: boolean;
  isDestroyed: boolean;
}

// ユニット能力値
export interface UnitStats {
  hp: number;
  attack: number;
  defense: number;
  movement: number;
  range: number | [number, number]; // 射程（最小-最大）
  fuel: number;
  cost: number;
  specialAbilities?: string[];
}
```

### 地形・マップ型
```typescript
// 地形タイプ
export type TerrainType = 
  | 'Plains' 
  | 'Forest' 
  | 'Mountain' 
  | 'River' 
  | 'Road' 
  | 'Bridge' 
  | 'City' 
  | 'Mud';

// タイル情報
export interface Tile {
  position: Position;
  terrain: TerrainType;
  unit?: Unit;
  isOccupied: boolean;
  owner?: Team;
  cityHp?: number; // 都市の場合のHP
}

// ボード全体
export interface Board {
  width: number;
  height: number;
  tiles: Tile[][];
  cities: CityInfo[];
}

// 都市情報
export interface CityInfo {
  position: Position;
  owner: Team | null;
  hp: number;
  maxHp: number;
  income: number;
  isCapital: boolean;
}
```

### 戦闘・アクション型
```typescript
// アクションタイプ
export type ActionType = 
  | 'move' 
  | 'attack' 
  | 'wait' 
  | 'capture';

// アクション詳細
export interface GameAction {
  type: ActionType;
  unitId: string;
  source: Position;
  target: Position;
  timestamp: number;
}

// 戦闘結果
export interface CombatResult {
  attackerId: string;
  defenderId: string;
  attackerDamage: number;
  defenderDamage: number;
  attackerDestroyed: boolean;
  defenderDestroyed: boolean;
  experienceGained: number;
  isCritical: boolean;
}

// 移動結果
export interface MovementResult {
  unitId: string;
  fromPosition: Position;
  toPosition: Position;
  fuelConsumed: number;
  isValid: boolean;
  path: Position[];
}
```

### 天候・環境型
```typescript
// 天候タイプ
export type WeatherType = 
  | 'Clear' 
  | 'Rain' 
  | 'HeavyRain' 
  | 'Snow';

// 天候効果
export interface WeatherEffect {
  type: WeatherType;
  movementModifier: number;
  visibilityRange: number;
  terrainChanges: Record<TerrainType, TerrainType>;
  combatModifier?: number;
  duration: number;
}

// ゲーム環境状態
export interface GameEnvironment {
  weather: WeatherType;
  turn: number;
  maxTurns: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}
```

### UI・表示型
```typescript
// 画面サイズ・表示設定
export interface ViewSettings {
  zoomLevel: number;
  centerPosition: Position;
  showGrid: boolean;
  showCoordinates: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
}

// 選択状態
export interface SelectionState {
  selectedTile: Position | null;
  selectedUnit: Unit | null;
  reachableTiles: Position[];
  attackableTiles: Position[];
  hoveredTile: Position | null;
}

// ゲーム表示状態
export interface GameDisplay {
  view: ViewSettings;
  selection: SelectionState;
  showInfoPanel: boolean;
  showMiniMap: boolean;
  uiMode: 'normal' | 'deployment' | 'battle' | 'result';
}
```

### セーブ・ロード型
```typescript
// セーブデータ
export interface SaveData {
  id: string;
  name: string;
  timestamp: number;
  gameState: GameState;
  board: Board;
  units: Unit[];
  environment: GameEnvironment;
  playerStats: PlayerStats;
  version: string;
}

// プレイヤー統計
export interface PlayerStats {
  unitsDestroyed: number;
  unitsLost: number;
  citiesCaptured: number;
  turnsPlayed: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
}
```

### AI・敵思考型
```typescript
// AI難易度
export type AIDifficulty = 
  | 'easy' 
  | 'normal' 
  | 'hard' 
  | 'expert';

// AI行動評価
export interface AIEvaluation {
  unitId: string;
  action: GameAction;
  priority: number;
  expectedValue: number;
  risk: number;
  reasoning: string;
}

// AI戦略
export type AIStrategy = 
  | 'aggressive' 
  | 'defensive' 
  | 'balanced' 
  | 'economic';
```

## ゲームへの影響とポイント

### 型安全性の確保
- **コンパイル時エラー**: 不正なデータアクセスを事前に検出
- **リファクタリング支援**: 型定義変更時の影響範囲の明確化
- **開発効率**: IDEによる自動補完とエラー検出

### コード品質向上
- **一貫性**: プロジェクト全体での統一されたデータ構造
- **可読性**: 型注釈による意図の明確化
- **保守性**: 型定義による仕様書的役割

### 拡張性確保
- **新機能追加**: 型定義の拡張による機能追加支援
- **API設計**: 外部連携時の型定義による仕様明確化
- **テスト**: 型安全なテストコードの作成

## 設計原則

### 型の命名規則
- **Interface**: PascalCase（例：`GameState`, `UnitInfo`）
- **Type Union**: PascalCase（例：`TerrainType`, `ActionType`）
- **Generic**: 1文字大文字（例：`T`, `K`, `V`）

### 構造設計
- **継承**: 基本型からの拡張による階層構造
- **組み合わせ**: 小さな型の組み合わせによる複合型
- **オプション**: 必須/オプション要素の明確な区別

### パフォーマンス考慮
- **軽量型**: 不要なプロパティの除外
- **遅延評価**: 重い計算を含む型の最適化
- **メモリ効率**: 参照型と値型の適切な使い分け

## 依存関係
- 全ゲームコンポーネント - 型定義の参照
- [[constants]] - 定数値の型注釈
- [[useGameLogic]] - ゲームロジックの型安全性

## 関連ツール
- **TypeScript Compiler**: 型チェックとコンパイル
- **ESLint**: TypeScript用の静的解析
- **Prettier**: コードフォーマット

## バージョン管理
```typescript
export const TYPE_VERSION = '1.0.0';

// 型定義の後方互換性
export interface LegacyUnit {
  // 旧バージョンとの互換性維持
}
```

## タグ
#types #TypeScript #DataStructure #TypeSafety #API #Interface #Development