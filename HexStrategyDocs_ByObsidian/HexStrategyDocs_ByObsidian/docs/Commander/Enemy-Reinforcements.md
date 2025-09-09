# 敵増援システム

## 概要

敵増援システムは、特定のターンにマップ上の指定された位置に新たな敵ユニットを出現させる機能です。これにより、戦闘の途中で戦況が変化し、プレイヤーに新たな戦術的課題を提示します。

## プレイヤー体験への効果・狙い

- **静的な戦況の打破**: 戦闘が膠着状態に陥るのを防ぎ、常に緊張感を維持します。
- **戦術の多様化**: プレイヤーは、将来出現する増援を考慮に入れた長期的な戦略を立てる必要があります。
- **リプレイ性の向上**: 同じマップでも、増援の存在によって異なるゲーム展開を楽しめます。

## 設定方法

敵増援は、マップごとに個別のJSONファイルで設定します。

1.  **設定ファイルの作成**: `Commander/public/data/reinforcements/` ディレクトリに、マップIDと同じ名前のJSONファイルを作成します。（例：`test_map_1.json`）

2.  **設定ファイルの記述**: 作成したJSONファイルに、以下の形式で増援情報を記述します。

    ```json
    {
      "mapId": "test_map_1",
      "description": "Test map reinforcement configuration",
      "reinforcements": [
        {
          "id": "reinforcement-1",
          "unitId": "red-infantry-standard",
          "spawnTurn": 2,
          "spawnLocation": {
            "x": 3,
            "y": 2
          },
          "team": "Red",
          "description": "Enemy infantry reinforcement from the east"
        },
        {
          "id": "reinforcement-2", 
          "unitId": "red-tank-medium",
          "spawnTurn": 5,
          "spawnLocation": {
            "x": 3,
            "y": 2
          },
          "team": "Red",
          "description": "Enemy tank reinforcement from the east"
        }
      ],
      "spawnLocations": [
        {
          "x": 3,
          "y": 2,
          "description": "Eastern reinforcement spawn point",
          "allowedTeam": "Red"
        }
      ]
    }
    ```

    - **`mapId`**: 対応するマップのID。
    - **`description`**: この設定ファイルの説明。
    - **`reinforcements`**: 増援ユニットの配列。
        - **`id`**: 増援の一意なID。
        - **`unitId`**: 出現させるユニットのID。`Commander/src/data/armyOrganization.json` で定義されているユニットIDと一致させる必要があります。
        - **`spawnTurn`**: ユニットが出現するターン。
        - **`spawnLocation`**: ユニットが出現する座標。
        - **`team`**: ユニットの所属チーム（`Red` または `Blue`）。
        - **`description`**: 増援の説明。
    - **`spawnLocations`**: 増援の出現地点に関する情報の配列（現在はプレビュー表示などに使用）。

3.  **ゲームへの反映**: 上記の設定を行うと、ゲームは自動的にこのファイルを読み込み、指定されたターンの開始時に指定されたユニットをマップ上に出現させます。出現時には、プレイヤーに通知モーダルが表示されます。
