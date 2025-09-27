// 游戏状态管理
class GoldMiningGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gold = 0;
        this.totalGoldMined = 0;

        // 工具系统
        this.tools = {
            pickaxe: { level: 1, efficiency: 1.0, cost: 10 },
            drill: { level: 1, efficiency: 1.5, cost: 25 },
            excavator: { level: 1, efficiency: 2.0, cost: 50 }
        };

        // 矿石位置和大小
        this.goldSpots = [];
        this.worker = { x: 100, y: 200, mining: false, targetX: 100, targetY: 200 };

        // 成就系统
        this.achievements = {
            achievement1: { unlocked: false, requirement: 100, name: "初级矿工" },
            achievement2: { unlocked: false, requirement: 500, name: "黄金猎人" },
            achievement3: { unlocked: false, requirement: 1000, name: "矿业大亨" }
        };

        this.init();
    }

    init() {
        this.generateGoldSpots();
        this.setupEventListeners();
        this.updateUI();
        this.gameLoop();
    }

    // 生成黄金点
    generateGoldSpots() {
        this.goldSpots = [];
        for (let i = 0; i < 20; i++) {
            this.goldSpots.push({
                x: Math.random() * (this.canvas.width - 100) + 50,
                y: Math.random() * 200 + 250,
                size: Math.random() * 20 + 15,
                gold: Math.floor(Math.random() * 5) + 1,
                mined: false
            });
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.mineGold(x, y);
        });
    }

    // 挖矿逻辑
    mineGold(x, y) {
        // 移动工人到点击位置
        this.worker.targetX = x;
        this.worker.targetY = Math.max(250, Math.min(y, 400));
        this.worker.mining = true;

        // 检查是否点击到黄金
        for (let spot of this.goldSpots) {
            if (!spot.mined && this.isPointInGold(x, y, spot)) {
                const efficiency = this.getTotalEfficiency();
                const goldEarned = Math.floor(spot.gold * efficiency);

                this.gold += goldEarned;
                this.totalGoldMined += goldEarned;
                spot.mined = true;

                // 创建粒子效果
                this.createParticles(spot.x, spot.y, goldEarned);

                // 检查成就
                this.checkAchievements();

                // 播放挖矿音效
                this.playMineSound();

                break;
            }
        }

        this.updateUI();
    }

    // 检查点是否在黄金范围内
    isPointInGold(x, y, spot) {
        const distance = Math.sqrt((x - spot.x) ** 2 + (y - spot.y) ** 2);
        return distance < spot.size;
    }

    // 获取总效率
    getTotalEfficiency() {
        let totalEfficiency = 1;
        for (let toolKey in this.tools) {
            const tool = this.tools[toolKey];
            totalEfficiency += (tool.level - 1) * (tool.efficiency - 1);
        }
        return totalEfficiency;
    }

    // 创建粒子效果
    createParticles(x, y, goldAmount) {
        const particleCount = Math.min(goldAmount * 2, 10);
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'sparkle';
            particle.style.left = (x + this.canvas.offsetLeft) + 'px';
            particle.style.top = (y + this.canvas.offsetTop) + 'px';
            document.body.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 600);
        }
    }

    // 播放挖矿音效（模拟）
    playMineSound() {
        // 创建简单的音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // 检查成就
    checkAchievements() {
        for (let achievementKey in this.achievements) {
            const achievement = this.achievements[achievementKey];
            if (!achievement.unlocked && this.totalGoldMined >= achievement.requirement) {
                achievement.unlocked = true;
                this.unlockAchievement(achievementKey, achievement.name);
            }
        }
    }

    // 解锁成就
    unlockAchievement(achievementKey, name) {
        const achievementElement = document.getElementById(achievementKey);
        achievementElement.classList.add('unlocked');

        // 显示成就通知
        setTimeout(() => {
            alert(`🎉 恭喜解锁成就：${name}！`);
        }, 500);
    }

    // 升级工具
    upgradeTool(toolKey) {
        const tool = this.tools[toolKey];
        if (this.gold >= tool.cost) {
            this.gold -= tool.cost;
            tool.level++;
            tool.cost = Math.floor(tool.cost * 1.5);

            this.updateUI();
            this.playUpgradeSound();
        } else {
            alert('黄金不足，无法升级！');
        }
    }

    // 播放升级音效（模拟）
    playUpgradeSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 1200;
        oscillator.type = 'triangle';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    // 更新UI
    updateUI() {
        // 更新黄金数量
        document.getElementById('goldCount').textContent = this.gold;

        // 更新工具等级和效率
        for (let toolKey in this.tools) {
            const tool = this.tools[toolKey];
            const efficiency = this.getTotalEfficiency();

            document.getElementById(toolKey + 'Efficiency').textContent = efficiency.toFixed(1) + 'x';
            document.getElementById(toolKey + 'Cost').textContent = tool.cost;
        }

        // 更新工具等级
        const totalLevel = Object.values(this.tools).reduce((sum, tool) => sum + tool.level, 0);
        document.getElementById('toolLevel').textContent = totalLevel;
    }

    // 游戏主循环
    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    // 绘制游戏画面
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制背景
        this.drawBackground();

        // 绘制矿层
        this.drawMineLayers();

        // 绘制黄金点
        this.drawGoldSpots();

        // 绘制工人
        this.drawWorker();

        // 更新工人位置
        this.updateWorker();
    }

    // 绘制背景
    drawBackground() {
        // 天空
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, 250);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#98D8E8');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, 250);

        // 地面
        const groundGradient = this.ctx.createLinearGradient(0, 250, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#8B4513');
        groundGradient.addColorStop(1, '#A0522D');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, 250, this.canvas.width, this.canvas.height - 250);

        // 添加云朵
        this.drawClouds();
    }

    // 绘制云朵
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        // 云朵1
        this.ctx.beginPath();
        this.ctx.arc(150, 80, 30, 0, Math.PI * 2);
        this.ctx.arc(180, 80, 40, 0, Math.PI * 2);
        this.ctx.arc(210, 80, 30, 0, Math.PI * 2);
        this.ctx.fill();

        // 云朵2
        this.ctx.beginPath();
        this.ctx.arc(500, 120, 25, 0, Math.PI * 2);
        this.ctx.arc(525, 120, 35, 0, Math.PI * 2);
        this.ctx.arc(550, 120, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // 绘制矿层
    drawMineLayers() {
        const layers = [
            { y: 300, color: '#8B4513', depth: 1 },
            { y: 350, color: '#A0522D', depth: 2 },
            { y: 400, color: '#CD853F', depth: 3 },
            { y: 450, color: '#D2691E', depth: 4 }
        ];

        for (let layer of layers) {
            this.ctx.fillStyle = layer.color;
            this.ctx.fillRect(0, layer.y, this.canvas.width, 50);

            // 添加纹理
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < this.canvas.width; i += 20) {
                this.ctx.beginPath();
                this.ctx.moveTo(i, layer.y);
                this.ctx.lineTo(i + 10, layer.y + 50);
                this.ctx.stroke();
            }
        }
    }

    // 绘制黄金点
    drawGoldSpots() {
        for (let spot of this.goldSpots) {
            if (!spot.mined) {
                // 黄金光晕
                const glowGradient = this.ctx.createRadialGradient(
                    spot.x, spot.y, 0,
                    spot.x, spot.y, spot.size + 10
                );
                glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
                glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
                this.ctx.fillStyle = glowGradient;
                this.ctx.fillRect(spot.x - spot.size - 10, spot.y - spot.size - 10,
                                 (spot.size + 10) * 2, (spot.size + 10) * 2);

                // 黄金主体
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(spot.x, spot.y, spot.size, 0, Math.PI * 2);
                this.ctx.fill();

                // 黄金高光
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                this.ctx.beginPath();
                this.ctx.arc(spot.x - spot.size/3, spot.y - spot.size/3, spot.size/3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    // 绘制工人
    drawWorker() {
        const { x, y } = this.worker;

        // 工人身体
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(x - 15, y - 10, 30, 40);

        // 工人头
        this.ctx.fillStyle = '#FFDAB9';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 20, 15, 0, Math.PI * 2);
        this.ctx.fill();

        // 工人帽子
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x - 20, y - 35, 40, 10);

        // 工人工具（根据最高等级工具显示）
        const bestTool = this.getBestTool();
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 15, y - 5, 30, 5);
        this.ctx.fillRect(x + 40, y - 15, 5, 20);

        // 挖矿动画效果
        if (this.worker.mining) {
            this.canvas.classList.add('mining-animation');
            setTimeout(() => {
                this.canvas.classList.remove('mining-animation');
            }, 500);
        }
    }

    // 获取最佳工具
    getBestTool() {
        let bestTool = 'pickaxe';
        let bestLevel = 1;

        for (let toolKey in this.tools) {
            if (this.tools[toolKey].level > bestLevel) {
                bestTool = toolKey;
                bestLevel = this.tools[toolKey].level;
            }
        }

        return bestTool;
    }

    // 更新工人位置
    updateWorker() {
        const dx = this.worker.targetX - this.worker.x;
        const dy = this.worker.targetY - this.worker.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            this.worker.x += dx * 0.1;
            this.worker.y += dy * 0.1;
            this.worker.mining = true;
        } else {
            this.worker.mining = false;
        }
    }
}

// 全局游戏实例
let game;

// 页面加载完成后初始化游戏
window.addEventListener('load', () => {
    game = new GoldMiningGame();
});

// 升级工具函数（供HTML调用）
function upgradeTool(toolKey) {
    game.upgradeTool(toolKey);
}

// 键盘控制
document.addEventListener('keydown', (e) => {
    if (game) {
        const moveSpeed = 20;
        switch(e.key) {
            case 'ArrowLeft':
                game.worker.targetX = Math.max(20, game.worker.targetX - moveSpeed);
                break;
            case 'ArrowRight':
                game.worker.targetX = Math.min(game.canvas.width - 20, game.worker.targetX + moveSpeed);
                break;
            case 'ArrowUp':
                game.worker.targetY = Math.max(270, game.worker.targetY - moveSpeed);
                break;
            case 'ArrowDown':
                game.worker.targetY = Math.min(game.canvas.height - 20, game.worker.targetY + moveSpeed);
                break;
            case ' ':
                // 空格键挖矿
                game.mineGold(game.worker.targetX, game.worker.targetY);
                break;
        }
    }
});