import { useGameStore, useDefaultSetting } from '../Store/StoreManage';
import { gsap } from 'gsap';
import * as THREE from 'three';

class MonsterAI {
    constructor(monsterMesh) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.heroManage = this.getState().HeroManage
        this.monster = monsterMesh; // 单个怪物的Mesh/SkinnedMesh
        this.speed = 1 + Math.random() * 0.5; // 每个怪物速度略有不同
        this.stopDistance = 1.5; // 停止距离
        this.rotationSpeed = 0.1; // 转向速度
        this.actions = {}
        this.updateFn = null;
        this.health = 10
        this.textGroup = new THREE.Group();
        this.monster.add(this.textGroup)
        this.init()
    }

    init() {
        this.updateFn = (delta) => {
            this.update(delta);
        };
        useGameStore.getState().addLoop(this.updateFn);
    }

    update(delta) {
        if (!this.heroManage?.hero || !this.monster) return;

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

        if (distance > this.stopDistance) {
            this.moveTowards(direction, delta);
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

    showTxt(txt) {
        const text = String(txt);
        const texture = this.createCanvasTexture(text);

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            depthTest: false,
            depthWrite: false
        });

        const sprite = new THREE.Sprite(material);

        const aspect = texture.image.width / texture.image.height;
        const spriteHeight = 150;
        sprite.scale.set(spriteHeight * aspect, spriteHeight, 1);

        sprite.position.set(0, 200, 0);

        this.textGroup.add(sprite);

        this.monster.updateWorldMatrix(true, true);
        const duration = 0.5;
        const travelHeight = 100;

        gsap.timeline({
            onComplete: () => {
                this.textGroup.remove(sprite);
                material.dispose();
                texture.dispose();
            }
        })
            .to(sprite.position, {
                duration: duration,
                y: `+=${travelHeight}`,
                ease: "power2.out"
            }, 0)

            .to(material, {
                duration: duration * 0.75,
                opacity: 0
            }, duration * 0.25);
    }

    createCanvasTexture(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const fontSize = 32;

        context.font = `${fontSize}px Arial`;
        const metrics = context.measureText(text);
        const textWidth = metrics.width;

        canvas.width = textWidth + 20;
        canvas.height = fontSize + 20;

        context.font = `${fontSize}px Arial`;

        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#6a0505ff'; // 黑色文字

        context.fillText(text, canvas.width / 2, canvas.height / 2 + 5);

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

        gsap.killTweensOf(this.textGroup.children);
        this.textGroup.traverse((child) => {
            if (child.isSprite) {
                child.material.dispose();
                if (child.material.map) {
                    child.material.map.dispose();
                }
            }
        });
        if (this.monster) this.monster.remove(this.textGroup);

        this.monster = null;
        this.heroManage = null;
        this.updateFn = null;
    }
}

export default MonsterAI