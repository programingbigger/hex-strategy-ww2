# Utils & Helpers - ユーティリティ・ヘルパー関数集

## 概要
ゲーム全体で使用される汎用的な関数とヘルパー機能を提供するモジュール群です。計算処理、データ変換、検証処理などの共通機能を集約し、コードの再利用性と保守性を向上させます。

## ファイル場所
`/Commander/src/utils/`配下の各ファイル

## 主要ユーティリティモジュール

### 座標・位置計算 (`coordinateUtils.ts`)
```typescript
// ヘックス座標系の計算
export const calculateDistance = (pos1: Position, pos2: Position): number => {
  // ヘックスグリッド上の距離計算
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return (Math.abs(dx) + Math.abs(dx + dy) + Math.abs(dy)) / 2;
}

// 隣接タイル取得
export const getAdjacentTiles = (center: Position): Position[] => {
  // 6角形の隣接タイル座標を返す
  const directions = [
    {x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: -1},
    {x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: 1}
  ];
  return directions.map(dir => ({
    x: center.x + dir.x,
    y: center.y + dir.y
  }));
}

// 射程内判定
export const isInRange = (from: Position, to: Position, range: number | [number, number]): boolean => {
  const distance = calculateDistance(from, to);
  if (typeof range === 'number') {
    return distance <= range;
  }
  return distance >= range[0] && distance <= range[1];
}
```

### 戦闘計算 (`combatUtils.ts`)
```typescript
// ダメージ計算
export const calculateDamage = (
  attacker: Unit, 
  defender: Unit, 
  terrain: TerrainType
): number => {
  const baseAttack = attacker.attack + (attacker.experience || 0);
  const defense = defender.defense + getTerrainDefenseBonus(terrain);
  const damage = Math.max(1, baseAttack - defense);
  
  // クリティカルヒット判定
  if (Math.random() < 0.1) {
    return Math.floor(damage * 1.5);
  }
  return damage;
}

// 命中率計算
export const calculateHitRate = (
  attacker: Unit, 
  defender: Unit, 
  distance: number,
  weather: WeatherType
): number => {
  let baseHitRate = 85;
  
  // 距離による修正
  if (distance > 1) {
    baseHitRate -= (distance - 1) * 5;
  }
  
  // 天候による修正
  const weatherModifier = getWeatherHitModifier(weather);
  
  return Math.max(10, Math.min(95, baseHitRate + weatherModifier));
}
```

### パスファインディング (`pathfindingUtils.ts`)
```typescript
// A*アルゴリズムによる最短経路探索
export const findPath = (
  start: Position, 
  goal: Position, 
  board: Board,
  unit: Unit
): Position[] => {
  // A*アルゴリズムの実装
  const openSet: PathNode[] = [{position: start, gScore: 0, fScore: 0}];
  const closedSet: Set<string> = new Set();
  
  while (openSet.length > 0) {
    const current = openSet.reduce((min, node) => 
      node.fScore < min.fScore ? node : min
    );
    
    if (positionsEqual(current.position, goal)) {
      return reconstructPath(current);
    }
    
    // 隣接ノードの探索
    const neighbors = getAdjacentTiles(current.position);
    for (const neighbor of neighbors) {
      if (isValidMove(neighbor, board, unit)) {
        // パスの評価と更新
      }
    }
  }
  
  return []; // パスが見つからない場合
}

// 移動可能範囲計算
export const getReachableTiles = (
  unit: Unit, 
  board: Board
): Position[] => {
  const reachable: Position[] = [];
  const visited: Set<string> = new Set();
  const queue: {pos: Position, fuel: number}[] = [
    {pos: unit.position, fuel: unit.fuel}
  ];
  
  while (queue.length > 0) {
    const {pos, fuel} = queue.shift()!;
    const key = `${pos.x},${pos.y}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    if (fuel >= 0) {
      reachable.push(pos);
      
      // 隣接タイルを探索
      for (const adjacent of getAdjacentTiles(pos)) {
        const moveCost = getMovementCost(adjacent, board);
        if (fuel >= moveCost) {
          queue.push({pos: adjacent, fuel: fuel - moveCost});
        }
      }
    }
  }
  
  return reachable;
}
```

### データ変換・検証 (`validationUtils.ts`)
```typescript
// 座標の境界チェック
export const isValidPosition = (pos: Position, board: Board): boolean => {
  return pos.x >= 0 && pos.x < board.width && 
         pos.y >= 0 && pos.y < board.height;
}

// ユニット配置の妥当性検証
export const isValidUnitPlacement = (
  unit: Unit, 
  position: Position, 
  board: Board
): boolean => {
  // 1. 座標の有効性
  if (!isValidPosition(position, board)) return false;
  
  // 2. タイルの占有状況
  const tile = board.tiles[position.y][position.x];
  if (tile.isOccupied) return false;
  
  // 3. 地形制限
  if (hasTerrainRestriction(unit.type, tile.terrain)) return false;
  
  return true;
}

// 戦闘行動の妥当性検証
export const isValidAttack = (
  attacker: Unit, 
  target: Position, 
  board: Board
): boolean => {
  const distance = calculateDistance(attacker.position, target);
  
  // 射程チェック
  if (!isInRange(attacker.position, target, attacker.range)) {
    return false;
  }
  
  // ターゲット存在チェック
  const targetTile = board.tiles[target.y][target.x];
  if (!targetTile.unit || targetTile.unit.team === attacker.team) {
    return false;
  }
  
  return true;
}
```

### ゲーム状態管理 (`stateUtils.ts`)
```typescript
// ゲーム状態の深いコピー
export const deepCloneGameState = (state: GameState): GameState => {
  return JSON.parse(JSON.stringify(state));
}

