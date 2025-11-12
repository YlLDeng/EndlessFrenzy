import { updateMixer } from '../Utils/Utils';
import { useGameStore } from '../Store/StoreManage';
import HeroBasics from './HeroBasics';
import * as THREE from 'three';

class HeroAnimate extends HeroBasics {
    constructor(hero, animations) {
        super();
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.hero = hero;
        this.animations = animations;
        this.mixer = new THREE.AnimationMixer(this.hero);
        this.actions = {};
        this.AnimationStates = {
            Idle: {
                from: ['Run', 'Attack'],
                clip: 'Idle1'
            },
            Run: {
                from: ['Idle', 'Attack'],
                clip: 'Run_Normal'
            },
            Attack: {
                from: ['Idle', 'Run'],
                clip: 'caitlyn_skin11_attackfast1.anm',
                isSingle: true
            }
        };
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
            action.loop = isSingle ? THREE.LoopOnce : THREE.LoopRepeat;
            action.clampWhenFinished = isSingle;
            action.setEffectiveTimeScale(1);
            action.stop();
            this.actions[state] = action;
        });

        this.actions.Idle.play();
        this.state.currentState = 'Idle';
        this.lastState = 'Idle';

        this.mixer.addEventListener('finished', (e) => {
            const finishedActionName = Object.keys(this.actions).find(key => this.actions[key] === e.action);

            if (finishedActionName && this.AnimationStates[finishedActionName]?.isSingle) {

                this.state.currentState = "Idle";

                const heroAttack = this.getState().HeroManage.HeroAttack;
                if (heroAttack) {
                    heroAttack.isAttacking = false;
                }
            }
        });
    };

    update = (delta) => {
        this.switchState(this.state.currentState);
        updateMixer(this.mixer, delta);
    };

    switchState(targetState, fadeDuration = 0.2) {
        if (!this.AnimationStates[targetState]) {
            targetState = 'Idle';
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
            timeScale = this.state.attackSpeed;
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
}

export default HeroAnimate;