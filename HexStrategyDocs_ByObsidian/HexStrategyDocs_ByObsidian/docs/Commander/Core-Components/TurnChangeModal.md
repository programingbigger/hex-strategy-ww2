# TurnChangeModal - ターン切替通知モーダル

## 概要
ターン切替時に表示される通知モーダルコンポーネントです。新しいターンの開始、天候変化、現在の戦況を視覚的に表示し、プレイヤーに状況変化を明確に伝えます。天候による背景色変化とアニメーション効果により、没入感を高めます。

## ファイル場所
`/Commander/src/components/game/TurnChangeModal.tsx`

## 主要機能

### ターン切替情報表示
- **ターン番号**: 新しいターン数の表示
- **アクティブチーム**: 行動順番の明示
- **天候情報**: 現在の天候状態と変化
- **戦況概要**: 残存ユニット数などの基本情報

### 視覚効果
- **天候別背景**: 天候に応じた背景グラデーション
- **アニメーション**: フェードイン・フェードアウト効果
- **チーム色**: アクティブチームの色による視覚区別
- **天候アイコン**: 直感的な天候表現

## Props インターフェース

```typescript
interface TurnChangeModalProps {
  isOpen: boolean;           // モーダル表示状態
  turn: number;              // 現在のターン数
  activeTeam: Team;          // アクティブなチーム
  weather: WeatherType;      // 現在の天候
  onClose: () => void;       // 閉じる時のコールバック
}
```

### Props詳細
- **isOpen**: モーダルの表示/非表示制御
- **turn**: 表示するターン番号
- **activeTeam**: `'Blue'`（プレイヤー）または `'Red'`（敵）
- **weather**: `'Clear' | 'Rain' | 'HeavyRain' | 'Storm'`
- **onClose**: モーダルを閉じる際に呼び出される関数

## 天候別背景システム

### 背景グラデーション設計
```typescript
const getWeatherBackground = (weather: WeatherType): string => {
  switch (weather) {
    case 'Clear':
      return 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 50%, #B0E0E6 100%)';
    case 'Rain':
      return 'linear-gradient(135deg, #708090 0%, #A9A9A9 50%, #C0C0C0 100%)';
    case 'HeavyRain':
      return 'linear-gradient(135deg, #556B2F 0%, #696969 50%, #808080 100%)';
    case 'Storm':
      return 'linear-gradient(135deg, #2F4F4F 0%, #483D8B 50%, #191970 100%)';
    default:
      return 'linear-gradient(135deg, #87CEEB 0%, #E0F6FF 50%, #B0E0E6 100%)';
  }
};
```

### 天候アイコンマッピング
```typescript
const getWeatherIcon = (weather: WeatherType): string => {
  switch (weather) {
    case 'Clear': return '☀️';
    case 'Rain': return '🌧️';
    case 'HeavyRain': return '⛈️';
    case 'Storm': return '🌩️';
    default: return '🌤️';
  }
};
```

### 天候説明テキスト
```typescript
const getWeatherDescription = (weather: WeatherType): string => {
  switch (weather) {
    case 'Clear': return '晴天 - 通常の戦闘条件';
    case 'Rain': return '雨 - 移動コスト増加';
    case 'HeavyRain': return '大雨 - 視界制限あり';
    case 'Storm': return '嵐 - 戦闘効率低下';
    default: return '天候不明';
  }
};
```

## UI設計

### モーダル構造
```
┌─────────────────────────────────────┐
│          [天候別背景グラデーション]   │
│                                     │
│            ターン 5                 │
│         プレイヤーターン             │
│                                     │
│         ☀️ 晴天                   │
│      晴天 - 通常の戦闘条件          │
│                                     │
│    [Blue: 8ユニット] [Red: 6ユニット] │
│                                     │
│              [続行]                 │
│                                     │
└─────────────────────────────────────┘
```

### チーム別カラーリング
```typescript
const getTeamColor = (team: Team): string => {
  switch (team) {
    case 'Blue': return '#007bff';  // 青色（プレイヤー）
    case 'Red': return '#dc3545';   // 赤色（敵）
    default: return '#6c757d';      // グレー（中立）
  }
};

const getTeamDisplayName = (team: Team): string => {
  switch (team) {
    case 'Blue': return 'プレイヤーターン';
    case 'Red': return '敵ターン';
    default: return '不明なターン';
  }
};
```

## 実装詳細

### 自動閉じタイマー
```typescript
useEffect(() => {
  if (isOpen) {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // 3秒後に自動で閉じる
    
    return () => clearTimeout(timer);
  }
}, [isOpen, onClose]);
```

### アニメーション効果
```typescript
const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: -50 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.3
    }
  }
};
```

### 戦況情報表示
```typescript
const getBattleSituation = (units: Unit[]) => {
  const blueUnits = units.filter(u => u.team === 'Blue' && !u.loaded).length;
  const redUnits = units.filter(u => u.team === 'Red' && !u.loaded).length;
  
  return {
    blue: blueUnits,
    red: redUnits,
    total: blueUnits + redUnits
  };
};
```

## 使用例