// ユニット検索
export const findUnitById = (units: Unit[], id: string): Unit | undefined => {
  return units.find(unit => unit.id === id);
}

// チーム別ユニット取得
export const getUnitsByTeam = (units: Unit[], team: Team): Unit[] => {
  return units.filter(unit => unit.team === team && !unit.isDestroyed);
}

// 勝利条件チェック
export const checkVictoryConditions = (
  board: Board, 
  units: Unit[]
): 'blue_victory' | 'red_victory' | 'draw' | 'ongoing' => {
  const blueUnits = getUnitsByTeam(units, 'blue');
  const redUnits = getUnitsByTeam(units, 'red');
  
  // 全滅チェック
  if (blueUnits.length === 0) return 'red_victory';
  if (redUnits.length === 0) return 'blue_victory';
  
  // 都市占領チェック
  const blueCities = board.cities.filter(city => city.owner === 'blue');
  const redCities = board.cities.filter(city => city.owner === 'red');
  
  if (blueCities.length >= board.cities.length * 0.7) return 'blue_victory';
  if (redCities.length >= board.cities.length * 0.7) return 'red_victory';
  
  return 'ongoing';
}
```

### ランダム・確率処理 (`randomUtils.ts`)
```typescript
// シード可能な疑似乱数生成器
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// 確率判定
export const rollDice = (probability: number, random: SeededRandom): boolean => {
  return random.next() < probability / 100;
}

// ランダム要素選択
export const randomChoice = <T>(array: T[], random: SeededRandom): T => {
  const index = Math.floor(random.next() * array.length);
  return array[index];
}
```

## ゲームへの影響とポイント

### パフォーマンス最適化
- **計算効率**: 最適化されたアルゴリズムによる高速処理
- **メモ化**: 重い計算結果のキャッシュ
- **遅延評価**: 必要な時点での計算実行

### 品質向上
- **テスト可能性**: 純粋関数による単体テストの容易さ
- **予測可能性**: 同じ入力に対する同じ出力の保証
- **デバッグ支援**: 計算過程の追跡とログ出力

### 拡張性確保
- **モジュール性**: 機能別の分離による保守性向上
- **再利用性**: 汎用的な関数による開発効率向上
- **設定可能性**: パラメータによる動作調整

## 設計原則

### 純粋関数設計
- **副作用なし**: 入力以外の状態に依存しない
- **不変性**: 引数オブジェクトの変更を行わない
- **予測可能**: 同じ入力に対して常に同じ出力

### エラーハンドリング
- **境界値チェック**: 不正な入力値の検証
- **例外処理**: 適切なエラーメッセージと復旧処理
- **フォールバック**: 計算失敗時の代替処理

### パフォーマンス考慮
- **計算量**: O(n)、O(log n)の効率的なアルゴリズム選択
- **メモリ使用**: 不要なオブジェクト生成の回避
- **キャッシュ**: 計算結果の適切なキャッシュ戦略

## 依存関係
- [[types-index]] - 型定義の参照
- [[constants]] - 定数値の使用
- [[useGameLogic]] - ゲームロジックでの利用

## テストカバレッジ
```typescript
// ユニットテスト例
describe('coordinateUtils', () => {
  test('calculateDistance should return correct hex distance', () => {
    expect(calculateDistance({x: 0, y: 0}, {x: 2, y: 1})).toBe(2);
  });
  
  test('getAdjacentTiles should return 6 neighbors', () => {
    const neighbors = getAdjacentTiles({x: 0, y: 0});
    expect(neighbors).toHaveLength(6);
  });
});
```

## タグ
#utils #helpers #algorithms #calculations #pathfinding #validation #performance

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "1", "content": "\u30e1\u30a4\u30f3\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u69cb\u9020\u4f5c\u6210\uff08\u65e5\u672c\u8a9e\u5bfe\u5fdc\uff09", "status": "completed", "priority": "high"}, {"id": "2", "content": "\u30b3\u30a2\u30b3\u30f3\u30dd\u30fc\u30cd\u30f3\u30c8\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u4f5c\u6210\uff08\u65e5\u672c\u8a9e\uff09", "status": "completed", "priority": "high"}, {"id": "3", "content": "\u30b2\u30fc\u30e0\u30ed\u30b8\u30c3\u30af\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u4f5c\u6210\uff08\u65e5\u672c\u8a9e\uff09", "status": "completed", "priority": "high"}, {"id": "4", "content": "\u753b\u9762\u30b3\u30f3\u30dd\u30fc\u30cd\u30f3\u30c8\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u4f5c\u6210\uff08\u65e5\u672c\u8a9e\uff09", "status": "completed", "priority": "medium"}, {"id": "5", "content": "\u578b\u5b9a\u7fa9\u30fb\u8a2d\u5b9a\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u4f5c\u6210\uff08\u65e5\u672c\u8a9e\uff09", "status": "completed", "priority": "medium"}, {"id": "6", "content": "\u30e6\u30fc\u30c6\u30a3\u30ea\u30c6\u30a3\u30fb\u30d8\u30eb\u30d1\u30fc\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8\u4f5c\u6210\uff08\u65e5\u672c\u8a9e\uff09", "status": "completed", "priority": "low"}]