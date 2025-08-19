# EngineerActionConfirmModal - 工作車アクション確認モーダル

## 概要
工作車ユニット（Engineer）の地形改変アクション（架橋・橋破壊）を実行前に確認するモーダルコンポーネントです。アクション内容、対象地形、必要資材コストを表示し、重要な地形変更の意図を確認します。

## ファイル場所
`/Commander/src/components/game/EngineerActionConfirmModal.tsx`

## 主要機能

### 地形改変アクション確認
- **架橋（Bridge Building）**: 河川への橋梁建設
- **橋破壊（Bridge Destruction）**: 既存橋梁の破壊
- **資材コスト表示**: アクション実行に必要な資材量
- **対象位置表示**: 座標と現在の地形状況

### 戦略的重要性
地形改変は戦術に大きな影響を与えるため、確認プロセスが必須：
- **架橋**: 部隊の新たな移動ルート確保
- **橋破壊**: 敵の進軍ルート遮断
- **資材管理**: 限られた資材の効率的使用

## Props インターフェース

```typescript
interface EngineerActionConfirmModalProps {
  isOpen: boolean;                                    // モーダル表示状態
  actionType: 'build_bridge' | 'destroy_bridge' | null; // アクションタイプ
  targetCoord: Coordinate | null;                     // 対象位置座標
  targetTile: Tile | null;                           // 対象タイル情報
  materialCost: number;                              // 必要資材コスト
  onConfirm: () => void;                             // 確認時のコールバック
  onCancel: () => void;                              // キャンセル時のコールバック
}
```

### 必須Props詳細
- **isOpen**: モーダルの表示/非表示制御
- **actionType**: `'build_bridge'`（架橋）または `'destroy_bridge'`（橋破壊）
- **targetCoord**: 作業対象の座標 {x, y}
- **targetTile**: 対象タイルの地形・所有者情報
- **materialCost**: アクション実行に必要な資材量

## アクションタイプ別UI

### 架橋確認（build_bridge）
```
┌─────────────────────────────────────┐
│ 🌉 架橋確認                         │
├─────────────────────────────────────┤
│ 座標 (x, y) のRiverに橋を架けますか？│
├─────────────────────────────────────┤
│ 必要資材: xx ユニット               │
│ 現在地形: River                     │
│ 変更後: Bridge                      │
├─────────────────────────────────────┤
│              [キャンセル] [架橋実行] │
└─────────────────────────────────────┘
```

### 橋破壊確認（destroy_bridge）
```
┌─────────────────────────────────────┐
│ ⛏️ 橋破壊確認                       │
├─────────────────────────────────────┤
│ 座標 (x, y) の橋を破壊しますか？    │
├─────────────────────────────────────┤
│ 必要資材: xx ユニット               │
│ 現在地形: Bridge                    │
│ 変更後: River                       │
├─────────────────────────────────────┤
│              [キャンセル] [破壊実行] │
└─────────────────────────────────────┘
```

## 実装詳細

### アクション情報生成
```typescript
const getActionText = () => {
  switch (actionType) {
    case 'build_bridge':
      return {
        title: '架橋確認',
        message: `座標 (${targetCoord.x}, ${targetCoord.y}) の${targetTile.terrain}に橋を架けますか？`,
        action: '架橋実行',
        icon: '🌉'
      };
    case 'destroy_bridge':
      return {
        title: '橋破壊確認', 
        message: `座標 (${targetCoord.x}, ${targetCoord.y}) の橋を破壊しますか？`,
        action: '破壊実行',
        icon: '⛏️'
      };
    default:
      return {
        title: '確認',
        message: 'アクションを実行しますか？',
        action: '実行',
        icon: '⚙️'
      };
  }
};
```

### 表示条件チェック
```typescript
if (!isOpen || !actionType || !targetCoord || !targetTile) {
  return null;
}
```

### スタイリング仕様
```typescript
const modalStyles = {
  overlay: {
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
  },
  confirmButton: {
    background: '#28a745',  // 緑色（建設的アクション）
    borderColor: '#28a745'
  },
  destructiveButton: {
    background: '#dc3545',  // 赤色（破壊的アクション）
    borderColor: '#dc3545'
  }
};
```

## 使用例

### BattleScreenでの統合
```typescript
import EngineerActionConfirmModal from '../components/game/EngineerActionConfirmModal';

const BattleScreen: React.FC = () => {
  const {
    engineerConfirmState,
    confirmEngineerAction,
    cancelEngineerAction
  } = useGameLogic();

  return (
    <div>
      {/* ゲームボード */}
      <GameBoard />
      
      {/* 工作車アクション確認モーダル */}
      <EngineerActionConfirmModal
        isOpen={engineerConfirmState.isOpen}
        actionType={engineerConfirmState.actionType}
        targetCoord={engineerConfirmState.targetCoord}
        targetTile={engineerConfirmState.targetTile}
        materialCost={engineerConfirmState.materialCost}
        onConfirm={confirmEngineerAction}
        onCancel={cancelEngineerAction}
      />
    </div>
  );
};
```

