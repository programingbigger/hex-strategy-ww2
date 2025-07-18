# UnitDeploymentScreen - ユニット配置画面

## 概要
戦闘開始前にプレイヤーがユニットを配置する画面です。戦略的な初期配置により、その後の戦闘の展開を大きく左右する重要な画面です。

## ファイル場所
`/Commander/src/screens/UnitDeploymentScreen.tsx`

## 主要機能

### ユニット配置システム
- **配置エリア表示**: 配置可能な開始エリアのハイライト
- **ユニット選択**: 利用可能なユニットタイプの選択
- **配置実行**: ドラッグ&ドロップまたはクリックによる配置
- **配置解除**: 誤配置したユニットの取り消し

### 戦略的配置支援
- **地形情報**: 配置エリア周辺の地形と戦術的価値の表示
- **敵情報**: 判明している敵ユニットの位置表示
- **推奨配置**: AIによる戦術的配置提案

### リソース管理
- **ユニット予算**: 配置可能なユニット数の制限
- **編成バランス**: 歩兵・戦車・砲兵等のバランス表示
- **コスト表示**: 各ユニットの配置コスト

## Props（引数）

```typescript
interface UnitDeploymentScreenProps {
  availableUnits: UnitType[];       // 配置可能ユニットリスト
  deploymentZones: Position[];      // 配置可能エリア
  unitBudget: number;               // ユニット予算
  enemyIntel: EnemyIntelligence;    // 敵情報
  onDeploymentComplete: (deployment: UnitDeployment[]) => void;
  onBack: () => void;               // 前画面に戻る
}
```

## 画面レイアウト

```
┌─────────────────────────────────────────┐
│ Unit Budget: 800/1000    [Back][Next]  │
├─────────────────────┬───────────────────┤
│                     │ Available Units   │
│    Deployment       │ ┌─────────────────┤
│      Board          │ │ 👥 Infantry(100)│
│  (Deployment Zone   │ │ 🚗 Tank(300)    │
│   Highlighted)      │ │ 🎯 Artillery(250│
│                     │ │ 🏎️ ArmoredCar(150│
│                     │ │                 │
│                     │ │ Current Force:  │
│                     │ │ Infantry: 3     │
│                     │ │ Tank: 1         │
│                     │ │ Artillery: 1    │
├─────────────────────┴───────────────────┤
│ Tip: Place artillery on high ground    │
└─────────────────────────────────────────┘
```

## 配置ルールと制約

### 配置エリア制限
```typescript
const DEPLOYMENT_RULES = {
  ZONE_TYPE: 'starting_area',      // 開始エリアのみ配置可能
  MAX_UNITS_PER_TILE: 1,          // 1タイルに1ユニットまで
  MINIMUM_DISTANCE: 0,             // ユニット間の最小距離
  TERRAIN_RESTRICTIONS: {          // 地形制限
    Mountain: ['Infantry'],        // 山地は歩兵のみ
    River: [],                     // 川タイルは配置不可
  }
}
```

### 予算システム
```typescript
const calculateDeploymentCost = (units: Unit[]) => {
  return units.reduce((total, unit) => {
    return total + UNIT_COSTS[unit.type];
  }, 0);
}
```

## 戦術的配置ガイドライン

### 基本原則
1. **前線配置**: 歩兵を前面に配置し、敵の進撃を阻止
2. **砲兵配置**: 高地や後方に砲兵を配置し、射程を活用
3. **機動予備**: 戦車を中央付近に配置し、機動性を活用
4. **側面警戒**: 翼側面の警戒と突破口の封鎖

### 地形活用
- **高地利用**: 山地・丘陵への砲兵配置で射程と命中率向上
- **隘路確保**: 橋や峠の確保で敵の進撃路制限
- **都市占領**: 開始時に都市を確保し収入源確保

### 敵配置への対応
- **情報活用**: 判明している敵配置への対抗配置
- **予測配置**: 予想される敵戦術への事前対策
- **柔軟性確保**: 複数の戦術に対応できる汎用的配置

## ゲームへの影響とポイント

### 戦略的重要性
- **勝敗への影響**: 初期配置が戦闘全体の60%を決定
- **戦術選択**: 攻撃的 vs 防御的な戦術の選択
- **リソース配分**: 限られた予算内での最適化

### 学習要素
- **地形理解**: 各地形の戦術的価値の学習
- **ユニット特性**: 各兵種の役割と運用法の理解
- **戦術発展**: プレイ経験による配置戦術の向上

### ゲーム体験
- **戦略性**: じっくりと考える戦略的思考の時間
- **個性表現**: プレイヤーの戦術スタイルの反映
- **リプレイ性**: 異なる配置による多様な戦闘展開

## UI/UX設計

### 操作性
- **ドラッグ&ドロップ**: 直感的なユニット配置操作
- **グリッドスナップ**: 正確な位置への自動吸着
- **一括操作**: 類似ユニットの連続配置支援

### 視覚フィードバック
- **配置可能表示**: 緑色ハイライトによる配置可能エリア表示
- **配置不可表示**: 赤色表示による制限エリア表示
- **コスト表示**: リアルタイムな予算残高表示

### 情報提供
- **ツールチップ**: ユニット詳細情報のホバー表示
- **戦術ヒント**: 配置位置に応じた戦術アドバイス
- **敵情報**: 利用可能な敵軍情報の表示

## AI支援機能

### 自動配置
```typescript
const suggestDeployment = (terrain: Terrain[], budget: number) => {
  // 1. 地形分析
  // 2. 戦術的価値評価
  // 3. 最適配置算出
  // 4. 推奨配置提案
}
```

### バランス分析
```typescript
const analyzeForceBalance = (deployment: UnitDeployment[]) => {
  return {
    attackPower: calculateTotalAttack(deployment),
    defensePower: calculateTotalDefense(deployment),
    mobility: calculateAverageMobility(deployment),
    recommendation: generateBalanceAdvice(deployment)
  }
}
```

## エラーハンドリング

### 配置エラー
- **予算超過**: 予算を超えた配置の防止
- **重複配置**: 同一タイルへの重複配置の防止
- **無効配置**: 配置不可エリアへの配置阻止

### 復旧機能
- **自動保存**: 配置途中の自動保存
- **元に戻す**: 直前の配置操作の取り消し
- **リセット**: 配置状況の全リセット

## 依存関係
- [[BattlePrepScreen]] - 前画面からの遷移
- [[BattleScreen]] - 配置完了後の遷移先
- [[GameBoard]] - 配置ボードの表示
- [[useGameLogic]] - 配置ルールの検証
- [[constants]] - ユニットコストとルール定義

## 関連機能
- **セーブ/ロード**: 配置テンプレートの保存・読み込み
- **プリセット**: 定型的な配置パターンの提供
- **分析**: 配置の戦術的評価と改善提案

## タグ
#UnitDeployment #Strategy #Preparation #TacticalPlanning #InitialSetup #ResourceManagement