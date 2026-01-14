import { useGameStore } from '../Store/StoreManage';
import * as THREE from 'three';

class NormalBullet {
    constructor(target, self, bulletMesh, from, damage) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.collisionManager = this.getState().CollisionManager;
        this.self = self
        this.damage = damage

        this.MODEL_SCALE = 0.3;
        this.target = target;
        this.bulletModel = bulletMesh;

        this.speed = 7;
        this.isFlying = false;
        this.isHit = false;
        this.scene = this.getState().scene;
        this.from = from

        this.id = THREE.MathUtils.generateUUID();
        this.tag = 'bullet';
        this.updateFn = null;

        this.init();
    }

    init() {
        this.updateFn = (delta) => {
            this.update(delta);
        };
        useGameStore.getState().addLoop(this.updateFn);
        this.initModel();
    }

    initModel() {
        this.bulletModel.traverse((child) => {
            if (child.isMesh) {
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(m => m.clone());
                } else {
                    child.material = child.material.clone();
                }
                child.castShadow = true;
            }
        });
        this.bulletModel.scale.set(this.MODEL_SCALE, this.MODEL_SCALE, this.MODEL_SCALE);
        this.bulletModel.visible = false;
        this.bulletModel.from = this.from
        this.bulletModel.damage = this.damage
    }

    create() {
        if (!this.bulletModel) {
            console.error("Bullet model is not set.");
            return;
        }
        this.scene.add(this.bulletModel);
        this.bulletModel.hitTargets = new Set();
        this.shotTarget();
        this.initCollision();
    }

    initCollision() {
        this.collisionManager.register({
            id: this.id,
            mesh: this.bulletModel,
            tag: this.tag,
            onCollision: this.handleCollision.bind(this)
        });
    }

    shotTarget() {
        if (!this.self || !this.target || this.isFlying) return;

        const heroPos = new THREE.Vector3();
        this.self.getWorldPosition(heroPos);

        const heroForward = new THREE.Vector3(0, 1.7, 2);
        heroForward.applyQuaternion(this.self.quaternion);
        const startPos = heroPos.addScaledVector(heroForward, 1.0);

        const targetPos = new THREE.Vector3();
        this.target.getWorldPosition(targetPos);
        targetPos.y += 0.5;
        this.bulletModel.position.copy(startPos);
        this.bulletModel.visible = true;
        this.isFlying = true;
        this.isHit = false;

        this.targetPos = targetPos;
        this.direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

        this.bulletModel.lookAt(targetPos);
        this.bulletModel.rotateX(Math.PI / 2);
    }

    handleCollision(otherObject) {
        if (otherObject.tag == 'monster' || otherObject.tag == 'hero') {
            this.collisionManager.unregister(this.id);
            if (this.isHit) return;
            this.isHit = true;
            this.isFlying = false;
            this.destroy();
        }
    }

    update = (delta) => {
        if (this.isFlying && !this.isHit && this.bulletModel) {
            const moveDistance = this.speed * delta;
            this.bulletModel.position.addScaledVector(this.direction, moveDistance);
        }

        if (this.bulletModel && this.bulletModel.position.distanceTo(this.self.position) > 50) {
            this.destroy();
        }
    };

    destroy() {
        useGameStore.getState().removeLoop(this.updateFn);
        this.collisionManager.unregister(this.id);

        if (this.bulletModel) {
            if (this.scene) {
                this.scene.remove(this.bulletModel);
            }

            this.bulletModel.traverse((child) => {
                if (child.isMesh) {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
            this.bulletModel = null;
        }
    }
}

export default NormalBullet;