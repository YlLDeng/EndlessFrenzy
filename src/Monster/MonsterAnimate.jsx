import { updateMixer } from '../Utils/Utils';
import { useGameStore, monsterDict } from '../Store/StoreManage';
import * as THREE from 'three';
class MonsterAnimate {
    constructor(monsterAI) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.monsterAI = monsterAI;
        this.monster = monsterAI.monster;
        this.animations = monsterAI.monsterAnimate;
        this.mixer = new THREE.AnimationMixer(this.monster);
        this.actions = {};
        this.AnimationStates = monsterDict[this.monster.monsterType].AnimationStates || {}
        this.lastState = null;
        this.fadeing = false;
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
                return;
            }
            const action = this.mixer.clipAction(clip);
            action.loop = THREE.LoopRepeat;
            action.clampWhenFinished = isSingle;
            action.setEffectiveTimeScale(1);
            action.stop();
            this.actions[state] = action;
        });
        this.actions.Run.play();
        this.monsterAI.currentState = 'Run';
        this.lastState = 'Run';

        this.mixer.addEventListener('loop', (e) => {
            const finishedActionName = Object.keys(this.actions).find(key => this.actions[key] === e.action);
            if (finishedActionName == 'Attack') {
                // this.monsterAI.attack.
                // const heroAttack = this.getState().HeroManage.HeroAttack;
                // if (heroAttack) {
                //     heroAttack.isAttacking = false;
                // }
            }
        });
        this.switchState("Run");
    };

    update = (delta) => {
        updateMixer(this.mixer, delta);
    };

    switchState(targetState, fadeDuration = 0.2) {
        if (!this.AnimationStates[targetState]) {
            targetState = 'Run';
        }

        const currentState = this.lastState;

        if (currentState === targetState) {
            this.actions[currentState]?.play();
            return;
        }

        const oldAction = this.actions[currentState];
        const newAction = this.actions[targetState];

        let timeScale = 1;
        if (targetState === 'Attack') {
            timeScale = this.monsterAI.attackSpeed;
        }
        if (!this.AnimationStates[targetState].from.includes(currentState)) {
            if (oldAction) oldAction.stop();
            newAction?.reset().play();
            this.lastState = targetState;
            return;
        }

        if (oldAction) {
            oldAction.setEffectiveTimeScale(1);
            oldAction.fadeOut(fadeDuration);
        }

        newAction.setEffectiveTimeScale(timeScale)
            .reset()
            .fadeIn(fadeDuration)
            .play();

        this.lastState = targetState;
    }

    dispose() {
        const { removeLoop } = useGameStore.getState();
        if (this.updateFn && removeLoop) removeLoop(this.updateFn);
        this.updateFn = null;
        this.lastState = null;
        this.fadeing = false;
        this.mixer = null
    }
}

export default MonsterAnimate;