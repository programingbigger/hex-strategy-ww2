# GameBoard - ゲームボード表示コンポーネント

## 概要

`GameBoard.tsx`は、ゲームの盤面全体をSVGとして描画するコンテナコンポーネントです。`boardLayout`（盤面情報）を元にループ処理を行い、個々のヘックスの描画は子コンポーネントの `Hexagon` に委譲します。また、`useCamera` フックと連携し、マップのズームやパン（視点移動）を実現します。

## ファイル場所

`/Commander/src/components/game/GameBoard.tsx`

## ロジックフロー

1.  `boardLayout` Propを受け取り、マップ上の全タイルに対してループ処理を行います。
2.  各タイルについて、`units`, `selectedUnitId`, `reachableTiles`, `attackableTiles`, `engineerTargetTiles` などのPropsから、そのタイルの状態（選択されているか、移動可能か、攻撃可能かなど）を判定します。
3.  判定した状態とタイル・ユニット情報を `Hexagon` コンポーネントにPropsとして渡し、個々のヘックスの描画を依頼します。
4.  `useCamera` フックから受け取ったカメラの座標とズームレベルをSVGの `viewBox` 属性に設定し、表示領域を制御します。

## Props（引数）

| Prop                  | Type                  | Description                                                      |
| --------------------- | --------------------- | ---------------------------------------------------------------- |
| `boardLayout`         | `BoardLayout`         | ゲーム盤面のタイル情報を持つMapオブジェクト。                      |
| `units`               | `Unit[]`              | 全ユニットの配列。                                               |
| `selectedUnitId`      | `string \| null`      | 選択されているユニットのID。                                     |
| `reachableTiles`      | `Coordinate[]`        | 選択中ユニットが移動可能なタイル座標の配列。                     |
| `attackableTiles`     | `Coordinate[]`        | 選択中ユニットが攻撃可能なタイル座標の配列。                     |
| `engineerTargetTiles` | `Coordinate[]`        | 工兵のアクション対象となるタイル座標の配列。                     |
| `onHexClick`          | `(coord: Coordinate) => void` | ヘックスがクリックされたときに呼び出されるコールバック。         |
| `onHexHover`          | `(coord: Coordinate) => void` | マウスがヘックス上にあるときに呼び出されるコールバック。         |
| `onHexLeave`          | `() => void`          | マウスがヘックスから離れたときに呼び出されるコールバック。       |

## 依存関係

- [[Hexagon]] - 個別ヘックスタイルの描画に依存します。
- [[useCamera]] - マップの視点操作（ズーム、パン）に依存します。
- [[types-index]] - 型定義に依存します。
- `../config/constants.ts` - ヘックスの基本サイズ（`HEX_SIZE`）を取得します。

## 関連コンポーネント

- [[BattleScreen]] - メイン戦闘画面でこのコンポーネントを使用します。

## タグ
#GameBoard #CoreComponent #UI #HexGrid #SVG #ViewPort
