# BR Shooting - サーティワンアイスクリーム シューティングゲーム

サーティワンアイスクリームをテーマにした、ブラウザで遊べるシューティングゲームです。

## 🎮 ゲームの遊び方

1. 画面上部に「残すアイス」が表示されます
2. 3種類のアイスクリームが上から降ってきます
3. **指定されたアイス以外** をカーソルで狙ってクリック！
4. ４指定アイスを撃つとペナルティ！

## 📊 スコアルール

| アクション | 点数 |
|-----------|------|
| 正しいアイスを撃つ | +150点 |
| 指定アイスを撃つ | -200点 ＆ ライフ-1 |

## 🔄 別テーマへの変更方法

`js/config.js` の `ICE_CREAMS` 配列を編集するだけで別テーマに変更できます。

```js
// imagePath: null → 絵文字で表示（デフォルト）
// imagePath: "images/xxx.png" → 実際の画像を使用
{ id: 1, name: "バニラ", emoji: "🍦", imagePath: "images/vanilla.png", ... },
```

## 🚀 GitHub Pages での公開

`main` ブランチへ push するだけで自動的に GitHub Pages へデプロイされます。

**URL**: `https://mkt918.github.io/053_BRshooting/`

## 📁 ファイル構造

```
053_BRshooting/
├── index.html          # メインHTML
├── js/
│   ├── config.js       # ゲーム設定・アイスクリームデータ（ここを変えるだけで別テーマ対応）
│   ├── game.js         # ゲームロジック（Canvas描画・当たり判定）
│   └── ui.js           # 画面遷移・HUD管理
├── images/             # アイスクリーム画像（後で追加）
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages 自動デプロイ
```
