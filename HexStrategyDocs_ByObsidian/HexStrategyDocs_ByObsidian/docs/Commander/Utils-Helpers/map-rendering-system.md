# Map Rendering System - マップ描画システム

## 概要
Commander配下のマップ描画システムは、**統一されたマップ管理アーキテクチャ**により、Deployment PhaseとBattle Phaseの両方で同一のマップデータを使用する包括的なシステムです。選択されたマップが全フェーズを通じて一貫して使用され、ユニットの配置状態も完全に引き継がれます。

## 🎯 システムの目的
- **マップ統一管理**: 両フェーズで同じマップデータを共有
- **状態引き継ぎ**: Deployment Phaseの配置→Battle Phaseへシームレス移行
- **柔軟なマップ選択**: 複数マップからの動的選択機能
- **開発者フレンドリー**: 新マップの簡単な追加・管理

## ファイル場所
`/Commander/src/`配下の複数ファイル

## 🏗️ 統一マップ管理システムの全体フロー

### 1. マップ選択・登録フェーズ

#### マップ定義ファイル
**ファイル場所**: `/Commander/src/data/maps.ts`
**機能**: 利用可能なマップの一元管理

```typescript
export const availableMaps: GameMap[] = [
  {
    id: 'test_map_1',
    name: 'Test Map 1',
    description: 'First mission - Secure the battlefield and eliminate enemy forces.',
    difficulty: 'Normal',
    deploymentCenter: { q: -4, r: -2 }
  },
  {
    id: 'alpha_ver_stage',
    name: 'Alpha Version Stage',
    description: 'Advanced battlefield with varied terrain and strategic positions.',
    difficulty: 'Normal',
    deploymentCenter: { q: -4, r: -2 }
  }
];
```

#### JSONファイル配置場所
**ディレクトリ**: `/Commander/public/data/maps/`
**読み込み対象**: `maps.ts`で定義されたIDに対応するJSONファイル群
- `test_map_1.json`
- `alpha_ver_stage.json`
- その他の追加マップファイル

### 2. 統一データ読み込みフェーズ

#### App.tsx - マップ選択の統合処理
**ファイル場所**: `/Commander/src/App.tsx`
**重要な処理**: 22-52行目での選択マップ管理

```typescript
const navigateToScreen = async (screen: GameScreen, selectedMap?: GameMap) => {
  if (selectedMap) {
    try {
      // 選択されたマップの完全データを読み込み
      const { boardLayout, deploymentCenter } = await loadCompleteMap(selectedMap.id);
      
      setGameState(prev => ({
        ...prev,
        currentScreen: screen,
        selectedMap: {
          ...selectedMap,
          deploymentCenter
        },
        board: boardLayout
      }));
    } catch (error) {
      console.error('Failed to load map:', error);
    }
  }
};
```

#### BattleScreen.tsx - 動的マップ読み込み
**ファイル場所**: `/Commander/src/screens/BattleScreen.tsx`
**重要な処理**: 42-75行目での動的マップ読み込み

```typescript
const loadBattle = async () => {
  if (gameState.selectedMap) {
    try {
      // 選択されたマップを動的に読み込み（ハードコーディング除去）
      const response = await fetch(`data/maps/${gameState.selectedMap.id}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load map ${gameState.selectedMap.id}`);
      }
      const mapData: MapData = await response.json();
      
      // デプロイ済みユニットがあれば引き継ぎ
      if (gameState.units && gameState.units.length > 0) {
        const enemyUnits = mapData.units.filter(unit => unit.team === 'Red');
        const allUnits = [...gameState.units, ...enemyUnits];
        
        const customMapData: MapData = {
          ...mapData,
          units: allUnits
        };
        loadGame(customMapData);
      } else {
        loadGame(mapData);
      }
    } catch (error) {
      console.error(`Failed to load map ${gameState.selectedMap.id}:`, error);
      loadFallbackMap();
    }
  }
};
```

**詳細処理フロー（39-174行目）**:
1. `loadBattle`非同期関数内でマップデータをfetch
2. JSONレスポンスを`MapData`型として解析
3. デプロイ済みユニットの処理（ゲーム状態またはデフォルトマップユニット使用）
4. `loadGame`関数を呼び出してゲームロジックにデータを渡す

### 2. データ処理フェーズ

#### useGameLogic.ts - ゲーム状態管理
**ファイル場所**: `/Commander/src/hooks/useGameLogic.ts`
**重要な処理**: 45行目での`loadGame`コールバック

