# map.ts - マップ関連ユーティリティ

`Commander/src/utils/map.ts` は、ヘックス座標の計算、マップデータの読み込み、ユニットの移動範囲や経路の探索など、ゲームボードに関するすべての計算と操作を担うユーティリティファイルです。

## 機能カテゴリ

### 1. 座標ヘルパー

- `coordToString(coord)`: `{x, y}` 形式の座標オブジェクトを `'x,y'` 形式の文字列に変換します。Mapのキーとして使用されます。
- `stringToCoord(key)`: 文字列キーを座標オブジェクトに戻します。
- `axialToPixel(coord, size)`: ヘックスの軸座標（axial coordinate）を画面上のピクセル座標に変換します。
- `getNeighbors(coord)`: 指定したヘックスに隣接する6つのヘックスの座標を返します。
- `getDistance(a, b)`: 2つのヘックス間の距離を計算します。

### 2. マップの読み込み

- `loadMapFromJSON(mapData)`: マップデータ（JSON形式）を受け取り、ゲームで使用する `BoardLayout` (Mapオブジェクト) と `Unit` の配列を生成して返します。
  - ユニット生成時に `createUnit` を呼び出し、HPや弾薬などの状態がセーブデータから正しく引き継がれるように、破損防止ロジックが含まれています。

### 3. 経路探索と移動範囲計算

- `calculateReachableTiles(start, movement, fuel, board, units, currentTeam)`: 指定したユニットが移動可能なタイルのリストを計算します。
  - **ダイクストラ法**をベースに実装されています。
  - ユニットの移動力と燃料、地形ごとの移動コストを考慮します。
  - 敵ユニットのZOC（Zone of Control）に入ると追加の移動コストがかかるロジックが含まれています。
  - 他のユニットがいるタイルは通行不可とします。
- `findPath(start, goal, board, units, currentTeam)`: スタート地点からゴール地点までの最短経路を探索します。
  - **A*アルゴリズム**で実装されています。
  - ユニットの移動コストを考慮した最適な経路を返します。

### 4. 配置とゾーンコントロール

- `findCapitalsForTeam(board, team)`: 指定したチームが所有する首都の座標をすべて検索します。
- `calculateDeployableTilesFromCapitals(board, team, radius)`: 首都から指定した半径（デフォルト5ヘックス）以内の、ユニットを配置可能なタイルを計算します。
- `isCoordinateDeployable(board, team, coord, radius)`: 指定した座標が、指定したチームの配置可能エリア内にあるかどうかを判定します。
- `countUnitsWithinRadius(coord, units, radius, teamFilter)`: 指定した座標から特定の半径以内にいるユニットの数を数えます。
- `shouldMoveCapital(...)`: 首都の周辺に敵ユニットが密集しているかどうかを判定する将来的な機能です。
- `findPotentialCapitalLocations(...)`: 首都を移動させる場合の候補地を探す将来的な機能です。

## タグ
#MapUtils #Pathfinding #Coordinates #AStar #Dijkstra #ZOC
