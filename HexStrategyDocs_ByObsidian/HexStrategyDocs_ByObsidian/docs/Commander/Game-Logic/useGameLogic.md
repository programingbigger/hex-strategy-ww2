# useGameLogic - メインゲームロジックフック

## 概要
ヘックス戦略ゲームの核となるロジックを管理するReactカスタムフックです。ゲーム状態、戦闘システム、ターン管理、勝利条件などすべてのゲームメカニクスを統合管理します。地形システムを含む包括的なゲームロジックを提供します。

## ファイル場所
`/Commander/src/hooks/useGameLogic.ts`

## 主要機能

### 状態管理
- **ゲーム状態**: 現在のゲームフェーズとプレイヤーターンの管理
- **ボード管理**: ヘックスマップの状態とユニット配置の追跡
- **ユニット管理**: 全ユニットの位置、HP、状態の一元管理
- **地形管理**: 17種類の地形タイプとその効果の処理

### 戦闘システム
- **攻撃計算**: [[terrain-types]]で定義された地形効果を含む総合的なダメージ計算
- **反撃システム**: 攻撃を受けた際の自動反撃処理
- **経験値システム**: 戦闘により得られる経験値とレベルアップ
- **武器システム**: ユニットごとの専用武装と射程管理

### 地形システム統合
- **移動コスト計算**: 兵種別の地形移動コスト適用（[[constants]]参照）
- **戦闘修正**: 地形による攻撃・防御ボーナスの自動適用
- **特殊地形効果**: 
  - 都市・港・飛行場での補給・回復効果
  - 河川・山岳での移動制限
  - 要塞・首都での戦術的優位性

### ターン管理
- **フェーズ移行**: プレイヤーターン → 敵ターン → ターン終了の流れ
- **ユニット回復**: 占領都市でのHP・燃料回復処理
- **天候システム**: ランダムな天候変化とゲームへの影響

## 主要な関数とメソッド

### 戦闘関連
```typescript
// 攻撃実行（地形効果を含む）
const executeAttack = (attacker: Unit, defender: Unit) => {
  // 1. 攻撃側・防御側の地形取得
  const attackerTile = boardLayout.get(coordToString(attacker));
  const defenderTile = boardLayout.get(coordToString(defender));
  
  // 2. 地形ボーナス計算（TERRAIN_STATSから）
  const attackBonus = attackerTile ? TERRAIN_STATS[attackerTile.terrain].attackBonus : 0;
  const defenseBonus = defenderTile ? TERRAIN_STATS[defenderTile.terrain].defenseBonus : 0;
  
  // 3. 総合ダメージ計算
  const attackPower = attacker.attack + attackBonus;
  const defensePower = defender.defense + defenseBonus;
  
  // 4. 反撃・経験値処理
}

// 移動可能範囲計算（地形コスト考慮）
const calculateReachableTiles = (unit: Unit) => {
  // 1. ユニットタイプ別移動コスト取得
  const movementCost = TERRAIN_STATS[terrain].movementCost[unit.type] 
    ?? TERRAIN_STATS[terrain].movementCost.default;
  
  // 2. 地形制限チェック（車両の河川・山岳通行不可など）
  if (unit.unitClass === 'Vehicle' && 
      ['River', 'Sea', 'Mountain'].includes(terrain)) {
    moveCost = Infinity; // 通行不可
  }
  
  // 3. ZOC（統制区域）効果適用
  // 4. 到達可能タイルのリスト生成
}
```

### 都市システム
```typescript
// 都市占領処理
const captureCity = (unit: Unit, tile: Tile) => {
  // 1. 歩兵ユニットかチェック
  if (unit.unitClass \!== 'Infantry') return;
  
  // 2. 占領可能地形かチェック
  const capturableTerrains = ['City', 'Capital', 'Airport', 'Port'];
  if (\!capturableTerrains.includes(tile.terrain)) return;
  
  // 3. 所有権変更とHP回復設定
  tile.owner = unit.team;
  // 4. 収入計算更新
}

// ターン開始時の補給・回復処理
const healUnitsInCities = () => {
  units.forEach(unit => {
    const unitTile = boardLayout.get(coordToString(unit));
    
    // 占領済み都市にいるユニットを回復
    if (unitTile && isCapturableTerrain(unitTile.terrain) && 
        unitTile.owner === unit.team) {
      
      unit.hp = Math.min(unit.maxHp, unit.hp + UNIT_HEAL_HP);
      unit.fuel = unit.maxFuel; // 燃料満タン補給
    }
  });
}
```

### AI思考ルーチン
```typescript
// 敵AIのターン処理（地形を考慮した行動選択）
const processEnemyTurn = () => {
  // 1. 全敵ユニットの行動優先度計算
  // 2. 地形を活用した最適ポジション選択
  // 3. 高所や要塞などの戦術的地形への移動優先
  // 4. 移動・攻撃の実行
}
```

## ゲームへの影響とポイント

