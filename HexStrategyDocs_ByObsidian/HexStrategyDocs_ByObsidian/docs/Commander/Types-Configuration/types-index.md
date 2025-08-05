# types/index - 型定義システム

## 概要
TypeScriptによる型安全性を確保するための型定義ファイルです。ゲーム内で使用される全てのデータ構造、インターフェース、列挙型を定義し、開発効率と品質向上を支援します。地形システムを含む包括的な型安全性を提供します。

## ファイル場所
`/Commander/src/types/index.ts`

## 主要型定義

### 基本ゲーム型
```typescript
// 座標システム
export interface Coordinate {
  x: number;
  y: number;
}

// ゲーム画面状態
export type GameScreen = 
  | 'title' 
  | 'home' 
  | 'scenario-select' 
  | 'battle-prep' 
  | 'deployment' 
  | 'battle' 
  | 'result';

// プレイヤー/チーム/派閥
export type Team = 'Blue' | 'Red';
export type Faction = 'Blue' | 'Red';
export type MilitaryBranch = '陸' | '海' | '空';
```

### ユニット型定義
```typescript
// ユニットタイプ
export type UnitType = 
  | 'Infantry' 
  | 'Tank' 
  | 'ArmoredCar'
  | 'Artillery' 
  | 'AntiTank';

// ユニットクラス（地形制限判定用）
export type UnitClass = 'Infantry' | 'Vehicle';

// ユニットカテゴリ
export type UnitCategory = 
  | 'infantry' | 'armor' | 'artillery' | 'antitank' 
  | 'destroyer' | 'cruiser' | 'battleship' 
  | 'fighter' | 'bomber' | 'transport';

// ユニット詳細情報
export interface Unit {
  id: string;
  type: UnitType;
  team: Team;
  faction?: Faction;
  branch?: MilitaryBranch;
  category?: UnitCategory;
  name?: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  movement: number;
  attackRange: { min: number; max: number };
  x: number;
  y: number;
  moved: boolean;
  attacked: boolean;
  canCounterAttack: boolean;
  unitClass: UnitClass;
  fuel: number;
  maxFuel: number;
  xp: number;
  attackVs?: { [key in UnitClass]?: number };
  defenseVs?: { [key in UnitClass]?: number };
  weapons: Weapon[];
}

// ユニット能力値
export interface UnitStats {
  maxHp: number;
  attack: number;
  defense: number;
  movement: number;
  attackRange: { min: number; max: number };
  canCounterAttack: boolean;
  unitClass: UnitClass;
  maxFuel: number;
  attackVs?: { [key in UnitClass]?: number };
  defenseVs?: { [key in UnitClass]?: number };
  isArtillery?: boolean;
}
```

### 武器システム型
```typescript
// 武器タイプ（派閥別）
export type WeaponType = 
  | '37mm主砲' | '36MG機銃' | '9mmライフル' | '105mm野砲'  // Legacy weapons
  | '50mm主砲' | '30cal機銃' | '57mm対戦車砲' | 'M1ライフル' | '155mm榴弾砲' | 'BAR機銃'  // Blue faction
  | '7.7mm機銃' | '47mm対戦車砲' | '6.5mmライフル' | '99式軽機銃';  // Red faction

// 武器詳細
export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  ammunition: number;
  maxAmmunition: number;
  range: { min: number; max: number };
  attack: number;
  effectiveness?: { [key in UnitClass]?: number };
}
```

### 地形・マップ型
```typescript
// 地形タイプ（17種類）
export type TerrainType = 
  | 'Plains'    // 平原
  | 'Forest'    // 森林
  | 'Mountain'  // 山岳
  | 'River'     // 河川
  | 'Road'      // 道路
  | 'Bridge'    // 橋梁
  | 'City'      // 都市
  | 'Mud'       // 泥濘
  | 'Sea'       // 海洋
  | 'Capital'   // 首都
  | 'Airport'   // 飛行場
  | 'Bocage'    // 生垣地
  | 'Snow'      // 雪原
  | 'Desert'    // 砂漠
  | 'Reef'      // 岩礁
  | 'Fortress'  // 要塞
  | 'Port';     // 港

// タイル情報
export interface Tile {
  x: number;
  y: number;
  terrain: TerrainType;
  owner?: Team;
  hp?: number;        // 都市・要塞等のHP
  maxHp?: number;
}

// 地形効果統計
export interface TerrainStats {
  defenseBonus: number;
  attackBonus: number;
  movementCost: { [key: string]: number; default: number };
}

// ボード全体
export type BoardLayout = Map<string, Tile>;
```

### 戦闘・アクション型
```typescript
// 戦闘結果
export interface BattleReport {
  attacker: Unit;
  defender: Unit;
  damage: number;
  counterDamage?: number;
  report: string;
  weaponUsed?: Weapon;
  counterWeaponUsed?: Weapon;
}

// 移動結果
export interface MovementResult {
  unitId: string;
  fromPosition: Coordinate;
  toPosition: Coordinate;
  fuelConsumed: number;
  isValid: boolean;
  path: Coordinate[];
}
```

### 天候・環境型
```typescript
// 天候タイプ
export type WeatherType = 
  | 'Clear'     // 晴天
  | 'Rain'      // 雨
  | 'HeavyRain' // 大雨
  | 'Snow'      // 雪
  | 'Fog';      // 霧

// 天候効果（地形変化を含む）
export interface WeatherEffect {
  type: WeatherType;
  movementModifier: number;
  visibilityRange: number;
  terrainChanges: Partial<Record<TerrainType, TerrainType>>; // 平原→泥濘など
  combatModifier?: number;
  duration: number;
}
```

