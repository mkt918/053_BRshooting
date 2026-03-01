/**
 * ui.js
 * 画面遷移・HUD管理
 */

class UIManager {
    constructor() {
        this.titleScreen = document.getElementById("title-screen");
        this.gameScreen = document.getElementById("game-screen");
        this.gameOverScreen = document.getElementById("gameover-screen");
        this.roundClearScreen = document.getElementById("round-clear-screen");

        this.scoreEl = document.getElementById("score-value");
        this.livesEl = document.getElementById("lives-display");
        this.roundEl = document.getElementById("round-value");
        this.targetNameEl = document.getElementById("target-name");
        this.targetEmojiEl = document.getElementById("target-emoji");

        this.finalScoreEl = document.getElementById("final-score");
        this.finalRoundEl = document.getElementById("final-round");
        this.clearRoundEl = document.getElementById("clear-round-num");
        this.clearScoreEl = document.getElementById("clear-score-value");

        this.targetConfirmScreen = document.getElementById("target-confirm-screen");
        this.confirmTargetImg = document.getElementById("confirm-target-img");
        this.confirmTargetName = document.getElementById("confirm-target-name");
        this.targetOkBtn = document.getElementById("target-ok-btn");
    }

    showTitle() {
        this.titleScreen.classList.remove("hidden");
        this.gameScreen.classList.add("hidden");
        this.gameOverScreen.classList.add("hidden");
        this.roundClearScreen.classList.add("hidden");
        this.targetConfirmScreen.classList.add("hidden");
    }

    showGame() {
        this.titleScreen.classList.add("hidden");
        this.gameScreen.classList.remove("hidden");
        this.gameOverScreen.classList.add("hidden");
        this.roundClearScreen.classList.add("hidden");
        this.targetConfirmScreen.classList.add("hidden");
    }

    showGameOver(score, round) {
        this.gameOverScreen.classList.remove("hidden");
        this.roundClearScreen.classList.add("hidden");
        if (this.finalScoreEl) this.finalScoreEl.textContent = score.toLocaleString();
        if (this.finalRoundEl) this.finalRoundEl.textContent = round;
        // ハイスコア
        const hs = localStorage.getItem("brShootingHiScore") || 0;
        if (score > hs) {
            localStorage.setItem("brShootingHiScore", score);
            document.getElementById("hi-score-label").textContent = "🎉 NEW RECORD!";
            document.getElementById("hi-score-value").textContent = score.toLocaleString();
        } else {
            document.getElementById("hi-score-label").textContent = "ハイスコア";
            document.getElementById("hi-score-value").textContent = Number(hs).toLocaleString();
        }
    }

    showRoundClear(clearedRound, score, onClose) {
        this.roundClearScreen.classList.remove("hidden");
        if (this.clearRoundEl) this.clearRoundEl.textContent = clearedRound;
        if (this.clearScoreEl) this.clearScoreEl.textContent = score.toLocaleString();
        // 2秒後に自動で次のラウンドへ
        setTimeout(() => {
            this.roundClearScreen.classList.add("hidden");
            onClose();
        }, 2000);
    }

    showTargetConfirm(ice, onConfirm) {
        this.targetConfirmScreen.classList.remove("hidden");
        if (this.confirmTargetImg) this.confirmTargetImg.src = ice.imagePath;
        if (this.confirmTargetName) this.confirmTargetName.textContent = ice.name;

        // OKボタンのイベントリセットとバインド
        const newBtn = this.targetOkBtn.cloneNode(true);
        this.targetOkBtn.parentNode.replaceChild(newBtn, this.targetOkBtn);
        this.targetOkBtn = newBtn;

        this.targetOkBtn.addEventListener("click", () => {
            this.targetConfirmScreen.classList.add("hidden");
            onConfirm();
        });
    }

    updateScore(score) {
        if (this.scoreEl) this.scoreEl.textContent = score.toLocaleString();
    }

    updateLives(lives) {
        if (this.livesEl) {
            this.livesEl.textContent = "❤️".repeat(Math.max(0, lives));
        }
    }

    updateRound(round) {
        if (this.roundEl) this.roundEl.textContent = round;
    }

    updateTarget(ice) {
        if (this.targetNameEl) this.targetNameEl.textContent = ice.name;
        if (this.targetEmojiEl) this.targetEmojiEl.textContent = ice.emoji;
        // ターゲット表示のアニメーション
        const targetBox = document.getElementById("target-box");
        if (targetBox) {
            targetBox.style.borderColor = ice.borderColor;
            targetBox.style.background = ice.bgColor;
            targetBox.style.color = ice.textColor;
            // アニメーション
            targetBox.classList.remove("pulse-anim");
            void targetBox.offsetWidth; // reflow
            targetBox.classList.add("pulse-anim");
        }
    }
}
