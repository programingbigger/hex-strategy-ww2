# Assets Directory

このディレクトリには、ビルド時に最適化される静的アセットを配置します。

## フォルダ構成

### 📁 images/
ビルド時に最適化される画像ファイルを配置

#### 📁 images/units/
ユニットのアイコンや画像
- `infantry.png` - 歩兵アイコン
- `tank.png` - 戦車アイコン  
- `artillery.png` - 砲兵アイコン
- `armored-car.png` - 装甲車アイコン
- `anti-tank.png` - 対戦車砲アイコン

#### 📁 images/terrains/
地形の背景画像やテクスチャ
- `plains.png` - 平原テクスチャ
- `forest.png` - 森林テクスチャ
- `mountain.png` - 山岳テクスチャ
- `river.png` - 河川テクスチャ
- `city.png` - 都市テクスチャ
- `road.png` - 道路テクスチャ
- `mud.png` - 泥濘テクスチャ

#### 📁 images/ui/
UI関連の画像

##### 📁 images/ui/tutorial/
チュートリアル・導入マップ用の画像
- `intro-map-overview.png` - マップ全体説明画像
- `movement-guide.png` - 移動説明画像
- `combat-guide.png` - 戦闘説明画像

##### 📁 images/ui/tooltips/
ツールチップ用の小さなアイコンや装飾

### 📁 videos/
小〜中サイズの動画ファイル

#### 📁 videos/tutorials/
チュートリアル動画
- `basic-movement.mp4` - 基本移動説明
- `combat-basics.mp4` - 戦闘基礎説明

#### 📁 videos/unit-actions/
ユニットアクション動画（ホバー時表示用）
- `infantry-move.mp4` - 歩兵移動アニメーション
- `tank-attack.mp4` - 戦車攻撃アニメーション

## 使用方法

```typescript
// ES6 import で使用（推奨）
import infantryIcon from './images/units/infantry.png';
import movementGuide from './images/ui/tutorial/movement-guide.png';

// コンポーネント内で使用
<img src={infantryIcon} alt="Infantry" />
```

## 注意事項
- ここに配置したファイルはビルド時に最適化・圧縮されます
- ファイル名にハッシュが付加されるため、キャッシュ効率が良い
- 大きなファイル（>1MB）は public/assets/ の使用を推奨