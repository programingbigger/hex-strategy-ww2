# TransportActionConfirmModal - 輸送ユニットアクション確認モーダル

## 概要
輸送ユニット（Transport）の降車アクションを実行前に確認するモーダルコンポーネントです。降車位置、降車するユニット情報、地形条件を視覚的に表示し、プレイヤーの意図しない操作を防止します。

## ファイル場所
`/Commander/src/components/game/TransportActionConfirmModal.tsx`

## 主要機能

### 降車アクション確認
- **降車位置表示**: 座標と地形タイプの明示
- **ユニット情報**: 降車するユニットの詳細表示
- **安全性確認**: 降車可能性の事前チェック
- **操作確認**: 意図しない降車の防止

### 情報表示要素
- 降車ユニット名、所属チーム、HP、燃料状況
- 降車予定地の座標・地形情報
- アクション実行/キャンセルボタン

## Props インターフェース

```typescript
interface TransportActionConfirmModalProps {
  isOpen: boolean;                    // モーダル表示状態
  actionType: 'unload' | null;        // アクションタイプ
  targetCoord: Coordinate | null;     // 降車位置座標
  targetTile: Tile | null;           // 降車位置タイル情報
  loadedUnit: Unit | null;           // 降車対象ユニット
  onConfirm: () => void;             // 確認時のコールバック
  onCancel: () => void;              // キャンセル時のコールバック
}
```

### 必須Props
- **isOpen**: モーダルの表示/非表示制御
- **actionType**: 現在`'unload'`のみ対応
- **targetCoord**: 降車位置の{x, y}座標
- **targetTile**: 降車位置の地形・所有者情報
- **loadedUnit**: 降車するユニットオブジェクト

### コールバック関数
- **onConfirm**: 降車実行確定時に呼び出される
- **onCancel**: キャンセル時・モーダル外クリック時に呼び出される

## UI設計

### モーダル構造
```
┌─────────────────────────────────────┐
│ 🚛 降車確認                         │
├─────────────────────────────────────┤
│ 座標 (x, y) の地形に                │
│ ユニット名を降車させますか？         │
├─────────────────────────────────────┤
│ 降車するユニット:                    │
│ ユニット名 (チーム)                  │
│ HP: xx/xx | 燃料: xx/xx            │
├─────────────────────────────────────┤
│ 降車位置:                           │
│ (x, y) - 地形タイプ                 │
├─────────────────────────────────────┤
│              [キャンセル] [降車実行] │
└─────────────────────────────────────┘
```

### アイコン・カラー設計
- **メインアイコン**: 🚛（輸送車両を表現）
- **確認ボタン**: オレンジ系（#fd7e14）
- **キャンセルボタン**: グレー系（#6c757d）
- **情報パネル**: 薄グレー背景（#f8f9fa）

## 実装詳細

### 表示条件チェック
```typescript
if (!isOpen || !actionType || !targetCoord || !targetTile || !loadedUnit) {
  return null;
}
```

### アクションテキスト生成
```typescript
const getActionText = () => {
  switch (actionType) {
    case 'unload':
      return {
        title: '降車確認',
        message: `座標 (${targetCoord.x}, ${targetCoord.y}) の${targetTile.terrain}に${loadedUnit.name || loadedUnit.type}を降車させますか？`,
        action: '降車実行',
        icon: '📤'
      };
    default:
      return {
        title: '確認',
        message: 'アクションを実行しますか？',
        action: '実行',
        icon: '🚛'
      };
  }
};
```

### スタイリング詳細
```typescript
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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

## 使用例

### BattleScreenでの統合
```typescript
import TransportActionConfirmModal from '../components/game/TransportActionConfirmModal';

