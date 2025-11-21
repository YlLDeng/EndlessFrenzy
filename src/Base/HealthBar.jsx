import * as THREE from 'three';
import { useGameStore } from '../Store/StoreManage';
import { gsap } from 'gsap';

class HealthBar {
    constructor(targetMesh, maxHealth, offset) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.scene = this.getState().scene;
        this.targetMesh = targetMesh;
        this.renderRatio = 1.0;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.offset = offset
        this.healthBarGroup = new THREE.Group();
        this.healthBarMesh = null;
        this.healthBarTexture = null;
        this.healthBarCanvas = null;

        this.scene.add(this.healthBarGroup);
        this.updateFn = null
        this.init()
    }

    init() {
        this.updateFn = (delta) => {
            this.update(delta);
        };
        useGameStore.getState().addLoop(this.updateFn);
        this.createHealthBarMesh();
    }

    createHealthBarMesh() {
        const width = 2.0;
        const height = 0.2;

        const geometry = new THREE.PlaneGeometry(width, height);

        const { texture, canvas } = this._createCanvasElements();
        this.healthBarCanvas = canvas;
        this.healthBarTexture = texture;

        this._drawHealthBar(this.renderRatio);

        const material = new THREE.MeshBasicMaterial({
            map: this.healthBarTexture,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
        });

        this.healthBarMesh = new THREE.Mesh(geometry, material);
        this.healthBarMesh.renderOrder = 999;
        this.healthBarMesh.visible = false

        this.healthBarGroup.add(this.healthBarMesh);
    }

    _createCanvasElements() {
        const canvas = document.createElement('canvas');
        const logicWidth = 256;
        const logicHeight = 32;
        canvas.width = logicWidth * this.pixelRatio;
        canvas.height = logicHeight * this.pixelRatio;

        canvas.style.width = `${logicWidth}px`;
        canvas.style.height = `${logicHeight}px`;

        const texture = new THREE.CanvasTexture(canvas);
        return { texture, canvas };
    }

    _drawHealthBar(ratio) {
        const context = this.healthBarCanvas.getContext('2d');
        const canvasWidth = this.healthBarCanvas.width;
        const canvasHeight = this.healthBarCanvas.height;

        context.save();
        context.scale(this.pixelRatio, this.pixelRatio);

        const logicWidth = canvasWidth / this.pixelRatio;
        const logicHeight = canvasHeight / this.pixelRatio;
        const padding = 2; // 逻辑像素下的边距

        context.fillStyle = '#000000';
        context.fillRect(0, 0, logicWidth, logicHeight);

        context.fillStyle = '#333333';
        context.fillRect(padding, padding, logicWidth - 2 * padding, logicHeight - 2 * padding);

        const healthColor = ratio > 0.3 ? '#00ff00' : '#ffaa00';
        context.fillStyle = healthColor;

        const barWidth = (logicWidth - 2 * padding) * ratio;
        context.fillRect(padding, padding, barWidth, logicHeight - 2 * padding);

        context.restore();

        this.healthBarTexture.needsUpdate = true;
    }

    updateHealth(newHealth) {
        gsap.killTweensOf(this);

        this.currentHealth = Math.max(0, Math.min(newHealth, this.maxHealth));

        const targetRatio = this.currentHealth / this.maxHealth;

        gsap.to(this, {
            renderRatio: targetRatio,
            duration: 0.3,
            ease: "power2.out",
            onUpdate: () => {
                this._drawHealthBar(this.renderRatio);
            },
            onComplete: () => {
                if (this.currentHealth <= 0) {
                    this.healthBarGroup.visible = false;
                }
            }
        });

        if (this.currentHealth > 0 && !this.healthBarGroup.visible) {
            this.healthBarGroup.visible = true;
        }
    }

    update() {
        if (!this.healthBarGroup?.visible) return;

        const targetPos = new THREE.Vector3();
        this.targetMesh.getWorldPosition(targetPos);

        this.healthBarGroup.position.copy(targetPos).add(new THREE.Vector3(0, this.offset, 0));
        this.healthBarMesh.visible = true
        const camera = this.getState().camera;
        this.healthBarMesh.visible = true
        this.healthBarGroup.lookAt(camera.position);
    }

    dispose() {
        gsap.killTweensOf(this);

        if (this.healthBarMesh) {
            this.healthBarMesh.geometry.dispose();
            this.healthBarMesh.material.dispose();
            if (this.healthBarTexture) this.healthBarTexture.dispose();
        }
        if (this.scene) this.scene.remove(this.healthBarGroup);

        this.healthBarGroup = null;
        this.targetMesh = null;
    }
}

export default HealthBar;