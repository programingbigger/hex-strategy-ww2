# 🧑‍💻 機能定義書：Hex Strategy Tactics (Beta)

### 1. ゲームの基本構造と状態管理 (`useGameLogic.ts`)
アプリケーションの主要なロジックと状態は、カスタムフック `useGameLogic` に集約されています。

| 状態 (State) | 型 (Type) | 説明 |
| :--- | :--- | :--- |
| `gameState` | `GameState` | ゲームの現在の状態（'playing' または 'gameOver'）。 |
| `turn` | `number` | 現在のターン数。 |
| `activeTeam` | `Team` | 現在行動中のチーム（'Blue' または 'Red'）。 |
| `boardLayout` | `BoardLayout` | マップ全体の地形情報を保持する `Map` オブジェクト。 |
| `units` | `Unit[]` | 全てのユニットの状態を保持する配列。**各ユニットはHP、燃料、経験値(XP)を持つ。** |
| `selectedUnitId` | `string | null` | プレイヤーに選択されているユニットのID。 |
| `hoveredHex` | `Coordinate | null` | マウスカーソルが乗っているヘックスの座標。 |
| `battleReport` | `BattleReport | null` | 戦闘結果のレポート情報。 |
| `isLoadingAI` | `boolean` | AIの処理中（戦闘レポート生成など）を示すフラグ。 |
| `winner` | `Team | null` | 勝者が決定した場合のチーム名。 |
| `weather` | `WeatherType` | 現在の天候（晴れ、雨、豪雨）。 |
| `weatherDuration` | `number` | 現在の天候が継続しているターン数。地形変化の判定に使用。 |
| `history` | `GameStateSnapshot[]` | 「元に戻す」機能のためのゲーム状態のスナップショット配列。 |

### 2. 主要な関数/メソッド (`useGameLogic.ts`)
| 関数名 | 説明 |
| :--- | :--- |
| `initializeGame()` | ゲームボード、ユニット、各種状態を初期化する。 |
| `handleEndTurn()` | ターンを終了し、次のチームに行動権を移す。**自軍ターン開始時に都市にいるユニットの回復/補給を行う。** また、**天候の変化と、それに伴う地形の変化（平原⇔泥）を処理する。** |
| `handleHexClick(coord)` | ヘックスがクリックされた際の処理。ユニットの選択、**燃料を消費しての移動**、攻撃の起点となる。 |
| `handleAttack(attacker, defender)` | 攻撃処理を実行し、ダメージ計算、**与えたダメージに応じた経験値(XP)の付与**、戦闘レポート生成、ユニットの状態更新を行う。**砲兵は反撃を受けない。** |
| `handleAction(action)` | 選択中のユニットに対して「待機」、**「占領」（歩兵のみ、経験値獲得を伴う）**、「元に戻す」などのアクションを実行する。 |
| `checkWinCondition()` | 勝利条件（敵ユニットの全滅、全都市の占領）が満たされているかを確認する。 |
| `saveStateToHistory()` | 現在のゲーム状態を `history` stateに保存する。 |
| `saveGameToJson()` | 現在のゲーム状態全体をJSON文字列として生成し、返す。 |
| `loadGameFromJson(jsonString)` | 引数で受け取ったJSON文字列をパースし、ゲーム状態を復元する。 |

### 3. 定数と型定義
*   **`src/config/constants.ts`**: ユニットの基本ステータス (`UNIT_STATS`)、地形の効果 (`TERRAIN_STATS`)、ユニットの初期配置 (`INITIAL_UNIT_POSITIONS`) など、ゲームのバランスに関わる静的なデータが定義されています。
*   **`src/types/index.ts`**: `Unit`, `Tile`, `Team`, `GameState` など、アプリケーション全体で使用される主要なデータ構造の型が定義されています。**`Unit`型には `fuel` と `xp` が含まれる。**

### 4. コアロジック
#### 4.1. マップ関連処理 (`src/utils/map.ts`)
| 関数名 | 説明 |
| :--- | :--- |
| `generateBoardLayout()` | 平原、都市、川、山、森などを手続き的に生成し、ゲームボードを作成する。 |
| `calculateReachableTiles(...)` | ユニットの移動力、**残り燃料**、地形コスト、**敵ユニットのZOC（Zone of Control）**を考慮して、移動可能なタイルのリストを計算する。**ZOCヘックスへの進入には追加の移動コストが必要。** |
| `findPath(...)` | A*アルゴリズムを用いて、指定された2点間の最短経路を探索する。 |
| `getDistance(a, b)` | 2つのヘックス間の距離を計算する。 |
| `axialToPixel(coord, size)` | ヘックスの座標を画面上のピクセル座標に変換する。 |
| `loadMapFromJson(jsonData)` | JSONデータからマップレイアウトとユニット配置を読み込む。 |

#### 4.2. 戦闘処理
*   **`src/hooks/useGameLogic.ts` の `handleAttack` 関数**: 戦闘の主要ロジックを担当。攻撃側と防御側のユニット、地形効果を基にダメージを算出します。**砲兵は地形の防御ボーナスを無視し、反撃を受けません。** 戦闘後、攻撃側は与えたダメージと同量の経験値(XP)を獲得します。
*   **`src/services/battleReport.ts` の `generateBattleReport` 関数**: 戦闘結果を基に、自然言語のレポートを生成します。

### 5. UIコンポーネント
| コンポーネント (`src/components/`) | 受け取る主要なProps | 役割 |
| :--- | :--- | :--- |
| `game/GameBoard.tsx` | `boardLayout`, `units`, `selectedUnit`, `reachableTiles`, `attackableTiles` | ゲームのメインボードを描画。ヘックスとユニットを表示し、クリックやホバーイベントを `useGameLogic` に通知する。 |
| `game/Header.tsx` | `turn`, `activeTeam`, `units`, `weather` | ゲームの全体情報（ターン、天候など）を表示するヘッダー。セーブ/ロード機能のボタンが追加される。 |
| `game/InfoPanel.tsx` | `hoveredHex`, `selectedUnit`, `gameState` | マウスオーバーされたタイルや選択されたユニットの詳細情報（**燃料、経験値を含む**）を表示。アクションボタン（待機、占領）を提供する。 |
| `game/BattleReportModal.tsx` | `report` | `battleReport` の内容をモーダルウィンドウで表示する。 |
| `game/Hexagon.tsx` | `terrain`, `isReachable`, `isAttackable` | 個々のヘックスタイルを描画。地形に応じて色を変え、移動/攻撃範囲をハイライトする。 |
| `icons/UnitIcon.tsx` | `type`, `team` | ユニットの種類とチームに応じたSVGアイコンを描画する。 |
