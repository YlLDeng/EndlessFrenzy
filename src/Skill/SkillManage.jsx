
import { useGameStore, useBulletModelDict } from '../Store/StoreManage';
import NormalBullet from './NormalBullet';
import MagicProjectile from './MagicProjectile';
import { loadGLTFModel } from '../Utils/Utils'
class SkillManage {
    constructor() {
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState
        this.bulletModelCache = {};
        this.BulletClassMap = {
            NormalBullet,
            MagicProjectile,
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
                this.bulletModelCache[type] = "MagicProjectile"
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
        const newBulletMesh = sourceModel.clone();
        const BulletClass = this.BulletClassMap[type];
        const newBulletInstance = new BulletClass(targetMesh, self, newBulletMesh, from, damage);
        newBulletInstance.create();
        return newBulletInstance;
    }
}
export default SkillManage;