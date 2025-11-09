import * as THREE from 'three';
import { useGameStore, useDefaultSetting } from '../Store/StoreManage';

class MonsterAnimate {
    constructor(monsterMesh, animations) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.monster = monsterMesh;
        this.animations = animations;
        this.mixer = null;
        this.actions = {};
        this.currentAction = null;
        this.updateFn = null;

        this.init();
    }

    init() {
        // 1. 创建动画混合器 (AnimationMixer)
        this.mixer = new THREE.AnimationMixer(this.monster);

        this.updateFn = (delta) => {
            this.update(delta);
        };

        useGameStore.getState().addLoop(this.updateFn);

        // 2. 将所有动画剪辑映射到 Action
        this.animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            this.actions[clip.name] = action;
        });

        // 3. 播放默认动画
        this.playAction('Run2');
    }

    /**
     * 播放指定的动画，带有淡入效果
     * @param {string} name - 动画剪辑的名称 (如 'Run2')
     * @param {number} duration - 淡入时间 (秒)
     */
    playAction(name, duration = 0.5) {
        const nextAction = this.actions[name];
        if (!nextAction) {
            console.warn(`动画 '${name}' 不存在.`);
            return;
        }

        if (this.currentAction === nextAction) {
            return;
        }

        if (this.currentAction) {
            this.currentAction.fadeOut(duration);
        }

        nextAction
            .reset()
            .setEffectiveTimeScale(1)
            .setEffectiveWeight(1)
            .fadeIn(duration)
            .play();

        this.currentAction = nextAction;
    }

    /**
     * 每帧更新混合器
     * @param {number} delta - 上一帧到当前帧的时间间隔 (秒)
     */
    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }

    /**
     * 销毁动画资源，以便垃圾回收
     */
    dispose() {
        if (this.mixer) {
            this.mixer.stopAllAction();
            this.mixer = null;
        }
        this.actions = {};
        this.currentAction = null;
    }
}

export default MonsterAnimate;