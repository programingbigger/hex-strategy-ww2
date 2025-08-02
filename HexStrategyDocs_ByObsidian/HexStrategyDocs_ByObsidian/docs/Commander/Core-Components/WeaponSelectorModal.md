# WeaponSelectorModal - 武器選択モーダル

## 概要
戦闘時に使用する武器をプレイヤーが自由に選択できるモーダルダイアログコンポーネントです。従来の自動武器選択システムから完全にプレイヤー主導の戦略的武器選択システムに変更されました。

## ファイル場所
`/Commander/src/components/game/WeaponSelectorModal.tsx`

## 主要機能

### 戦略的武器選択
- **完全な選択自由度**: プレイヤーが任意の使用可能武器を選択可能
- **推奨武器表示**: 最も効果的な武器に「推奨」タグを表示（強制選択なし）
- **弾薬管理**: 弾薬切れ武器の視覚的表示と選択不可制御
- **射程範囲チェック**: 距離に応じた使用可能武器の自動フィルタリング

### UI/UX改善
- **選択状態表示**: ○（未選択）/ ◉（選択済み）による明確な視覚フィードバック
- **武器効果表示**: 対象ユニットクラスに対する武器効果の詳細表示
- **弾薬状況表示**: 現在弾薬数/最大弾薬数の明確な表示
- **操作ガイド**: 選択方法の明確な指示文

## 重要な技術的修正

### useEffect依存関係の修正
**修正前の問題**:
```typescript
React.useEffect(() => {
  setSelectedWeaponId(''); // 武器選択が連続リセット
}, [availableWeapons]);    // 依存関係が不適切
```

**修正後の解決**:
```typescript
React.useEffect(() => {
  if (isOpen) {
    setSelectedWeaponId(''); // モーダル開始時のみリセット
  }
}, [isOpen]);              // 適切な依存関係
```

### 自動選択ロジックの除去
- **修正前**: 「最も効果的」な武器を強制的に選択
- **修正後**: プレイヤーの選択を完全に尊重、推奨表示のみ

## プロパティ仕様

```typescript
interface WeaponSelectorModalProps {
  isOpen: boolean;           // モーダルの表示状態
  attacker: Unit;           // 攻撃を行うユニット
  target: Unit;             // 攻撃対象ユニット
  onWeaponSelect: (weapon: Weapon) => void;  // 武器選択時のコールバック
  onClose: () => void;      // モーダル閉じる時のコールバック
}
```

## 武器選択ロジック

### 使用可能武器の判定
```typescript
const availableWeapons = getWeaponsInRange(attacker, distance);
// 1. 弾薬が残っている武器
// 2. 現在の距離で射程範囲内の武器
// 3. 両条件を満たす武器のみ表示
```

### 推奨武器の決定
```typescript
const getMostEffectiveWeapon = () => {
  return availableWeapons.reduce((best, current) => {
    const currentEffectiveness = current.effectiveness?.[target.unitClass] ?? current.attack;
    const bestEffectiveness = best.effectiveness?.[target.unitClass] ?? best.attack;
    return currentEffectiveness > bestEffectiveness ? current : best;
  });
};
```

### 武器効果表示システム
```typescript
const getEffectivenessDisplay = (weapon: Weapon) => {
  const effectiveness = weapon.effectiveness?.[target.unitClass] ?? weapon.attack;
  const baseAttack = weapon.attack;
  
  if (effectiveness > baseAttack) {
    return `攻撃力: ${weapon.attack} (対${target.unitClass}: +${effectiveness - baseAttack})`;
  } else if (effectiveness < baseAttack) {
    return `攻撃力: ${weapon.attack} (対${target.unitClass}: ${effectiveness - baseAttack})`;
  } else {
    return `攻撃力: ${weapon.attack}`;
  }
};
```

## ゲームプレイへの影響

### 戦略的深度の向上
- **弾薬保存**: 高威力武器の弾薬を温存する戦術的判断
- **射程活用**: 距離に応じた最適な武器選択
- **敵タイプ対応**: 装甲目標には対戦車砲、歩兵には機銃など

### プレイヤー体験の改善
- **選択の自由**: 強制的な「最適」選択から解放
- **戦術的思考**: 状況に応じた武器選択の重要性
- **リソース管理**: 弾薬という限られたリソースの戦略的運用

## 表示情報

