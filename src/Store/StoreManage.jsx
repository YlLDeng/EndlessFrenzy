import { create } from 'zustand';

// 模型加载路径字典
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
    defaultHero: '女警',  // 默认角色
    setData: (key, value) => set((state) => ({ [key]: value }))
}));

// 游戏场景
export const useGameStore = create((set) => ({
    container: null,
    scene: null,
    renderer: null,
    camera: null,
    orbitControls: null,
    clock: null,
    light: null,
    HeroManage: null,
    MonsterManage: null,
    ActionManage:null,
    floor: null,
    followGroup: null,
    setData: (key, value) => set((state) => ({ [key]: value }))
}));