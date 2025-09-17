# Public Assets Directory

このディレクトリには、直接URLでアクセス可能な静的ファイルを配置します。

## フォルダ構成

### 📁 images/
静的画像ファイル

#### 📁 images/large/
大きなサイズの画像ファイル（>1MB）
- `battlefield-background.jpg` - 戦場背景画像
- `victory-banner.png` - 勝利時バナー画像
- `defeat-banner.png` - 敗北時バナー画像

### 📁 videos/
静的動画ファイル

#### 📁 videos/intro/
イントロ・導入動画
- `game-introduction.mp4` - ゲーム紹介動画
- `story-opening.mp4` - ストーリーオープニング
- `map-overview.mp4` - マップ概要説明動画

## 使用方法

```typescript
// 直接URLで参照
<img src="/assets/images/large/battlefield-background.jpg" alt="Battlefield" />
<video src="/assets/videos/intro/game-introduction.mp4" controls />

// 動的に読み込み
const [currentVideo, setCurrentVideo] = useState('/assets/videos/intro/map-overview.mp4');
```

## アクセスパターン

### 基本URL
- 開発環境: `http://localhost:3000/assets/...`
- 本番環境: `https://yourdomain.com/assets/...`

### 動的読み込み例
```typescript
// 複数の画像を動的に切り替え
const unitImages = {
  Infantry: '/assets/images/units/infantry-large.png',
  Tank: '/assets/images/units/tank-large.png',
  Artillery: '/assets/images/units/artillery-large.png'
};

// 条件に応じて動画を切り替え
const getTutorialVideo = (step: number) => 
  `/assets/videos/intro/tutorial-step-${step}.mp4`;
```

## 注意事項
- ファイルはビルド時に最適化されません
- キャッシュ制御は手動で行う必要があります
- 大きなファイルや動的に読み込むファイルに適しています
- ファイルパスは必ず `/assets/` から始めてください