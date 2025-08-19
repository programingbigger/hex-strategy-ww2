# 画面遷移詳細ガイド - Screen Transitions Detail

## 🔄 画面遷移システムの技術的実装

### 中央集約型ナビゲーション
**実装場所**: `Commander/src/App.tsx:22-52`

```typescript
const navigateToScreen = async (screen: GameScreen, selectedMap?: GameMap) => {
  if (selectedMap) {
    try {
      // マップデータの完全読み込み
      const { boardLayout, deploymentCenter } = await loadCompleteMap(selectedMap.id);
      
      setGameState(prev => ({
        ...prev,
        currentScreen: screen,
        selectedMap: { ...selectedMap, deploymentCenter },
        board: boardLayout
      }));
    } catch (error) {
      console.error('Failed to load map:', error);
      // フォールバック処理
    }
  }
};
```

### スクリーン判定ロジック
**実装場所**: `Commander/src/App.tsx:77-94`

```typescript
const renderCurrentScreen = () => {
  switch (gameState.currentScreen) {
    case 'title':
      return <TitleScreen onNavigate={navigateToScreen} />;
    case 'scenario-select':
      return <ScenarioSelectScreen onNavigate={navigateToScreen} />;
    case 'battle-prep':
      return <BattlePrepScreen gameState={gameState} onNavigate={navigateToScreen} onUpdateBattlePrep={updateBattlePrep} />;
    case 'deployment':
      return <UnitDeploymentScreen gameState={gameState} onNavigate={navigateToScreen} onUpdateBattlePrep={updateBattlePrep} onStartBattle={startBattle} />;
    case 'battle':
      return <BattleScreen gameState={gameState} setGameState={setGameState} onNavigate={navigateToScreen} />;
    default:
      return <TitleScreen onNavigate={navigateToScreen} />;
  }
};
```

---

## 📱 個別画面遷移詳細

### 1. タイトル → シナリオ選択
**遷移トリガー**: ゲーム開始ボタンクリック
**実装**: `TitleScreen.tsx`

```typescript
// UI要素
<button onClick={() => onNavigate('scenario-select')}>
  ゲーム開始
</button>
```

**データ転送**: なし（軽量遷移）
**ロード時間**: 即座（< 100ms）

---

### 2. シナリオ選択 → 戦闘準備
**遷移トリガー**: マップカードクリック
**実装**: `ScenarioSelectScreen.tsx:9-11`

```typescript
const handleMapSelect = (map: GameMap) => {
  onNavigate('battle-prep', map); // マップデータと共に遷移
};
```

**データ転送内容**:
- マップID
- マップ名
- 地形データ参照
- 敵ユニット配置情報

**非同期処理**:
```typescript
// App.tsx での非同期マップロード
const { boardLayout, deploymentCenter } = await loadCompleteMap(selectedMap.id);
```

---

### 3. 戦闘準備 → 部隊配置
**遷移トリガー**: "配置に進む" ボタン
**実装**: `BattlePrepScreen.tsx`

```typescript
// ユニット選択状態の保存
const handleProceedToDeployment = () => {
  onUpdateBattlePrep({
    selectedUnits: currentSelectedUnits,
    deployedUnits: new Map(),
    // その他の準備状態
  });
  onNavigate('deployment');
};
```

**データ転送内容**:
- 選択されたユニット配列
- 戦闘準備パラメータ
- マップ情報（継続）

---

### 4. 部隊配置 → 戦闘開始
**遷移トリガー**: "戦闘開始" ボタン
**実装**: `UnitDeploymentScreen.tsx`

```typescript
// 配置完了後の戦闘移行
const handleStartBattle = () => {
  // 配置済みユニットをゲームユニットに変換
  const deployedUnits = battlePrep.selectedUnits.map(unit => {
    const deployment = battlePrep.deployedUnits.get(unit.id);
    return deployment ? { ...unit, x: deployment.x, y: deployment.y } : unit;
  });
  
  onStartBattle(); // App.tsx の startBattle() 呼び出し
};
```

**App.tsx での処理**:
```typescript
const startBattle = () => {
  if (gameState.battlePrep) {
    const deployedUnits = gameState.battlePrep.selectedUnits.map(unit => {
      const deployment = gameState.battlePrep!.deployedUnits.get(unit.id);
      return deployment ? { ...unit, x: deployment.x, y: deployment.y } : unit;
    });
    
    setGameState(prev => ({
      ...prev,
      currentScreen: 'battle',
      units: deployedUnits // 戦場にユニット配置
    }));
  }
};
```

---

### 5. 戦闘画面内の状態遷移
**実装**: `BattleScreen.tsx`

