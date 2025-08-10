# useGameLogic - メインゲームロジックフック

## 概要

ヘックス戦略ゲームの核となるロジックを管理するReactカスタムフックです。ゲーム状態、戦闘システム、ターン管理、勝利条件など、すべてのゲームメカニクスを統合管理します。このフックは、`Commander/src/hooks/useGameLogic.ts` にあります。

## 主要機能

- **状態管理:** ゲームの全状態（ターン、アクティブプレイヤー、ユニット、ボード、勝利条件など）を一元管理。
- **ゲームサイクル管理:** `loadGame` による初期化、`handleEndTurn` によるターン進行。
- **ユーザーインタラクション:** `handleHexClick` によるユニットの選択、移動、攻撃命令の受付。
- **戦闘システム:** `handleAttackWithWeapon` を中心とした、武器、地形効果、反撃を考慮した戦闘処理。
- **補給と回復:** ターン開始時の自動的なHP・燃料・弾薬の回復処理。
- **勝利条件判定:** ターン終了ごとに、複数の勝利条件（敵全滅、首都占領など）を優先順位に従って判定。
- **アクション履歴:** `history` stateを利用した「元に戻す」機能。

## 主要な関数とロジックフロー

### ゲームの読み込みとターン進行

```typescript
// マップデータからゲームを初期化
const loadGame = (mapData: MapData) => { /* ... */ }

// ターンを終了し、次のプレイヤーへ移行
const handleEndTurn = useCallback(() => {
  // 1. プレイヤー交代
  // 2. 全ユニットの行動フラグをリセット
  // 3. 次のチームのユニットの補給・回復処理
  //    - 所有する都市・首都にいる陸上ユニットが対象
  //    - HP、燃料、弾薬を回復
  // 4. ターン数を更新（Blueチームのターン開始時）
  // 5. 天候を更新し、状況に応じて地形を「ぬかるみ」に変更
  // 6. 勝利条件とターン制限をチェック
}, [/* ... */]);
```

### ユニットの行動と戦闘

```typescript
// ヘックスがクリックされたときの処理
const handleHexClick = useCallback((coord: Coordinate) => {
  // 選択、移動、攻撃のロジックを処理
  if (selectedUnit) {
    // 攻撃可能な敵ユニットをクリックした場合
    if (isAttackable && unitOnHex) {
      // 武器選択モーダルを開くか、直接攻撃を実行
      setWeaponSelectionState({ isOpen: true, attacker: selectedUnit, target: unitOnHex });
      return;
    }
    // 移動可能な空き地をクリックした場合
    if (isReachable && !unitOnHex) {
      // ユニットを移動させ、燃料を消費
      // 砲兵は移動後に攻撃不可
    }
  }
}, [/* ... */]);

// 武器を使用した攻撃処理
const handleAttackWithWeapon = useCallback((attacker: Unit, defender: Unit, weapon: Weapon) => {
  // 1. ダメージ計算（武器攻撃力、相性、地形効果）
  // 2. 攻撃側の弾薬を消費
  // 3. 戦闘レポートを作成
  // 4. 双方のHPを更新 (HPが0になったユニットは除去)
  // 5. 防御側が反撃可能な場合、自動で武器を選択して反撃
  // 6. 勝利条件をチェック
}, [/* ... */]);
```

### 特殊アクション

```typescript
// 待機、占領、元に戻すアクションを処理
const handleAction = useCallback((action: 'wait' | 'undo' | 'capture') => {
  if (action === 'wait') { /* ユニットの行動を完了 */ }
  if (action === 'capture') {
    // 歩兵が敵都市のHPを減少させる
    // HPが0になったら自軍の都市に
  }
  if (action === 'undo') {
    // history stateから直前の状態を復元
  }
}, [/* ... */]);
```

## 勝利条件の判定 (`checkWinCondition`)

ターン終了時に、以下の優先順位で勝利条件を評価します。

1.  **敵軍全滅:** どちらかのチームのユニットが0になった場合。
2.  **首都占領:** マップ上の全ての首都を一方のチームが占領した場合。
3.  **全都市占領:** マップ上の全ての占領可能施設を一方のチームが占領した場合。

## 依存関係

- **Types:** `../types/index.ts`
- **Utils:** `../utils/map.ts`, `../utils/weapons.ts`, `../utils/logger.ts`
- **Config:** `../config/constants.ts`
- **Data:** `../data/units.ts`

## タグ
#useGameLogic #GameCore #Hooks #Combat #TurnManagement #StateManagement