```typescript
// 45行目: マップデータの処理開始
const loadGame = useCallback((mapData: MapData, deployedUnits?: DeployedUnit[]) => {
  const { board, units } = loadMapFromJSON(mapData, deployedUnits);
  setBoardLayout(board);        // 46行目: ボードレイアウト設定
  setUnits(units);             // 47行目: ユニット配置設定
  // ... ゲーム状態初期化（ターン、天候など）
}, []);
```

#### map.ts - マップデータ変換ユーティリティ
**ファイル場所**: `/Commander/src/utils/map.ts`
**重要な処理**: 32-60行目の`loadMapFromJSON`関数

```typescript
// 32行目: JSONからゲーム内部データ構造への変換
export const loadMapFromJSON = (
  mapData: MapData, 
  deployedUnits?: DeployedUnit[]
): { board: BoardLayout; units: Unit[] } => {
  // タイルデータからBoardLayout Mapを作成
  const boardLayout = new Map<string, HexTile>();
  
  // ユニットデータの処理（UNIT_STATSから完全なステータス取得）
  const processedUnits = mapData.units.map(unitData => ({
    ...unitData,
    ...UNIT_STATS[unitData.type as keyof typeof UNIT_STATS]
  }));
  
  return { board: boardLayout, units: processedUnits };
}
```

### 3. 描画・表示フェーズ

#### GameBoard.tsx - メイン描画コンポーネント
**ファイル場所**: `/Commander/src/components/game/GameBoard.tsx`
**重要な処理**: 32-58行目の`renderHexes()`関数

```typescript
// 32行目: ヘックスタイルの描画処理開始
const renderHexes = () => {
  const hexes = [];
  
  // 35行目〜: boardLayoutの各エントリを反復処理
  for (const [key, tile] of boardLayout.entries()) {
    const [x, y] = key.split(',').map(Number);
    
    // 各タイルをHexagonコンポーネントとして生成
    hexes.push(
      <Hexagon
        key={key}
        position={{ x, y }}
        terrain={tile.terrain}
        unit={tile.unit}
        isSelected={/* 選択状態判定 */}
        isInMoveRange={/* 移動範囲判定 */}
        isInAttackRange={/* 攻撃範囲判定 */}
        onClick={() => onTileClick({ x, y })}
      />
    );
  }
  
  return hexes;
};
```

**描画処理の詳細**:
- JSONから変換されたboardLayoutの各エントリを反復
- Hexagonコンポーネントによる個別タイル描画
- ユニット配置、選択状態、対話ゾーンの処理
- カメラコントロール付きSVGビューポート内での描画

#### Hexagon.tsx - 個別ヘックス描画
**ファイル場所**: `/Commander/src/components/game/Hexagon.tsx`
**機能**: 各ヘックスタイルの視覚的表現
- 地形の視覚的区別（平原、森林、山、川、道路、橋、都市、泥地）
- ユニットアイコンとステータス表示
- 選択状態とハイライト効果

## 📋 新しいマップの追加手順

### ステップ1: JSONマップファイルの作成
**配置場所**: `/Commander/public/data/maps/your_map_name.json`

```json
{
  "gameStatus": {
    "gameState": "playing",
    "turn": 1,
    "activeTeam": "Blue",
    "winner": null,
    "weather": "Clear",
    "weatherDuration": 0
  },
  "board": {
    "tiles": [
      { "x": -6, "y": -6, "terrain": "Plains" },
      { "x": -5, "y": -6, "terrain": "Forest" },
      // ... 他のタイルデータ
    ]
  },
  "units": [
    {
      "id": "enemy-1",
      "type": "Tank",
      "team": "Red",
      "x": 2,
      "y": 0,
      // ... 他のユニットプロパティ
    }
  ],
  "deploymentCenter": { "q": -4, "r": -2 }
}
```

### ステップ2: マップをシステムに登録
**ファイル編集**: `/Commander/src/data/maps.ts`

```typescript
export const availableMaps: GameMap[] = [
  // 既存のマップ...
  {
    id: 'your_map_name',           // JSONファイル名と一致させる
    name: 'あなたのマップ名',
    description: 'マップの説明文',
    difficulty: 'Hard',            // Easy, Normal, Hard
    deploymentCenter: { q: -4, r: -2 }  // JSONと同じ座標
  }
];
```

### ステップ3: 確認とテスト
1. **開発サーバー起動**: `npm start`
2. **マップ選択画面**: 追加したマップが表示されることを確認
3. **動作テスト**: Deployment→Battle フェーズの流れを確認

## 🔄 統一データフローダイアグラム

