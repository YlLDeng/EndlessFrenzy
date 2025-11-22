import * as THREE from 'three';
import { useGameStore } from '../Store/StoreManage';
import HeroBasics from './HeroBasics';
import { gsap } from 'gsap';
class HeroExperience extends HeroBasics {
    constructor(hero, scene) {
        super();
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.collisionManager = this.getState().CollisionManager;

        this.hero = hero;
        this.scene = scene
        this.followGroup = this.getState().followGroup;
        this.id = THREE.MathUtils.generateUUID();
        this.tag = 'hero_pickup_range';

        this.experienceScopeRadius = this.state.experienceScope;
        this.experienceScopeMesh = null;

        this.renderRatio = 0;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.maxExperience = 10;
        this.offset = 3
        this.experienceBarGroup = new THREE.Group();
        this.experienceBarMesh = null;
        this.experienceBarTexture = null;
        this.experienceBarCanvas = null;
        this.scene.add(this.experienceBarGroup);
        this.updateFn = null

        this.init();
    }

    init() {
        this.updateFn = (delta) => {
            this.update(delta);
        };
        useGameStore.getState().addLoop(this.updateFn);
        this.createExperienceScope();
        this.initCollision();
        this.creatEexperienceBarMesh();
    }

    createExperienceScope() {
        const geometry = new THREE.CylinderGeometry(
            this.experienceScopeRadius, // 顶部半径
            this.experienceScopeRadius, // 底部半径
            50, // 高度
            32 // 分段数
        );

        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00, // 绿色
            opacity: 0.0,
            transparent: true,
            wireframe: true,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 25;
        this.experienceScopeMesh = mesh;
        this.followGroup.add(this.experienceScopeMesh);
    }

    initCollision() {
        this.collisionManager.register({
            id: this.id,
            mesh: this.experienceScopeMesh,
            tag: this.tag,
            onCollision: this.handleCollision.bind(this)
        });
    }

    handleCollision(otherObject) {

    }

    creatEexperienceBarMesh() {
        const width = 2.0;
        const height = 0.07;

        const geometry = new THREE.PlaneGeometry(width, height);

        const { texture, canvas } = this._createCanvasElements();
        this.experienceBarCanvas = canvas;
        this.experienceBarTexture = texture;

        this._drawexperienceBar(this.renderRatio);

        const material = new THREE.MeshBasicMaterial({
            map: this.experienceBarTexture,
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
        });

        this.experienceBarMesh = new THREE.Mesh(geometry, material);
        this.experienceBarMesh.renderOrder = 999;
        this.experienceBarMesh.visible = false
        this.experienceBarGroup.add(this.experienceBarMesh);
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

    _drawexperienceBar(ratio) {
        const context = this.experienceBarCanvas.getContext('2d');
        const canvasWidth = this.experienceBarCanvas.width;
        const canvasHeight = this.experienceBarCanvas.height;

        context.save();
        context.scale(this.pixelRatio, this.pixelRatio);

        const logicWidth = canvasWidth / this.pixelRatio;
        const logicHeight = canvasHeight / this.pixelRatio;
        const padding = 2;

        context.fillStyle = '#FFF';
        context.fillRect(0, 0, logicWidth, logicHeight);

        context.fillStyle = '#FFF';
        context.fillRect(padding, padding, logicWidth - 2 * padding, logicHeight - 2 * padding);

        const experienceColor = '#9438a9ff';
        context.fillStyle = experienceColor;

        const barWidth = (logicWidth - 2 * padding) * ratio;
        context.fillRect(padding, padding, barWidth, logicHeight - 2 * padding);

        context.restore();
        this.experienceBarTexture.needsUpdate = true;
    }

    updateExperience(newExperience) {
        this.state.experience += newExperience
        let levelUpOccurred = false;

        while (this.state.experience >= this.maxExperience) {
            this.state.experience -= this.maxExperience;
            this.getState().HeroManage.upLevel();
            levelUpOccurred = true;
        }

        gsap.killTweensOf(this);
        const targetRatio = this.state.experience / this.maxExperience;
        gsap.to(this, {
            renderRatio: targetRatio,
            duration: levelUpOccurred ? 0.6 : 0.3,
            ease: "power2.out",
            onUpdate: () => {
                this._drawexperienceBar(this.renderRatio);
            }
        });
    }

    update() {
        if (!this.experienceBarGroup?.visible) return;
        const targetPos = new THREE.Vector3();
        this.hero.getWorldPosition(targetPos);
        this.experienceBarGroup.position.copy(targetPos).add(new THREE.Vector3(0, this.offset, 0));
        this.experienceBarMesh.visible = true
        const camera = this.getState().camera;
        this.experienceBarMesh.visible = true
        this.experienceBarGroup.lookAt(camera.position);
    }

    hiddenBar() {
        this.experienceBarGroup.visible = false
    }

    dispose() {
        if (this.collisionManager && this.experienceScopeMesh) {
            this.collisionManager.unregister(this.id);
        }

        if (this.experienceScopeMesh) {
            this.followGroup.remove(this.experienceScopeMesh);
            this.experienceScopeMesh.geometry.dispose();
            this.experienceScopeMesh.material.dispose();
            this.experienceScopeMesh = null;
        }

        gsap.killTweensOf(this);

        if (this.experienceBarMesh) {
            this.experienceBarMesh.geometry.dispose();
            this.experienceBarMesh.material.dispose();
            if (this.experienceBarTexture) this.experienceBarTexture.dispose();
        }
        if (this.scene) this.scene.remove(this.experienceBarGroup);

        this.experienceBarGroup = null;
    }
}
export default HeroExperience;