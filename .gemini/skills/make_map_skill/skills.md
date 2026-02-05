---
name: make_map_skill
description: ゲーム開発をする上で、マップの70%を作成するためのスキル。残りの30はユーザーが修正する。このskillの発動条件は、skillの使用・呼び出し + マップの縦横の数nが絶対に必須。このnを用いて、make_board.mdへ入力し、マップの更地の全体像を作成するためだ。そのほかの入力は、ユーザーが行ったら、よしなにマップ構成の各要素を埋めていく。もし、このnがない場合は、ユーザーに問い合わせる、質問すること。絶対に。
version: 1.0.0
---
# ステップ
- ① 箱の作成：マップ構成の各要素をjsonで作成する
- ② マップの要、tileの定義：board>tiles(array)を一番最初に作成する
- ③ 各要素を埋める
- ④ アウトプットを指定の場所に名前(name_hogehogeなど)を付け、json形式で提出する
- ⑤ ④のアウトプットをアクティベイトするために、マップを登録する

# 条件
- jsonの要素のうち、gameStatusとarmyFunds、deploymentLimits、　initialCameraPosition、availableUnits、producibleUnitsはassetを参考にする。
- 特に指示がない場合は、それ以外はbrank（""）にする

# マップの構成
- gameStatus (Object) ゲーム開始時ステータス
   * gameState: "playing" などの状態
   * turn: 開始時ターン
   * activeTeam: ユーザーが操作する軍defaultはBlue ("Blue" / "Red")
   * weather: 開始時の天候。defaultは"Clear"
   * weatherDuration: ?
   * turnLimit: 最大ターン
   * attackingTeam / defendingTeam:
     攻守のチーム設定。
   * enabledVictoryConditions:
     有効な勝利条件の配列
     ("unit_elimination", "capital_capture"
     など)

- armyFunds (Object)　開始時の軍資金
   * Blue: 数値
   * Red: 数値


- deploymentLimits (Object):マップ上におけるユニットの上限
   * Blue: 数値
   * Red: 数値

- initialCameraPosition: 初期カメラの位置
    - x: x座標
    - y: y座標

- availableUnits (Array of Objects)
  初期配置フェーズで「ストック」として持って
  いるユニット。
   * id: 管理用ID
   * faction: "Blue" / "Red"
   * count: 保有数
   * unitId: ユニットのタイプID

- producibleUnits (Object): 生産できるユニットの定義
   * Blue: ユニットIDの配列
   * Red: ユニットIDの配列


- units (Array of Objects): マップに配置済みの各ユニットの詳細。
   * id, team, x, y, hp, fuel, xp, moved,
     attacked など


- board (Object): マップのタイルを作成する
   * tiles: (Array of Objects)
       * x: x座標
       * y: y座標
       * terrain: 地形タイプ ("Plains",
         "Forest", "Road", "River",
         "Capital" など)
       * owner: (都市や首都の場合) 所有チーム ("Blue" / "Red")
       * hp / maxHp: (拠点の場合) 耐久値

# ツール
- boardの作成: make_board.md
- マップの登録: touroku_maps.md

# アウトプットの提出先
- Commander/public/maps/scenario配下

# 参考
- board>tiles>terrainを定義するときは、Commander/src/types/index.tsの61行目を参照。