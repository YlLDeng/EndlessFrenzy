import { useGameStore } from '../Store/StoreManage';
import * as THREE from 'three';

class Bullet {
    constructor(hero, monster, onHitCallback, baseModel) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;

        this.hero = hero;
        this.monster = monster;
        this.onHitCallback = onHitCallback;

        this.speed = 7;
        this.radius = 1.2;
        this.isFlying = false;
        this.isHit = false;
        this.scene = this.getState().scene;
        this.bulletModel = baseModel.clone();
        this.init()
    }

    init() {
        this.scene.add(this.bulletModel);
        this.shotTarget();
        useGameStore.getState().addLoop((delta) => {
            if (this.isFlying && !this.isHit) {
                this.update(delta);
            }
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

    update = (delta) => {

        const moveDistance = this.speed * delta;
        const currentPos = this.bulletModel.position.clone();

        const distanceToTarget = currentPos.distanceTo(this.targetPos);
        if (distanceToTarget <= moveDistance || distanceToTarget < this.radius) {
            this.onHit();
            return;
        }

        this.bulletModel.position.addScaledVector(this.direction, moveDistance);
        this.checkCollision();
    };

    checkCollision() {
        const monsterPos = new THREE.Vector3();
        if (!this.monster) return;

        this.monster.getWorldPosition(monsterPos);
        const bulletPos = this.bulletModel.position;

        const distance = bulletPos.distanceTo(monsterPos);
        if (distance < this.radius && !this.isHit) {
            this.onHit();
        }
    }

    onHit() {
        if (this.isHit) return;

        this.isHit = true;
        this.isFlying = false;
        if (this.bulletModel) {
            this.bulletModel.visible = false;
        }

        if (typeof this.onHitCallback === 'function') {
            this.onHitCallback({
                bullet: this,
                attacker: this.hero,
                target: this.monster
            });
        }

        this.destroy();
    }

    destroy() {
        if (this.bulletModel) {
            if (this.scene) {
                this.scene.remove(this.bulletModel);
            }
            this.bulletModel = null;
        }

        this.hero = null;
        this.monster = null;
        this.onHitCallback = null;
    }
}

export default Bullet;