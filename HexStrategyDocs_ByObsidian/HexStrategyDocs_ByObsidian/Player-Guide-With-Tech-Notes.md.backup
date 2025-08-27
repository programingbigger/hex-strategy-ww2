# Commanderプレイヤーガイド - 技術実装解説付き

## 🎮 ゲーム概要

Commanderは第二次世界大戦をモチーフにしたヘクサゴナル（六角形）グリッド戦略ゲームです。プレイヤーは軍指揮官として、限られたリソースで戦術的判断を行い、敵軍を撃破して勝利を目指します。

**技術的背景**: React + TypeScript で構築されており、ブラウザ上で動作するWebアプリケーションです。

---

## 🚀 ゲーム開始から戦闘まで

### 1. タイトル画面
**操作**: "ゲーム開始" ボタンをクリック
**実装**: `TitleScreen.tsx` - React Functional Component

ゲームのメインエントリーポイントです。シンプルなUIで直感的にゲームを開始できます。

### 2. シナリオ(マップ)選択
**操作**: 任意のマップカードをクリック
**実装**: `ScenarioSelectScreen.tsx` - JSONファイルからマップデータを動的読み込み

```typescript
// マップデータ例
{
  "id": "tutorial_basic",
  "name": "基本訓練",
  "description": "基本的な戦術を学ぶトレーニングマップ",
  "terrain": {...}
}
```

各マップには固有の地形、敵配置、勝利条件が設定されています。

### 3. 戦闘準備
**操作**: 使用するユニットを選択
**実装**: `BattlePrepScreen.tsx` - 動的ユニット選択システム

利用可能なユニットタイプ:
- **Infantry** (歩兵): 汎用性が高く、都市制圧に適している
- **Tank** (戦車): 高い攻撃力と装甲を持つ主力ユニット
- **Artillery** (砲兵): 長距離攻撃が可能だが移動力は低い
- **Engineer** (工兵): 橋の建設・破壊など地形改変が可能

### 4. 部隊配置
**操作**: 選択したユニットを戦場に配置
**実装**: `UnitDeploymentScreen.tsx` - ヘクサゴン座標システム

**配置ルール**:
- 首都から5ヘクス以内のエリアのみ配置可能
- 他のユニットや敵と重複配置不可
- 地形による制限あり（山岳地帯など）

**技術的詳細**: 六角形座標系を使用し、効率的な距離計算とパスファインディングを実現

---

## ⚔️ 戦闘システム詳細

### ターン制システム
**実装**: `useGameLogic.tsx` - カスタムReact Hook

1. **ブルー軍ターン** → **レッド軍ターン** → **ターン数増加**
2. 各ターンで全ユニットの行動が可能
3. ターン終了は `Cmd+E` (Mac) / `Ctrl+E` (Windows) で実行

```typescript
// ターン管理の核心ロジック
const handleEndTurn = () => {
  setActiveTeam(activeTeam === 'Blue' ? 'Red' : 'Blue');
  if (activeTeam === 'Red') {
    setTurn(turn + 1);
  }
};
```

### ユニット行動システム

#### 移動
**操作**: ユニットをクリック → 目的地をクリック
**実装**: A*アルゴリズムによる最適経路計算

**移動ルール**:
- 各ユニットに固有の移動力設定
- 地形による移動コスト変動
- 敵のZOC(Zone of Control)による移動制限

**技術実装**: `map.ts` の `findPath()` 関数

#### 攻撃
**操作**: 自軍ユニット選択 → 敵ユニットクリック
**実装**: `weapons.ts` の戦闘計算システム

**攻撃システム**:
```typescript
// 戦闘計算の基本式
const baseDamage = attacker.attack - defender.defense;
const terrainModifier = getTerrainDefenseBonus(defender.position);
const finalDamage = Math.max(1, baseDamage - terrainModifier);
```

**地形効果**:
- **森林**: 防御+2
- **山岳**: 防御+3
- **都市**: 防御+4
- **平原**: 効果なし

### 特殊アクション

#### 🚛 輸送システム
**操作**: 輸送ユニット選択 → "Load"ボタン → 歩兵選択
**実装**: `TransportActionConfirmModal.tsx`

**輸送ルール**:
- 輸送ユニットは歩兵のみ搭載可能
- 搭載中は輸送ユニットと歩兵が一体移動
- Unload時は隣接ヘクスに歩兵を配置

**技術的特徴**: ユニット間の親子関係管理とUI連動

#### ⚙️ 工兵システム
**操作**: 工兵選択 → "Engineer"ボタン → 対象地形選択
**実装**: `EngineerActionConfirmModal.tsx`

**工兵能力**:
- **橋建設**: 川を渡れる橋を建設 (コスト: 材料3)
- **橋破壊**: 既存の橋を破壊 (コスト: 材料1)
- **地形整地**: 一部地形の改変

**実装詳細**: 動的な地形データ更新とリアルタイム表示

---

## 🌦️ 天候システム

**実装**: `RainEffect.tsx` - CSS KeyFramesアニメーション

### 天候タイプと効果

1. **Clear** (晴天)
   - 効果: なし
   - 背景: 爽やかなブルーグラデーション

