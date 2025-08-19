# Commander - ゲームフローとスクリーン推移ガイド

## 全体像

Commanderは、第二次世界大戦をモチーフにしたヘクサゴナル戦略ゲームです。プレイヤーは複数の画面を段階的に進みながら、戦略的な判断を行い、最終的に戦場での勝利を目指します。

### 技術的実装の概要
- **フレームワーク**: React + TypeScript
- **状態管理**: `useState` Hook による局所的状態管理
- **スクリーン管理**: `App.tsx`の`renderCurrentScreen()`関数による集中管理
- **ナビゲーション**: `navigateToScreen()` 関数による画面遷移制御

---

## 🎮 ゲーム全体フロー

```
タイトル画面 → シナリオ選択 → 戦闘準備 → 部隊配置 → 戦闘画面 → 結果画面
     ↓              ↓           ↓         ↓         ↓
TitleScreen → ScenarioSelect → BattlePrep → Deployment → BattleScreen
                                                           ↓
                                                     VictoryModal
```

### 主要データフロー
1. **マップデータ**: `loadCompleteMap()` でJSONファイルから読み込み
2. **ユニット情報**: 各画面で段階的に構築・更新
3. **ゲーム状態**: `GameState` オブジェクトで一元管理

---

## 📱 詳細スクリーン解説

### 1. タイトル画面 (TitleScreen)
**実装ファイル**: `Commander/src/screens/TitleScreen.tsx`

#### 画面の役割
- ゲームのエントリーポイント
- ゲームモード選択の入り口

#### 使用技術
```typescript
// React Functional Component
const TitleScreen: React.FC<TitleScreenProps> = ({ onNavigate }) => {
  const [modeSelectExpanded, setModeSelectExpanded] = useState(false);
  // ...
}
```

#### UI構成
- **タイトルロゴ**: "COMMANDER" の大きな表示
- **サブタイトル**: ゲーム説明テキスト
- **ナビゲーションボタン**: 次の画面への遷移

#### 画面遷移
```typescript
// シナリオ選択画面への遷移
onNavigate('scenario-select')
```

---

### 2. シナリオ選択画面 (ScenarioSelectScreen)
**実装ファイル**: `Commander/src/screens/ScenarioSelectScreen.tsx`

#### 画面の役割
- 利用可能なマップから戦場を選択
- 戦術環境の事前確認

#### 使用技術
```typescript
const ScenarioSelectScreen: React.FC<ScenarioSelectScreenProps> = ({ onNavigate }) => {
  const handleMapSelect = (map: GameMap) => {
    onNavigate('battle-prep', map); // マップデータと共に次画面へ
  };
}
```

#### データ処理
- **マップリスト**: `availableMaps` 配列から表示
- **マップ選択**: 選択したマップデータを次画面に渡す

#### UI構成
- **マップカード**: 各マップの概要表示
- **選択インタラクション**: クリックで即座に次画面へ

---

### 3. 戦闘準備画面 (BattlePrepScreen)
**実装ファイル**: `Commander/src/screens/BattlePrepScreen.tsx`

#### 画面の役割
- 軍隊編成とユニット選択
- 戦術プランニング

#### 使用技術
```typescript
// 戦闘準備状態の管理
interface BattlePrepState {
  selectedUnits: Unit[];
  deployedUnits: Map<string, {x: number, y: number}>;
  // ...
}
```

#### データフロー
1. **マップデータ読み込み**: 前画面から受け取ったマップ情報を展開
2. **ユニット選択**: プレイヤーが使用する部隊を決定
3. **状態更新**: `onUpdateBattlePrep()` で準備状況を更新

---

### 4. 部隊配置画面 (UnitDeploymentScreen)
**実装ファイル**: `Commander/src/screens/UnitDeploymentScreen.tsx`

#### 画面の役割
- 選択したユニットの戦場配置
- 初期戦術ポジショニング

#### 使用技術
```typescript
// 配置システム
const deployedUnits = gameState.battlePrep?.deployedUnits || new Map();

// 配置可能エリアの判定
const isValidDeploymentPosition = (x: number, y: number) => {
  // 5ヘクス半径内の首都周辺エリア判定ロジック
}
```

#### 配置ロジック
- **配置制限**: 首都から5ヘクス半径内のみ
- **ユニット管理**: マップベースでの位置情報保存
- **視覚的フィードバック**: 配置可能エリアのハイライト

---

### 5. 戦闘画面 (BattleScreen) - メインゲーム
**実装ファイル**: `Commander/src/screens/BattleScreen.tsx`

#### 画面の役割
- 実際の戦闘シミュレーション
- ターン制戦略ゲームプレイ

#### 使用技術
```typescript
// ゲームロジックの中心
const {
  gameState: battleGameState,
  turn, activeTeam, boardLayout, units,
  selectedUnit, hoveredHex, weather,
  handleEndTurn, handleHexClick, handleAction
} = useGameLogic(); // カスタムフック使用
```

#### 主要システム

