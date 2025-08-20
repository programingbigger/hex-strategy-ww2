# RainEffect - 天候エフェクトコンポーネント

## 概要
天候システムの視覚的表現を担当するコンポーネントです。雨、大雨、嵐の天候状態に応じて画面全体にリアルタイムの天候アニメーションを表示し、プレイヤーに現在の天候状況を直感的に伝えます。

## ファイル場所
`/Commander/src/components/game/RainEffect.tsx`

## 主要機能

### 天候アニメーション表示
- **雨（Rain）**: 軽度の雨滴アニメーション（80滴、透明度0.4）
- **大雨（HeavyRain）**: 中程度の雨滴アニメーション（150滴、透明度0.6）
- **嵐（Storm）**: 激しい雨滴＋稲妻エフェクト（200滴、透明度0.8）

### アニメーション仕様
```typescript
interface WeatherAnimationConfig {
  dropCount: number;      // 雨滴の数
  opacity: number;        // 透明度
  animationSpeed: string; // アニメーション速度
  lightningEffect: boolean; // 稲妻エフェクトの有無
}
```

### 対応天候タイプ
```typescript
type SupportedWeather = 'Rain' | 'HeavyRain' | 'Storm';
```

## Props インターフェース

```typescript
interface RainEffectProps {
  weather: WeatherType;
}
```

### weather
- **型**: `WeatherType`
- **説明**: 現在の天候状態
- **対応値**: `'Clear' | 'Rain' | 'HeavyRain' | 'Storm'`
- **非対応時**: `null`を返してアニメーションを非表示

## 実装詳細

### 雨滴エフェクト生成
```typescript
const generateRainDrops = (count: number, opacity: number, speed: string) => {
  return Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        left: `${Math.random() * 100}%`,
        width: isStorm ? '3px' : '2px',
        height: `${Math.random() * 15 + 10}px`,
        background: `linear-gradient(to bottom, transparent, rgba(173, 216, 230, ${opacity}))`,
        animation: `rainDrop ${speed} infinite linear`,
        animationDelay: `${Math.random() * 2}s`,
        transform: 'rotate(10deg)'
      }}
    />
  ));
};
```

### 稲妻エフェクト（嵐時）
```typescript
const lightningEffect = (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(255, 255, 255, 0.1)',
      animation: 'lightning 3s infinite',
      animationDelay: `${Math.random() * 5}s`
    }}
  />
);
```

### CSS キーフレームアニメーション
```css
@keyframes rainDrop {
  0% {
    transform: translateY(-100vh) rotate(10deg);
    opacity: 0;
  }
  10% {
    opacity: ${opacity};
  }
  90% {
    opacity: ${opacity};
  }
  100% {
    transform: translateY(100vh) rotate(10deg);
    opacity: 0;
  }
}

@keyframes lightning {
  0%, 90%, 96%, 100% {
    background: rgba(255, 255, 255, 0);
  }
  93%, 94% {
    background: rgba(255, 255, 255, 0.4);
  }
  95% {
    background: rgba(255, 255, 255, 0.6);
  }
}
```

## スタイリング設計

### レイヤー管理
- **z-index**: 500（ヘッダー1000より下、ゲームコンテンツより上）
- **pointerEvents**: `none`（ゲーム操作を妨げない）
- **position**: `fixed`（画面全体をカバー）

### パフォーマンス考慮
- **要素数制限**: 天候タイプごとに最適化された雨滴数
- **ランダム化**: 位置、タイミング、高さをランダム化で自然な表現
- **メモリ効率**: 軽量なCSS3アニメーションを使用

## 天候別設定

### 雨（Rain）
```typescript
{
  dropCount: 80,
  opacity: 0.4,
  animationSpeed: '0.8s',
  color: 'rgba(173, 216, 230, 0.4)', // ライトブルー
  dropWidth: '2px'
}
```

### 大雨（HeavyRain）
```typescript
{
  dropCount: 150,
  opacity: 0.6,
  animationSpeed: '0.5s',
  color: 'rgba(173, 216, 230, 0.6)', // ミディアムブルー
  dropWidth: '2px'
}
```

### 嵐（Storm）
```typescript
{
  dropCount: 200,
  opacity: 0.8,
  animationSpeed: '0.3s',
  color: 'rgba(135, 206, 235, 0.8)', // 濃いブルー
  dropWidth: '3px',
  lightning: true
}
```

## 使用例

### BattleScreenでの使用
```typescript
import RainEffect from '../components/game/RainEffect';

const BattleScreen: React.FC = () => {
  const { weather } = useGameLogic();
  
  return (
    <div className="battle-screen">
      {/* ゲームコンテンツ */}
      <GameBoard />
      <Header />
      
      {/* 天候エフェクト */}
      <RainEffect weather={weather} />
    </div>
  );
};
```

### カスタム天候エフェクト
```typescript
// 将来的な拡張例
const customWeatherConfig = {
  Snow: {
    dropCount: 60,
    opacity: 0.7,
    animationSpeed: '2s',
    color: 'rgba(255, 255, 255, 0.7)',
    dropShape: 'snowflake'
  }
};
```

## 拡張可能性

