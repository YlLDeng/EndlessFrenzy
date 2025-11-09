import { useGameStore } from '../Store/StoreManage';
import * as THREE from 'three';

class Bullet {
    constructor(hero, monster, onHitCallback, baseModel) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;

        // 核心引用
        this.hero = hero;
        this.monster = monster;
        this.onHitCallback = onHitCallback;

        // 子弹属性
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

        // 设置子弹模型位置
        this.bulletModel.position.copy(startPos);
        this.bulletModel.visible = true;
        this.isFlying = true;
        this.isHit = false;

        this.targetPos = targetPos;
        this.direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();
        this.totalDistance = startPos.distanceTo(targetPos);

        // 设置子弹模型朝向目标
        this.bulletModel.lookAt(targetPos);
        this.bulletModel.rotateX(Math.PI / 2);
    }

    // 帧更新：控制飞行和碰撞检测 (逻辑不变)
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

    // 击中目标后的处理 (逻辑不变)
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

    // ♻️ 销毁子弹
    destroy() {
        if (this.bulletModel) {
            // 从场景移除克隆的模型实例
            if (this.scene) {
                this.scene.remove(this.bulletModel);
            }
            // 清空模型引用
            this.bulletModel = null;
        }

        // 清空其他引用
        this.hero = null;
        this.monster = null;
        this.onHitCallback = null;
    }
}

export default Bullet;