# Core-Components - コアコンポーネント

ゲームの中核となるUI要素とボード描画機能を提供するコンポーネント群です。ゲームプレイに必要な基本機能から、最新の天候システム、輸送・工作システム、UI改善まで包含しています。

## ゲーム表示コンポーネント

### [[GameBoard]] - ゲームボード表示
ヘックスマップとユニットの表示、プレイヤー操作を担当

### [[Hexagon]] - ヘックスタイル 
個別の6角形タイルと地形・ユニットの描画

### [[InformationPanel]] - 情報表示パネル
選択されたユニット・タイルの詳細情報表示

### [[Header]] - ヘッダーコンポーネント
ターン情報、天候、勝利条件の表示

### [[SelectedUnitPanel]] - 選択ユニットパネル
選択されたユニットの詳細情報と行動選択UI

## 戦闘・情報表示コンポーネント

### [[BattleLogPanel]] - 戦闘ログパネル
戦闘結果とゲーム内イベントの履歴表示

### [[VictoryModal]] - 勝利モーダル
ゲーム終了時の勝利・敗北結果表示

### [[WeaponInfoPanel]] - 武器情報パネル
ユニットの武装詳細と弾薬状況の表示

### [[WeaponSelectorModal]] - 武器選択モーダル
攻撃時の使用武器選択インターフェース

## 天候システムコンポーネント

### [[RainEffect]] - 天候エフェクト
雨、大雨、嵐の視覚的アニメーション効果

## アクション確認コンポーネント

### [[TransportActionConfirmModal]] - 輸送アクション確認
輸送ユニットの降車アクション実行前確認

### [[EngineerActionConfirmModal]] - 工作アクション確認  
工作車の地形改変（架橋・橋破壊）実行前確認

### [[EndTurnConfirmModal]] - ターン終了確認
プレイヤーターン終了前の最終確認

### [[TurnChangeModal]] - ターン切替通知
ターン切替時の状況表示と天候情報

## ユーザビリティ向上コンポーネント

### [[ShortcutsPanel]] - ショートカットパネル
利用可能なキーボードショートカットの表示

## 依存関係

### 基本表示システム
```
GameBoard → Hexagon
GameBoard → InformationPanel  
BattleScreen → Header
BattleScreen → SelectedUnitPanel
```

### 天候システム
```
BattleScreen → RainEffect
TurnChangeModal → WeatherType
Header → WeatherType
```

### アクションシステム
```
BattleScreen → TransportActionConfirmModal
BattleScreen → EngineerActionConfirmModal
BattleScreen → EndTurnConfirmModal
BattleScreen → TurnChangeModal
```

### 戦闘システム
```
BattleScreen → BattleLogPanel
BattleScreen → WeaponSelectorModal
SelectedUnitPanel → WeaponInfoPanel
```

### ユーザビリティ
```
BattleScreen → ShortcutsPanel
BattleScreen → VictoryModal
```

## 機能別分類

### 💻 基本UI
- GameBoard, Hexagon, Header, InformationPanel

### ⚔️ 戦闘・戦術
- BattleLogPanel, WeaponInfoPanel, WeaponSelectorModal, VictoryModal

### 🌦️ 天候システム
- RainEffect, TurnChangeModal (天候表示)

### 🚛 輸送・工作システム
- TransportActionConfirmModal, EngineerActionConfirmModal

### 🎮 ユーザビリティ
- EndTurnConfirmModal, TurnChangeModal, ShortcutsPanel, SelectedUnitPanel

### 📊 情報表示
- InformationPanel, BattleLogPanel, WeaponInfoPanel

## 最新の追加機能

### 天候システム (v2.1.0)
- **RainEffect**: 雨・大雨・嵐の視覚エフェクト
- **天候別背景**: ターン切替時の天候対応背景色

### 輸送システム (v2.0.0)
- **TransportActionConfirmModal**: 安全な降車操作の確認
- **輸送ユニット**: 歩兵の輸送・降車機能

### 工作システム (v2.0.0)
- **EngineerActionConfirmModal**: 地形改変の事前確認
- **工作車**: 架橋・橋破壊による戦術的地形変更

### UI/UX改善 (v1.9.0)
- **EndTurnConfirmModal**: ターン終了の安全確認
- **TurnChangeModal**: 天候情報付きターン切替通知
- **ShortcutsPanel**: キーボードショートカット表示

## 開発ガイドライン

### 新規コンポーネント追加時
1. 適切なPropsインターフェースの定義
2. TypeScript型安全性の確保
3. アクセシビリティ対応（ARIA属性）
4. レスポンシブデザイン考慮
5. パフォーマンス最適化（React.memo等）

### 既存コンポーネント更新時
1. 後方互換性の維持
2. 関連コンポーネントへの影響確認
3. テスト実行とデバッグ
4. ドキュメント更新

## タグ
#CoreComponents #UI #GameDisplay #WeatherSystem #TransportSystem #EngineerSystem #UserExperience
