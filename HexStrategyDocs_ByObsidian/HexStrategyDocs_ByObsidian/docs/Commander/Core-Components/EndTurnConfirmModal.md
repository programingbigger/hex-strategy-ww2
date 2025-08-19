# EndTurnConfirmModal - ターン終了確認モーダル

## 概要
プレイヤーターンの終了を確認するモーダルコンポーネントです。意図しないターン終了を防止し、重要な操作の取り忘れがないかを最終確認する機能を提供します。ショートカットキー（Cmd+E / Ctrl+E）からの呼び出しにも対応しています。

## ファイル場所
`/Commander/src/components/game/EndTurnConfirmModal.tsx`

## 主要機能

### ターン終了の安全確認
- **操作確認**: ターン終了前の最終確認
- **情報表示**: 現在のターン状況の表示
- **誤操作防止**: 意図しないターン終了の防止
- **ショートカット対応**: キーボードショートカットからの呼び出し

### 表示情報
- 現在のターン数
- 行動可能ユニット数
- 未移動・未攻撃ユニットの警告
- ターン終了の最終確認メッセージ

## Props インターフェース

```typescript
interface EndTurnConfirmModalProps {
  isOpen: boolean;           // モーダル表示状態
  onConfirm: () => void;     // ターン終了確定時のコールバック
  onCancel: () => void;      // キャンセル時のコールバック
}
```

### Props詳細
- **isOpen**: モーダルの表示/非表示制御
- **onConfirm**: "ターン終了"ボタンクリック時に呼び出される
- **onCancel**: "キャンセル"ボタンまたはEscキー押下時に呼び出される

## UI設計

### モーダル構造
```
┌─────────────────────────────────────┐
│ 🎯 ターン終了確認                   │
├─────────────────────────────────────┤
│ 本当にターンを終了しますか？         │
│                                     │
│ ⚠️ 警告事項:                       │
│ • 未移動のユニットがあります        │
│ • 未攻撃のユニットがあります        │
│                                     │
│ この操作は取り消せません。          │
├─────────────────────────────────────┤
│              [キャンセル] [終了確定] │
└─────────────────────────────────────┘
```

### 視覚的デザイン
- **メインアイコン**: 🎯（ターン管理を表現）
- **警告アイコン**: ⚠️（注意喚起）
- **確認ボタン**: 赤系（#dc3545）重要なアクション
- **キャンセルボタン**: グレー系（#6c757d）

## 実装詳細

### 表示条件チェック
```typescript
if (!isOpen) return null;
```

### 警告システム
```typescript
const getUnfinishedUnits = (units: Unit[], activeTeam: Team) => {
  return units.filter(unit => 
    unit.team === activeTeam && 
    (!unit.moved || !unit.attacked) &&
    !unit.loaded
  );
};

const generateWarnings = (unfinishedUnits: Unit[]) => {
  const warnings = [];
  
  const unmoved = unfinishedUnits.filter(u => !u.moved);
  const unattacked = unfinishedUnits.filter(u => !u.attacked);
  
  if (unmoved.length > 0) {
    warnings.push(`未移動のユニットが${unmoved.length}体あります`);
  }
  
  if (unattacked.length > 0) {
    warnings.push(`未攻撃のユニットが${unattacked.length}体あります`);
  }
  
  return warnings;
};
```

### キーボードイベント処理
```typescript
useEffect(() => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
    } else if (event.key === 'Enter') {
      onConfirm();
    }
  };
  
  if (isOpen) {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }
}, [isOpen, onConfirm, onCancel]);
```

## 使用例

### BattleScreenでの統合
```typescript
import EndTurnConfirmModal from '../components/game/EndTurnConfirmModal';

const BattleScreen: React.FC = () => {
  const [isEndTurnConfirmOpen, setIsEndTurnConfirmOpen] = useState(false);
  
  const handleEndTurnConfirm = useCallback(() => {
    handleEndTurn();
    setIsEndTurnConfirmOpen(false);
  }, [handleEndTurn]);

  const handleEndTurnCancel = useCallback(() => {
    setIsEndTurnConfirmOpen(false);
  }, []);

  // ショートカットキー処理
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
        event.preventDefault();
        setIsEndTurnConfirmOpen(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div>
      {/* ゲームコンテンツ */}
      
      <EndTurnConfirmModal
        isOpen={isEndTurnConfirmOpen}
        onConfirm={handleEndTurnConfirm}
        onCancel={handleEndTurnCancel}
      />
    </div>
  );
};
```

