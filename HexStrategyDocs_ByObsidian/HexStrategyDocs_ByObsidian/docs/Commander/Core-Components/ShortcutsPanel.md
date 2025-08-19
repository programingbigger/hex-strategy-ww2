# ShortcutsPanel - キーボードショートカット表示パネル

## 概要
利用可能なキーボードショートカットを表示・管理するパネルコンポーネントです。折りたたみ式のデザインでゲーム画面を妨げることなく、プレイヤーが効率的な操作方法を確認できます。初心者から上級者まで、すべてのプレイヤーの操作効率向上をサポートします。

## ファイル場所
`/Commander/src/components/game/ShortcutsPanel.tsx`

## 主要機能

### ショートカット表示システム
- **折りたたみ式UI**: 必要時のみ展開する省スペース設計
- **キー表記**: 実際のキーボード表記による直感的表示
- **説明文**: 各ショートカットの機能説明
- **拡張可能性**: 新しいショートカットの追加が容易

### UI特徴
- **半透明デザイン**: ゲーム画面を妨げない背景透過
- **アニメーション効果**: スムーズな展開・収縮
- **視認性**: 高コントラストによる読みやすさ
- **固定位置**: 左下に固定配置で常時アクセス可能

## 実装詳細

### コンポーネント構造
```typescript
const ShortcutsPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shortcuts = [
    { key: 'Cmd+E', description: 'End Turn' },
    { key: 'Esc', description: 'Cancel Selection' },
    { key: 'Space', description: 'Center on Selected Unit' },
  ];
  
  return (
    // Panel implementation
  );
};
```

### ショートカット定義
```typescript
interface Shortcut {
  key: string;          // キー表記（例：'Cmd+E', 'Esc'）
  description: string;  // 機能説明
}

const shortcuts: Shortcut[] = [
  { key: 'Cmd+E', description: 'End Turn' },
  { key: 'Esc', description: 'Cancel Selection' },
  { key: 'Space', description: 'Center on Selected Unit' }
];
```

## 現在のショートカット一覧

### ターン管理
- **Cmd+E (Mac) / Ctrl+E (Windows)**: ターン終了確認モーダルを開く

### 選択・キャンセル
- **Esc**: 現在の選択をキャンセル、モーダルを閉じる

### 画面操作
- **Space**: 選択中のユニットを画面中央に表示

## UI設計仕様

### パネル配置
- **位置**: 画面左下（bottom: 20px, left: 340px）
- **z-index**: 1000（他のUI要素より前面）
- **最小幅**: 140px（折りたたみ時）、280px（展開時）

### 色彩設計
```typescript
const colorScheme = {
  background: 'rgba(52, 73, 94, 0.9)',      // 半透明ダークブルー
  border: '#3498db',                         // ブルー境界線
  text: '#ecf0f1',                          // 明るいテキスト
  accent: '#34495e',                        // アクセント色
  warning: '#f1c40f',                       // 警告・注意色
  keyBackground: '#34495e',                 // キー表記背景
  keyBorder: '#2c3e50'                      // キー表記境界線
};
```

### アニメーション効果
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## スタイリング詳細

### トグルボタン
```typescript
const toggleButtonStyle = {
  padding: '10px 15px',
  background: 'rgba(52, 73, 94, 0.9)',
  color: 'white',
  border: '1px solid #3498db',
  borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
  backdropFilter: 'blur(5px)',
  transition: 'all 0.3s ease'
};
```

### ショートカットリスト
```typescript
const shortcutItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #34495e'
};

const kbdStyle = {
  background: '#34495e',
  color: '#ecf0f1',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
  border: '1px solid #2c3e50',
  fontFamily: 'monospace'
};
```

## 使用例

### BattleScreenでの統合
```typescript
import ShortcutsPanel from '../components/game/ShortcutsPanel';

const BattleScreen: React.FC = () => {
  return (
    <div className="battle-screen">
      {/* ゲームコンテンツ */}
      <GameBoard />
      <Header />
      <SelectedUnitPanel />
      
      {/* ショートカットパネル */}
      <ShortcutsPanel />
    </div>
  );
};
```

### カスタムショートカットの追加
```typescript
const extendedShortcuts = [
  ...defaultShortcuts,
  { key: 'R', description: 'Repair Unit' },
  { key: 'A', description: 'Attack Mode' },
  { key: 'M', description: 'Move Mode' },
  { key: 'Tab', description: 'Next Unit' },
  { key: 'Shift+Tab', description: 'Previous Unit' }
];
```

## 拡張機能

### 動的ショートカット更新
```typescript
interface ShortcutsPanelProps {
  additionalShortcuts?: Shortcut[];
  showCategories?: boolean;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

const ShortcutsPanel: React.FC<ShortcutsPanelProps> = ({
  additionalShortcuts = [],
  showCategories = false,
  position = 'bottom-left'
}) => {
  const allShortcuts = [...defaultShortcuts, ...additionalShortcuts];
  
  // Implementation
};
```

