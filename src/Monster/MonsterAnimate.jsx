import * as THREE from 'three';
import { useGameStore } from '../Store/StoreManage';

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
        this.mixer = new THREE.AnimationMixer(this.monster);

        this.updateFn = (delta) => {
            this.update(delta);
        };

        useGameStore.getState().addLoop(this.updateFn);

        this.animations.forEach((clip) => {
            const action = this.mixer.clipAction(clip);
            this.actions[clip.name] = action;
        });

        this.playAction('Run2');
    }

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


    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    }

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