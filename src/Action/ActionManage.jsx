// src/components/SceneElements.jsx
import { useGameStore, useDefaultSetting } from '../Store/StoreManage';
import HeroManage from '../Hero/HeroManage';
import MonsterManage from '../Monster/MonsterManage';
import SkillManage from '../Skill/SkillManage';
import CollisionManager from '../Base/CollisionManager';

class ActionManage {
    constructor() {
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState
        this.loadFinish = false
        this.init()
    }

    async init() {
        await this.initGame()
    }

    initGame = async () => {
        const { scene, camera, followGroup, setData } = useGameStore.getState();

        setData('CollisionManager', new CollisionManager());

        const _SkillManage = new SkillManage();
        setData('SkillManage', _SkillManage);
        await _SkillManage.loadPromise;

        const _HeroManage = new HeroManage(scene, followGroup, camera, useDefaultSetting.getState().defaultHero);
        setData('HeroManage', _HeroManage);
        await _HeroManage.loadPromise;

        const _MonsterManage = new MonsterManage(scene);
        setData('MonsterManage', _MonsterManage);
        await _MonsterManage.loadPromise;

        this.loadFinish = true


    }
}

export default ActionManage