2. **Rain** (雨)
   - 移動コスト +1
   - 視界 -1ヘクス
   - 背景: グレートーンのグラデーション
   - **視覚効果**: CSS雨粒アニメーション

3. **HeavyRain** (大雨)
   - 移動コスト +2
   - 視界 -2ヘクス
   - 攻撃効率 -20%

4. **Storm** (嵐)
   - 移動コスト +3
   - 視界 -3ヘクス
   - 攻撃効率 -40%
   - 背景: ダークパープル/ブラックグラデーション

**技術実装**:
```css
/* 雨のアニメーション */
@keyframes rainDrop {
  0% { transform: translateY(-100vh) translateX(0); opacity: 1; }
  100% { transform: translateY(100vh) translateX(-50px); opacity: 0; }
}
```

---

## ⌨️ キーボードショートカット

**実装**: `BattleScreen.tsx` のイベントリスナー

### 利用可能なショートカット
| キー | 機能 | 実装詳細 |
|------|------|----------|
| `Cmd+E` / `Ctrl+E` | ターン終了 | `handleKeyPress()` 関数 |
| `Escape` | モーダル閉じる/選択解除 | 複数状態の段階的解除 |
| `任意のキー` | ターン変更通知を閉じる | `isTurnChangeModalOpen` 管理 |

**ショートカット表示**: `ShortcutsPanel.tsx` で動的に現在利用可能なショートカットを表示

---

## 🎯 勝利条件

### 勝利パターン
1. **全滅勝利**: 敵軍ユニットをすべて撃破
2. **首都占領**: 敵の首都を制圧し保持
3. **ポイント勝利**: 指定ターン数での戦略ポイント比較

**技術実装**: `useGameLogic.tsx` の勝利判定ロジック
```typescript
// 勝利条件チェック
const checkVictoryConditions = () => {
  const blueUnits = units.filter(u => u.team === 'Blue');
  const redUnits = units.filter(u => u.team === 'Red');
  
  if (blueUnits.length === 0) return 'Red';
  if (redUnits.length === 0) return 'Blue';
  
  // 首都制圧チェック
  // ...
};
```

### 勝利時の表示
**実装**: `VictoryModal.tsx`
- アニメーション付き勝利/敗北表示
- 戦闘統計の表示
- リプレイ/タイトル復帰選択

---

## 📊 ゲーム情報UI

### メイン情報パネル
**実装**: 各種専用コンポーネント

1. **Header.tsx**: ターン、チーム、天候、ユニット数
2. **SelectedUnitPanel.tsx**: 選択ユニットの詳細ステータス
3. **InformationPanel.tsx**: 地形情報、戦術ヒント
4. **BattleLogPanel.tsx**: 戦闘履歴とイベントログ
5. **WeaponInfoPanel.tsx**: 武器性能と射程表示

### 動的情報更新
- **リアルタイム**: ゲーム状態の変化を即座に反映
- **条件付き表示**: 状況に応じた情報の出し分け
- **アクセシビリティ**: スクリーンリーダー対応

---

## 🔧 技術的特徴とパフォーマンス

### フロントエンド技術スタック
- **React 18**: 関数型コンポーネントとHooks
- **TypeScript**: 型安全性とIDE支援
- **CSS3**: アニメーションと responsive design
- **SVG**: ベクター描画によるスケーラブルグラフィック

### 最適化手法
- **useCallback**: 不要な再レンダリング防止
- **メモ化**: 計算集約的な処理の結果キャッシュ
- **条件付きレンダリング**: 必要な時のみコンポーネント描画
- **CSS Animations**: JavaScript アニメーションより軽量

### データ管理
- **局所状態管理**: 各コンポーネントでの適切な状態分離
- **Prop Drilling 回避**: カスタムHooksによるロジック共有
- **非同期処理**: マップデータの段階的ロード

---

## 🎨 UI/UXデザイン哲学

### 視覚デザイン
- **軍事テーマ**: NATO軍事シンボル準拠
- **色彩設計**: 色覚多様性を考慮した配色
- **情報階層**: 重要度に応じた視覚的重み付け

### インタラクション設計
- **直感的操作**: マウスクリック中心の操作体系
- **フィードバック**: すべての操作に明確な反応
- **エラー防止**: 確認ダイアログによる誤操作防止

### アクセシビリティ
- **キーボード操作**: マウス不使用でも完全操作可能
- **スクリーンリーダー**: aria-label による音声読み上げ対応
- **フォーカス管理**: 明確なフォーカス順序と視覚化

---

## 📚 さらなる学習リソース

### 開発者向けドキュメント
- [Core Components](./docs/Commander/Core-Components/README.md): UIコンポーネント詳細
- [Game Logic](./docs/Commander/Game-Logic/README.md): ゲームロジック実装
- [Types Configuration](./docs/Commander/Types-Configuration/types-index.md): 型定義

### プレイヤー向けガイド
- [戦術ガイド](./tactical-guide.md): 高度な戦術とコツ
- [マップ攻略](./map-strategies.md): マップ別攻略法
- [ユニット運用](./unit-management.md): 効果的なユニット運用

---

このガイドにより、プレイヤーはゲームを楽しみながら、その背後にある技術実装も理解できます。Commanderは単なるゲームを超えて、現代的なWeb開発技術の実践例としても価値のあるプロジェクトです。