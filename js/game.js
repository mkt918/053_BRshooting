/**
 * game.js
 * ゲームのメインロジック（Canvas描画・ゲームループ・当たり判定）
 */

class IceCreamObject {
    constructor(x, y, iceCream, isTarget) {
        this.x = x;
        this.y = y;
        this.iceCream = iceCream;
        this.isTarget = isTarget; // 残すべきアイスかどうか
        this.width = GAME_CONFIG.iceWidth;
        this.height = GAME_CONFIG.iceHeight;
        this.destroyed = false;
        this.alpha = 1;
        this.scale = 1;
        // 破壊アニメーション
        this.exploding = false;
        this.explodeTimer = 0;
        this.particles = [];
        // 揺れアニメーション
        this.wobble = 0;
        this.wobbleDir = 1;
    }

    update(fallSpeed) {
        if (this.exploding) {
            this.explodeTimer++;
            this.alpha = Math.max(0, 1 - this.explodeTimer / 20);
            this.scale = 1 + this.explodeTimer * 0.05;
            this.particles.forEach(p => p.update());
            if (this.explodeTimer >= 20) {
                this.destroyed = true;
            }
            return;
        }
        this.y += fallSpeed;
        this.wobble += 0.08 * this.wobbleDir;
        if (Math.abs(this.wobble) > 0.15) this.wobbleDir *= -1;
    }

