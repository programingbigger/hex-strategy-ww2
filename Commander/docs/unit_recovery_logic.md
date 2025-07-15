
# ユニットの回復ロジック解説

このドキュメントでは、ユニットのHPと燃料の回復に関するロジックについて解説します。

## 1. 回復ロジックの概要

ユニットの回復は、自軍のターンが開始された時に、特定の条件下で自動的に行われます。

- **回復タイミング**: 各プレイヤーのターン開始時
- **回復場所**: 自軍が所有する「都市」地形にいるユニットのみ
- **回復対象**: HPと燃料

## 2. 該当コード

回復ロジックは以下のファイルに記述されています。

- **ファイル名**: `src/hooks/useGameLogic.ts`
- **関数名**: `handleEndTurn`
- **コード箇所**: 148行目〜183行目

```typescript
// Unit healing and resupply logic for the NEXT team (at start of their turn)
const unitsWithHealing = unitsWithReset.map(u => {
  // Only heal units that belong to the next team (starting their turn)
  if (u.team === nextTeam) {
    const unitTile = boardLayout.get(coordToString(u));
    
    if (unitTile && unitTile.terrain === 'City' && unitTile.owner === u.team) {
      // Heal HP by UNIT_HEAL_HP amount, capped at maxHp
      const healedHp = Math.min(u.maxHp, u.hp + UNIT_HEAL_HP);
      // Restore fuel to maximum if UNIT_HEAL_FUEL_FULL is true
      const refueledFuel = UNIT_HEAL_FUEL_FULL ? UNIT_STATS[u.type].maxFuel : u.fuel;
      
      return { ...u, hp: healedHp, fuel: refueledFuel };
    }
  }
  return u;
});
```

## 3. 回復ロジックの詳細

### HPの回復

- **回復量**: `UNIT_HEAL_HP` という定数で定義された値だけ回復します。
- **上限**: ユニットの最大HP（`maxHp`）を超えることはありません。

#### コード変更による影響

- `src/config/constants.ts` ファイル内の `UNIT_HEAL_HP` の値を変更することで、HPの回復量を調整できます。
  - **例**: `UNIT_HEAL_HP` を `10` から `20` に変更すると、都市での回復量が2倍になります。これにより、ユニットの生存率が向上し、より攻撃的な戦略を取ることが可能になります。

### 燃料の回復

- **回復量**: `UNIT_HEAL_FUEL_FULL` という定数が `true` の場合、燃料が最大値（`maxFuel`）まで全回復します。
- **`false`の場合**: 燃料は回復しません。

#### コード変更による影響

- `src/config/constants.ts` ファイル内の `UNIT_HEAL_FUEL_FULL` の値を変更することで、燃料の回復仕様を変更できます。
  - **例**: `UNIT_HEAL_FUEL_FULL` を `false` に変更すると、都市にいても燃料が回復しなくなります。これにより、補給の概念がより重要になり、プレイヤーはユニットの燃料管理に一層注意を払う必要があります。長距離の移動や、燃料消費の激しいユニットの運用が難しくなります。

## 4. まとめ

ユニットの回復ロジックは `useGameLogic.ts` に集約されており、具体的な回復量や条件は `constants.ts` ファイルで定義されています。これらのファイルを変更することで、ゲームバランスを調整し、異なる戦略的体験を生み出すことが可能です。