```
ScenarioSelectScreen (マップ選択)
    ↓ (selectedMapを渡す)
App.tsx:navigateToScreen (統合マップ管理)
    ↓ (loadCompleteMapでデータ読み込み)
mapLoader.ts:loadMapData (JSONファイル読み込み)
    ↓ (gameState.selectedMapに保存)
┌─────────────────────────────────────┐
│  UnitDeploymentScreen               │  BattleScreen
│  gameState.selectedMapを参照        │  gameState.selectedMapを参照
│  ↓                                 │  ↓
│  同じマップデータでboard描画         │  同じマップデータでboard描画
│  ↓                                 │  ↓
│  ユニット配置→gameState.unitsに保存  │  gameState.unitsを引き継ぎ
└─────────────────────────────────────┘
    ↓ (両フェーズ共通)
useGameLogic.ts:loadGame (状態管理)
    ↓ (loadMapFromJSON呼び出し)
map.ts:loadMapFromJSON (データ変換)
    ↓ (BoardLayout・Units作成)
GameBoard.tsx:renderHexes (描画処理)
    ↓ (各タイル描画)
Hexagon.tsx (個別タイル視覚化)
```

## 代替マップローダーシステム

### mapLoader.ts - モジュラーマップローダー
**ファイル場所**: `/Commander/src/utils/mapLoader.ts`
**機能**: 
- `loadMapData`: ID指定によるマップデータ読み込み
- `createBoardLayout`: ボードレイアウト作成
- `loadCompleteMap`: 完全なマップ読み込み

**注意**: このユーティリティは現在test_map_1.jsonでは使用されていませんが、より柔軟なマップ管理のための拡張可能な仕組みを提供しています。

## ゲームへの影響とポイント

### パフォーマンス最適化
- **効率的なSVG描画**: 大量のヘックスタイルを滑らかに表示
- **React状態管理**: 必要な部分のみの再描画制御
- **メモリ効率**: Map構造による高速な座標アクセス

### 拡張性確保
- **JSONベース設計**: 外部ツールでのマップ編集可能
- **モジュラー構造**: 各フェーズの独立した拡張・修正
- **型安全性**: TypeScriptによる堅牢なデータ変換

### 設定・カスタマイズポイント
- **マップサイズ**: JSON内でのタイル配置による柔軟な形状
- **地形バリエーション**: 新しい地形タイプの追加
- **ユニット配置**: デフォルト配置またはカスタム配置の選択
- **視覚的カスタマイズ**: 色、アイコン、エフェクトの調整

## ⚠️ マップ追加時の注意点

### JSONファイル形式の要件
- **座標系**: ヘックスグリッド座標系（x, y形式）を使用
- **地形タイプ**: `Plains`, `Forest`, `Mountain`, `River`, `Road`, `Bridge`, `City`, `Mud`
- **ユニットタイプ**: `Tank`, `Infantry`, `Artillery`, `Fighter`, `Bomber`等（`UNIT_STATS`定義済み）
- **チーム**: `Blue`（プレイヤー）, `Red`（敵）

### デプロイメントセンター
- **配置**: プレイヤーユニットの初期配置エリア中心
- **座標形式**: `{ q: number, r: number }`（ヘックス座標）
- **推奨値**: マップ左側の戦略的位置

### ファイル命名規則
- **JSONファイル**: 小文字とアンダースコア（例: `desert_storm.json`）
- **マップID**: JSONファイル名と完全一致
- **表示名**: 日本語可、ユーザーフレンドリーな名前

## 🔧 統合システムの重要ポイント

### 統一マップ管理の利点
- **開発効率**: 1つのマップファイルで全フェーズ対応
- **データ整合性**: フェーズ間でのマップデータ不整合を防止
- **保守性**: マップ変更時の影響範囲を限定
- **拡張性**: 新マップの追加が簡単

### 状態引き継ぎメカニズム
- **gameState.selectedMap**: 選択されたマップ情報を全フェーズで共有
- **gameState.units**: Deployment Phaseの配置情報をBattle Phaseへ引き継ぎ  
- **gameState.board**: 統一されたボードレイアウトを両フェーズで使用
- **battlePrep.deployedUnits**: ユニット配置座標の永続化

### エラーハンドリング
- **フォールバック機能**: マップ読み込み失敗時の代替マップ
- **型安全性**: TypeScriptによる実行時エラーの防止
- **ログ出力**: デバッグ用の詳細なエラー情報

## 依存関係
- [[BattleScreen]] - メイン戦闘画面での使用
- [[GameBoard]] - ゲームボード表示コンポーネント
- [[Hexagon]] - 個別ヘックスタイルの描画
- [[useGameLogic]] - ゲーム状態の管理
- [[types-index]] - 型定義（MapData、BoardLayout、Unit等）
- [[constants]] - ユニットステータス定数（UNIT_STATS）

## 🎯 実用例: 新マップ「Desert Storm」の追加

### 完全な実装例