const BattleScreen: React.FC = () => {
  const { 
    transportConfirmState,
    confirmTransportAction,
    cancelTransportAction 
  } = useGameLogic();

  return (
    <div>
      {/* ゲームコンテンツ */}
      
      <TransportActionConfirmModal
        isOpen={transportConfirmState.isOpen}
        actionType={transportConfirmState.actionType}
        targetCoord={transportConfirmState.targetCoord}
        targetTile={transportConfirmState.targetTile}
        loadedUnit={transportConfirmState.loadedUnit}
        onConfirm={confirmTransportAction}
        onCancel={cancelTransportAction}
      />
    </div>
  );
};
```

### useGameLogicでの状態管理
```typescript
const [transportConfirmState, setTransportConfirmState] = useState<{
  isOpen: boolean;
  actionType: 'unload' | null;
  targetCoord: Coordinate | null;
  targetTile: Tile | null;
  loadedUnit: Unit | null;
}>({ 
  isOpen: false, 
  actionType: null, 
  targetCoord: null, 
  targetTile: null, 
  loadedUnit: null 
});
```

## 輸送システムとの連携

### 降車プロセス
1. **降車モード開始**: 輸送ユニット選択 → "降車" アクション選択
2. **位置選択**: 降車可能位置のハイライト表示
3. **確認モーダル**: TransportActionConfirmModalの表示
4. **降車実行**: モーダル確認後の実際の降車処理

### 降車可能条件
```typescript
const getAvailableUnloadTargets = (transportUnit: Unit): Coordinate[] => {
  const targets: Coordinate[] = [];
  const adjacentPositions = getAdjacentPositions(transportUnit);
  
  for (const pos of adjacentPositions) {
    if (isValidUnloadPosition(pos, transportUnit)) {
      targets.push(pos);
    }
  }
  
  return targets;
};
```

### エラーハンドリング
- **無効な降車位置**: 他ユニット占有地での降車防止
- **地形制限**: 降車ユニットが移動不可能な地形への降車防止
- **範囲外**: 輸送ユニットから離れすぎた位置への降車防止

## アクセシビリティ

### キーボード操作
- **Esc**: モーダルキャンセル
- **Enter**: 降車実行（フォーカス時）
- **Tab**: ボタン間のフォーカス移動

### 視覚的配慮
- **高コントラスト**: 重要情報の明確な色分け
- **十分なクリック領域**: ボタンサイズの最適化
- **情報の階層化**: 重要度に応じた情報配置

## パフォーマンス最適化

### レンダリング最適化
```typescript
const TransportActionConfirmModal = React.memo<TransportActionConfirmModalProps>(
  ({ isOpen, actionType, targetCoord, targetTile, loadedUnit, onConfirm, onCancel }) => {
    // Early return for performance
    if (!isOpen || !actionType || !targetCoord || !targetTile || !loadedUnit) {
      return null;
    }
    
    // Component rendering...
  }
);
```

### 状態管理最適化
- 必要時のみ状態更新
- 不要な再レンダリングの防止
- メモ化によるパフォーマンス向上

## 今後の拡張予定

### 追加アクションタイプ
```typescript
type TransportActionType = 
  | 'unload'           // 降車
  | 'load'             // 乗車
  | 'transfer'         // 他の輸送ユニットへの移乗
  | 'emergency_unload'; // 緊急降車
```

### 詳細情報の追加
- 降車後の移動可能範囲プレビュー
- 降車位置の安全性評価（敵ZOC等）
- 燃料消費予測表示

### バッチ操作対応
- 複数ユニットの同時降車
- 隊列単位での降車管理

## 依存関係
- [[TransportActionState]] - 輸送アクション状態管理
- [[useGameLogic]] - 降車ロジック・状態管理
- [[Coordinate, Tile, Unit]] - 基本型定義

## 関連コンポーネント
- [[SelectedUnitPanel]] - 輸送ユニット選択・アクション開始
- [[GameBoard]] - 降車位置選択・視覚化
- [[Hexagon]] - 降車可能位置のハイライト表示

## 関連システム
- [[輸送システム]] - 乗車・降車の全体フロー
- [[ZOCシステム]] - 降車位置の安全性判定
- [[地形システム]] - 降車可能地形の制限

## タグ
#TransportSystem #Modal #Confirmation #UI #UserExperience #Transport #Unload
