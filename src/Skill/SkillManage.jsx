
import { useGameStore, useBulletModelDict } from '../Store/StoreManage';
import NormalBullet from './NormalBullet';
import { loadGLTFModel } from '../Utils/Utils'
class SkillManage {
    constructor() {
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState
        this.bulletModelCache = {};
        this.init()
    }

    async init() {
        const bulletPaths = useBulletModelDict.getState();
        const loadPromises = Object.entries(bulletPaths).map(async ([type, path]) => {
            const gltf = await loadGLTFModel(path)
            this.bulletModelCache[type] = gltf.scene
        }
        );
        await Promise.all(loadPromises);
    }

    createBullet(targetMesh, type = 'normalBullet') {
        const sourceModel = this.bulletModelCache[type];
        if (!sourceModel) {
            return;
        }
        const newBulletMesh = sourceModel.clone();
        const newBulletInstance = new NormalBullet(targetMesh, newBulletMesh);
        newBulletInstance.create();
        return newBulletInstance;
    }
}
export default SkillManage;