import { useGameStore, monsterDict } from '../Store/StoreManage';
import { gsap } from 'gsap';
import * as THREE from 'three';
import MonsterAnimate from './MonsterAnimate'
import MonsterControl from './MonsterControl'
import MonsterAttack from './MonsterAttack'
import ExperienceBall from '../Base/ExperienceBall'
import HealthBar from '../Base/HealthBar'

class MonsterAI {
    constructor(monster, animate, type) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.heroManage = this.getState().HeroManage
        this.collisionManager = this.getState().CollisionManager
        this.scene = this.getState().scene;
        this.monster = monster;
        this.monsterAnimate = animate

        this.pixelRatio = window.devicePixelRatio || 1;
        this.maxHealth = monsterDict[this.monster.monsterType].maxHealth || 5;
        this.deathExperience = monsterDict[this.monster.monsterType].deathExperience || 1;
        this.attackSpeed = monsterDict[this.monster.monsterType].attackSpeed || 1.0
        this.attackAnimateTime = monsterDict[this.monster.monsterType].attackAnimateTime || 0.2
        this.damage = monsterDict[this.monster.monsterType].damage || 1

        this.health = this.maxHealth;

        this.textGroup = new THREE.Group();
        this.scene.add(this.textGroup)

        this.id = THREE.MathUtils.generateUUID();
        this.tag = 'monster';
        this.currentState = 'Run'
        this.monsterType = type

        this.animate = null
        this.control = null
        this.healthBar = null
        this.attack = null
        this.isAlive = true
        this.updateFn = null
        this.textOffset = 3
        this.init()
    }

    init() {
        this.updateFn = (delta) => {
            this.update(delta);
        };
        useGameStore.getState().addLoop(this.updateFn);
        this.initCollision()
        this.animate = new MonsterAnimate(this)
        this.control = new MonsterControl(this)
        this.attack = new MonsterAttack(this)
        this.healthBar = new HealthBar(this.monster, this.maxHealth, 2.5)
    }

    update(delta) {
        if (!this.monster) return;
        const monsterPos = new THREE.Vector3();
        this.monster.getWorldPosition(monsterPos);
        this.textGroup.position.copy(monsterPos).add(new THREE.Vector3(0, this.textOffset, 0));
    }

    initCollision() {
        this.collisionManager.register({
            id: this.id,
            mesh: this.monster.children[2],
            tag: this.tag,
            onCollision: this.handleCollision.bind(this)
        });
    }

    handleCollision(otherObject) {
        if (otherObject.tag === 'bullet' && otherObject.mesh.from === 'hero') {
            this.onHit(otherObject.mesh.damage);
        }
    }

    onHit(damage) {
        this.health -= damage;
        this.healthBar.updateHealth(this.health)
        this.health = Math.max(0, this.health);

        // const text = String(damage);
        // const texture = this.createCanvasTexture(text);

        // const material = new THREE.SpriteMaterial({
        //     map: texture,
        //     transparent: true,
        //     opacity: 1,
        //     depthTest: false,
        //     depthWrite: false,
        // });

        // const sprite = new THREE.Sprite(material);

        // const aspect = texture.image.width / texture.image.height;
        // const spriteHeight = 1.5;
        // sprite.scale.set(spriteHeight * aspect, spriteHeight, 1);

        // sprite.position.set(0, 0, 0);

        // this.textGroup.add(sprite);

        // const duration = 1.5;
        // const travelHeight = 2;

        // gsap.timeline({
        //     onComplete: () => {
        //         this.textGroup.remove(sprite);
        //         material.dispose();
        //         texture.dispose();
        //     }
        // })
        //     .to(sprite.position, {
        //         duration: duration,
        //         y: `+=${travelHeight}`,
        //         ease: "power2.out"
        //     }, 0)

        //     .to(material, {
        //         duration: duration * 0.75,
        //         opacity: 0
        //     }, duration * 0.25);

        if (this.health <= 0) {
            this.death()
        }
    }

    death() {
        this.isAlive = false
        this.attack.stopAttackLoop()
        this.animate.switchState("Death")
        this.collisionManager.unregister(this.id);
        new ExperienceBall(this.deathExperience, this.monster.position)
        setTimeout(() => {
            this.getState().MonsterManage.removeMonster(this);
        }, 1000)
    }

    createCanvasTexture(text) {

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const logicFontSize = 8;
        const padding = 20;

        context.font = `${logicFontSize}px Arial`;
        const metrics = context.measureText(text);
        const logicTextWidth = metrics.width;

        const logicWidth = logicTextWidth + padding;
        const logicHeight = logicFontSize + padding;

        canvas.width = logicWidth * this.pixelRatio;
        canvas.height = logicHeight * this.pixelRatio;

        canvas.style.width = `${logicWidth}px`;
        canvas.style.height = `${logicHeight}px`;

        context.scale(this.pixelRatio, this.pixelRatio);

        context.font = `${logicFontSize}px Arial`;

        context.fillStyle = 'rgba(0, 0, 0, 0.0)';
        context.fillRect(0, 0, logicWidth, logicHeight);

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#FFFFFF';

        context.fillText(text, logicWidth / 2, logicHeight / 2 + 2); // 调整 +2 略微修正基线

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        return texture;
    }

    dispose() {
        const { removeLoop } = useGameStore.getState();
        if (this.updateFn && removeLoop) {
            removeLoop(this.updateFn);
        }
        if (this.collisionManager) {
            this.collisionManager.unregister(this.id);
        }
        gsap.killTweensOf(this.textGroup.children);

        this.textGroup.traverse((child) => {
            if (child.isSprite) {
                child.material.dispose();
                if (child.material.map) child.material.map.dispose();
            }
        });
        if (this.scene) this.scene.remove(this.textGroup);
        this.healthBar.dispose()
        this.monster = null;
    }
}

export default MonsterAI