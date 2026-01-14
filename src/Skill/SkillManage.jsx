
import { useGameStore, useBulletModelDict } from '../Store/StoreManage';
import NormalBullet from './NormalBullet';
import MagicProjectile from './MagicProjectile';
import EzrealUltimate from './EzrealUltimate';

import { loadGLTFModel } from '../Utils/Utils'
class SkillManage {
    constructor() {
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState
        this.bulletModelCache = {};
        this.BulletClassMap = {
            NormalBullet,
            MagicProjectile,
            EzrealUltimate
        };
        this.init()
    }

    async init() {
        const bulletPaths = useBulletModelDict.getState();
        const loadPromises = Object.entries(bulletPaths).map(async ([type, path]) => {
            if (path !== '') {
                const gltf = await loadGLTFModel(path)
                this.bulletModelCache[type] = gltf.scene
            } else {
                this.bulletModelCache[type] = "shaderBullet"
            }
        }
        );
        await Promise.all(loadPromises);

    }

    createBullet(targetMesh, self, type = 'NormalBullet', from, damage) {
        const sourceModel = this.bulletModelCache[type];
        if (!sourceModel) {
            return;
        }

        const BulletClass = this.BulletClassMap[type];
        const newBulletMesh = sourceModel == 'shaderBullet' ? '' : sourceModel.clone();
        const newBulletInstance = new BulletClass(targetMesh, self, newBulletMesh, from, damage);

        newBulletInstance.create();
        return newBulletInstance;
    }
}
export default SkillManage;