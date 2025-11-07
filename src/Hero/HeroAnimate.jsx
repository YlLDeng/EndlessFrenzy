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
                from: ['Run', 'Attack', 'Idle'],
                clip: 'Idle1'
            },
            Run: {
                from: ['Idle', 'Run'],
                clip: 'Run_Normal'
            },
            Attack: {
                from: ['Idle', 'Run', 'Attack'],
                clip: 'caitlyn_skin11_attack1.anm',
                isSingle: true
            }
        };
        this.lastState = null
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
            action.loop = isSingle ? THREE.LoopOnce : THREE.LoopRepeat;
            action.clampWhenFinished = isSingle;
            action.setEffectiveTimeScale(1);
            action.stop();
            this.actions[state] = action;
        });

        this.actions.Idle.play();
        this.state.currentState = 'Idle';
        this.lastState = 'Idle'
    };

    update = (delta) => {
        if (this.state.currentState === 'Attack') {
            const attackSpeed = this.getState().HeroManage.HeroControl?.state?.attackSpeed || 2;
            const attackAction = this.actions.Attack;
            const attackInterval = 1 / attackSpeed;
            const animDuration = attackAction.getClip().duration || 1;
            attackAction.setEffectiveTimeScale(animDuration / attackInterval);
        }
        this.switchState(this.state.currentState);

        updateMixer(this.mixer, delta);
    };

    switchState(targetState, fadeDuration = 0.2) {
        if (!this.AnimationStates[targetState]) {
            targetState = 'Idle';
        }

        const currentState = this.lastState;
        if (!this.AnimationStates[targetState].from.includes(currentState)) {
            this.actions[targetState]?.play();
            return;
        }
        if (currentState === targetState) {
            this.actions[currentState]?.play();
            return;
        }

        const oldAction = this.actions[currentState];
        const newAction = this.actions[targetState];

        if (oldAction) {
            oldAction.stopFading();
            oldAction.fadeOut(fadeDuration);
            setTimeout(() => {
                oldAction.stop();
            }, fadeDuration * 1000);
        }

        newAction.stopFading();
        newAction.fadeIn(fadeDuration);
        newAction.play();

        this.lastState = targetState;
    }
}

export default HeroAnimate;