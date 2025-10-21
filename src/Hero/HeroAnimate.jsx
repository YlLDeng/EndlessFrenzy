import { updateMixer } from '../Utils/Utils';
import { useGameStore } from '../Store/StoreManage';
import HeroBasics from './HeroBasics';

class HeroAnimate extends HeroBasics {
    constructor(hero, animations) {
        super();
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.hero = hero;
        this.animations = animations;
        this.mixer = new THREE.AnimationMixer(this.hero);
        this.actions = {}
        this.AnimationStates = {
            Idle: {
                from: ['Run', 'Attack', 'Idle'], // 允许从这些状态切换到Idle
                clip: 'Idle1' // 对应的动画片段名
            },
            Run: {
                from: ['Idle', 'Run'], // 允许从Idle/Run切换到Run
                clip: 'Run_Normal'
            },
            Attack: {
                from: ['Idle', 'Run'], // 允许从Idle/Run切换到Attack
                clip: 'caitlyn_skin11_attack1.anm',
                isSingle: false // 单次动画（非循环）
            }
        };
        this.init();
    }

    init() {
        this.setAnimate();
        useGameStore.getState().addLoop((delta) => {
            this.update(delta);
        });
    }

    setAnimate = () => {
        Object.keys(this.AnimationStates).forEach(state => {
            const { clip: clipName, isSingle } = this.AnimationStates[state];
            const clip = this.animations.find(anim => anim.name.includes(clipName));
            if (!clip) {
                console.error(`动画片段 ${clipName} 不存在`);
                return;
            }
            const action = this.mixer.clipAction(clip);
            // 设置循环模式（单次动画用LoopOnce，循环动画用LoopRepeat）
            action.loop = isSingle ? THREE.LoopOnce : THREE.LoopRepeat;
            action.clampWhenFinished = isSingle; // 单次动画结束后停在最后一帧
            action.setEffectiveTimeScale(1); // 初始速度
            action.stop(); // 初始停止，等待触发
            this.actions[state] = action;
        });

        // 初始播放Idle动画
        this.actions.Idle.play();
    };

    update = (delta) => {
        // 优先处理攻击状态
        if (this.state.isAttacking) {
            this.switchState('Attack');
        } else {
            // 移动状态判断（修复：严格根据isMoving切换，避免中间状态）
            if (this.state.isMoving) {
                this.switchState('Run');
            } else {
                this.switchState('Idle');
            }
        }

        // 调整攻击动画速度（修复：获取正确的attackSpeed来源）
        if (this.state.current === 'Attack') {
            // 从角色状态中获取attackSpeed（确保来源正确）
            const attackSpeed = this.getState().HeroManage.HeroControl?.state?.attackSpeed || 2;
            const attackAction = this.actions.Attack;
            const attackInterval = 1 / attackSpeed;
            const animDuration = attackAction.getClip().duration || 1;
            attackAction.setEffectiveTimeScale(animDuration / attackInterval);
        }

        updateMixer(this.mixer, delta);
    };

    switchState(targetState, fadeDuration = 0.2) {
        if (!this.AnimationStates[targetState]) {
            console.warn(`无效动画状态：${targetState}`);
            return;
        }

        const currentState = this.state.current;
        // 检查是否允许切换（修复：当前状态为空时直接允许，如初始化）
        if (currentState && !this.AnimationStates[targetState].from.includes(currentState)) {
            return;
        }

        // 状态相同则更新动画时间（避免循环动画停滞）
        if (currentState === targetState) {
            // 对循环动画（如Run/Idle），确保动画持续播放
            if (!this.AnimationStates[targetState].isSingle) {
                this.actions[targetState].play(); // 强制保持播放状态
            }
            return;
        }

        const oldAction = currentState ? this.actions[currentState] : null;
        const newAction = this.actions[targetState];

        // 停止旧动画的过渡并淡出
        if (oldAction) {
            oldAction.stopFading();
            oldAction.fadeOut(fadeDuration);
            // 关键：循环动画淡出后强制停止，避免残留影响
            if (!this.AnimationStates[currentState].isSingle) {
                setTimeout(() => {
                    if (this.state.current === targetState) { // 确保已切换到新状态
                        oldAction.stop();
                    }
                }, fadeDuration * 1000);
            }
        }

        // 重置并激活新动画
        if (this.AnimationStates[targetState].isSingle) {
            newAction.reset(); // 单次动画从头开始
        } else {
            newAction.time = 0; // 循环动画重置时间（可选，避免从上次位置开始）
        }

        newAction.stopFading();
        newAction.fadeIn(fadeDuration);
        newAction.play(); // 强制播放新动画

        // 更新当前状态
        this.state.current = targetState;
        console.log(`动画状态切换：${currentState || 'None'} → ${targetState}`);
    }

}

export default HeroAnimate;