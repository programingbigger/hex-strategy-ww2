# hex-strategy-ww2
## ゲームタイトル
Commander

## ブランチについて
### main
#### 役割
本番。見せる用

### dev
#### 役割
- とりあえずゲームが動く状態のコードを保持する場所
- feature用のbackup
- mainにmergeする前のステージング環境

### feature
#### 役割
作業用スペース
壊れてもいい場所

## 魔法の言葉
### Agents
* requirement-verbalizer Agent
    * ユーザーの拙い言葉を言語化してくれるエージェント
* hex-strategy-docs-updater Agnet
    * Obsidianのドキュメントをアップデートしてくれるエージェント

### Custom Comand
* _Cognitive_Tools
* _gitcommit

##　用語集
- コンポーネント
- インジケーター
    - 「プレイヤーにゲームの状態を視覚的に、そして直
  感的に伝えるための小さな目印や記号」

## セットアップ

このゲームをローカル環境で立ち上げるには、以下の手順に従ってください。

1.  **リポジトリのクローン**
    以下のコマンドを実行して、プロジェクトをローカルにクローンします。
    ```bash
    git clone https://github.com/ユーザー名/hex-strategy-ww2.git
    ```
    （注：`https://github.com/ユーザー名/hex-strategy-ww2.git` は実際のプロジェクトURLに置き換えてください。）

2.  **プロジェクトディレクトリへ移動**
    クローンしたディレクトリ内の `Commander` ディレクトリに移動します。
    ```bash
    cd hex-strategy-ww2/Commander
    ```

3.  **依存関係のインストール**
    必要なnpmパッケージをインストールします。
    ```bash
    npm install
    ```

4.  **アプリケーションの起動**
    開発サーバーを起動します。
    ```bash
    npm start
    ```
    ブラウザで `http://localhost:3000` を開くとゲームが利用できます。