#### ターン変更フロー
```typescript
// ターン検出
useEffect(() => {
  if (turn !== lastTurn || activeTeam !== lastActiveTeam) {
    setIsTurnChangeModalOpen(true); // モーダル表示
    setLastTurn(turn);
    setLastActiveTeam(activeTeam);
  }
}, [turn, activeTeam, lastTurn, lastActiveTeam]);
```

#### 勝利判定フロー
```typescript
useEffect(() => {
  if (battleGameState === 'gameOver' && winner) {
    const defeatedArmy = winner === 'Blue' ? 'Red' : 'Blue';
    setVictoryInfo({ defeatedArmy, winnerArmy: winner });
    setIsVictoryModalOpen(true);
    setGameState(prev => ({ ...prev, winner }));
  }
}, [battleGameState, winner, setGameState]);
```

---

## 🎯 モーダル遷移システム

### ターン変更モーダル
**実装**: `TurnChangeModal.tsx`
**表示トリガー**: ターン・チーム変更検出
**背景**: 天候に応じた動的グラデーション

```typescript
// 天候ベース背景
const backgroundGradient = {
  Clear: 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 50%, #B0E0E6 100%)',
  Rain: 'linear-gradient(135deg, #708090 0%, #A9A9A9 50%, #C0C0C0 100%)',
  Storm: 'linear-gradient(135deg, #2F4F4F 0%, #4B0082 30%, #191970 60%, #000000 100%)'
};
```

### 確認モーダル群
1. **EndTurnConfirmModal**: ターン終了確認
2. **EngineerActionConfirmModal**: 工兵作業確認
3. **TransportActionConfirmModal**: 輸送作業確認

**共通パターン**:
```typescript
// モーダル状態管理
const [isModalOpen, setIsModalOpen] = useState(false);

// 確認処理
const handleConfirm = () => {
  setIsModalOpen(false);
  executeAction(); // 実際のアクション実行
};

const handleCancel = () => {
  setIsModalOpen(false);
  // キャンセル処理
};
```

---

## ⌨️ キーボードナビゲーション

### ショートカットシステム
**実装**: `BattleScreen.tsx:82-108`

```typescript
const handleKeyPress = useCallback((event: KeyboardEvent) => {
  // Cmd+E / Ctrl+E: ターン終了
  if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
    event.preventDefault();
    setIsEndTurnConfirmOpen(true);
  }
  
  // Escape: モーダル・選択モード解除
  if (event.key === 'Escape') {
    if (isEndTurnConfirmOpen) {
      setIsEndTurnConfirmOpen(false);
    } else if (engineerActionState.mode !== 'none') {
      cancelEngineerSelectionMode();
    } else if (transportActionState.mode !== 'none') {
      cancelTransportSelectionMode();
    }
  }
  
  // 任意のキー: ターン変更モーダル閉じる
  if (isTurnChangeModalOpen) {
    setIsTurnChangeModalOpen(false);
  }
}, [依存配列]);
```

### ショートカット表示パネル
**実装**: `ShortcutsPanel.tsx`
- 折りたたみ可能UI
- 現在利用可能なショートカット動的表示
- アクセシビリティ対応

---

## 🔧 エラーハンドリングと回復

### マップロード失敗時
```typescript
try {
  const { boardLayout, deploymentCenter } = await loadCompleteMap(selectedMap.id);
  // 正常処理
} catch (error) {
  console.error('Failed to load map:', error);
  // フォールバック用デフォルトマップ使用
  setGameState(prev => ({
    ...prev,
    currentScreen: screen,
    selectedMap // 基本情報のみ
  }));
}
```

### 画面遷移失敗時
```typescript
// App.tsx のデフォルト処理
default:
  return <TitleScreen onNavigate={navigateToScreen} />;
```

---

## 📊 パフォーマンス考慮事項

### 状態更新最適化
- **useCallback**: イベントハンドラーのメモ化
- **適切な依存配列**: 不要な再レンダリング防止
- **条件付きレンダリング**: 大きなコンポーネントの表示制御

### データ転送効率化
- **必要最小限のデータ転送**: 画面間で必要な情報のみ
- **非同期ロード**: マップデータの段階的読み込み
- **フォールバック機能**: ネットワークエラー時の代替手段

---

## 🎨 視覚的フィードバック

### 遷移アニメーション
- **CSS Transitions**: 滑らかな画面切り替え
- **Loading States**: 非同期処理中の視覚的フィードバック
- **Progress Indicators**: 長時間処理の進捗表示

### 状態表示
- **色による区別**: 味方・敵・中立の明確な識別
- **アイコン表示**: 文字に依存しない情報表示
- **ホバー効果**: インタラクティブ要素の明確化

---

この詳細な画面遷移ガイドにより、開発者は実装の全体像を把握し、プレイヤーは操作の流れを理解することができます。各画面とモーダルは明確な責任分担と効率的なデータフローを持ち、優れたユーザーエクスペリエンスを提供します。