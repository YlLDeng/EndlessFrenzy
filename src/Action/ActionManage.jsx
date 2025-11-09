// src/components/SceneElements.jsx
import { useGameStore, useDefaultSetting } from '../Store/StoreManage';
import HeroManage from '../Hero/HeroManage';
import MonsterManage from '../Monster/MonsterManage';
import SkillManage from '../Skill/SkillManage';

class ActionManage {
    constructor() {
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState
        this.init()
    }

    async init() {
        await this.initGame()
        useGameStore.getState().addLoop((delta) => {
            this.update(delta);
        });
    }

    initGame = async () => {
        const { scene, camera, renderer, followGroup, setData } = useGameStore.getState();

        const _HeroManage = new HeroManage(scene, followGroup, camera, useDefaultSetting.getState().defaultHero);
        setData('HeroManage', _HeroManage);
        await _HeroManage.loadPromise;

        const _MonsterManage = new MonsterManage(scene);
        setData('MonsterManage', _MonsterManage);
        await _MonsterManage.loadPromise;

        const _SkillManage = new SkillManage();
        setData('SkillManage', _SkillManage);
        await _SkillManage.loadPromise;
    }

    // 游戏主循环
    update(delta) {
        // const { HeroManage } = useGameStore.getState();
        // HeroManage.attack()
    }
}

export default ActionManage