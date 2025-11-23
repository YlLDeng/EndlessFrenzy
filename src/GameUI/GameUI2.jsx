import { useGameStore } from '../Store/StoreManage';

class GameUI {
    constructor() {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.container = null;
        this.isPaused = false;
        this.init();
    }

    init() {
        // 创建UI容器
        this.container = document.createElement("div");
        document.body.append(this.container);
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        this.createUI();

        // 添加到游戏循环
        this.getState().addLoop((delta) => {
            this.update(delta);
        });
    }

    createUI() {
        this.container.innerHTML = `
            <!-- 顶部右侧 - Buff栏 -->
            <div id="buffContainer" style="
                position: absolute;
                top: 20px;
                right: 80px;
                display: flex;
                gap: 8px;
                pointer-events: auto;
            "></div>

            <!-- 顶部右侧 - 暂停按钮 -->
            <button id="pauseBtn" style="
                position: absolute;
                top: 20px;
                right: 20px;
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                transition: all 0.2s;
                pointer-events: auto;
            ">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
            </button>

            <!-- 底部UI栏 -->
            <div style="
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.9) 30%);
                padding: 40px 30px 20px;
                pointer-events: auto;
            ">
                <div style="display: flex; align-items: flex-end; gap: 20px;">
                    
                    <!-- 左侧 - 英雄头像区 -->
                    <div style="display: flex; gap: 16px; align-items: flex-end;">
                        <!-- 头像 -->
                        <div style="
                            position: relative;
                            width: 100px;
                            height: 100px;
                            border-radius: 12px;
                            background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 50px;
                            border: 3px solid #d4af37;
                            box-shadow: 0 0 30px rgba(212, 175, 55, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.3);
                            overflow: hidden;
                        ">
                            <div style="
                                position: absolute;
                                bottom: 0;
                                left: 0;
                                right: 0;
                                height: 30%;
                                background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.7));
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <span id="heroLevel" style="
                                    color: #d4af37;
                                    font-size: 18px;
                                    font-weight: 900;
                                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
                                ">1</span>
                            </div>
                            <div id="heroAvatar" style="filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));">
                                🛡️
                            </div>
                        </div>

                        <!-- 血量和蓝量 -->
                        <div style="
                            display: flex;
                            flex-direction: column;
                            gap: 8px;
                            min-width: 300px;
                            margin-bottom: 8px;
                        ">
                            <!-- 名字 -->
                            <div id="heroName" style="
                                color: #fff;
                                font-size: 18px;
                                font-weight: 700;
                                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
                                margin-bottom: 4px;
                            ">英雄</div>

                            <!-- HP条 -->
                            <div style="
                                width: 100%;
                                height: 24px;
                                background: rgba(0, 0, 0, 0.6);
                                border-radius: 12px;
                                border: 2px solid rgba(255, 255, 255, 0.1);
                                overflow: hidden;
                                position: relative;
                                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
                            ">
                                <div id="hpBar" style="
                                    width: 100%;
                                    height: 100%;
                                    background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
                                    transition: width 0.3s ease;
                                    box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
                                "></div>
                                <div id="hpText" style="
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    color: #fff;
                                    font-size: 11px;
                                    font-weight: 700;
                                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
                                    white-space: nowrap;
                                ">100 / 100</div>
                            </div>

                            <!-- MP条 -->
                            <div style="
                                width: 100%;
                                height: 20px;
                                background: rgba(0, 0, 0, 0.6);
                                border-radius: 10px;
                                border: 2px solid rgba(255, 255, 255, 0.1);
                                overflow: hidden;
                                position: relative;
                                box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
                            ">
                                <div id="mpBar" style="
                                    width: 100%;
                                    height: 100%;
                                    background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
                                    transition: width 0.3s ease;
                                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
                                "></div>
                                <div id="mpText" style="
                                    position: absolute;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                    color: #fff;
                                    font-size: 10px;
                                    font-weight: 700;
                                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
                                    white-space: nowrap;
                                ">100 / 100</div>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧 - 属性显示 -->
                    <div style="
                        display: flex;
                        gap: 20px;
                        margin-left: auto;
                    ">
                        <!-- 攻击力 -->
                        <div style="
                            background: rgba(0, 0, 0, 0.7);
                            backdrop-filter: blur(10px);
                            padding: 12px 20px;
                            border-radius: 8px;
                            border: 2px solid rgba(239, 68, 68, 0.5);
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
                        ">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                                <path d="M6 2l6 6 6-6 2 2-6 6 6 6-2 2-6-6-6 6-2-2 6-6-6-6z"/>
                            </svg>
                            <div>
                                <div style="
                                    color: rgba(255, 255, 255, 0.6);
                                    font-size: 11px;
                                    margin-bottom: 2px;
                                ">攻击力</div>
                                <div id="heroAttack" style="
                                    color: #fff;
                                    font-size: 18px;
                                    font-weight: 700;
                                ">0</div>
                            </div>
                        </div>

                        <!-- 防御力 -->
                        <div style="
                            background: rgba(0, 0, 0, 0.7);
                            backdrop-filter: blur(10px);
                            padding: 12px 20px;
                            border-radius: 8px;
                            border: 2px solid rgba(59, 130, 246, 0.5);
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
                        ">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                            <div>
                                <div style="
                                    color: rgba(255, 255, 255, 0.6);
                                    font-size: 11px;
                                    margin-bottom: 2px;
                                ">防御力</div>
                                <div id="heroDefense" style="
                                    color: #fff;
                                    font-size: 18px;
                                    font-weight: 700;
                                ">0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 绑定暂停按钮事件
        this.bindEvents();
    }

    bindEvents() {
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.addEventListener('click', () => this.togglePause());

        pauseBtn.addEventListener('mouseenter', (e) => {
            e.target.style.transform = 'scale(1.1)';
        });

        pauseBtn.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'scale(1)';
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');

        if (this.isPaused) {
            pauseBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            pauseBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
            `;
            // 暂停游戏逻辑
            // this.getState().pauseGame();
        } else {
            pauseBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            pauseBtn.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
            `;
            // 恢复游戏逻辑
            // this.getState().resumeGame();
        }
    }

    update(delta) {
        const heroManage = this.getState().HeroManage;
        if (!heroManage || !heroManage.state) return;

        const state = heroManage.state;

        // 更新英雄信息
        this.updateHeroInfo(state);

        // 更新Buff列表
        this.updateBuffs(state.buffs || []);
    }

    updateHeroInfo(state) {
        // 更新等级
        const levelEl = document.getElementById('heroLevel');
        if (levelEl) levelEl.textContent = state.level || 1;

        // 更新名字
        const nameEl = document.getElementById('heroName');
        if (nameEl && state.name) nameEl.textContent = state.name;

        // 更新血量
        const hp = state.hp || 0;
        const maxHp = state.maxHp || 100;
        const hpPercentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));

        const hpText = document.getElementById('hpText');
        if (hpText) hpText.textContent = `${Math.floor(hp)} / ${maxHp}`;

        const hpBar = document.getElementById('hpBar');
        if (hpBar) {
            hpBar.style.width = `${hpPercentage}%`;

            // 根据血量改变颜色
            if (hpPercentage > 50) {
                hpBar.style.background = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
            } else if (hpPercentage > 20) {
                hpBar.style.background = 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';
            } else {
                hpBar.style.background = 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)';
            }
        }

        // 更新魔法值
        const mp = state.mp || 0;
        const maxMp = state.maxMp || 100;
        const mpPercentage = Math.max(0, Math.min(100, (mp / maxMp) * 100));

        const mpText = document.getElementById('mpText');
        if (mpText) mpText.textContent = `${Math.floor(mp)} / ${maxMp}`;

        const mpBar = document.getElementById('mpBar');
        if (mpBar) mpBar.style.width = `${mpPercentage}%`;

        // 更新攻击力
        const attackEl = document.getElementById('heroAttack');
        if (attackEl) attackEl.textContent = state.attack || 0;

        // 更新防御力
        const defenseEl = document.getElementById('heroDefense');
        if (defenseEl) defenseEl.textContent = state.defense || 0;
    }

    updateBuffs(buffs) {
        const buffContainer = document.getElementById('buffContainer');
        if (!buffContainer) return;

        // 清空现有Buff
        buffContainer.innerHTML = '';

        // 添加Buff
        buffs.forEach(buff => {
            const buffEl = document.createElement('div');
            buffEl.style.cssText = `
                width: 48px;
                height: 48px;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(10px);
                border-radius: 8px;
                border: 2px solid ${buff.color || '#fff'};
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                box-shadow: 0 0 20px ${buff.color || '#fff'}80;
                cursor: pointer;
                transition: transform 0.2s;
            `;

            buffEl.innerHTML = `
                <div style="font-size: 24px;">${buff.icon || '✨'}</div>
                <div style="
                    position: absolute;
                    bottom: 2px;
                    right: 2px;
                    background: rgba(0, 0, 0, 0.8);
                    color: #fff;
                    font-size: 10px;
                    padding: 2px 4px;
                    border-radius: 4px;
                    font-weight: 700;
                ">${buff.duration || 0}s</div>
            `;

            buffEl.title = buff.name || 'Buff';

            buffEl.addEventListener('mouseenter', () => {
                buffEl.style.transform = 'scale(1.1)';
            });

            buffEl.addEventListener('mouseleave', () => {
                buffEl.style.transform = 'scale(1)';
            });

            buffContainer.appendChild(buffEl);
        });
    }

    dispose() {
        if (this.container) {
            this.container.remove();
        }
    }
}

export default GameUI;