### 戦闘バランス
- **ダメージ計算式**: `(基本攻撃力 + 地形攻撃ボーナス) - (基本防御力 + 地形防御ボーナス)`
- **地形修正の重要性**: 山岳（+3防御）、要塞（+3防御+1攻撃）などの戦術的価値
- **兵種相性**: 歩兵は全地形対応、車両は機動力に優れるが地形制限あり

### 戦略的要素
- **燃料システム**: 移動に燃料を消費、都市での補給の重要性
- **地形活用**: 
  - 防御戦術: 森林(+1)、山岳(+3)、要塞(+3)での籠城
  - 攻撃戦術: 山岳(+2攻撃)、首都(+1攻撃)からの高所攻撃
  - 機動戦術: 道路での高速移動、河川・山岳での車両制限活用
- **都市経済**: 都市占領による収入増加と戦略的価値

### ゲームテンポ
- **ターン制限**: 長期戦を防ぐターン数上限
- **勝利条件**: 敵全滅 or 主要都市占領 or ターン経過
- **自動回復**: 都市での戦闘継続性を保つHP・燃料回復システム

## 地形システムの詳細実装

### 移動システム
```typescript
// 地形別移動コスト（constants.tsのTERRAIN_STATSから）
const getMovementCost = (unit: Unit, terrain: TerrainType): number => {
  const terrainStats = TERRAIN_STATS[terrain];
  return terrainStats.movementCost[unit.type] ?? terrainStats.movementCost.default;
}

// 車両の地形制限
const isPassableForVehicles = (terrain: TerrainType): boolean => {
  return \!['River', 'Sea', 'Mountain'].includes(terrain);
}
```

### 戦闘修正システム
```typescript
// 地形戦闘修正の適用
const applyTerrainCombatModifiers = (
  attacker: Unit, 
  defender: Unit, 
  attackerTerrain: TerrainType, 
  defenderTerrain: TerrainType
) => {
  const attackBonus = TERRAIN_STATS[attackerTerrain].attackBonus;
  const defenseBonus = TERRAIN_STATS[defenderTerrain].defenseBonus;
  
  return {
    modifiedAttack: attacker.attack + attackBonus,
    modifiedDefense: defender.defense + defenseBonus
  };
}
```

## 設定可能パラメータ

### 戦闘バランス
```typescript
const COMBAT_SETTINGS = {
  BASE_HIT_RATE: 85,        // 基本命中率
  CRITICAL_RATE: 10,        // クリティカル率
  COUNTER_ATTACK_RATE: 80,  // 反撃率
  EXPERIENCE_GAIN: 1,       // 経験値獲得量
}
```

### 地形・回復設定
```typescript
const TERRAIN_SETTINGS = {
  UNIT_HEAL_HP: 2,         // 都市での回復量
  UNIT_HEAL_FUEL_FULL: true, // 都市での燃料満タン補給
  CITY_HEAL_RATE: 1,       // 都市建物の回復レート
}
```

### ゲームバランス
```typescript
const GAME_SETTINGS = {
  MAX_TURNS: 30,           // 最大ターン数
  FUEL_CONSUMPTION: 1,     // 移動時燃料消費
  WEATHER_CHANGE_RATE: 20, // 天候変化確率
}
```

## 依存関係
- [[types-index]] - 全ての型定義（TerrainType, Unit, Tileなど）に依存
- [[constants]] - 地形効果定数（TERRAIN_STATS）とユニット能力値に依存
- [[terrain-types]] - 地形タイプの詳細仕様に対応
- React Hook システム - useState, useEffect, useCallback

## パフォーマンス最適化

### メモ化
- **useCallback**: 重い地形計算処理の結果をキャッシュ
- **useMemo**: 移動範囲・攻撃範囲計算などの最適化
- **状態分割**: 必要な部分のみの再計算

### 計算効率化
- **パスファインディング**: A*アルゴリズムによる地形コスト考慮の最適経路探索
- **AI思考**: 地形評価関数による効率的な行動選択
- **衝突検出**: 空間分割による高速な位置検索

## エラーハンドリング
- **不正な移動**: 地形制限・燃料不足による移動の防止
- **無効な攻撃**: 射程外・地形遮蔽による攻撃制限
- **状態不整合**: ゲーム状態と地形状態の整合性チェック

## デバッグ機能
- **地形ログ**: 移動コスト・戦闘修正の詳細ログ出力
- **状態ダンプ**: 地形効果を含むゲーム状態保存
- **リプレイ機能**: ターン単位での巻き戻し（開発用）

## 関連ファイル
- [[constants]] - 地形効果設定値（TERRAIN_STATS）
- [[terrain-types]] - 地形タイプ一覧と詳細仕様
- [[types-index]] - 使用する全型定義
- [[GameBoard]] - UI側でのゲーム状態表示
- [[BattleScreen]] - メイン戦闘画面での使用

## タグ
#useGameLogic #GameCore #Hooks #Combat #TurnManagement #AI #Strategy #Terrain
EOF < /dev/null