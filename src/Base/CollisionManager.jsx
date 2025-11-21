import { useGameStore } from '../Store/StoreManage';
import * as THREE from 'three';
class CollisionManager {
    collidables = [];
    collidableBoxes = new Map();
    constructor() {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.updateFn = null
        this.init()
    }

    init() {
        this.updateFn = (delta) => {
            this.update(delta);
        };
        useGameStore.getState().addLoop(this.updateFn);
    }

    register(object) {
        if (!object.id) {
            object.id = THREE.MathUtils.generateUUID();
        }
        if (!object.mesh || !object.onCollision) {
            console.error("Collidable object is missing required properties (mesh or onCollision).", object);
            return;
        }

        this.collidables.push(object);
        this.collidableBoxes.set(object.id, new THREE.Box3());
    }

    unregister(id) {
        this.collidables = this.collidables.filter(obj => obj.id !== id);
        this.collidableBoxes.delete(id);
    }

    update() {
        const count = this.collidables.length;

        for (const obj of this.collidables) {
            const box = this.collidableBoxes.get(obj.id);
            if (!box) continue;

            box.setFromObject(obj.mesh);
        }

        for (let i = 0; i < count; i++) {
            const obj1 = this.collidables[i];
            if (!obj1) continue;
            const box1 = this.collidableBoxes.get(obj1.id);
            if (!box1) continue;

            for (let j = i + 1; j < count; j++) {
                const obj2 = this.collidables[j];
                if (!obj2) continue;
                const box2 = this.collidableBoxes.get(obj2.id);
                if (!box2) continue;

                if (this.shouldHandleCollision(obj1.tag, obj2.tag)) {
                    if (box1.intersectsBox(box2)) {
                        obj1.onCollision(obj2);
                        obj2.onCollision(obj1);
                    }
                }
            }
        }
    }

    shouldHandleCollision(tag1, tag2) {
        if (tag1 === tag2) return false;

        if ((tag1 === 'bullet' && tag2 === 'monster') || (tag1 === 'monster' && tag2 === 'bullet')) {
            return true;
        }

        if ((tag1 === 'hero' && tag2 === 'monster') || (tag1 === 'monster' && tag2 === 'hero')) {
            return true;
        }

        if ((tag1 === 'hero' && tag2 === 'bullet') || (tag1 === 'bullet' && tag2 === 'hero')) {
            return true;
        }
        if ((tag1 === 'hero' && tag2 === 'experience_ball') || (tag1 === 'experience_ball' && tag2 === 'hero')) {
            return true;
        }

        return false;
    }

    dispose() {
        this.collidables = [];
        this.collidableBoxes.clear();
    }
}

export default CollisionManager;