#### 1️⃣ JSONファイル作成
**ファイル名**: `/Commander/public/data/maps/desert_storm.json`

```json
{
  "gameStatus": {
    "gameState": "playing",
    "turn": 1,
    "activeTeam": "Blue",
    "winner": null,
    "weather": "Clear",
    "weatherDuration": 0
  },
  "board": {
    "tiles": [
      { "x": -8, "y": -4, "terrain": "Mountain" },
      { "x": -7, "y": -4, "terrain": "Plains" },
      { "x": -6, "y": -4, "terrain": "Road" },
      { "x": -5, "y": -4, "terrain": "Plains" },
      { "x": -4, "y": -4, "terrain": "Plains" },
      { "x": -3, "y": -4, "terrain": "River" },
      { "x": -2, "y": -4, "terrain": "Bridge" },
      { "x": -1, "y": -4, "terrain": "River" },
      { "x": 0, "y": -4, "terrain": "Plains" },
      { "x": 1, "y": -4, "terrain": "Forest" },
      { "x": 2, "y": -4, "terrain": "Plains" },
      { "x": 3, "y": -4, "terrain": "City", "owner": "Red", "hp": 15, "maxHp": 15 }
    ]
  },
  "units": [
    {
      "id": "enemy-tank-1",
      "type": "Tank",
      "team": "Red",
      "x": 2,
      "y": -4,
      "hp": 20,
      "maxHp": 20,
      "attack": 7,
      "defense": 5,
      "movement": 4,
      "attackRange": { "min": 1, "max": 1 },
      "canCounterAttack": true,
      "unitClass": "Vehicle",
      "fuel": 40,
      "maxFuel": 40,
      "xp": 0,
      "moved": false,
      "attacked": false
    },
    {
      "id": "enemy-infantry-1",
      "type": "Infantry",
      "team": "Red",
      "x": 1,
      "y": -4,
      "hp": 10,
      "maxHp": 10,
      "attack": 4,
      "defense": 2,
      "movement": 3,
      "attackRange": { "min": 1, "max": 1 },
      "canCounterAttack": true,
      "unitClass": "Infantry",
      "fuel": 60,
      "maxFuel": 60,
      "xp": 0,
      "moved": false,
      "attacked": false
    }
  ],
  "deploymentCenter": { "q": -6, "r": -4 }
}
```

#### 2️⃣ マップ登録
**ファイル編集**: `/Commander/src/data/maps.ts`

```typescript
export const availableMaps: GameMap[] = [
  {
    id: 'test_map_1',
    name: 'Test Map 1',
    description: 'First mission - Secure the battlefield and eliminate enemy forces.',
    difficulty: 'Normal',
    deploymentCenter: { q: -4, r: -2 }
  },
  {
    id: 'alpha_ver_stage',
    name: 'Alpha Version Stage',
    description: 'Advanced battlefield with varied terrain and strategic positions.',
    difficulty: 'Normal',
    deploymentCenter: { q: -4, r: -2 }
  },
  {
    id: 'desert_storm',
    name: 'Desert Storm',
    description: 'Cross the river and capture the enemy stronghold in this desert battlefield.',
    difficulty: 'Hard',
    deploymentCenter: { q: -6, r: -4 }
  }
];
```

#### 3️⃣ 確認手順
1. **開発サーバー起動**: `npm start`
2. **ナビゲーション**: Title → Home → Scenario Select
3. **新マップ確認**: "Desert Storm"が表示されることを確認
4. **完全テスト**: マップ選択 → ユニット選択 → 配置 → 戦闘の流れ

## 🔍 トラブルシューティング

### よくある問題と解決法

#### マップが表示されない
- **原因**: JSONファイル名とマップIDの不一致
- **解決**: `maps.ts`のIDとJSONファイル名を完全一致させる

#### 座標エラー
- **原因**: ヘックス座標系の理解不足
- **解決**: 既存マップの座標を参考に、連続する座標を配置

#### デプロイメントエラー
- **原因**: `deploymentCenter`座標がボード外
- **解決**: ボード内の有効な座標を`deploymentCenter`に設定

## 関連システム
- [[utils-overview]] - 座標計算、戦闘計算等の支援ユーティリティ
- [[InformationPanel]] - 選択されたタイル/ユニット情報の表示
- [[ScenarioSelectScreen]] - マップ選択画面の実装
- [[UnitDeploymentScreen]] - ユニット配置システム

## タグ
#MapRendering #UnifiedMapSystem #JSONLoader #DataProcessing #HexGrid #GameBoard #BattleScreen #MapLoader #DataFlow #SystemIntegration #UtilityHelpers #DeploymentPhase #StateManagement