### BattleScreenでの統合
```typescript
import TurnChangeModal from '../components/game/TurnChangeModal';

const BattleScreen: React.FC = () => {
  const [isTurnChangeModalOpen, setIsTurnChangeModalOpen] = useState(false);
  const { turn, activeTeam, weather, units } = useGameLogic();

  // ターン変化の検出
  useEffect(() => {
    if (turn !== lastTurn || activeTeam !== lastActiveTeam) {
      setIsTurnChangeModalOpen(true);
      setLastTurn(turn);
      setLastActiveTeam(activeTeam);
    }
  }, [turn, activeTeam, lastTurn, lastActiveTeam]);

  const handleTurnChangeClose = useCallback(() => {
    setIsTurnChangeModalOpen(false);
  }, []);

  return (
    <div style={{ background: getWeatherBackground() }}>
      {/* ゲームコンテンツ */}
      
      <TurnChangeModal
        isOpen={isTurnChangeModalOpen}
        turn={turn}
        activeTeam={activeTeam}
        weather={weather}
        onClose={handleTurnChangeClose}
      />
    </div>
  );
};
```

### 手動ターン切替での使用
```typescript
const handleEndTurn = () => {
  // ターン終了処理
  endTurn();
  
  // ターン変更モーダルを表示
  setIsTurnChangeModalOpen(true);
};
```

## 天候システムとの連携

### 天候変化の通知
```typescript
const WeatherChangeNotification: React.FC = ({ oldWeather, newWeather }) => {
  if (oldWeather === newWeather) return null;
  
  return (
    <div className="weather-change-notice">
      <span>天候が{oldWeather}から{newWeather}に変化しました</span>
    </div>
  );
};
```

### 天候による戦術影響の表示
```typescript
const getWeatherEffects = (weather: WeatherType): string[] => {
  switch (weather) {
    case 'Rain':
      return ['移動コスト +1', '泥濘化の可能性'];
    case 'HeavyRain':
      return ['視界制限', '攻撃精度低下'];
    case 'Storm':
      return ['全ての行動にペナルティ', '雷による追加ダメージリスク'];
    default:
      return [];
  }
};
```

## アクセシビリティ

### スクリーンリーダー対応
```typescript
<div
  role="dialog"
  aria-labelledby="turn-change-title"
  aria-describedby="turn-change-description"
  aria-modal="true"
>
  <h2 id="turn-change-title">ターン {turn} - {getTeamDisplayName(activeTeam)}</h2>
  <p id="turn-change-description">
    天候: {weather}, 残存ユニット: Blue {blueUnits}, Red {redUnits}
  </p>
</div>
```

### キーボード操作
```typescript
useEffect(() => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'Escape' || event.key === ' ') {
      onClose();
    }
  };
  
  if (isOpen) {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }
}, [isOpen, onClose]);
```

## パフォーマンス最適化

### メモ化による最適化
```typescript
const TurnChangeModal = React.memo<TurnChangeModalProps>(
  ({ isOpen, turn, activeTeam, weather, onClose }) => {
    if (!isOpen) return null;
    
    const weatherBackground = useMemo(() => 
      getWeatherBackground(weather), [weather]
    );
    
    const weatherIcon = useMemo(() => 
      getWeatherIcon(weather), [weather]
    );
    
    return (
      // Modal content
    );
  }
);
```

### レンダリング最適化
```typescript
const shouldShowWeatherChange = useMemo(() => {
  return previousWeather !== weather;
}, [previousWeather, weather]);
```

## カスタマイズ設定

### 表示時間の調整
```typescript
interface TurnChangeSettings {
  autoCloseDelay: number;     // 自動閉じるまでの時間（ms）
  showWeatherInfo: boolean;   // 天候情報の表示有無
  showUnitCount: boolean;     // ユニット数の表示有無
  animationEnabled: boolean;  // アニメーション効果の有無
}
```

### テーマ対応
```typescript
const getThemeColors = (theme: 'light' | 'dark') => {
  return theme === 'dark' ? {
    text: '#ffffff',
    background: 'rgba(0, 0, 0, 0.8)',
    border: '#333333'
  } : {
    text: '#000000',
    background: 'rgba(255, 255, 255, 0.9)',
    border: '#cccccc'
  };
};
```

## 今後の拡張予定

### 詳細戦況表示
- **損失ユニット**: 前ターンで失ったユニット表示
- **占領地域**: 新たに占領した都市・要地
- **経験値獲得**: ユニットの成長情報

### インタラクティブ要素
```typescript
interface TurnChangeInteraction {
  allowQuickStart: boolean;    // クリックで即座に開始
  showTurnSummary: boolean;    // 前ターンのサマリー表示
  weatherForecast: boolean;    // 次ターンの天候予報
}
```

### AIターン表示
- **AI思考表示**: 敵ターンの行動予告
- **難易度表示**: AI の行動パターン情報
- **時間制限**: AIターンの制限時間表示

## 依存関係
- [[WeatherType, Team]] - 基本型定義
- [[useGameLogic]] - ターン・天候・ユニット状態管理
- [[BattleScreen]] - モーダル表示制御

## 関連コンポーネント
- [[RainEffect]] - 天候の視覚エフェクト
- [[Header]] - ターン・天候情報の常時表示
- [[EndTurnConfirmModal]] - ターン終了確認との連携

## ゲームフローとの関係
- **ターン管理**: 各ターン開始時の状況確認
- **天候システム**: 天候変化の通知・影響説明
- **戦況把握**: プレイヤーの現状認識支援

## タグ
#TurnChange #Modal #Weather #UI #TurnManagement #Notification #GameFlow
