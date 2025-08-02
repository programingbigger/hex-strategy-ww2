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

### 武器システム (`weapons.ts`) - 2025年8月強化
武器選択システムの大幅改善により実装された新機能群：

```typescript
// 使用可能武器の取得（弾薬チェック込み）
export const getAvailableWeapons = (unit: Unit): Weapon[] => {
  if (\!unit.weapons || \!Array.isArray(unit.weapons)) {
    return [];
  }
  return unit.weapons.filter(weapon => weapon.ammunition > 0);
};

// 射程内武器の取得（距離による自動フィルタリング）
export const getWeaponsInRange = (unit: Unit, targetDistance: number): Weapon[] => {
  return getAvailableWeapons(unit).filter(weapon => 
    targetDistance >= weapon.range.min && targetDistance <= weapon.range.max
  );
};

// 反撃可能性の判定（防御側武器の有効性チェック）
export const canCounterAttack = (defender: Unit, attacker: Unit): boolean => {
  if (\!defender.canCounterAttack) return false;
  
  const counterWeapon = selectCounterAttackWeapon(defender, attacker);
  if (\!counterWeapon) return false;
  
  const distance = 1; // 反撃は通常距離1で発生
  return distance >= counterWeapon.range.min && distance <= counterWeapon.range.max;
};

// 戦術的反撃武器選択システム
export const selectCounterAttackWeapon = (unit: Unit, attacker?: Unit): Weapon | undefined => {
  const availableWeapons = getAvailableWeapons(unit);
  if (availableWeapons.length === 0) return undefined;
  
  switch (unit.type) {
    case 'Tank':
      // 戦車：主砲優先、弾薬切れ時は副武装
      const mainWeapon = getMainWeapon(unit);
      return (mainWeapon?.ammunition > 0) ? mainWeapon : availableWeapons[0];
    
    case 'ArmoredCar':
      // 装甲車：攻撃武器に関係なく機銃で反撃
      const machineGun = availableWeapons.find(w => 
        w.type === '36MG機銃' || w.type === '30cal機銃' || w.type === '7.7mm機銃'
      );
      return machineGun || availableWeapons[0];
    
    case 'AntiTank':
      // 対戦車砲：敵のユニットクラスに応じて武器選択
      if (attacker?.unitClass === 'Vehicle') {
        const antiTankGun = availableWeapons.find(w => 
          w.type.includes('主砲') || w.type.includes('対戦車砲')
        );
        return antiTankGun || availableWeapons[0];
      } else {
        const rifle = availableWeapons.find(w => w.type.includes('ライフル'));
        return rifle || availableWeapons[0];
      }
    
    case 'Artillery':
      // 砲兵：近距離ではライフルで応戦
      const rifle = availableWeapons.find(w => w.type.includes('ライフル'));
      return rifle || availableWeapons[0];
    
    default:
      return availableWeapons[0];
  }
};

// 弾薬消費処理（イミュータブル更新）
export const consumeAmmunition = (unit: Unit, weaponId: string): Unit => {
  if (\!unit.weapons) return unit;
  
  return {
    ...unit,
    weapons: unit.weapons.map(weapon => 
      weapon.id === weaponId 
        ? { ...weapon, ammunition: Math.max(0, weapon.ammunition - 1) }
        : weapon
    )
  };
};

// 攻撃射程の動的計算
export const getMaxAttackRange = (unit: Unit): number => {
  const availableWeapons = getAvailableWeapons(unit);
  return availableWeapons.length > 0 
    ? Math.max(...availableWeapons.map(weapon => weapon.range.max)) 
    : 0;
};

export const getMinAttackRange = (unit: Unit): number => {
  const availableWeapons = getAvailableWeapons(unit);
  return availableWeapons.length > 0 
    ? Math.min(...availableWeapons.map(weapon => weapon.range.min)) 
    : 0;
};
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
    const {pos, fuel} = queue.shift()\!;
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
  if (\!isValidPosition(position, board)) return false;
  
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
  if (\!isInRange(attacker.position, target, attacker.range)) {
    return false;
  }
  
  // ターゲット存在チェック
  const targetTile = board.tiles[target.y][target.x];
  if (\!targetTile.unit || targetTile.unit.team === attacker.team) {
    return false;
  }
  
  return true;
}
```

## 武器システム強化の影響

### 戦略的深度の向上
- **リソース管理**: 弾薬という限定リソースの戦術的運用
- **武器特性活用**: 距離・対象に応じた最適武器選択
- **タイミング判断**: 高威力武器の温存 vs 即時使用の判断

### プレイヤー体験の改善
- **選択の自由**: 強制的な「最適」選択からの解放
- **戦術的思考**: 状況判断能力の重要性向上
- **学習曲線**: 武器システムを通じたゲーム理解の深化

### 技術的品質
- **関数型設計**: 純粋関数による予測可能な動作
- **型安全性**: TypeScriptによる実行時エラー防止
- **テスト可能性**: 各関数の独立性による単体テスト容易化

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
- [[WeaponSelectorModal]] - 武器選択UIとの連携

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

describe('weapons', () => {
  test('getAvailableWeapons should filter out empty ammunition', () => {
    const unit = createTestUnit();
    unit.weapons[0].ammunition = 0;
    const available = getAvailableWeapons(unit);
    expect(available).not.toContain(unit.weapons[0]);
  });
});
```

## タグ
#utils #helpers #algorithms #calculations #pathfinding #validation #performance #weapons #tactical-combat
EOF < /dev/null