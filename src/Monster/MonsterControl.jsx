import { useGameStore, monsterDict } from '../Store/StoreManage';
class MonsterControl {
    constructor(MonsterAI) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.heroManage = this.getState().HeroManage
        this.MonsterAI = MonsterAI
        this.monster = MonsterAI.monster;

        this.scene = this.getState().MonsterManage.scene;

        this.speed = 1 + Math.random() * 0.5;
        this.stopDistance = monsterDict[this.monster.monsterType].stopDistance || 1;
        this.rotationSpeed = 0.1;
        this.updateFn = null;

        this.init()
    }
    init() {
        this.updateFn = (delta) => {
            this.update(delta);
        };
        useGameStore.getState().addLoop(this.updateFn);
    }

    update(delta) {
        if (!this.heroManage?.hero || !this.monster || !this.MonsterAI.isAlive) return;

        const monsterPos = new THREE.Vector3();
        const heroPos = new THREE.Vector3();
        this.monster.getWorldPosition(monsterPos);
        this.heroManage.hero.getWorldPosition(heroPos);
        const direction = new THREE.Vector3()
            .subVectors(heroPos, monsterPos)
            .setY(0)
            .normalize();

        const distance = monsterPos.distanceTo(heroPos);
        this.lookAtHero(direction);

        if (distance > this.stopDistance && this.MonsterAI) {
            this.moveTowards(direction, delta);
            this.MonsterAI?.attack.stopAttackLoop()
            this.MonsterAI?.animate.switchState("Run")
        }
        if (distance <= this.stopDistance && this.MonsterAI) {
            this.MonsterAI?.animate.switchState("Attack")
            this.MonsterAI?.attack.startAttackLoop()
        }
    }

    lookAtHero(direction) {
        const targetRotationY = Math.atan2(direction.x, direction.z);
        const currentRotationY = this.monster.rotation.y;
        const rotationDiff = this.normalizeAngle(targetRotationY - currentRotationY);
        this.monster.rotation.y += rotationDiff * this.rotationSpeed;
    }

    moveTowards(direction, delta) {
        const moveStep = direction.multiplyScalar(this.speed * delta);
        this.monster.position.add(moveStep);
    }

    normalizeAngle(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    }
    dispose() {
        const { removeLoop } = useGameStore.getState();
        if (this.updateFn && removeLoop) {
            removeLoop(this.updateFn);
        }
        this.updateFn = null;
    }
}
export default MonsterControl;
