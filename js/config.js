/**
 * config.js
 * ゲームの設定ファイル。
 * ここを変更するだけで別テーマのゲームに変更可能。
 *
 * imagePath: null → emoji でプレースホルダー描画
 * imagePath: "images/xxx.png" → 実際の画像を使用
 */

const ICE_CREAMS = [
  {
    id: 1,
    name: "バニラ",
    emoji: "🍦",
    imagePath: null,
    bgColor: "#FFF8E7",
    borderColor: "#F5C842",
    textColor: "#8B6914",
  },
  {
    id: 2,
    name: "ストロベリー",
    emoji: "🍓",
    imagePath: null,
    bgColor: "#FFE0EA",
    borderColor: "#E91E63",
    textColor: "#880E4F",
  },
  {
    id: 3,
    name: "チョコレート",
    emoji: "🍫",
    imagePath: null,
    bgColor: "#EFEBE9",
    borderColor: "#795548",
    textColor: "#3E2723",
  },
  {
    id: 4,
    name: "ミント",
    emoji: "🌿",
    imagePath: null,
    bgColor: "#E0F2F1",
    borderColor: "#00897B",
    textColor: "#004D40",
  },
  {
    id: 5,
    name: "ブルーベリー",
    emoji: "🫐",
    imagePath: null,
    bgColor: "#EDE7F6",
    borderColor: "#7B1FA2",
    textColor: "#4A148C",
  },
  {
    id: 6,
    name: "レモン",
    emoji: "🍋",
    imagePath: null,
    bgColor: "#FFFDE7",
    borderColor: "#F9A825",
    textColor: "#F57F17",
  },
  {
    id: 7,
    name: "マンゴー",
    emoji: "🥭",
    imagePath: null,
    bgColor: "#FFF3E0",
    borderColor: "#FB8C00",
    textColor: "#E65100",
  },
];

const GAME_CONFIG = {
  // ゲームの基本設定
  numColumns: 3,           // 同時に落下する列数
  baseFallSpeed: 1.2,      // 基本落下速度 (px/frame)
  speedIncrement: 0.3,     // ラウンドクリアごとの速度上昇
  maxFallSpeed: 5.0,       // 最大落下速度
  spawnIntervalMs: 2000,   // アイスのスポーン間隔 (ms)

  // スコア
  hitScore: 150,           // 正しいアイスを撃った時の得点
  wrongPenalty: -200,      // 指定アイスを撃った時のペナルティ
  survivePenalty: -50,     // アイスを画面下まで逃した時のペナルティ（間違いが逃げた場合は関係なし）

  // ライフ
  lives: 3,

  // Canvas サイズ（CSSでレスポンシブ対応）
  canvasWidth: 800,
  canvasHeight: 550,

  // アイスの描画サイズ
  iceWidth: 90,
  iceHeight: 110,

  // ビームの設定
  beamSpeed: 18,
  beamWidth: 6,

  // ラウンドあたりに撃ち落とすアイスの数
  targetsPerRound: 6,      // 1ラウンドで撃ち落とす「間違いアイス」の総数
};
