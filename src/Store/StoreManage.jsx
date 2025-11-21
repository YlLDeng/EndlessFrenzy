import { create } from 'zustand';
import * as THREE from 'three';

// 怪物字典
export const monsterAnimateDict = {
    "normalMonster": {
        stopDistance: 1,
        damage: 2,
        deathExperience: 2,
        maxHealth: 10,
        AnimationStates: {
            Run: {
                from: ['Attack'],
                clip: 'Run'
            },
            Attack: {
                from: ['Run'],
                clip: 'Attack2',
                isSingle: true
            },
            Death: {
                from: ['Attack', 'Run'],
                clip: 'Death_Caster',
                isSingle: true
            }
        },
        modelPath: "'/Model/Monster/melee_minion_-_chaos.glb'"
    },
    "mageMonster": {
        stopDistance: 10,
        damage: 1,
        deathExperience: 1,
        maxHealth: 5,
        AnimationStates: {
            Run: {
                from: ['Attack'],
                clip: 'Run'
            },
            Attack: {
                from: ['Run'],
                clip: 'Attack2',
                isSingle: true
            },
            Death: {
                from: ['Attack', 'Run'],
                clip: 'Death_Caster',
                isSingle: true
            }
        },
        modelPath: "'/Model/Monster/melee_minion_-_chaos.glb'"
    }
}

// 子弹模型加载路径字典
export const useBulletModelDict = create((set) => ({
    'normalBullet': '/Model/Bullet/bullet.glb'
}));


// 角色模型加载路径字典
export const useHeroModelDict = create((set) => ({
    '女警': '/Model/Hero/pulsefire_caitlyn.glb'
}));

// 游戏默认设置
export const useDefaultSetting = create((set) => ({
    defaultCameraPos: {
        "x": -6.519497596566737,
        "y": 6.688921816040412,
        "z": -9.482592008647357
    },
    defaultHero: '女警',
    setData: (key, value) => set((state) => ({ [key]: value }))
}));

// 游戏数据
export const useGameStore = create((set, get) => ({
    // 渲染数据
    container: null,
    scene: null,
    renderer: null,
    camera: null,
    orbitControls: null,
    clock: new THREE.Clock(),
    light: null,
    floor: null,
    followGroup: null,
    LoopArr: [],
    FPS: 120,

    // 组件
    HeroManage: null,
    MonsterManage: null,
    ActionManage: null,
    SkillManage: null,
    CollisionManager: null,
    UIManage: null,

    setData: (key, value) => set((state) => ({ [key]: value })),
    addLoop: (fn) => set((state) => {
        if (!state.LoopArr.includes(fn)) {
            return { LoopArr: [...state.LoopArr, fn] };
        }
        return state;
    }),
    removeLoop: (fn) => set((state) => ({
        LoopArr: state.LoopArr.filter(loopFn => loopFn !== fn)
    }))
}));

if (import.meta.env.DEV) {
    window.game = useGameStore;
}