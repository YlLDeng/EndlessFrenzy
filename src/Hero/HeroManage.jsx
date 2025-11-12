import { loadGLTFModel } from '../Utils/Utils';
import { useGameStore, useHeroModelDict } from '../Store/StoreManage';
import HeroControl from './HeroControl'
import HeroAnimate from './HeroAnimate'
import HeroAttack from './HeroAttack'
import HeroBasics from './HeroBasics';

class HeroManage extends HeroBasics {
    constructor(scene, followGroup, camera, heroName) {
        super()
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState

        this.scene = scene
        this.followGroup = followGroup
        this.camera = camera

        this.HeroControl = null
        this.animations = null
        this.hero = null

        this.loadModel = useHeroModelDict.getState()[heroName]
        this.loadPromise = this.init();
    }

    async init() {
        await this.initModel();
        this.HeroAnimate = new HeroAnimate(this.hero, this.animations)
        this.HeroControl = new HeroControl(this.hero)
        this.HeroAttack = new HeroAttack(this.hero)
    }

    initModel = async () => {
        const gltf = await loadGLTFModel(this.loadModel);
        gltf.scene.scale.set(0.02, 0.02, 0.02)
        this.hero = gltf.scene
        this.scene.add(this.hero)

        this.hero.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                object.material.metalness = 1.0;
                object.material.roughness = 0.2;
                object.material.color.set(1, 1, 1);
                object.material.metalnessMap = object.material.map;
            }
        });

        this.animations = gltf.animations
    };

    attack = () => {
        this.HeroControl.attackTarget()
    }

    death = () => {

    }
};

export default HeroManage;
