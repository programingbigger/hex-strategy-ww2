# constants - ゲームバランス設定

## 概要
ヘックス戦略ゲームのバランス調整に関わる定数値を管理するファイルです。ユニット能力、地形効果、ゲームルールなどの数値設定を一箇所に集約しています。

## ファイル場所
`/Commander/src/config/constants.ts`

## 主要定数設定

### ユニット基本能力
```typescript
export const UNIT_STATS = {
  Infantry: {
    hp: 10,          // 体力
    attack: 4,       // 攻撃力
    defense: 2,      // 防御力  
    movement: 3,     // 移動力
    range: 1,        // 攻撃射程
    fuel: 40,        // 燃料容量
    cost: 100,       // 生産コスト
  },
  Tank: {
    hp: 20,
    attack: 7,
    defense: 5,
    movement: 4,
    range: 1,
    fuel: 60,
    cost: 300,
  },
  Artillery: {
    hp: 12,
    attack: 8,
    defense: 3,
    movement: 1,
    range: [2, 5],   // 最小-最大射程
    fuel: 30,
    cost: 250,
  },
  ArmoredCar: {
    hp: 8,
    attack: 3,
    defense: 3,
    movement: 6,
    range: 1,
    fuel: 50,
    cost: 150,
  },
  AntiTank: {
    hp: 8,
    attack: 6,
    defense: 2,
    movement: 2,
    range: 1,
    fuel: 25,
    cost: 200,
  }
}
```

### 地形効果設定
```typescript
export const TERRAIN_EFFECTS = {
  Plains: {
    defenseBonus: 0,    // 防御ボーナス
    movementCost: 1,    // 移動コスト
    attackBonus: 0,     // 攻撃ボーナス
    income: 0,          // 収入
  },
  Forest: {
    defenseBonus: 1,
    movementCost: 2,
    attackBonus: 0,
    income: 0,
    specialEffect: 'concealment', // 隠蔽効果
  },
  Mountain: {
    defenseBonus: 2,
    movementCost: 3,
    attackBonus: 1,     // 高所利得
    income: 0,
  },
  City: {
    defenseBonus: 2,
    movementCost: 1,
    attackBonus: 0,
    income: 100,        // ターンごとの収入
    canCapture: true,   // 占領可能
    healingRate: 2,     // 回復量/ターン
  },
  River: {
    defenseBonus: 1,
    movementCost: 3,
    attackBonus: 0,
    income: 0,
    crossingPenalty: true, // 渡河ペナルティ
  },
  Road: {
    defenseBonus: 0,
    movementCost: 0.5,  // 移動促進
    attackBonus: 0,
    income: 0,
  },
  Mud: {
    defenseBonus: 0,
    movementCost: 4,    // 移動困難
    attackBonus: 0,
    income: 0,
    condition: 'weather_dependent', // 天候依存
  }
}
```

### 戦闘システム設定
```typescript
export const COMBAT_SETTINGS = {
  BASE_HIT_RATE: 85,           // 基本命中率 (%)
  CRITICAL_HIT_RATE: 10,       // クリティカル率 (%)
  CRITICAL_DAMAGE_MULTIPLIER: 1.5, // クリティカル倍率
  COUNTER_ATTACK_RATE: 80,     // 反撃率 (%)
  EXPERIENCE_PER_COMBAT: 1,    // 戦闘経験値
  EXPERIENCE_PER_KILL: 3,      // 撃破経験値
  MAX_EXPERIENCE: 3,           // 最大経験値レベル
  EXPERIENCE_ATTACK_BONUS: 1,  // 経験値による攻撃ボーナス
}
```

### ゲームルール設定
```typescript
export const GAME_RULES = {
  MAX_TURNS: 30,               // 最大ターン数
  HEALING_PER_TURN: 2,         // 自然回復量
  FUEL_CONSUMPTION_RATE: 1,    // 移動燃料消費
  WEATHER_CHANGE_PROBABILITY: 20, // 天候変化確率 (%)
  VICTORY_CONDITIONS: {
    ELIMINATE_ALL: 'total_victory',    // 全滅勝利
    CAPTURE_CITIES: 'strategic_victory', // 都市占領勝利
    TURN_LIMIT: 'time_victory',       // ターン制限勝利
  },
  CITY_CAPTURE_REQUIREMENT: 'Infantry', // 都市占領可能兵種
}
```

### 天候システム
```typescript
export const WEATHER_EFFECTS = {
  Clear: {
    movementModifier: 1.0,      // 移動修正
    visibilityRange: 100,       // 視界範囲
    terrainChanges: {},         // 地形変化なし
  },
  Rain: {
    movementModifier: 0.8,      // 移動20%減少
    visibilityRange: 80,        // 視界減少
    terrainChanges: {
      Plains: 'Mud',            // 平原→泥地変化
    },
  },
  HeavyRain: {
    movementModifier: 0.6,      // 移動40%減少
    visibilityRange: 60,        // 視界大幅減少
    terrainChanges: {
      Plains: 'Mud',
      Road: 'Mud',              // 道路も泥地化
    },
    combatPenalty: -1,          // 戦闘ペナルティ
  }
}
```

## ゲームへの影響とポイント

### バランス調整の重要性
- **ユニット多様性**: 各兵種に明確な役割と特徴を付与
- **地形戦術**: 地形を活用した戦術の重要性
- **資源管理**: 燃料や収入による戦略的制約

### 調整可能な要素
- **難易度調整**: AI思考レベルや初期配置の変更
- **ゲーム時間**: ターン数やユニット能力による試合時間調整
- **戦術多様性**: 各兵種の役割分担明確化

### 設定変更の影響範囲
- **歩兵強化**: 都市占領能力により戦略的価値上昇
- **砲兵の射程**: 長距離攻撃による戦術的優位性
- **地形効果**: 防御戦術 vs 機動戦術のバランス

## 調整ガイドライン

### 新兵種追加時の考慮点
1. **既存兵種との差別化**: 明確な役割分担
2. **コストバランス**: 能力に見合った生産コスト
3. **カウンター関係**: 相性による戦術的深度

### 地形追加時の考慮点
1. **移動への影響**: 戦術的な迂回路の創出
2. **防御効果**: 要塞化の可能性
3. **収入源**: 経済的戦略要素

## 依存関係
- [[useGameLogic]] - 全設定値を戦闘計算で使用
- [[types-index]] - 各設定の型定義に依存
- 全ゲームコンポーネント - UI表示での数値参照

## デバッグ・テスト用設定
```typescript
export const DEBUG_SETTINGS = {
  ENABLE_CONSOLE_LOG: false,    // デバッグログ出力
  SHOW_AI_THINKING: false,      // AI思考過程表示
  UNLIMITED_FUEL: false,        // 燃料無制限モード
  FAST_COMBAT: false,          // 高速戦闘モード
}
```

## タグ
#constants #GameBalance #Configuration #Units #Terrain #Combat #Settings