# Game-Logic - ゲームロジック

戦闘システムと状態管理の中核を担うロジック群です。

## モジュール一覧

### [[useGameLogic]] - メインゲームロジック
戦闘計算、ターン管理、AI処理の統合管理フック

### [[constants]] - ゲームバランス設定  
ユニット能力、地形効果、戦闘ルールの定数定義

## 依存関係

```
useGameLogic → constants
useGameLogic → types-index
```

## タグ
#GameLogic #Combat #Rules #Balance