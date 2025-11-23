import * as THREE from "three";
import { useGameStore } from "../Store/StoreManage";

class MonsterAttack {
    constructor(monsterAI) {
        this.getState = useGameStore.getState;
        this.heroManage = this.getState().HeroManage;

        this.monsterAI = monsterAI;
        this.attackSpeed = monsterAI.attackSpeed;              // 攻击速度 默认1.0
        this.attackAnimateTime = monsterAI.attackAnimateTime;  // 在动画的什么时候触发攻击

        this.updateFn = null;
        this.isAttacking = false;

        // 攻击状态管理
        this.attackCooldown = 1 / this.attackSpeed;  // 攻击间隔(秒)
        this.cooldownTimer = 0;                       // 冷却计时器
        this.hasTriggeredAttack = false;              // 本次动画是否已触发伤害

        this.init();
    }

    init() {
        this.updateFn = this.update.bind(this);
        useGameStore.getState().addLoop(this.updateFn);
    }

    startAutoAttack() {
        this.isAttacking = true;
        this.cooldownTimer = 0; // 立即可以攻击
    }

    stopAutoAttack() {
        this.isAttacking = false;
        this.stopAttackAnimation();
    }

    update(delta) {
        if (!this.isAttacking || !this.heroManage.state.isAlive) {
            return;
        }

        const action = this.monsterAI.animate.actions.Attack;
        if (!action) return;

        // 更新冷却计时器
        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= delta;
        }

        // 如果冷却完成且动画未播放,开始新的攻击
        if (this.cooldownTimer <= 0 && !action.isRunning()) {
            this.beginAttack();
            return;
        }

        // 监测动画进度,触发伤害
        if (action.isRunning()) {
            this.checkAttackTiming(action);
        }
    }

    beginAttack() {
        const action = this.monsterAI.animate.actions.Attack;
        if (!action) return;

        // 重置状态
        this.hasTriggeredAttack = false;
        this.cooldownTimer = this.attackCooldown;

        // 播放攻击动画
        action.reset();
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();
    }

    checkAttackTiming(action) {
        if (this.hasTriggeredAttack) return;

        const clip = action.getClip();
        const normalizedTime = action.time / clip.duration;

        if (normalizedTime >= this.attackAnimateTime) {
            this.Attack();
            this.hasTriggeredAttack = true;
        }
    }

    stopAttackAnimation() {
        const action = this.monsterAI.animate.actions.Attack;
        if (action && action.isRunning()) {
            action.stop();
        }
    }

    Attack() {
        if (!this.heroManage.state.isAlive) return;

        const SkillManage = this.getState().SkillManage;
        SkillManage.createBullet(
            this.heroManage.hero,
            this.monsterAI.monster,
            "MagicProjectile",
            "monster",
            this.monsterAI.damage
        );
    }

    dispose() {
        this.stopAutoAttack();
        const { removeLoop } = this.getState();
        if (this.updateFn && removeLoop) {
            removeLoop(this.updateFn);
        }
    }
}

export default MonsterAttack;