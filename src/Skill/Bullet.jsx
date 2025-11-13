import { useGameStore } from '../Store/StoreManage';
import * as THREE from 'three';

class Bullet {
    constructor(hero, monster, baseModel) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.collisionManager = this.getState().CollisionManager

        this.hero = hero;
        this.monster = monster;

        this.speed = 7;
        this.radius = 1.2;
        this.isFlying = false;
        this.isHit = false;
        this.scene = this.getState().scene;
        this.bulletModel = baseModel.clone();

        this.id = THREE.MathUtils.generateUUID(); // 生成唯一 ID
        this.tag = 'bullet';
        this.updateFn = null
        this.init()
    }

    init() {
        this.scene.add(this.bulletModel);
        this.shotTarget();

        this.updateFn = (delta) => {
            this.update(delta);
        };
        useGameStore.getState().addLoop(this.updateFn);

        this.initCollision()
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
        if (!this.hero || !this.monster || this.isFlying) return;
        const heroPos = new THREE.Vector3();
        this.hero.getWorldPosition(heroPos);

        const heroForward = new THREE.Vector3(0, 0, 1);
        heroForward.applyQuaternion(this.hero.quaternion);
        const startPos = heroPos.addScaledVector(heroForward, 2);

        const targetPos = new THREE.Vector3();
        this.monster.getWorldPosition(targetPos);
        targetPos.y += 0.5;

        this.bulletModel.position.copy(startPos);
        this.bulletModel.visible = true;
        this.isFlying = true;
        this.isHit = false;

        this.targetPos = targetPos;
        this.direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
        this.totalDistance = startPos.distanceTo(targetPos);

        this.bulletModel.lookAt(targetPos);
        this.bulletModel.rotateX(Math.PI / 2);
    }

    handleCollision(otherObject) {
        if (otherObject.tag == 'monster') {

            this.collisionManager.unregister(this.id);
            if (this.isHit) return;

            this.isHit = true;
            this.isFlying = false;
            if (this.bulletModel) {
                this.bulletModel.visible = false;
            }

            this.destroy();
        }
    }

    update = (delta) => {
        if (this.isFlying && !this.isHit && this.bulletModel) {
            const moveDistance = this.speed * delta;
            this.bulletModel.position.addScaledVector(this.direction, moveDistance);
        }
    };

    destroy() {
        this.updateFn = null;
        if (this.bulletModel) {
            if (this.scene) {
                this.scene.remove(this.bulletModel);
            }
            this.bulletModel = null;
        }
    }
}

export default Bullet;