##### 🌦️ 天候システム
```typescript
// 天候による背景グラデーション
const getWeatherBackground = (): string => {
  switch (weather) {
    case 'Clear':
      return 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 50%, #B0E0E6 100%)';
    case 'Rain':
      return 'linear-gradient(135deg, #708090 0%, #A9A9A9 50%, #C0C0C0 100%)';
    case 'Storm':
      return 'linear-gradient(135deg, #2F4F4F 0%, #4B0082 30%, #191970 60%, #000000 100%)';
  }
};
```

**実装コンポーネント**: `RainEffect.tsx` - CSS KeyFramesアニメーション

##### ⌨️ キーボードショートカット
```typescript
const handleKeyPress = useCallback((event: KeyboardEvent) => {
  // Cmd+E / Ctrl+E でターン終了
  if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
    event.preventDefault();
    setIsEndTurnConfirmOpen(true);
  }
  
  // Escでモーダル閉じる・選択モード解除
  if (event.key === 'Escape') {
    // Engineer/Transport モード解除ロジック
  }
}, [dependencies]);
```

##### 🚛 輸送システム
**実装コンポーネント**: `TransportActionConfirmModal.tsx`
```typescript
// 輸送アクション管理
const {
  transportActionState,
  startTransportAction,
  handleTransportTargetSelect,
  confirmTransportAction
} = useGameLogic();
```

##### ⚙️ 工兵システム
**実装コンポーネント**: `EngineerActionConfirmModal.tsx`
```typescript
// 地形改変システム
const {
  engineerActionState,
  engineerConfirmState,
  confirmEngineerAction
} = useGameLogic();
```

#### ゲームボード描画
**実装コンポーネント**: `GameBoard.tsx`, `Hexagon.tsx`
- **ヘクサゴン描画**: SVG ベースの六角形グリッド
- **ユニット表示**: 軍事シンボルの動的描画
- **インタラクション**: クリック・ホバー処理

#### UI パネルシステム
1. **Header.tsx**: ターン・チーム・天候情報
2. **SelectedUnitPanel.tsx**: 選択ユニット詳細
3. **InformationPanel.tsx**: 戦場情報表示
4. **BattleLogPanel.tsx**: 戦闘ログ履歴
5. **WeaponInfoPanel.tsx**: 武器情報表示
6. **ShortcutsPanel.tsx**: キーボードショートカット一覧

#### モーダルシステム
1. **TurnChangeModal.tsx**: ターン切り替え通知
2. **EndTurnConfirmModal.tsx**: ターン終了確認
3. **WeaponSelectorModal.tsx**: 武器選択
4. **VictoryModal.tsx**: 勝利・敗北表示

---

## 🔄 ターンベースフロー

### ターン管理システム
```typescript
// ターン検出とモーダル表示
useEffect(() => {
  if (turn !== lastTurn || activeTeam !== lastActiveTeam) {
    setIsTurnChangeModalOpen(true); // ターン変更通知
    setLastTurn(turn);
    setLastActiveTeam(activeTeam);
  }
}, [turn, activeTeam]);
```

### プレイヤーアクションフロー
1. **ユニット選択** → `handleHexClick()`
2. **移動先選択** → パスファインディング計算
3. **アクション実行** → `handleAction()`
4. **ターン終了** → `handleEndTurn()`

---

## 🎯 勝利条件とゲーム終了

### 勝利判定システム
```typescript
useEffect(() => {
  if (battleGameState === 'gameOver' && winner) {
    const defeatedArmy = winner === 'Blue' ? 'Red' : 'Blue';
    setVictoryInfo({ defeatedArmy, winnerArmy: winner });
    setIsVictoryModalOpen(true);
  }
}, [battleGameState, winner]);
```

### 結果表示
- **VictoryModal**: 勝利・敗北のアニメーション表示
- **スコア計算**: 残存ユニット数、ターン数等の評価
- **リプレイ機能**: タイトル画面への復帰

---

## 🛠️ 技術的な特徴

### 状態管理アーキテクチャ
- **Centralized Navigation**: `App.tsx` での画面管理
- **Local State Management**: 各コンポーネントでの局所状態
- **Custom Hooks**: `useGameLogic` での複雑なゲームロジック分離

### パフォーマンス最適化
- **useCallback**: イベントハンドラーの最適化
- **useEffect**: 適切な依存配列管理
- **CSS Animations**: JavaScript ではなく CSS での軽量アニメーション

### アクセシビリティ対応
- **キーボード対応**: 全機能のキーボード操作サポート
- **スクリーンリーダー**: aria-label による読み上げ対応
- **視覚的フィードバック**: 色以外の手がかりによる状態表示

---

## 📚 追加ドキュメント

詳細な実装については、以下のドキュメントを参照してください：
- [Core Components Documentation](./docs/Commander/Core-Components/README.md)
- [Game Logic Documentation](./docs/Commander/Game-Logic/README.md)
- [Types and Configuration](./docs/Commander/Types-Configuration/types-index.md)

このドキュメントは、実装コードと密接に連携しており、開発者とプレイヤー双方の理解を深めることを目的としています。