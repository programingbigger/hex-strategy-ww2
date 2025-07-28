# Commander UI改善計画

## 概要
現在のUI実装状況と改善計画について、各画面コンポーネント別に詳細を記述します。

## Mode Select画面 (HomeScreen)

### 現在の実装状況
```typescript
// Commander/src/screens/HomeScreen.tsx
const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  return (
    <div className="screen home-screen">
      <h1 className="screen-title">Mode Select</h1>
      
      <div className="menu-container">
        <button className="menu-button" disabled>
          Story Mode (Coming Soon)
        </button>
        
        <button className="menu-button" onClick={() => onNavigate('scenario-select')}>
          Scenario Mode
        </button>
        
        <button className="menu-button" disabled>
          Tutorial (Coming Soon)
        </button>
      </div>
    </div>
  );
};
```

### 改善点
- [x] Commander画面から連続した推移 - 実装済み
- [x] 背景はそのまま - 実装済み  
- [ ] **下部コンポーネントをもっといい感じに収める**
  - メニューボタンのレイアウト改善
  - 視覚的なヒエラルキーの向上
  - レスポンシブデザインの考慮

## Select Mission画面 (ScenarioSelectScreen)

### 改善計画
- [ ] **左側コンポーネントにミッション名**
  - ストーリーモードで出てくる名前を理想とする
  - ミッション詳細情報の表示
- [ ] **残りの部分にmapの全体像を表示**
  - マップのプレビュー機能
  - 戦略的な概観の提供

### 実装考慮事項
```typescript
interface MissionInfo {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  mapPreview: string; // マップ画像のパス
  objectives: string[];
}
```

## Battle Preparation画面 (BattlePrepScreen)

### 現在の課題
- UIの改善が必要だが、具体的な案がない状況
- Geminiなどの生成AIに相談予定

### 改善方向性
- ユニット選択UIの直感性向上
- 戦術準備の視覚化
- プレイヤーのモチベーション向上

## Deployment Phase画面 (UnitDeploymentScreen)

### 現在の問題
- **範囲外でもユニットが配置できる問題**
- 配置可能範囲の視覚的表示が不十分

### 修正計画
```typescript
// 配置可能範囲のチェック機能
const isValidDeploymentPosition = (x: number, y: number, deploymentCenter: Position): boolean => {
  const distance = Math.abs(x - deploymentCenter.x) + Math.abs(y - deploymentCenter.y);
  return distance <= DEPLOYMENT_RADIUS;
};

// 視覚的フィードバックの追加
const highlightValidDeploymentArea = (deploymentCenter: Position) => {
  // 配置可能エリアのハイライト表示
};
```

## 共通UI改善項目

### 視覴一貫性
- カラーパレットの統一
- タイポグラフィの標準化
- アニメーション効果の一貫性

### ユーザビリティ
- 直感的な操作フロー
- 適切なフィードバック
- エラーハンドリングの改善

### レスポンシブデザイン
- 異なる画面サイズへの対応
- タッチデバイス対応
- アクセシビリティの考慮

## 実装優先度

### 高優先度
1. UnitDeploymentScreen の範囲外配置問題
2. Mode Select画面の下部コンポーネント改善

### 中優先度
1. Select Mission画面の左右レイアウト実装
2. Battle Preparation画面のUI刷新

### 低優先度
1. 全画面共通のデザインシステム統一
2. アニメーション効果の追加

## 関連ファイル

### 画面コンポーネント
- `/Commander/src/screens/HomeScreen.tsx` - Mode Select画面
- `/Commander/src/screens/ScenarioSelectScreen.tsx` - Select Mission画面  
- `/Commander/src/screens/BattlePrepScreen.tsx` - Battle Preparation画面
- `/Commander/src/screens/UnitDeploymentScreen.tsx` - Deployment Phase画面

### スタイルシート
- `/Commander/src/styles/App.css` - メインスタイル
- 各コンポーネント固有のCSSファイル

## 技術的考慮事項

### パフォーマンス
- 画像の最適化
- レンダリングの効率化
- メモリ使用量の最適化

### 保守性
- コンポーネントの再利用性
- スタイルの一元管理
- コードの可読性

## タグ  
#UI改善 #ユーザビリティ #デザイン #レスポンシブ #アクセシビリティ #Commander
EOF < /dev/null