    startExplode() {
        this.exploding = true;
        // パーティクル生成
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            this.particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                Math.cos(angle) * (3 + Math.random() * 4),
                Math.sin(angle) * (3 + Math.random() * 4),
                this.iceCream.borderColor
            ));
        }
    }

    isOffScreen(canvasHeight) {
        return this.y > canvasHeight + 20;
    }

    draw(ctx) {
        ctx.save();
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        ctx.globalAlpha = this.alpha;
        ctx.translate(cx, cy);
        ctx.scale(this.scale, this.scale);
        ctx.rotate(this.wobble * 0.1);

        // パーティクル描画
        if (this.exploding) {
            this.particles.forEach(p => p.draw(ctx));
        }

        // アイスコーン型の描画（imagePath なしの場合）
        if (!this.iceCream.imagePath) {
            this._drawPlaceholder(ctx);
        } else {
            const img = imageCache[this.iceCream.imagePath];
            if (img && img.complete) {
                ctx.drawImage(img, -this.width / 2, -this.height / 2, this.width, this.height);
            } else {
                this._drawPlaceholder(ctx);
            }
        }

        ctx.restore();
    }

    _drawPlaceholder(ctx) {
        const w = this.width;
        const h = this.height;
        const hw = w / 2;
        const hh = h / 2;

        // コーン（下の三角形）
        ctx.beginPath();
        ctx.moveTo(-hw * 0.5, hh * 0.1);
        ctx.lineTo(hw * 0.5, hh * 0.1);
        ctx.lineTo(0, hh);
        ctx.closePath();
        ctx.fillStyle = "#D2B48C";
        ctx.fill();
        // コーンの模様
        ctx.strokeStyle = "#A0785A";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // コーンの格子模様
        ctx.beginPath();
        ctx.moveTo(-hw * 0.3, hh * 0.1);
        ctx.lineTo(hw * 0.08, hh);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hw * 0.3, hh * 0.1);
        ctx.lineTo(-hw * 0.08, hh);
        ctx.stroke();

        // アイスクリーム本体（円）
        const r = hw * 0.9;
        ctx.beginPath();
        ctx.arc(0, -hh * 0.15, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(-r * 0.3, -hh * 0.4, r * 0.1, 0, -hh * 0.15, r);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.4, this.iceCream.bgColor);
        grad.addColorStop(1, this.iceCream.borderColor);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = this.iceCream.borderColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // 絵文字
        ctx.font = `${hw * 0.8}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.iceCream.emoji, 0, -hh * 0.15);

        // アイス名ラベル
        ctx.font = `bold ${hw * 0.28}px "Noto Sans JP", sans-serif`;
        ctx.fillStyle = this.iceCream.textColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.iceCream.name, 0, hh * 1.25);
    }

    contains(px, py) {
        return (
            px >= this.x && px <= this.x + this.width &&
            py >= this.y && py <= this.y + this.height
        );
    }
}

class Particle {
    constructor(x, y, vx, vy, color) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.color = color;
        this.alpha = 1;
        this.r = 4 + Math.random() * 4;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.alpha = Math.max(0, this.alpha - 0.05);
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x - (this.x), this.y - (this.y), this.r, 0, Math.PI * 2);
        // 親のtranslateから相対座標に直す必要があるため絶対座標で描く
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

class Beam {
    constructor(startX, startY, targetX, targetY) {
        // カーソル位置から上方向（画面上端）へ発射
        this.x = startX;
        this.y = startY;
        const dx = targetX - startX;
        const dy = targetY - startY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        this.vx = (dx / dist) * GAME_CONFIG.beamSpeed;
        this.vy = (dy / dist) * GAME_CONFIG.beamSpeed;
        this.done = false;
        this.trail = [];
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) this.trail.shift();
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -20 || this.y > 700 || this.x < -20 || this.x > 1000) {
            this.done = true;
        }
    }

    draw(ctx) {
        if (this.trail.length < 2) return;
        ctx.save();
        for (let i = 1; i < this.trail.length; i++) {
            const alpha = i / this.trail.length;
            ctx.beginPath();
            ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y);
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
            ctx.strokeStyle = `rgba(255, 80, 180, ${alpha})`;
            ctx.lineWidth = GAME_CONFIG.beamWidth * alpha;
            ctx.lineCap = "round";
            ctx.shadowColor = "rgba(255, 100, 200, 0.8)";
            ctx.shadowBlur = 12;
            ctx.stroke();
        }
        // 先端の光
        ctx.beginPath();
        ctx.arc(this.x, this.y, GAME_CONFIG.beamWidth, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.shadowColor = "#FF69B4";
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();
    }
}

// 画像キャッシュ
const imageCache = {};

function preloadImages() {
    ICE_CREAMS.forEach(ice => {
        if (ice.imagePath) {
            const img = new Image();
            img.src = ice.imagePath;
            imageCache[ice.imagePath] = img;
        }
    });
}

class GameEngine {
    constructor(canvas, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ui = ui;

        this.reset();
        this.bindEvents();
    }

    reset() {
        this.score = 0;
        this.lives = GAME_CONFIG.lives;
        this.round = 1;
        this.currentFallSpeed = GAME_CONFIG.baseFallSpeed;
        this.iceObjects = [];
        this.beams = [];
        this.targetIce = null;
        this.roundDestroyCount = 0; // 今ラウンドで撃ち落とした数
        this.roundTotalToDestroy = GAME_CONFIG.targetsPerRound;
        this.spawnTimer = 0;
        this.spawnInterval = GAME_CONFIG.spawnIntervalMs;
        this.lastTime = null;
        this.running = false;
        this.paused = false;
        this.mouseX = 400;
        this.mouseY = 300;
        this.flashMessage = null;

        // ラウンド開始時のターゲットを選ぶ
        this._selectTarget();
    }

    _selectTarget() {
        // ランダムに3種類選択し、そのうち1つを「残す」ターゲットにする
        const shuffled = [...ICE_CREAMS].sort(() => Math.random() - 0.5);
        this.roundIceTypes = shuffled.slice(0, GAME_CONFIG.numColumns);
        this.targetIce = this.roundIceTypes[Math.floor(Math.random() * this.roundIceTypes.length)];
        this.ui.updateTarget(this.targetIce);
    }

    bindEvents() {
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            this.mouseX = (e.clientX - rect.left) * scaleX;
            this.mouseY = (e.clientY - rect.top) * scaleY;
        });

        this.canvas.addEventListener("click", (e) => {
            if (!this.running || this.paused) return;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;

            // ビームをカーソル位置からクリック位置方向へ発射
            const beamStartX = mx;
            const beamStartY = this.canvas.height - 40;
            this.beams.push(new Beam(beamStartX, beamStartY, mx, my));
        });
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.spawnTimer = 0;
        requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.running = false;
    }

    loop(timestamp) {
        if (!this.running) return;
        const dt = timestamp - (this.lastTime || timestamp);
        this.lastTime = timestamp;
        this.spawnTimer += dt;

        this.update(dt);
        this.draw();
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // スポーン
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this._spawnRow();
        }

        // アイスの更新
        this.iceObjects.forEach(obj => obj.update(this.currentFallSpeed));

        // ビームの更新
        this.beams.forEach(beam => beam.update());

        // ビームとアイスの当たり判定
        this.beams.forEach(beam => {
            if (beam.done) return;
            this.iceObjects.forEach(obj => {
                if (obj.destroyed || obj.exploding) return;
                if (obj.contains(beam.x, beam.y)) {
                    beam.done = true;
                    if (obj.isTarget) {
                        // 正解アイスを撃った → ペナルティ
                        this.score += GAME_CONFIG.wrongPenalty;
                        this.lives--;
                        this._showFlash(`❌ ${obj.iceCream.name} は残すアイスです！ -${Math.abs(GAME_CONFIG.wrongPenalty)}点`, "#E53935");
                        obj.startExplode();
                        if (this.lives <= 0) this._gameOver();
                    } else {
                        // 間違いアイスを撃った → 得点
                        this.score += GAME_CONFIG.hitScore;
                        this.roundDestroyCount++;
                        this._showFlash(`✅ +${GAME_CONFIG.hitScore}点！`, "#43A047");
                        obj.startExplode();
                        if (this.roundDestroyCount >= this.roundTotalToDestroy) {
                            this._roundClear();
                        }
                    }
                    this.ui.updateScore(this.score);
                    this.ui.updateLives(this.lives);
                }
            });
        });

        // 画面外に出たアイスを削除
        this.iceObjects.forEach(obj => {
            if (!obj.exploding && obj.isOffScreen(this.canvas.height)) {
                // 落ちたのがターゲットアイスなら消えても問題なし、間違いアイスなら逃した（ペナルティなし）
                obj.destroyed = true;
            }
        });

        // クリーンアップ
        this.iceObjects = this.iceObjects.filter(o => !o.destroyed);
        this.beams = this.beams.filter(b => !b.done);
    }

    _spawnRow() {
        // 各列にランダムにアイスクリームを割り当てる
        const colWidth = this.canvas.width / GAME_CONFIG.numColumns;
        const margin = GAME_CONFIG.iceWidth * 0.3;

        // 各列に1つずつスポーン（どのアイスか ランダム）
        for (let col = 0; col < GAME_CONFIG.numColumns; col++) {
            const ice = this.roundIceTypes[col % this.roundIceTypes.length];
            // 時々シャッフルして違う種類も出る
            const selectedIce = Math.random() > 0.4
                ? this.roundIceTypes[col]
                : this.roundIceTypes[Math.floor(Math.random() * this.roundIceTypes.length)];

            const x = colWidth * col + margin / 2 + Math.random() * (colWidth - GAME_CONFIG.iceWidth - margin);
            const y = -GAME_CONFIG.iceHeight - Math.random() * 40;
            const isTarget = selectedIce.id === this.targetIce.id;

            this.iceObjects.push(new IceCreamObject(x, y, selectedIce, isTarget));
        }
    }

    _roundClear() {
        this.round++;
        this.roundDestroyCount = 0;
        this.currentFallSpeed = Math.min(
            GAME_CONFIG.baseFallSpeed + (this.round - 1) * GAME_CONFIG.speedIncrement,
            GAME_CONFIG.maxFallSpeed
        );
        this.iceObjects = [];
        this.beams = [];
        this._selectTarget();
        this.ui.showRoundClear(this.round - 1, this.score, () => {
            this.spawnTimer = this.spawnInterval; // すぐスポーン
        });
    }

    _gameOver() {
        this.running = false;
        setTimeout(() => {
            this.ui.showGameOver(this.score, this.round);
        }, 800);
    }

    _showFlash(msg, color) {
        this.flashMessage = { text: msg, color, alpha: 1, timer: 0 };
    }

    draw() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // 背景
        ctx.clearRect(0, 0, W, H);
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, "#1a0533");
        bgGrad.addColorStop(0.5, "#2d0a5e");
        bgGrad.addColorStop(1, "#1a0533");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // 星のエフェクト（固定ランダム）
        this._drawStars(ctx, W, H);

        // 列区切りガイドライン
        const colWidth = W / GAME_CONFIG.numColumns;
        for (let i = 1; i < GAME_CONFIG.numColumns; i++) {
            ctx.beginPath();
            ctx.moveTo(colWidth * i, 0);
            ctx.lineTo(colWidth * i, H);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
            ctx.lineWidth = 1;
            ctx.setLineDash([10, 10]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // アイスの描画
        this.iceObjects.forEach(obj => obj.draw(ctx));

        // ビームの描画
        this.beams.forEach(beam => beam.draw(ctx));

        // カーソルのクロスヘア
        this._drawCrosshair(ctx, this.mouseX, this.mouseY);

        // フラッシュメッセージ
        if (this.flashMessage) {
            const fm = this.flashMessage;
            fm.timer++;
            fm.alpha = Math.max(0, 1 - fm.timer / 50);
            fm.y = (fm.y || H * 0.4) - 1.5;
            ctx.save();
            ctx.globalAlpha = fm.alpha;
            ctx.font = 'bold 28px "Noto Sans JP", sans-serif';
            ctx.fillStyle = fm.color;
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(0,0,0,0.7)";
            ctx.shadowBlur = 8;
            ctx.fillText(fm.text, W / 2, fm.y || H * 0.4);
            ctx.restore();
            if (fm.alpha <= 0) this.flashMessage = null;
        }

        // 砲台（画面下中央）
        this._drawCannon(ctx, W, H);
    }

    _drawStars(ctx, W, H) {
        // シード固定の星（毎フレーム同じ位置）
        if (!this._stars) {
            this._stars = [];
            for (let i = 0; i < 60; i++) {
                this._stars.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: Math.random() * 1.5 + 0.5,
                    a: Math.random()
                });
            }
        }
        const t = Date.now() / 2000;
        this._stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(t + s.a * 10)})`;
            ctx.fill();
        });
    }

    _drawCrosshair(ctx, x, y) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 100, 200, 0.9)";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#FF69B4";
        ctx.shadowBlur = 10;

        const r = 18;
        const gap = 6;
        // 外円
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        // クロスライン（4本）
        [[x - r - gap, y, x - r - gap * 3, y],
        [x + r + gap, y, x + r + gap * 3, y],
        [x, y - r - gap, x, y - r - gap * 3],
        [x, y + r + gap, x, y + r + gap * 3]].forEach(([x1, y1, x2, y2]) => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        });
        ctx.restore();
    }

    _drawCannon(ctx, W, H) {
        const cx = this.mouseX; // 砲台はカーソルX追従
        const cy = H - 20;
        ctx.save();
        // 台座
        ctx.beginPath();
        ctx.roundRect(cx - 25, cy - 10, 50, 20, 8);
        ctx.fillStyle = "#7B1FA2";
        ctx.shadowColor = "#CE93D8";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.strokeStyle = "#CE93D8";
        ctx.lineWidth = 2;
        ctx.stroke();
        // 砲身（マウス方向へ向く）
        const angle = Math.atan2(this.mouseY - cy, this.mouseX - cx) - Math.PI / 2;
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.roundRect(-6, -35, 12, 35, 4);
        ctx.fillStyle = "#AB47BC";
        ctx.fill();
        ctx.restore();
    }
}
