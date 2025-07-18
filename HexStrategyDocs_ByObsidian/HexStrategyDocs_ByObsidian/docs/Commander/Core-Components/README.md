# Core-Components - コアコンポーネント

ゲームの中核となるUI要素とボード描画機能を提供するコンポーネント群です。

## コンポーネント一覧

### [[GameBoard]] - ゲームボード表示
ヘックスマップとユニットの表示、プレイヤー操作を担当

### [[Hexagon]] - ヘックスタイル 
個別の6角形タイルと地形・ユニットの描画

### [[InformationPanel]] - 情報表示パネル
選択されたユニット・タイルの詳細情報表示

## 依存関係

```
GameBoard → Hexagon
GameBoard → InformationPanel  
```

## タグ
#CoreComponents #UI #GameDisplay