// src/components/SceneElements.jsx
import { useGameStore, useDefaultSetting, useHeroModelDict } from '../Store/StoreManage';
import { loadHDRTexture, loadGLTFModel, updateMixer, unwrapRad, checkSphereCollision, createModelWithCollisionProxy } from '../Utils/Utils';

class ActionManage {
    constructor() {
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState
        this.initGame()
        this.startLoop();
    }

    initGame() {
        setInterval(() => {
            this.getState().MonsterManage.addMonsters();
        }, 1000)
    }

    heroUpdate(delta) {
        const hero = this.getState().HeroManage
        updateMixer(hero.mixer, delta)
        hero.handelMove(delta)

    }

    monsterUpdate(delta) {
        const monster = this.getState().MonsterManage
        updateMixer(monster.mixer, delta)  //更新动画
        monster.moveToHero(delta)  //怪物走向英雄
    }


    // 游戏主循环
    startLoop() {
        const {
            scene, renderer, camera, clock,
            HeroManage, MonsterManage, orbitControls, ActionManage
        } = useGameStore.getState();

        if (!scene) return;

        // 计算帧间隔时间
        const delta = clock.getDelta();

        this.monsterUpdate(delta)
        this.heroUpdate(delta)

        // 渲染场景
        renderer.render(scene, camera);
        requestAnimationFrame(() => this.startLoop())
    }
}

export default ActionManage