### 新天候タイプの追加
```typescript
// 霧エフェクトの例
case 'Fog':
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(128, 128, 128, 0.3)',
      animation: 'fogMovement 10s infinite'
    }} />
  );
```

### 音響エフェクトとの連携
```typescript
// 将来実装例
useEffect(() => {
  if (weather === 'Storm') {
    playThunderSound();
  } else if (weather === 'Rain') {
    playRainSound();
  }
}, [weather]);
```

## パフォーマンス最適化

### レンダリング最適化
- 天候変更時のみコンポーネント再生成
- 非アクティブ天候時のDOM要素完全削除
- CSS3ハードウェアアクセラレーション活用

### メモリ管理
- 雨滴要素の適切なクリーンアップ
- アニメーション停止時のリソース解放
- ランダム要素の効率的な生成

## 依存関係
- [[WeatherType]] - 天候タイプ定義
- [[BattleScreen]] - 天候エフェクト表示画面
- [[useGameLogic]] - 天候状態管理

## 関連コンポーネント
- [[Header]] - 天候情報テキスト表示
- [[TurnChangeModal]] - ターン切替時の天候通知
- [[InformationPanel]] - 天候による効果表示

## 天候システム全体との関係
- **天候判定**: useGameLogicで管理される天候状態
- **視覚表現**: RainEffectでのアニメーション表示
- **ゲーム効果**: 移動コスト、視界制限等への影響
- **UI表示**: ヘッダーでの天候アイコン・文字表示

## 今後の実装予定

### 季節システム連携
- 地域・季節に応じた天候パターン
- 歴史的天候データの反映

### インタラクティブ要素
- 天候による視界制限の視覚化
- 地形変化（泥濘化）のアニメーション

### 高品質エフェクト
- パーティクルシステムの導入
- より自然な雨滴軌道の計算
- 風向きによる雨の角度変化

## 📈 最新改善履歴（調査結果反映）

### パフォーマンス最適化 (Based on weather_animation_investigation.md)

#### React.useMemo活用によるメモ化
```typescript
// 天候設定のメモ化で不要な再計算を防止
const weatherConfig = useMemo(() => ({
  dropCount: isStorm ? 200 : isHeavyRain ? 150 : 100,
  opacity: isStorm ? 0.8 : isHeavyRain ? 0.6 : 0.4,
  isHeavyRain, isStorm
}), [weather]);

// 雨粒データのメモ化で再レンダリング最適化
const rainDrops = useMemo(() => 
  Array.from({ length: dropCount }, (_, i) => ({
    id: i, left: Math.random() * 100,
    animationDelay: Math.random() * 2,
    height: Math.random() * 15 + (isStorm ? 15 : 10),
    duration: `${baseSpeed + Math.random() * variation}s`
  })), [dropCount, isStorm, isHeavyRain]
);
```

#### 大気オーバーレイ効果の追加
```typescript
// 天候感を高める大気効果
<div style={{
  background: isStorm 
    ? 'rgba(25, 25, 112, 0.1)'    // 嵐: 濃紺
    : isHeavyRain 
    ? 'rgba(105, 105, 105, 0.08)' // 大雨: グレー
    : 'rgba(176, 196, 222, 0.05)' // 雨: 薄青
}} />
```

#### CSS最適化とGPU加速
```css
.rain-drop {
  will-change: transform, opacity; /* GPU加速明示 */
  animation: fall linear infinite;
}

@keyframes fall {
  0% { transform: translateY(-10px) rotate(10deg); opacity: 0; }
  5% { opacity: var(--opacity); }
  95% { opacity: var(--opacity); }
  100% { transform: translateY(100vh) rotate(10deg); opacity: 0; }
}
```

#### 強化された雷エフェクト
```css
@keyframes lightning {
  0%, 88%, 92%, 96%, 100% { background: rgba(255, 255, 255, 0); }
  90%, 94% { background: rgba(255, 255, 255, 0.3); }
  91%, 95% { background: rgba(255, 255, 255, 0.6); }
  93% { background: rgba(255, 255, 255, 0.8); }
}
```

### 機能改善

#### 高度なランダム化システム
- **位置ランダム化**: 水平位置の完全ランダム分散
- **タイミング変動**: アニメーション開始時刻の2秒範囲分散
- **サイズ変動**: 雨粒高さの動的変更（嵐時は大型化）
- **速度変動**: 天候に応じた落下速度のランダム変化

#### React Hooks準拠最適化
- **Hooks順序適正化**: 条件付きreturnより前のHooks配置
- **依存配列最適化**: 必要最小限の依存関係指定
- **メモリリーク防止**: 適切なクリーンアップ実装

### 実装品質向上

#### TypeScript警告解消
- 未使用変数の除去
- 型安全性の向上
- ESLint準拠コードの維持

#### パフォーマンス指標
- **Build時間**: 警告のみで正常ビルド完了
- **メモリ使用量**: useMemoによる削減
- **レンダリング効率**: 不要な再計算防止

これらの改善により、調査結果で示されたシンプルかつ効果的な実装パターンを踏襲しつつ、エンタープライズレベルのパフォーマンスと保守性を実現しています。

## タグ
#RainEffect #WeatherSystem #Animation #VisualEffect #UI #Performance #CSS3 #Optimization #ReactMemo
