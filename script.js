const TYPES = {
    ROCK: 'rock',
    PAPER: 'paper',
    SCISSORS: 'scissors'
};

const EMOJIS = {
    [TYPES.ROCK]: '🪨',
    [TYPES.PAPER]: '📄',
    [TYPES.SCISSORS]: '✂️'
};

// Define who beats who
const RULES = {
    [TYPES.ROCK]: TYPES.SCISSORS,
    [TYPES.PAPER]: TYPES.ROCK,
    [TYPES.SCISSORS]: TYPES.PAPER
};

class Entity {
    constructor(x, y, type, size) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = size;

        // Random velocity between -1.5 and 1.5
        const speed = 1.5;
        this.vx = (Math.random() - 0.5) * 2 * speed;
        this.vy = (Math.random() - 0.5) * 2 * speed;

        // Ensure minimum speed so they don't get stuck
        if (Math.abs(this.vx) < 0.2) this.vx = this.vx < 0 ? -0.2 : 0.2;
        if (Math.abs(this.vy) < 0.2) this.vy = this.vy < 0 ? -0.2 : 0.2;
    }

    update(width, height, speedMultiplier) {
        this.x += this.vx * speedMultiplier;
        this.y += this.vy * speedMultiplier;

        // Bounce off walls (accounting for roughly half the size)
        const radius = this.size / 2;

        if (this.x - radius < 0) {
            this.x = radius;
            this.vx *= -1;
        } else if (this.x + radius > width) {
            this.x = width - radius;
            this.vx *= -1;
        }

        if (this.y - radius < 0) {
            this.y = radius;
            this.vy *= -1;
        } else if (this.y + radius > height) {
            this.y = height - radius;
            this.vy *= -1;
        }
    }

    draw(ctx) {
        ctx.font = `${this.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(EMOJIS[this.type], this.x, this.y);
    }
}

class Simulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.entities = [];
        this.animationId = null;

        // State
        this.speedMultiplier = 1;
        this.baseEntitySize = 24;

        // Resize canvas to match container
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // DOM Elements for UI
        this.rockStat = document.getElementById('rockCount');
        this.paperStat = document.getElementById('paperCount');
        this.scissorsStat = document.getElementById('scissorsCount');

        this.setupControls();
        this.start();
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    setupControls() {
        document.getElementById('btnSpawnRock').addEventListener('click', () => this.spawnEntities(TYPES.ROCK, 10));
        document.getElementById('btnSpawnPaper').addEventListener('click', () => this.spawnEntities(TYPES.PAPER, 10));
        document.getElementById('btnSpawnScissors').addEventListener('click', () => this.spawnEntities(TYPES.SCISSORS, 10));

        document.getElementById('btnSpawnRandom').addEventListener('click', () => {
            this.spawnEntities(TYPES.ROCK, 10);
            this.spawnEntities(TYPES.PAPER, 10);
            this.spawnEntities(TYPES.SCISSORS, 10);
        });

        document.getElementById('btnReset').addEventListener('click', () => {
            this.entities = [];
            this.updateStats();
        });

        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        speedSlider.addEventListener('input', (e) => {
            this.speedMultiplier = parseFloat(e.target.value);
            speedValue.textContent = `${this.speedMultiplier.toFixed(1)}x`;
        });

        const sizeSlider = document.getElementById('sizeSlider');
        const sizeValue = document.getElementById('sizeValue');
        sizeSlider.addEventListener('input', (e) => {
            this.baseEntitySize = parseInt(e.target.value);
            sizeValue.textContent = `${this.baseEntitySize}px`;
            // Update existing entities
            this.entities.forEach(ent => ent.size = this.baseEntitySize);
        });
    }

    spawnEntities(type, count) {
        for (let i = 0; i < count; i++) {
            const x = this.canvas.width * 0.2 + Math.random() * (this.canvas.width * 0.6);
            const y = this.canvas.height * 0.2 + Math.random() * (this.canvas.height * 0.6);
            this.entities.push(new Entity(x, y, type, this.baseEntitySize));
        }
        this.updateStats();
    }

    checkCollisions() {
        const len = this.entities.length;

        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len; j++) {
                const e1 = this.entities[i];
                const e2 = this.entities[j];

                const dx = e1.x - e2.x;
                const dy = e1.y - e2.y;
                const distanceSq = dx * dx + dy * dy;

                const collisionRadius = this.baseEntitySize * 0.4;
                const minDistanceSq = (collisionRadius * 2) * (collisionRadius * 2);

                if (distanceSq < minDistanceSq) {
                    this.resolveCollision(e1, e2, Math.sqrt(distanceSq) || 1);
                }
            }
        }
    }

    resolveCollision(e1, e2, distance) {
        // Push apart slightly
        const collisionRadius = this.baseEntitySize * 0.4;
        const overlap = (collisionRadius * 2) - distance;

        const dx = e1.x - e2.x;
        const dy = e1.y - e2.y;
        const nx = dx / distance;
        const ny = dy / distance;

        const pushX = (nx * overlap) / 2;
        const pushY = (ny * overlap) / 2;

        e1.x += pushX;
        e1.y += pushY;
        e2.x -= pushX;
        e2.y -= pushY;

        // Simple elastic collision response (swapping velocity along the normal)
        const p = 2 * (e1.vx * nx + e1.vy * ny - e2.vx * nx - e2.vy * ny) / 2;

        e1.vx -= p * nx;
        e1.vy -= p * ny;
        e2.vx += p * nx;
        e2.vy += p * ny;

        // Apply RPS rules
        if (e1.type !== e2.type) {
            let typeChanged = false;

            if (RULES[e1.type] === e2.type) {
                e2.type = e1.type;
                typeChanged = true;
            } else if (RULES[e2.type] === e1.type) {
                e1.type = e2.type;
                typeChanged = true;
            }

            if (typeChanged) {
                this.updateStats();
            }
        }
    }

    updateStats() {
        let rocks = 0;
        let papers = 0;
        let scissors = 0;

        for (const ent of this.entities) {
            if (ent.type === TYPES.ROCK) rocks++;
            else if (ent.type === TYPES.PAPER) papers++;
            else if (ent.type === TYPES.SCISSORS) scissors++;
        }

        this.rockStat.textContent = rocks;
        this.paperStat.textContent = papers;
        this.scissorsStat.textContent = scissors;
    }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.checkCollisions();

        for (const ent of this.entities) {
            ent.update(this.canvas.width, this.canvas.height, this.speedMultiplier);
            ent.draw(this.ctx);
        }

        this.animationId = requestAnimationFrame(() => this.loop());
    }

    start() {
        this.spawnEntities(TYPES.ROCK, 20);
        this.spawnEntities(TYPES.PAPER, 20);
        this.spawnEntities(TYPES.SCISSORS, 20);

        if (!this.animationId) {
            this.loop();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Adding a slight delay to ensure fonts/layout are fully ready
    setTimeout(() => {
        window.simulation = new Simulation('simCanvas');
    }, 100);
});