### 武器情報表示
- **武器名**: 明確な武器の識別名
- **攻撃力**: 基本攻撃力と対象への効果修正
- **射程**: 最小射程〜最大射程の表示
- **命中率**: 現在距離での推定命中率
- **弾薬状況**: 残弾数/最大弾薬数

### 状態表示
- **選択インジケーター**: ○/◉による選択状態
- **推奨タグ**: 最も効果的な武器への「推奨」表示
- **弾薬切れ表示**: 使用不可武器の明確な識別

## ユーザーインタラクション

### 基本操作
1. **武器選択**: 武器オプションをクリックして選択
2. **選択確認**: 「選択した武器で攻撃」ボタンで実行
3. **キャンセル**: 「キャンセル」ボタンまたは背景クリックで中止

### 操作制限
- **弾薬切れ武器**: クリック不可、視覚的に無効化
- **選択必須**: 武器を選択するまで攻撃ボタン無効
- **射程外武器**: 自動的にリストから除外

## スタイリング仕様

### モーダルデザイン
- **背景**: 半透明黒オーバーレイ（rgba(0, 0, 0, 0.7)）
- **ダイアログ**: ダークテーマ（#2a2a2a背景、#444境界）
- **テキスト**: 白文字（#fff）、ゴールドアクセント（#ffd700）

### 武器選択項目
- **通常状態**: グレー背景（#333）、境界線（#555）
- **選択状態**: 濃いグレー背景（#444）、ゴールド境界（#ffd700）
- **ホバー効果**: 明度変化によるインタラクション フィードバック
- **無効状態**: 透明度50%、赤系境界色（#666）

## 関連コンポーネント

### 連携コンポーネント
- [[GameBoard]] - 攻撃アクション開始時に本モーダルを呼び出し
- [[InformationPanel]] - 選択されたユニットの武器情報表示
- [[WeaponInfoPanel]] - 武器詳細情報の補完表示

### 依存ユーティリティ
- `getWeaponsInRange()` - 射程内武器の取得
- `getDistance()` - ユニット間距離計算
- [[utils-overview]] - 各種計算処理

## エラーハンドリング

### 入力検証
- **null/undefined チェック**: 必須プロパティの存在確認
- **射程外攻撃**: 物理的に不可能な攻撃の防止
- **弾薬切れ**: 使用不可武器の選択防止

### ユーザビリティ保護
- **意図しない攻撃**: 確認ボタンによる二段階実行
- **モーダル外クリック**: 背景クリックでの安全な終了
- **状態不整合**: コンポーネント状態の適切な初期化

## パフォーマンス最適化

### レンダリング最適化
- **条件付きレンダリング**: `isOpen`による不要レンダリング回避
- **メモ化**: 重い計算結果のキャッシュ
- **イベントハンドラー**: 適切なイベント委譲

### 状態管理最適化
- **最小再レンダリング**: 必要な状態変更のみ
- **依存関係整理**: useEffect依存関係の適切な管理
- **メモリリーク防止**: コンポーネントアンマウント時の適切なクリーンアップ

## 将来の拡張可能性

### 機能拡張
- **命中率計算の詳細化**: 地形、天候、経験値による修正
- **武器アニメーション**: 選択時のビジュアルエフェクト
- **音響効果**: 武器選択時のサウンドフィードバック

### UI改善
- **武器アイコン**: 視覚的な武器識別の向上
- **比較表示**: 武器効果の並列比較機能
- **ヘルプシステム**: 武器特性の詳細説明

## バグ修正履歴

### 重要な修正（2025年8月）
1. **useEffect依存関係修正**: `[availableWeapons]` → `[isOpen]`
   - 武器選択の連続リセット問題を解決
   - 攻撃不能バグの根本的修正

2. **自動選択ロジック除去**: 
   - プレイヤーの自由選択を尊重
   - 「最も効果的」武器の強制選択を廃止

3. **UI表示改善**:
   - 選択状態の明確化（○/◉表示）
   - 推奨武器タグの追加
   - 操作説明文の追加

## 関連ファイル
- [[useGameLogic]] - 戦闘処理での武器選択結果の使用
- [[utils-overview]] - 武器関連ユーティリティ関数
- [[BattleScreen]] - メイン戦闘画面での使用
- [[types-index]] - Weapon、Unit型定義の参照

## タグ
#WeaponSelector #Modal #Combat #UI #Strategy #PlayerChoice #BugFix #UX
EOF < /dev/null