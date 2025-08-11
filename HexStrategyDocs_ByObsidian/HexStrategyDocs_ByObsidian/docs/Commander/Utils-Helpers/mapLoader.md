# mapLoader.ts - マップデータ読み込みユーティリティ

`Commander/src/utils/mapLoader.ts` は、JSONファイルからマップデータを非同期に読み込み、ゲームで利用可能な形式に変換する役割を担うユーティリティファイルです。

## 主要機能

- `loadMapData(mapId)`: `public/data/maps/` ディレクトリから、指定された `mapId` に対応するJSONファイルを非同期に`fetch`します。読み込んだデータを `MapData` 型として返します。

- `createBoardLayout(mapData)`: `MapData` オブジェクトを受け取り、ゲームロジックで扱いやすい `BoardLayout`（キーが座標文字列のMapオブジェクト）形式に変換します。

- `loadCompleteMap(mapId)`: 上記の2つの関数を組み合わせたものです。指定した `mapId` のマップを読み込み、`mapData`、`boardLayout`、そしてユニット配置の基準点となる `deploymentCenter` を含むオブジェクトを返します。

## 役割と分離

このファイルは、マップ関連の処理の中でも、特に**ファイルの非同期I/O**と**初期データ構造の解析**という側面に特化しています。`map.ts` が経路探索や距離計算などのアルゴリズムに焦点を当てているのに対し、`mapLoader.ts` はデータソースからの読み込みという関心事を分離しています。

## タグ
#MapLoader #Utils #Async #Fetch #DataParsing
