# Commander - ヘックス戦略ゲーム

## 概要
Commander は TypeScript/React で構築された第二次世界大戦をテーマとしたヘックス戦略ゲームです。プレイヤーは青軍として赤軍と戦い、都市を占領し、戦術的な勝利を目指します。

## アーキテクチャ概要
- **技術スタック**: React 18.2.0, TypeScript 4.9.5
- **状態管理**: React Hooks ベース
- **ゲームフロー**: タイトル → ホーム → シナリオ選択 → 戦闘準備 → ユニット配置 → 戦闘 → 結果

## ドキュメント構造

### [[Core-Components]] - コアコンポーネント
ゲームの核となるUI要素とボード描画機能
- [[GameBoard]] - ヘックスマップの描画とユーザー操作
- [[Hexagon]] - 個別ヘックスタイルの表示
- [[InformationPanel]] - ゲーム情報表示パネル

### [[Game-Logic]] - ゲームロジック  
戦闘システムと状態管理の中核
- [[useGameLogic]] - メインゲームロジックフック
- [[constants]] - ゲームバランス設定

### [[Screen-Components]] - 画面コンポーネント
各ゲーム画面の実装
- [[TitleScreen]] - タイトル画面
- [[BattleScreen]] - 戦闘画面
- [[UnitDeploymentScreen]] - ユニット配置画面

### [[Types-Configuration]] - 型定義・設定
TypeScript型定義とゲーム設定
- [[types-index]] - 全型定義
- [[game-constants]] - ゲーム定数

### [[Utils-Helpers]] - ユーティリティ・ヘルパー
汎用的な機能とヘルパー関数

## タグ
#Commander #HexStrategy #TypeScript #React #WW2Game #Documentation