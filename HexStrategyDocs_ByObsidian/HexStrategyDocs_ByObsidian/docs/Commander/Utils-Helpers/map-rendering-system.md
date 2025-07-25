# Map Rendering System - マップ描画システム

## 概要
Commander配下のマップ描画システムは、JSONファイル形式のマップデータを読み込み、ヘックス戦略ゲームの視覚的なマップとして描画する包括的なシステムです。データの読み込みから最終的な画面表示まで、複数のファイルが連携して動作します。

## ファイル場所
`/Commander/src/`配下の複数ファイル

## マップ描画システムの全体フロー

### 1. データ読み込みフェーズ

#### JSONファイル配置場所
**ディレクトリ**: `/Commander/public/data/maps/`
**読み込み対象**: このディレクトリ配下のJSONファイル群
- 現在のメインマップ: `test_map_1.json`
- その他のマップファイル: 必要に応じて同ディレクトリに配置

#### BattleScreen.tsx - メインエントリポイント
**ファイル場所**: `/Commander/src/screens/BattleScreen.tsx`
**重要な処理**: 43行目でのJSON読み込み

```typescript
// 43行目: JSONファイルの直接読み込み
// publicディレクトリ内のdata/maps/配下からファイルを読み込み
const response = await fetch('data/maps/test_map_1.json');
const mapData: MapData = await response.json();
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

## データフロー図

```
/Commander/public/data/maps/ (JSONファイル配置ディレクトリ)
    ↓
test_map_1.json (JSONデータ)
    ↓ (fetch)
BattleScreen.tsx:43 (ファイル読み込み)
    ↓ (loadGame呼び出し)
useGameLogic.ts:45 (ゲーム状態管理)
    ↓ (loadMapFromJSON呼び出し)
map.ts:32 (データ変換ユーティリティ)
    ↓ (BoardLayout・Units作成)
useGameLogic.ts:46-47 (React状態設定)
    ↓ (setBoardLayout、setUnits)
GameBoard.tsx:35+ (描画処理)
    ↓ (renderHexes反復処理)
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

## 重要な統合ポイント

### データ読み込み統合
- **ファイル配置**: `/Commander/public/data/maps/` ディレクトリ配下のJSONファイル群
- **BattleScreen.tsx:43** - `fetch('data/maps/test_map_1.json')` でのファイル読み込み
- **useGameLogic.ts:45** - `loadGame`でのデータ処理開始
- **map.ts:32** - `loadMapFromJSON`でのデータ変換

### 状態管理統合
- **useGameLogic.ts:46-47** - `setBoardLayout`、`setUnits`によるReact状態設定
- **GameBoard.tsx:35+** - `boardLayout`のマップ反復による描画

### 視覚表示統合
- **GameBoard.tsx:32-58** - `renderHexes()`による包括的な描画制御
- **Hexagon.tsx** - 個別タイルの詳細な視覚化

## 依存関係
- [[BattleScreen]] - メイン戦闘画面での使用
- [[GameBoard]] - ゲームボード表示コンポーネント
- [[Hexagon]] - 個別ヘックスタイルの描画
- [[useGameLogic]] - ゲーム状態の管理
- [[types-index]] - 型定義（MapData、BoardLayout、Unit等）
- [[constants]] - ユニットステータス定数（UNIT_STATS）

## 関連システム
- [[utils-overview]] - 座標計算、戦闘計算等の支援ユーティリティ
- [[InformationPanel]] - 選択されたタイル/ユニット情報の表示

## タグ
#MapRendering #JSONLoader #DataProcessing #HexGrid #GameBoard #BattleScreen #MapLoader #DataFlow #SystemIntegration #UtilityHelpers