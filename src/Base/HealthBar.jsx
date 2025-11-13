import * as THREE from 'three';
import { useGameStore } from '../Store/StoreManage';

class HealthBar {
    constructor(targetMesh, maxHealth) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.scene = this.getState().MonsterManage.scene;
        this.targetMesh = targetMesh;

        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.offset = 2.5;
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

        const { texture, canvas } = this._createOrUpdateHealthBarTexture(this.currentHealth, this.maxHealth);
        this.healthBarCanvas = canvas;
        this.healthBarTexture = texture;

        const material = new THREE.MeshBasicMaterial({
            map: this.healthBarTexture,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false, // 忽略深度测试，确保血条总能显示
            depthWrite: false,
        });

        this.healthBarMesh = new THREE.Mesh(geometry, material);
        this.healthBarMesh.visible = false
        this.healthBarMesh.renderOrder = 999;
        this.healthBarGroup.add(this.healthBarMesh);
    }

    _createOrUpdateHealthBarTexture(current, max) {
        const canvasWidth = 256;
        const canvasHeight = 32;
        const padding = 2;
        const ratio = current / max;

        const canvas = this.healthBarCanvas || document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const context = canvas.getContext('2d');

        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        context.fillStyle = '#333333';
        context.fillRect(padding, padding, canvasWidth - 2 * padding, canvasHeight - 2 * padding);

        const healthColor = ratio > 0.3 ? '#00ff00' : '#ffaa00'; // 低血量时变黄
        context.fillStyle = healthColor;
        context.fillRect(padding, padding, (canvasWidth - 2 * padding) * ratio, canvasHeight - 2 * padding);

        const texture = this.healthBarTexture || new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        return { texture, canvas };
    }

    updateHealth(newHealth) {
        this.currentHealth = Math.max(0, Math.min(newHealth, this.maxHealth));
        this._createOrUpdateHealthBarTexture(this.currentHealth, this.maxHealth);

        if (this.currentHealth <= 0) {
            this.healthBarGroup.visible = false;
        } else {
            this.healthBarGroup.visible = true;
        }
    }

    update() {
        if (!this.healthBarGroup?.visible) return;

        const targetPos = new THREE.Vector3();
        this.targetMesh.getWorldPosition(targetPos);

        this.healthBarGroup.position.copy(targetPos).add(new THREE.Vector3(0, this.offset, 0));
        const camera = this.getState().camera;
        this.healthBarMesh.visible = true
        this.healthBarGroup.lookAt(camera.position);
    }

    dispose() {
        if (this.healthBarMesh) {
            this.healthBarMesh.geometry.dispose();
            this.healthBarMesh.material.dispose();
            if (this.healthBarTexture) this.healthBarTexture.dispose();
        }
        if (this.scene) this.scene.remove(this.healthBarGroup);

        this.healthBarGroup = null;
        this.healthBarMesh = null;
        this.healthBarTexture = null;
        this.healthBarCanvas = null;
        this.targetMesh = null;
        this.updateFn = null
    }
}

export default HealthBar;