import { useGameStore } from '../Store/StoreManage';
import HeroBasics from './HeroBasics';
import Bullet from '../Skill/Bullet'
import * as THREE from 'three';

class HeroAttack extends HeroBasics {
    constructor(model) {
        super();
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.model = model;
        this.isAttacking = false;
        this.isRotatingToTarget = false;
        this.attackTimer = null;
        this.cleanupAttackCheck = null;
        this.targetQuaternion = new THREE.Quaternion()
        this.rotationThreshold = 0.01
        this.rotateSpeed = 10
        this.nearestMonster = null
        this.hasCreatedBullet = false;
        // this.init();
    }

    init() {
        this.startAttackLoop();
        useGameStore.getState().addLoop((delta) => {
            this.update(delta);
        });
    }

    // 启动攻击循环（控制攻击频率）
    startAttackLoop() {
        if (this.attackTimer) clearInterval(this.attackTimer);
        const intervalMs = (1 / this.state.attackSpeed) * 1000;
        this.attackTimer = setInterval(() => this.tryInitiateAttack(), intervalMs);
    }

    // 子弹指向目标 不管血量 
    // 寻找目标 => 转向 => 攻击动画 => 3分1生成子弹

    // 尝试发起攻击（先检查目标再转向）
    tryInitiateAttack() {
        if (this.state.currentState === 'Run' || this.isRotatingToTarget) return;
        const monsters = this.getState().MonsterManage.monsterGroup.children;
        if (monsters.length === 0) {
            this.state.currentState = 'Idle'
            return;
        }

        this.nearestMonster = this.findMonster();
        if (this.nearestMonster) {
            this.attackTarget(this.nearestMonster);
            this.isRotatingToTarget = true; // 标记转向状态
        }
    }

    // 计算攻击目标的转向
    attackTarget = (nearestMonster) => {
        const heroPos = this.model.position;
        const targetDir = new THREE.Vector3()
            .subVectors(nearestMonster.position, heroPos)
            .normalize();
        targetDir.y = 0;

        const targetQuat = new THREE.Quaternion();
        targetQuat.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            targetDir
        );

        const currentQuat = this.model.quaternion;
        const dotProduct = currentQuat.dot(targetQuat);
        if (dotProduct < 0) {
            targetQuat.x = -targetQuat.x;
            targetQuat.y = -targetQuat.y;
            targetQuat.z = -targetQuat.z;
            targetQuat.w = -targetQuat.w;
        }

        this.targetQuaternion.copy(targetQuat);
    };

    // 每帧更新转向逻辑
    update(delta) {
        if (this.isRotatingToTarget) {
            this.rotateTowardsTarget(delta);
        }
    }

    // 查找最近的怪物
    findMonster = () => {
        const monsterArr = this.getState().MonsterManage.monsterGroup.children;
        if (monsterArr.length === 0) return null;

        const heroPos = this.model.position;
        let nearestMonster = null;
        let minDist = Infinity;
        monsterArr.forEach(monster => {
            const dist = heroPos.distanceTo(monster.position);
            if (dist < minDist) {
                minDist = dist;
                nearestMonster = monster;
            }
        });
        return nearestMonster;
    }

    // 缓慢转向目标
    rotateTowardsTarget(delta) {
        const currentQuat = this.model.quaternion;
        const targetQuat = this.targetQuaternion;
        const angleDiff = currentQuat.angleTo(targetQuat);

        if (angleDiff < this.rotationThreshold) {
            this.model.quaternion.copy(targetQuat);
            this.isRotatingToTarget = false;
            this.executeAttackAfterRotation();
            return;
        }

        currentQuat.rotateTowards(targetQuat, this.rotateSpeed * delta);
        this.model.quaternion.copy(currentQuat);
    }

    // 转向完成后执行攻击
    executeAttackAfterRotation() {
        this.isAttacking = true;
        this.state.currentState = 'Attack';
        this.waitForAttackEnd();
    }

    // 等待攻击动画结束并重置状态
    waitForAttackEnd() {
        const heroAnimate = this.getState().HeroManage.HeroAnimate;
        if (!heroAnimate) return;

        // 清理上一次的检查函数，避免多次叠加
        if (this.cleanupAttackCheck) {
            cancelAnimationFrame(this.cleanupAttackCheck);
        }

        const checkFinish = () => {
            if (!this.isAttacking) return;
            const attackAction = heroAnimate.actions.Attack;
            const attackDuration = attackAction.getClip().duration;
            const playProgress = attackAction.time / attackDuration; // 计算播放进度（0→1）

            // 核心逻辑：进度 ≥ 1/3 且未创建子弹时，生成子弹
            if (playProgress >= 1 / 3 && !this.hasCreatedBullet) {
                this.createBulletAtProgress();
                this.hasCreatedBullet = true; // 标记已创建，避免重复
            }

            // 动画播放完成后重置状态
            if (attackAction.time >= attackDuration) {
                this.isAttacking = false;
                this.state.currentState = 'Idle';
                this.hasCreatedBullet = false; // 重置标记，为下一次攻击做准备
                this.cleanupAttackCheck = null;
                return;
            }

            this.cleanupAttackCheck = requestAnimationFrame(checkFinish);
        };

        this.cleanupAttackCheck = requestAnimationFrame(checkFinish);
    }
    createBulletAtProgress() {
        if (!this.nearestMonster) {
            console.warn('攻击目标不存在，无法创建子弹');
            return;
        }

        // 创建子弹（与原逻辑一致）
        new Bullet(
            this.model, // 角色模型
            this.nearestMonster, // 攻击目标（需提前记录）
            (hitInfo) => {
                this.getState().MonsterManage.removeMonster(hitInfo.target.monsterAI);
            }
        );
    }
    // 动态更新攻击速度
    updateAttackSpeed(newSpeed) {
        this.state.attackSpeed = newSpeed;
        this.startAttackLoop();
    }

    interruptAttack() {
        this.isRotatingToTarget = false;
        this.isAttacking = false;

        if (this.cleanupAttackCheck) {
            cancelAnimationFrame(this.cleanupAttackCheck);
            this.cleanupAttackCheck = null;
        }

        const heroAnimate = this.getState().HeroManage.HeroAnimate;
        if (heroAnimate && this.state.currentState === 'Attack') {
            heroAnimate.actions.Attack.stop();
        }
    }

}

export default HeroAttack;