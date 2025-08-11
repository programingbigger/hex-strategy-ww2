# useGameLogic - メインゲームロジックフック

## 概要

ヘックス戦略ゲームの核となるロジックを管理するReactカスタムフックです。ゲーム状態、戦闘システム、ターン管理、勝利条件に加え、**工兵の特殊アクション**や**戦闘ログ**、**軍隊の指揮系統**など、すべてのゲームメカニクスを統合管理します。このフックは、`Commander/src/hooks/useGameLogic.ts` にあります。

## 主要機能

- **状態管理:** ゲームの全状態（ターン、ユニット、ボード、天候、勝利条件など）を一元管理。
- **ゲームサイクル管理:** `loadGame` による初期化、`handleEndTurn` によるターン進行。
- **ユーザーインタラクション:** `handleHexClick` によるユニットの選択、移動、攻撃命令の受付。
- **戦闘システム:** `handleAttackWithWeapon` を中心とした、武器、地形効果、反撃を考慮した戦闘処理。
- **補給と回復:** ターン開始時の自動的なHP・燃料・弾薬の回復処理（厳格な条件下）。
- **勝利条件判定:** ターン終了ごとに、複数の勝利条件（敵全滅、首都占領など）を優先順位に従って判定。
- **工兵アクション:** 資材を消費する建設・破壊活動（架橋、要塞化など）の管理。
- **戦闘ログ:** `BattleLogState` を通じて、すべての戦闘イベントを記録・管理。
- **軍隊管理:** `armyManager`と連携し、ユニットの動員や指揮官ボーナスの計算を行う。
- **アクション履歴:** `history` stateを利用した「元に戻す」機能。

## 主要な関数とシステム

### ゲーム進行と補給

- `loadGame(mapData)`: マップデータからゲームを初期化します。
- `handleEndTurn()`: ターンを終了し、次のプレイヤーへ移行します。
  - **厳格な補給ロジック**: 次のターンのチームに所属する**陸上ユニット**が、自軍の**都市・首都**にいる場合のみ、HP・燃料・弾薬を補給します。
  - 天候を更新し、長雨が続くと平原が「ぬかるみ」に変わるなどの地形変化を処理します。
  - ターン制限を超えていないかチェックします。

### ユニットの行動と戦闘

- `handleHexClick(coord)`: ヘックスがクリックされた際の主要な処理です。
  - ユニットの選択、移動、攻撃対象の指定を行います。
  - **工兵アクションモード中**は、ユニット移動がブロックされ、ターゲット選択ロジックが優先されます。
- `handleAttackWithWeapon(attacker, defender, weapon)`: 武器を使用した攻撃処理です。
  - ダメージ計算、弾薬消費、反撃処理を行います。
  - `createBattleLogEntry`を呼び出して、詳細な戦闘ログを生成・追加します。

### 工兵アクションシステム

工兵ユニット (`type === 'Engineer'`) のための多段階アクションを管理します。

1.  `handleAction(action)`: `SelectedUnitPanel`から`'build_bridge'`などのアクションを受け取ると、`startEngineerAction`を呼び出します。
2.  `startEngineerAction(actionType)`: **ターゲット選択モード**を開始します。建設/破壊可能なヘックスをハイライト表示します。
3.  `handleEngineerTargetSelect(coord)`: プレイヤーがターゲットのヘックスをクリックすると、確認モーダル(`EngineerConfirmState`)を開きます。
4.  `confirmEngineerAction()`: プレイヤーが確認すると、`handleMaterialActionWithTarget`を実行し、資材を消費して地形を実際に変更します。

### その他のアクション

- `handleAction(action)`: 上記の工兵アクション以外も処理します。
  - `'wait'`: ユニットの行動を完了させます。
  - `'capture'`: 歩兵が敵の都市/施設のHPを削り、0にすると占領します。
  - `'undo'`: 直前のアクションを取り消します。

### 勝利条件の判定 (`checkWinCondition`)

ターン終了時に、以下の優先順位で勝利条件を評価します。

1.  **敵軍全滅:** どちらかのチームのユニットが0になった場合。
2.  **首都占領:** マップ上の全ての首都を一方のチームが占領した場合。
3.  **全都市占領:** マップ上の全ての占領可能施設を一方のチームが占領した場合。

## 依存関係

- **Types:** `../types/index.ts`
- **Utils:** `../utils/map.ts`, `../utils/weapons.ts`, `../utils/logger.ts`, `../utils/debugLogger.ts`
- **Config:** `../config/constants.ts`
- **Data:** `../data/units.ts`

## タグ
#useGameLogic #GameCore #Hooks #Combat #TurnManagement #StateManagement #Engineer #BattleLog