### ゲーム状態型
```typescript
// ゲーム状態
export interface GameState {
  currentScreen: GameScreen;
  selectedMap?: GameMap;
  units: Unit[];
  board: BoardLayout;
  activeTeam: Team;
  turn: number;
  winner?: Team;
  gameState?: 'playing' | 'gameOver';
  weather?: WeatherType;
  weatherDuration?: number;
  battlePrep?: BattlePrepState;
}

// ゲーム状態スナップショット
export interface GameStateSnapshot {
  units: Unit[];
  turn: number;
  activeTeam: Team;
  selectedUnitId: string | null;
}

// 戦闘準備状態
export interface BattlePrepState {
  selectedUnits: Unit[];
  deployedUnits: Map<string, { x: number; y: number }>;
  victoryConditions: string[];
}
```

### マップ・シナリオ型
```typescript
// ゲームマップ
export interface GameMap {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  thumbnail?: string;
  deploymentCenter?: { q: number; r: number };
}

// マップデータ
export interface MapData {
  gameStatus: {
    gameState: string;
    turn: number;
    activeTeam: Team;
    winner: Team | null;
    weather: WeatherType;
    weatherDuration: number;
  };
  board: {
    tiles: Tile[];
  };
  units: Unit[];
  deploymentCenter?: { q: number; r: number };
}

// 配置座標
export interface DeploymentCoordinate {
  q: number;
  r: number;
}
```

### 軍編成システム型
```typescript
// 軍隊ユニットテンプレート
export interface ArmyUnitTemplate {
  id: string;
  name: string;
  type: UnitType;
  faction: Faction;
  branch: MilitaryBranch;
  category: UnitCategory;
  stats: UnitStats;
  weapons: Weapon[];
}

// ユニットカテゴリデータ
export interface UnitCategoryData {
  name: string;
  units: ArmyUnitTemplate[];
}

// 軍種データ
export interface MilitaryBranchData {
  name: string;
  unitCategories: Record<string, UnitCategoryData>;
}

// 派閥データ
export interface FactionData {
  name: string;
  description: string;
  branches: Record<MilitaryBranch, MilitaryBranchData>;
}

// 指揮構造
export interface CommandStructure {
  hierarchy: string[];
  bonuses: {
    [key: string]: {
      attack?: number;
      defense?: number;
      範囲?: number;
      効果?: number;
    };
  };
}

// 軍編成システム
export interface ArmyOrganization {
  metadata: {
    version: string;
    description: string;
    lastUpdated: string;
  };
  factions: Record<Faction, FactionData>;
  commandStructure: CommandStructure;
}
```

### 戦果・結果型
```typescript
// 戦闘結果
export interface BattleResult {
  winner: Team;
  turnsToWin: number;
  unitsLost: number;
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

## ゲームへの影響とポイント

### 地形システムの型安全性
- **TerrainType**: 17種類の地形を型安全に管理
- **TerrainStats**: 地形効果の一貫した適用
- **移動制限**: UnitClassによる地形通行可否の型チェック
- **戦闘修正**: 地形ボーナスの自動適用とバリデーション

### 武器システムの型安全性
- **派閥別武器**: WeaponTypeによる派閥固有武器の管理
- **射程管理**: 武器ごとの攻撃範囲の型安全な処理
- **弾薬管理**: ammunition/maxAmmunitionによる弾薬制限

### ユニット階層の型管理
- **兵種分類**: UnitType → UnitClass → UnitCategoryの階層管理
- **派閥システム**: Faction → MilitaryBranch → UnitCategoryの組織構造
- **能力継承**: 基本能力と派閥固有能力の型安全な組み合わせ

### 型安全性の確保
- **コンパイル時エラー**: 不正なデータアクセスを事前に検出
- **リファクタリング支援**: 型定義変更時の影響範囲の明確化
- **開発効率**: IDEによる自動補完とエラー検出

### コード品質向上
- **一貫性**: プロジェクト全体での統一されたデータ構造
- **可読性**: 型注釈による意図の明確化
- **保守性**: 型定義による仕様書的役割

## 設計原則

### 型の命名規則
- **Interface**: PascalCase（例：`GameState`, `UnitStats`）
- **Type Union**: PascalCase（例：`TerrainType`, `WeaponType`）
- **Generic**: 1文字大文字（例：`T`, `K`, `V`）

### 地形システム設計原則
- **拡張性**: 新地形タイプの追加が容易
- **一貫性**: 全地形で統一されたプロパティ構造
- **型安全性**: 存在しない地形タイプの参照を防止

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
- [[constants]] - 定数値の型注釈（TERRAIN_STATSなど）
- [[useGameLogic]] - ゲームロジックの型安全性
- [[terrain-types]] - 地形仕様の型対応

## 関連ツール
- **TypeScript Compiler**: 型チェックとコンパイル
- **ESLint**: TypeScript用の静的解析
- **Prettier**: コードフォーマット

## バージョン管理
```typescript
export const TYPE_VERSION = '2.0.0'; // 地形システム統合対応

// 型定義の後方互換性
export interface LegacyUnit {
  // 旧バージョンとの互換性維持
}
```

## 関連ファイル
- [[constants]] - 型定義に対応する定数値
- [[terrain-types]] - 地形タイプの詳細仕様
- [[useGameLogic]] - 型安全なゲームロジック実装
- [[Utils-Helpers]] - 型安全なユーティリティ関数

## タグ
#types #TypeScript #DataStructure #TypeSafety #API #Interface #Development #Terrain #WeaponSystem
EOF < /dev/null