### ヘッダーからの呼び出し
```typescript
const Header: React.FC = () => {
  const [isEndTurnConfirmOpen, setIsEndTurnConfirmOpen] = useState(false);
  
  return (
    <header>
      <button onClick={() => setIsEndTurnConfirmOpen(true)}>
        ターン終了
      </button>
      
      <EndTurnConfirmModal
        isOpen={isEndTurnConfirmOpen}
        onConfirm={handleEndTurn}
        onCancel={() => setIsEndTurnConfirmOpen(false)}
      />
    </header>
  );
};
```

## ショートカットキー連携

### キーボードショートカット
- **Cmd+E (Mac) / Ctrl+E (Windows)**: ターン終了確認モーダルを開く
- **Esc**: モーダルをキャンセル
- **Enter**: ターン終了を実行（モーダル内で）

### ショートカット実装
```typescript
const handleKeyPress = useCallback((event: KeyboardEvent) => {
  // Cmd+E or Ctrl+E for End Turn
  if ((event.metaKey || event.ctrlKey) && event.key === 'e') {
    event.preventDefault();
    setIsEndTurnConfirmOpen(true);
  }
  
  // Esc to close modals
  if (event.key === 'Escape') {
    if (isEndTurnConfirmOpen) {
      setIsEndTurnConfirmOpen(false);
    }
  }
}, [isEndTurnConfirmOpen]);
```

## UXインパクト

### プレイヤー体験の向上
- **誤操作防止**: 重要な意思決定の二段階確認
- **状況把握**: 残りアクションの可視化
- **効率化**: ショートカットキーによる操作高速化
- **安心感**: 取り返しのつかない操作の事前確認

### ゲームフロー改善
- **意図的なターン終了**: 計画的なプレイの促進
- **見落とし防止**: 未行動ユニットの警告
- **操作一貫性**: 全体的なUI操作の統一感

## スタイリング詳細

### モーダル外観
```typescript
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // より濃い背景
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    minWidth: '400px',
    maxWidth: '500px'
  }
};
```

### 警告表示スタイル
```typescript
const warningStyles = {
  container: {
    background: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: '6px',
    padding: '12px',
    margin: '16px 0'
  },
  icon: {
    color: '#856404',
    fontSize: '18px'
  },
  text: {
    color: '#856404',
    fontSize: '14px'
  }
};
```

## アクセシビリティ

### スクリーンリーダー対応
```typescript
<div
  role="dialog"
  aria-labelledby="end-turn-title"
  aria-describedby="end-turn-description"
  aria-modal="true"
>
  <h2 id="end-turn-title">ターン終了確認</h2>
  <p id="end-turn-description">本当にターンを終了しますか？</p>
</div>
```

### フォーカス管理
```typescript
useEffect(() => {
  if (isOpen) {
    // モーダル内の最初の要素にフォーカス
    const firstButton = modalRef.current?.querySelector('button');
    firstButton?.focus();
  }
}, [isOpen]);
```

## パフォーマンス最適化

### メモ化の活用
```typescript
const EndTurnConfirmModal = React.memo<EndTurnConfirmModalProps>(
  ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    
    return (
      // Modal content
    );
  }
);
```

### イベントリスナーの最適化
```typescript
useEffect(() => {
  if (!isOpen) return;
  
  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle keyboard events
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onConfirm, onCancel]);
```

## 今後の拡張予定

### 詳細情報の追加
- **ユニット別行動状況**: 各ユニットの詳細状態表示
- **戦況サマリー**: ターン内の主要な出来事まとめ
- **次ターン予告**: 敵ターンの予想される展開

### 設定オプション
```typescript
interface EndTurnSettings {
  showWarnings: boolean;          // 警告表示の有無
  requireDoubleConfirm: boolean;  // 二重確認の必要性
  showShortcutHint: boolean;      // ショートカットヒント表示
}
```

### AI支援機能
- **最適化提案**: より良いターン終了タイミングの提案
- **リスク警告**: 敵の反撃リスクの事前通知
- **戦術アドバイス**: 次ターンの推奨行動

## 依存関係
- [[useGameLogic]] - ターン管理・ユニット状態
- [[ShortcutsPanel]] - ショートカットキー一覧表示
- [[TurnChangeModal]] - ターン切替後の表示

## 関連コンポーネント
- [[Header]] - ターン終了ボタンの配置
- [[SelectedUnitPanel]] - ユニット行動状況の表示
- [[BattleLogPanel]] - ターン内行動履歴の表示

## ゲームフローとの関係
- **ターン管理**: プレイヤーターンの適切な終了
- **状態保存**: ターン終了時の状態スナップショット
- **AI移行**: 敵ターンへのスムーズな移行

## タグ
#EndTurn #Modal #Confirmation #UX #Shortcuts #TurnManagement #UserInterface
