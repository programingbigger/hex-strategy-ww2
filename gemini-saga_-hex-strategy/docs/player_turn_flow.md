```
ゲーム仕様書：Hex Strategy Tactics (Beta)
	ゲーム概要
		ゲームタイトル案: Hex Strategy Tactics
		テーマ: 第二次世界大戦モチーフのターン制ヘックス戦略シミュレーション
		勝利条件
			敵ユニットの全滅
			敵の首都を占領
	ユニット特性
		歩兵 (Infantry)
		戦車 (Tank)
		装甲車 (ArmoredCar)
		対戦車砲 (AntiTank)
		砲兵 (Artillery)
			反撃不可
		経験値とレベルアップ
			敵へのダメージか都市占領でXP獲得
			XP100でレベルアップ
		燃料
			移動で消費
			地形によって消費量変動
			燃料切れで移動不可
	地形と天候
		地形一覧
			平原 (Plains)
			森林 (Forest)
			山岳 (Mountain)
			川 (River)
			道路 (Road)
			橋 (Bridge)
			都市 (City)
			泥 (Mud)
		都市と回復
			自軍都市でターン開始時にHP+2、燃料全回復
		天候システム
			種類: 晴れ、雨、豪雨
			地形変化: 雨/豪雨が続くと平原→泥、晴れが続くと泥→平原
	基本ルールと流れ
		ターン制
		ユニットの行動
		アクション
			移動 (燃料消費)
			攻撃 (経験値獲得、砲兵は反撃されない)
			占領 (歩兵のみ、都市HPを0にして経験値獲得)
			待機
			やり直し
		ZOC (Zone of Control)
			敵隣接ヘックスへの進入に追加移動コスト+2
		ターン終了
	UI概要
		ヘッダー (Header)
			セーブ/ロードボタン配置
		ゲームボード (GameBoard)
		情報パネル (InfoPanel)
			HP、燃料、経験値を表示
		戦闘レポート (BattleReportModal)
	ゲーム状態の保存と読み込み (JSON)
		機能
			保存 (Save)
			読み込み (Load)
		JSONデータ構造 (スキーマ)
			gameStatus
			board
			units
```