### useGameLogicでの状態管理
```typescript
const [engineerConfirmState, setEngineerConfirmState] = useState<{
  isOpen: boolean;
  actionType: 'build_bridge' | 'destroy_bridge' | null;
  targetCoord: Coordinate | null;
  targetTile: Tile | null;
  materialCost: number;
}>({ 
  isOpen: false, 
  actionType: null, 
  targetCoord: null, 
  targetTile: null, 
  materialCost: 0 
});
```

## 工作システムとの連携

### 工作プロセス全体
1. **工作ユニット選択**: 工作車の選択
2. **アクションモード開始**: "架橋"または"橋破壊"選択
3. **対象位置選択**: 作業可能位置のハイライト表示
4. **確認モーダル**: EngineerActionConfirmModalの表示
5. **作業実行**: モーダル確認後の地形変更処理

### 作業可能条件チェック
```typescript
const getEngineerTargets = (engineerUnit: Unit, actionType: string): Coordinate[] => {
  const targets: Coordinate[] = [];
  const adjacentPositions = getAdjacentPositions(engineerUnit);
  
  for (const pos of adjacentPositions) {
    const tile = getBoardTile(pos);
    if (!tile) continue;
    
    if (actionType === 'build_bridge' && tile.terrain === 'River') {
      targets.push(pos);
    } else if (actionType === 'destroy_bridge' && tile.terrain === 'Bridge') {
      targets.push(pos);
    }
  }
  
  return targets;
};
```

### 資材システム
```typescript
interface MaterialCost {
  build_bridge: number;    // 架橋に必要な資材
  destroy_bridge: number;  // 破壊に必要な資材
}

const MATERIAL_COSTS: MaterialCost = {
  build_bridge: 3,
  destroy_bridge: 1
};
```

## 戦略的インパクト

### 架橋の戦略価値
- **攻撃ルート確保**: 河川を越えた攻撃経路の開拓
- **補給線構築**: 後方との連絡線確保
- **迂回防止**: 敵の迂回機動を無効化

### 橋破壊の戦略価値
- **敵進軍阻止**: 主要進軍ルートの遮断
- **退却支援**: 味方の戦術的後退支援
- **時間稼ぎ**: 敵の迂回による時間獲得

## エラーハンドリング

### 無効操作の防止
```typescript
const validateEngineerAction = (
  actionType: string, 
  targetTile: Tile, 
  engineerUnit: Unit
): boolean => {
  // 資材不足チェック
  if (engineerUnit.materials < MATERIAL_COSTS[actionType]) {
    return false;
  }
  
  // 地形条件チェック
  if (actionType === 'build_bridge' && targetTile.terrain !== 'River') {
    return false;
  }
  
  if (actionType === 'destroy_bridge' && targetTile.terrain !== 'Bridge') {
    return false;
  }
  
  return true;
};
```

### エラーメッセージ
- "資材不足": 必要資材が不足している場合
- "無効な地形": 作業対象として不適切な地形
- "作業範囲外": 工作車から離れすぎた位置での作業

## アクセシビリティ

### キーボード操作サポート
- **Esc**: モーダルキャンセル
- **Enter**: アクション実行（フォーカス時）
- **Tab**: ボタン間移動

### 視覚的配慮
- **アクション種別の色分け**: 建設（緑）/ 破壊（赤）
- **アイコンによる直感的表現**: 🌉（架橋）、⛏️（破壊）
- **明確な情報階層**: 重要情報の優先表示

## パフォーマンス最適化

### 条件付きレンダリング
```typescript
const EngineerActionConfirmModal = React.memo<EngineerActionConfirmModalProps>(
  ({ isOpen, actionType, targetCoord, targetTile, materialCost, onConfirm, onCancel }) => {
    // Early return for performance
    if (!isOpen || !actionType || !targetCoord || !targetTile) {
      return null;
    }
    
    return (
      // Modal content
    );
  }
);
```

## 今後の拡張予定

### 追加工作アクション
```typescript
type EngineerActionType = 
  | 'build_bridge'      // 架橋
  | 'destroy_bridge'    // 橋破壊
  | 'build_fortification' // 要塞建設
  | 'clear_forest'      // 森林伐採
  | 'build_road'        // 道路建設
  | 'lay_minefield'     // 地雷敷設
  | 'clear_minefield';  // 地雷除去
```

### 高度な工作システム
- **作業時間**: 複数ターンにわたる大規模工事
- **協力作業**: 複数工作車による共同作業
- **専門化**: 工作車の種類別専門分野

### 環境への影響
- **天候影響**: 雨天時の作業効率低下
- **地形難易度**: 山岳地帯での作業困難
- **敵妨害**: 敵攻撃による作業中断

## 依存関係
- [[EngineerActionState]] - 工作アクション状態管理
- [[useGameLogic]] - 工作ロジック・状態管理
- [[MaterialSystem]] - 資材管理システム
- [[TerrainSystem]] - 地形変更システム

## 関連コンポーネント
- [[SelectedUnitPanel]] - 工作車選択・アクション開始
- [[GameBoard]] - 作業対象位置選択・視覚化
- [[Hexagon]] - 作業可能位置のハイライト表示

## 関連システム
- [[工作システム]] - 地形改変の全体フロー
- [[資材システム]] - 工作に必要な資材管理
- [[地形システム]] - 地形変更とその影響

## タグ
#EngineerSystem #Modal #Confirmation #TerrainModification #Strategy #UI #Infrastructure
