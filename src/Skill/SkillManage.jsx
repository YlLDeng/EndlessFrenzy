
import { useGameStore } from '../Store/StoreManage';
import { useBulletModelDict } from '../Store/StoreManage';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Bullet from './Bullet';
class SkillManage {
    constructor() {
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState
        this.Bullet_L1_Model = null
        this.defaultLevel = "L1"
        this.MODEL_SCALE = 0.3
        this.loader = new GLTFLoader();
        this.BULLET_MODEL_PATH = useBulletModelDict.getState()[this.defaultLevel]
        this.isLoadedPromise = this.init();
    }

    async init() {
        await this.loadBullet()
    }

    async loadBullet() {
        let bulletLoadPromise = new Promise((resolve, reject) => {
            this.loader.load(
                this.BULLET_MODEL_PATH,
                (gltf) => {
                    const model = gltf.scene;
                    this.Bullet_L1_Model = model;
                    this.Bullet_L1_Model.traverse((child) => {
                        if (child.isMesh) {
                            if (Array.isArray(child.material)) {
                                child.material = child.material.map(m => m.clone());
                            } else {
                                child.material = child.material.clone();
                            }
                            child.castShadow = true;
                        }
                    });
                    this.Bullet_L1_Model.scale.set(this.MODEL_SCALE, this.MODEL_SCALE, this.MODEL_SCALE);
                    this.Bullet_L1_Model.visible = false;

                    resolve(this.Bullet_L1_Model);
                },
                undefined,
                (error) => {
                    console.error('Failed to load bullet GLB model:', error);
                    reject(error);
                }
            );
        });
        return bulletLoadPromise;
    }

    async createBullet(hero, target, level = this.defaultLevel) {
        if (!this.Bullet_L1_Model) {
            console.warn(`Bullet model L1 not yet loaded. Waiting...`);
            await this.isLoadedPromise;
        }
        const baseModel = this[`Bullet_${level}_Model`];

        if (!baseModel) {
            console.error(`Bullet model for level ${level} not found.`);
            return null;
        }

        try {
            const newBulletInstance = new Bullet(
                hero,
                target,
                baseModel.clone() // 传入克隆后的模型
            );
            return newBulletInstance;
        } catch (e) {
            console.error("Error creating Bullet instance:", e);
            return null;
        }
    }
}
export default SkillManage;
