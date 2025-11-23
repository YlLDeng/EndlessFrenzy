import { useGameStore } from '../Store/StoreManage';

class GameUI {
    constructor() {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.state = {
            currentState: 'Idle',
            isAlive: true,
            level: 0,
            health: 5,
            maxHealth: 5,
            damage: 0,
            attackSpeed: 3.0,
            experience: 0,
            maxExperience: 10,
            experienceScope: 2,
            buff: [],
            debuff: [],
            skill: ["NormalBullet"]
        };
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
        this.bindEvents();

        // 添加到游戏循环
        this.updateFn = this.update.bind(this);
        this.getState().addLoop(this.updateFn);

        // 添加样式动画
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes uiPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.8; }
            }
            @keyframes uiShine {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes uiSlide {
                0% { left: -100%; }
                100% { left: 100%; }
            }
        `;
        document.head.appendChild(style);
    }

    createUI() {
        this.container.innerHTML = `
            <!-- 顶部右侧控制区 -->
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                display: flex;
                gap: 12px;
                align-items: center;
                z-index: 1000;
            ">
                <!-- Buff栏 -->
                <div id="buffContainer" style="display: flex; gap: 8px;"></div>

                <!-- 暂停按钮 -->
                <button id="pauseBtn" style="
                    width: 52px;
                    height: 52px;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
                    transition: all 0.2s ease;
                    backdrop-filter: blur(20px);
                    pointer-events: auto;
                ">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                </button>
            </div>

            <!-- 底部固定UI栏 -->
            <div style="
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 24px 40px 20px;
                z-index: 999;
            ">
                <div style="
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    align-items: flex-end;
                    gap: 24px;
                ">
                    
                    <!-- 左侧 - 英雄信息 -->
                    <div style="display: flex; gap: 20px; align-items: flex-end;">
                        <!-- 头像 -->
                        <div style="position: relative; width: 110px; height: 110px;">
                            <div style="
                                width: 100%;
                                height: 100%;
                                border-radius: 20px;
                                background: linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6366f1 100%);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 56px;
                                border: 4px solid #fbbf24;
                                box-shadow: 0 0 40px rgba(251, 191, 36, 0.6), 0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.2);
                                overflow: hidden;
                                position: relative;
                            ">
                                <div style="
                                    position: absolute;
                                    top: -50%;
                                    left: -50%;
                                    width: 200%;
                                    height: 200%;
                                    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
                                    animation: uiShine 3s linear infinite;
                                "></div>
                                
                                <div id="heroAvatar" style="
                                    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6));
                                    z-index: 1;
                                ">⚔️</div>

                                <!-- 等级标签 -->
                                <div id="heroLevelBadge" style="
                                    position: absolute;
                                    bottom: -4px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                                    color: #0f172a;
                                    font-size: 16px;
                                    font-weight: 900;
                                    padding: 6px 16px;
                                    border-radius: 12px;
                                    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3);
                                    border: 2px solid rgba(15, 23, 42, 0.3);
                                    z-index: 2;
                                    letter-spacing: 0.5px;
                                ">Lv.0</div>
                            </div>
                        </div>

                        <!-- 状态条 -->
                        <div style="
                            display: flex;
                            flex-direction: column;
                            gap: 10px;
                            min-width: 380px;
                            margin-bottom: 4px;
                        ">
                            <!-- 名字和状态 -->
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 12px;
                                margin-bottom: 4px;
                            ">
                                <span id="heroName" style="
                                    color: #fff;
                                    font-size: 22px;
                                    font-weight: 800;
                                    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
                                    letter-spacing: 0.5px;
                                ">英雄</span>
                                <span id="heroState" style="
                                    color: #a855f7;
                                    font-size: 13px;
                                    font-weight: 600;
                                    padding: 4px 10px;
                                    background: rgba(168, 85, 247, 0.15);
                                    border-radius: 8px;
                                    border: 1px solid rgba(168, 85, 247, 0.3);
                                ">Idle</span>
                            </div>

                            <!-- HP条 -->
                            <div>
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    margin-bottom: 6px;
                                ">
                                    <span style="
                                        color: rgba(255, 255, 255, 0.6);
                                        font-size: 11px;
                                        font-weight: 700;
                                        text-transform: uppercase;
                                        letter-spacing: 1px;
                                    ">生命值</span>
                                    <span id="hpText" style="
                                        color: #fff;
                                        font-size: 12px;
                                        font-weight: 700;
                                    ">5 / 5</span>
                                </div>
                                <div style="
                                    width: 100%;
                                    height: 28px;
                                    background: rgba(0, 0, 0, 0.5);
                                    border-radius: 14px;
                                    border: 2px solid rgba(255, 255, 255, 0.1);
                                    overflow: hidden;
                                    position: relative;
                                    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.6);
                                ">
                                    <div id="hpBar" style="
                                        width: 100%;
                                        height: 100%;
                                        background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
                                        transition: width 0.4s ease, background 0.3s ease;
                                        box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
                                        position: relative;
                                        overflow: hidden;
                                    ">
                                        <div style="
                                            position: absolute;
                                            top: 0;
                                            left: -100%;
                                            width: 100%;
                                            height: 100%;
                                            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                                            animation: uiSlide 2s infinite;
                                        "></div>
                                    </div>
                                </div>
                            </div>

                            <!-- 经验条 -->
                            <div>
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    margin-bottom: 6px;
                                ">
                                    <span style="
                                        color: rgba(255, 255, 255, 0.6);
                                        font-size: 11px;
                                        font-weight: 700;
                                        text-transform: uppercase;
                                        letter-spacing: 1px;
                                    ">经验值</span>
                                    <span id="expText" style="
                                        color: #fbbf24;
                                        font-size: 12px;
                                        font-weight: 700;
                                    ">0 / 10</span>
                                </div>
                                <div style="
                                    width: 100%;
                                    height: 12px;
                                    background: rgba(0, 0, 0, 0.5);
                                    border-radius: 6px;
                                    border: 1px solid rgba(251, 191, 36, 0.2);
                                    overflow: hidden;
                                    position: relative;
                                    box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.6);
                                ">
                                    <div id="expBar" style="
                                        width: 0%;
                                        height: 100%;
                                        background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
                                        transition: width 0.4s ease;
                                        box-shadow: 0 0 15px rgba(251, 191, 36, 0.8);
                                        position: relative;
                                        overflow: hidden;
                                    ">
                                        <div style="
                                            position: absolute;
                                            top: 0;
                                            left: -100%;
                                            width: 100%;
                                            height: 100%;
                                            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                                            animation: uiSlide 1.5s infinite;
                                        "></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 中间 - 技能栏 -->
                    <div id="skillContainer" style="
                        display: flex;
                        gap: 12px;
                        margin-bottom: 12px;
                        margin-left: auto;
                    "></div>

                    <!-- 右侧 - 属性卡片 -->
                    <div style="
                        display: flex;
                        gap: 12px;
                        margin-bottom: 12px;
                    ">
                        <!-- 攻击力 -->
                        <div style="
                            background: rgba(15, 23, 42, 0.9);
                            backdrop-filter: blur(10px);
                            padding: 14px 18px;
                            border-radius: 12px;
                            border: 2px solid rgba(239, 68, 68, 0.4);
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.2);
                            min-width: 120px;
                        ">
                            <div style="
                                width: 40px;
                                height: 40px;
                                border-radius: 10px;
                                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
                            ">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
                                    <path d="M6 2l6 6 6-6 2 2-6 6 6 6-2 2-6-6-6 6-2-2 6-6-6-6z"/>
                                </svg>
                            </div>
                            <div>
                                <div style="
                                    color: rgba(255, 255, 255, 0.5);
                                    font-size: 10px;
                                    margin-bottom: 2px;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                ">攻击力</div>
                                <div id="damageValue" style="
                                    color: #fff;
                                    font-size: 20px;
                                    font-weight: 900;
                                    line-height: 1;
                                ">0</div>
                            </div>
                        </div>

                        <!-- 攻击速度 -->
                        <div style="
                            background: rgba(15, 23, 42, 0.9);
                            backdrop-filter: blur(10px);
                            padding: 14px 18px;
                            border-radius: 12px;
                            border: 2px solid rgba(234, 179, 8, 0.4);
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(234, 179, 8, 0.2);
                            min-width: 120px;
                        ">
                            <div style="
                                width: 40px;
                                height: 40px;
                                border-radius: 10px;
                                background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 0 20px rgba(234, 179, 8, 0.5);
                            ">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                                </svg>
                            </div>
                            <div>
                                <div style="
                                    color: rgba(255, 255, 255, 0.5);
                                    font-size: 10px;
                                    margin-bottom: 2px;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                ">攻速</div>
                                <div id="attackSpeedValue" style="
                                    color: #fff;
                                    font-size: 20px;
                                    font-weight: 900;
                                    line-height: 1;
                                ">3.0</div>
                            </div>
                        </div>

                        <!-- 吸附范围 -->
                        <div style="
                            background: rgba(15, 23, 42, 0.9);
                            backdrop-filter: blur(10px);
                            padding: 14px 18px;
                            border-radius: 12px;
                            border: 2px solid rgba(139, 92, 246, 0.4);
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.2);
                            min-width: 120px;
                        ">
                            <div style="
                                width: 40px;
                                height: 40px;
                                border-radius: 10px;
                                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
                            ">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                </svg>
                            </div>
                            <div>
                                <div style="
                                    color: rgba(255, 255, 255, 0.5);
                                    font-size: 10px;
                                    margin-bottom: 2px;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                ">范围</div>
                                <div id="scopeValue" style="
                                    color: #fff;
                                    font-size: 20px;
                                    font-weight: 900;
                                    line-height: 1;
                                ">2.0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.addEventListener('click', () => this.togglePause());

        pauseBtn.addEventListener('mouseenter', (e) => {
            e.target.style.transform = 'translateY(-4px) scale(1.05)';
            e.target.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.5)';
        });

        pauseBtn.addEventListener('mouseleave', (e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
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
        // 从 HeroManage 获取状态数据
        const heroManage = this.getState().HeroManage;
        if (!heroManage || !heroManage.state) return;

        const heroState = heroManage.state;

        // 更新本地状态
        Object.assign(this.state, heroState);

        // 更新UI
        this.updateHeroInfo();
        this.updateBuffs();
        this.updateSkills();
    }

    updateHeroInfo() {
        // 更新等级
        const levelBadge = document.getElementById('heroLevelBadge');
        if (levelBadge) levelBadge.textContent = `Lv.${this.state.level}`;

        // 更新状态
        const stateEl = document.getElementById('heroState');
        if (stateEl) stateEl.textContent = this.state.currentState;

        // 更新血量
        const hp = this.state.health || 0;
        const maxHp = this.state.maxHealth || 5;
        const hpPercentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));

        const hpText = document.getElementById('hpText');
        if (hpText) hpText.textContent = `${Math.floor(hp)} / ${maxHp}`;

        const hpBar = document.getElementById('hpBar');
        if (hpBar) {
            hpBar.style.width = `${hpPercentage}%`;

            // 根据血量改变颜色
            if (hpPercentage > 50) {
                hpBar.style.background = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
                hpBar.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.8)';
            } else if (hpPercentage > 20) {
                hpBar.style.background = 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';
                hpBar.style.boxShadow = '0 0 20px rgba(245, 158, 11, 0.8)';
            } else {
                hpBar.style.background = 'linear-gradient(90deg, #dc2626 0%, #f87171 100%)';
                hpBar.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.8)';
            }
        }

        // 更新经验值
        const exp = this.state.experience || 0;
        const maxExp = this.state.maxExperience || 10;
        const expPercentage = Math.max(0, Math.min(100, (exp / maxExp) * 100));

        const expText = document.getElementById('expText');
        if (expText) expText.textContent = `${Math.floor(exp)} / ${maxExp}`;

        const expBar = document.getElementById('expBar');
        if (expBar) expBar.style.width = `${expPercentage}%`;

        // 更新属性
        const damageEl = document.getElementById('damageValue');
        if (damageEl) damageEl.textContent = this.state.damage || 0;

        const attackSpeedEl = document.getElementById('attackSpeedValue');
        if (attackSpeedEl) attackSpeedEl.textContent = (this.state.attackSpeed || 0).toFixed(1);

        const scopeEl = document.getElementById('scopeValue');
        if (scopeEl) scopeEl.textContent = (this.state.experienceScope || 0).toFixed(1);
    }

    updateBuffs() {
        const buffContainer = document.getElementById('buffContainer');
        if (!buffContainer) return;

        buffContainer.innerHTML = '';

        this.state.buff.forEach(buff => {
            const buffEl = document.createElement('div');
            buffEl.style.cssText = `
                width: 52px;
                height: 52px;
                background: rgba(15, 23, 42, 0.9);
                backdrop-filter: blur(20px);
                border-radius: 12px;
                border: 2px solid ${buff.color || '#fff'};
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                box-shadow: 0 0 30px ${buff.color || '#fff'}60, 0 8px 16px rgba(0, 0, 0, 0.4);
                cursor: pointer;
                transition: all 0.2s ease;
                animation: uiPulse 2s ease-in-out infinite;
                pointer-events: auto;
            `;

            buffEl.innerHTML = `
                <div style="
                    font-size: 26px;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
                ">${buff.icon || '✨'}</div>
                <div style="
                    position: absolute;
                    bottom: -8px;
                    right: -8px;
                    background: ${buff.color || '#fff'};
                    color: #fff;
                    font-size: 11px;
                    padding: 4px 6px;
                    border-radius: 8px;
                    font-weight: 900;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
                    border: 2px solid rgba(15, 23, 42, 0.9);
                ">${buff.duration || 0}s</div>
            `;

            buffEl.title = buff.name || 'Buff';

            buffEl.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
                e.target.style.boxShadow = `0 0 40px ${buff.color || '#fff'}, 0 12px 24px rgba(0, 0, 0, 0.5)`;
            });

            buffEl.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `0 0 30px ${buff.color || '#fff'}60, 0 8px 16px rgba(0, 0, 0, 0.4)`;
            });

            buffContainer.appendChild(buffEl);
        });
    }

    updateSkills() {
        const skillContainer = document.getElementById('skillContainer');
        if (!skillContainer) return;

        const skillIcons = {
            'NormalBullet': '🎯',
            'FireBall': '🔥',
            'IceBolt': '❄️',
            'Lightning': '⚡',
            'Poison': '☠️'
        };

        skillContainer.innerHTML = '';

        this.state.skill.forEach((skill, index) => {
            const skillEl = document.createElement('div');
            skillEl.style.cssText = `
                width: 64px;
                height: 64px;
                background: rgba(15, 23, 42, 0.9);
                backdrop-filter: blur(10px);
                border-radius: 14px;
                border: 2px solid rgba(139, 92, 246, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.2);
                position: relative;
                overflow: hidden;
                pointer-events: auto;
            `;

            skillEl.innerHTML = `
                <div style="
                    font-size: 32px;
                    filter: drop-shadow(0 2px 6px rgba(0,0, 0, 0.6));
                ">${skillIcons[skill] || '✨'}</div>
                <div style="
                    position: absolute;
                    bottom: 4px;
                    right: 4px;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 12px;
                    font-weight: 900;
                    background: rgba(0, 0, 0, 0.6);
                    padding: 2px 6px;
                    border-radius: 6px;
                ">${index + 1}</div>
            `;

            skillEl.title = skill;

            skillEl.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'translateY(-6px)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.8)';
                e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.5)';
            });

            skillEl.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.2)';
            });

            skillContainer.appendChild(skillEl);
        });
    }

    // 公开方法 - 手动更新状态
    setState(newState) {
        Object.assign(this.state, newState);
        this.updateHeroInfo();
        this.updateBuffs();
        this.updateSkills();
    }

    // 添加Buff
    addBuff(buff) {
        if (!this.state.buff.find(b => b.id === buff.id)) {
            this.state.buff.push(buff);
            this.updateBuffs();
        }
    }

    // 移除Buff
    removeBuff(buffId) {
        this.state.buff = this.state.buff.filter(b => b.id !== buffId);
        this.updateBuffs();
    }

    // 添加技能
    addSkill(skill) {
        if (!this.state.skill.includes(skill)) {
            this.state.skill.push(skill);
            this.updateSkills();
        }
    }

    // 升级
    levelUp() {
        this.state.level++;
        this.updateHeroInfo();
    }

    // 受伤
    takeDamage(damage) {
        this.state.health = Math.max(0, this.state.health - damage);
        this.updateHeroInfo();
    }

    // 治疗
    heal(amount) {
        this.state.health = Math.min(this.state.maxHealth, this.state.health + amount);
        this.updateHeroInfo();
    }

    // 获得经验
    gainExperience(amount) {
        this.state.experience += amount;
        if (this.state.experience >= this.state.maxExperience) {
            this.state.experience = 0;
            this.state.maxExperience = Math.floor(this.state.maxExperience * 1.5);
            this.levelUp();
        }
        this.updateHeroInfo();
    }

    dispose() {
        const { removeLoop } = this.getState();
        if (this.updateFn && removeLoop) {
            removeLoop(this.updateFn);
        }
        if (this.container) {
            this.container.remove();
        }
    }
}

export default GameUI;