### カテゴリ別表示
```typescript
interface ShortcutCategory {
  name: string;
  shortcuts: Shortcut[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'ターン管理',
    shortcuts: [
      { key: 'Cmd+E', description: 'ターン終了' }
    ]
  },
  {
    name: 'ユニット操作',
    shortcuts: [
      { key: 'Space', description: 'ユニットを中央表示' },
      { key: 'Tab', description: '次のユニット選択' }
    ]
  },
  {
    name: '画面操作',
    shortcuts: [
      { key: 'Esc', description: '選択キャンセル' }
    ]
  }
];
```

## アクセシビリティ

### キーボードナビゲーション
```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'F1') {
    event.preventDefault();
    setIsExpanded(!isExpanded);
  }
};

useEffect(() => {
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isExpanded]);
```

### スクリーンリーダー対応
```typescript
<div
  role="region"
  aria-label="キーボードショートカット一覧"
  aria-expanded={isExpanded}
>
  <button
    aria-label="ショートカット一覧を開閉"
    aria-expanded={isExpanded}
  >
    ⌨️ Shortcuts
  </button>
  
  {isExpanded && (
    <ul role="list" aria-label="利用可能なショートカット">
      {shortcuts.map((shortcut, index) => (
        <li key={index} role="listitem">
          <span>{shortcut.description}</span>
          <kbd aria-label={`キー: ${shortcut.key}`}>
            {shortcut.key}
          </kbd>
        </li>
      ))}
    </ul>
  )}
</div>
```

## パフォーマンス最適化

### メモ化の活用
```typescript
const ShortcutsPanel = React.memo(() => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shortcuts = useMemo(() => [
    { key: 'Cmd+E', description: 'End Turn' },
    { key: 'Esc', description: 'Cancel Selection' },
    { key: 'Space', description: 'Center on Selected Unit' }
  ], []);
  
  // Component implementation
});
```

### 条件付きレンダリング
```typescript
const renderShortcutsList = useMemo(() => {
  if (!isExpanded) return null;
  
  return (
    <div className="shortcuts-list">
      {shortcuts.map((shortcut, index) => (
        <ShortcutItem 
          key={`${shortcut.key}-${index}`} 
          shortcut={shortcut} 
        />
      ))}
    </div>
  );
}, [isExpanded, shortcuts]);
```

## 設定オプション

### カスタマイズ可能な要素
```typescript
interface ShortcutsPanelConfig {
  position: {
    bottom?: string;
    left?: string;
    right?: string;
    top?: string;
  };
  theme: 'dark' | 'light' | 'auto';
  autoHide: boolean;
  autoHideDelay: number;
  showTooltips: boolean;
  groupByCategory: boolean;
}
```

### テーマ対応
```typescript
const getThemeColors = (theme: 'dark' | 'light') => {
  const themes = {
    dark: {
      background: 'rgba(52, 73, 94, 0.9)',
      text: '#ecf0f1',
      border: '#3498db'
    },
    light: {
      background: 'rgba(255, 255, 255, 0.9)',
      text: '#2c3e50',
      border: '#3498db'
    }
  };
  
  return themes[theme];
};
```

## 今後の拡張予定

### 高度な機能
```typescript
interface AdvancedFeatures {
  searchShortcuts: boolean;        // ショートカット検索
  customShortcuts: boolean;        // ユーザー定義ショートカット
  shortcutConflictDetection: boolean; // キー競合検出
  contextualShortcuts: boolean;    // コンテキスト別表示
  shortcutTraining: boolean;       // ショートカット練習モード
}
```

### インタラクティブヘルプ
- **操作ガイド**: 初回プレイ時のショートカット紹介
- **使用統計**: よく使われるショートカットの分析
- **学習支援**: ショートカット習得のためのヒント表示

### マルチプラットフォーム対応
```typescript
const getPlatformShortcuts = () => {
  const isMac = navigator.platform.toUpperCase().includes('MAC');
  
  return shortcuts.map(shortcut => ({
    ...shortcut,
    key: shortcut.key.replace('Cmd', isMac ? 'Cmd' : 'Ctrl')
  }));
};
```

## 依存関係
- React hooks (useState, useMemo, useEffect)
- CSS-in-JS styling
- プラットフォーム検出

## 関連コンポーネント
- [[BattleScreen]] - パネル表示画面
- [[EndTurnConfirmModal]] - Cmd+E ショートカット連携
- 各種ゲームコンポーネント - ショートカット機能の実装元

## UXへの貢献
- **操作効率向上**: 熟練プレイヤーの高速操作支援
- **学習支援**: 新規プレイヤーのショートカット習得
- **アクセシビリティ**: キーボード中心の操作支援
- **ユーザビリティ**: 直感的な操作方法の提示

## タグ
#Shortcuts #UI #Accessibility #KeyboardNavigation #UserExperience #OperationEfficiency
