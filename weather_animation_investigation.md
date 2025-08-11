# 天候アニメーションの調査結果

## 目的

参照プロジェクト内の天候アニメーション（雨）の仕組みを解明し、現在のプロジェクトに同様の機能を実装するための参考資料とする。

## 対象ファイル

- `/Users/namiya_fuminori/hex-strategy-ww2/Commander/ref_folders/gemini-saga_-hex-strategy/src/components/game/GameBoard.tsx`

## アニメーションの仕組み

この雨エフェクトは、外部ライブラリや複雑なパーティクルシステムを使用せず、ReactとインラインCSSアニメーションを組み合わせて実装されています。

### 1. 実装の概要

`GameBoard.tsx`コンポーネント内で、特定の気象条件下でのみ表示されるCSSアニメーションとして構築されています。

### 2. 発動条件

コンポーネントが受け取る`weather`プロパティの値が `'Rain'`, `'HeavyRain'`, `'Storm'` のいずれかである場合に、アニメーションを描画する`div`要素が有効になります。

```javascript
{['Rain', 'HeavyRain', 'Storm'].includes(weather) && (
  // ... アニメーションのJSX ...
)}
```

### 3. 実装詳細

- **オーバーレイ:**
  画面全体を覆う`div`要素をコンテナとして配置し、`pointer-events-none` を指定して、下のゲームボードへの操作を妨げないようにしています。
  内部に半透明の青い`div`を配置し、雨の雰囲気の色合いを表現しています。

- **雨粒の生成:**
  `Array.from({ length: 100 }).map(...)` を使用して、100個の`div`要素（雨粒）を動的に生成します。

- **CSSによるアニメーション:**
  コンポーネント内に直接`<style>`タグを埋め込み、雨粒のスタイルとアニメーションを定義しています。

  - **雨粒のスタイル (`.rain-drop`):**
    - `position: absolute;` で親コンテナ内の任意の位置に配置できるようにします。
    - `background: linear-gradient(...)` を使い、雨粒が流れるような見た目を表現しています。

  - **落下アニメーション (`@keyframes fall`):**
    - `transform: translateY(100vh);` を `to` のスタイルに指定し、要素が画面の上から下まで垂直に移動するアニメーションを定義します。

  - **ランダム化:**
    各雨粒のスタイルに`Math.random()`を用いて値を設定することで、自然なばらつきを生み出しています。
    - `left`: 水平位置をランダムに配置します。
    - `animationDelay`: アニメーションの開始タイミングをずらし、一斉に降り始めないようにします。
    - `animationDuration`: 落下速度に変化をつけます。

### コード抜粋

```jsx
<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
  <div className="absolute top-0 left-0 w-full h-full bg-blue-900 opacity-20"></div>
  {/* A simple rain effect using CSS */}
  <style>{`
    .rain-drop {
      position: absolute;
      bottom: 100%;
      width: 2px;
      height: 80px;
      background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.4));
      animation: fall 0.5s linear infinite;
    }
    @keyframes fall {
      to {
        transform: translateY(100vh);
      }
    }
  `}</style>
  {Array.from({ length: 100 }).map((_, i) => (
    <div
      key={i}
      className="rain-drop"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${0.5 + Math.random() * 0.3}s`,
      }}
    />
  ))}
</div>
```

## 結論

この方法は、JavaScript（React）でパーティクル（雨粒）を動的に生成し、その個々の動きをCSSアニメーションで制御する、シンプルかつ効果的な実装です。追加のライブラリを必要とせず、軽量な視覚効果を実現しています。
