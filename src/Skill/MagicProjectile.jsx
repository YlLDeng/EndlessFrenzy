import { useGameStore } from '../Store/StoreManage';
import * as THREE from 'three';

class MagicProjectile {
    constructor(target, self, model, from, damage) {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.collisionManager = this.getState().CollisionManager;
        this.self = self
        this.damage = damage
        this.target = target;
        this.bulletModel = null;

        this.speed = 7;
        this.isFlying = false;
        this.isHit = false;
        this.scene = this.getState().scene;
        this.from = from

        this.id = THREE.MathUtils.generateUUID();
        this.tag = 'bullet';
        this.updateFn = null;
        this.init();
    }

    init() {
        this.updateFn = (delta) => {
            this.update(delta);
        };
        useGameStore.getState().addLoop(this.updateFn);
        this.initModel();
    }

    initModel() {
        const geometry = new THREE.SphereGeometry(0.12, 32, 32);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(1.0, 0.2, 0.2) },
            },
            vertexShader: `
                        varying vec2 vUv;
                        varying vec3 vPos;
                        void main() {
                            vUv = uv;
                            vPos = position;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
            fragmentShader: `
                        uniform float uTime;
                        uniform vec3 uColor;
        
                        varying vec2 vUv;
                        varying vec3 vPos;
        
                        float noise(vec3 p){
                            return fract(sin(dot(p ,vec3(12.9898,78.233, 37.719))) * 43758.5453);
                        }
        
                        void main(){
                            float core = 1.0 - length(vPos) * 1.6;
        
                            float pulse = noise(vPos * 4.0 + uTime * 6.0);
                            float glow = smoothstep(0.2, 1.0, core + pulse * 0.3);
        
                            vec3 color = uColor * glow * 2.0;
        
                            float alpha = glow;
                            if(alpha < 0.05) discard;
        
                            gl_FragColor = vec4(color, alpha);
                        }
                    `
        });

        this.bulletModel = new THREE.Mesh(geometry, material);
        this.bulletModel.visible = false;
        this.bulletModel.from = this.from
        this.bulletModel.damage = this.damage
        this.scene.add(this.bulletModel);
    }

    create() {
        if (!this.bulletModel) {
            console.error("Bullet model is not set.");
            return;
        }
        this.bulletModel.visible = true;
        this.scene.add(this.bulletModel);
        this.shotTarget();
        this.initCollision();
    }

    initCollision() {
        this.collisionManager.register({
            id: this.id,
            mesh: this.bulletModel,
            tag: this.tag,
            onCollision: this.handleCollision.bind(this)
        });
    }

    shotTarget() {
        if (!this.self || !this.target || this.isFlying) return;

        const heroPos = new THREE.Vector3();
        this.self.getWorldPosition(heroPos);

        const heroForward = new THREE.Vector3(0, 1, 2);
        heroForward.applyQuaternion(this.self.quaternion);
        const startPos = heroPos.addScaledVector(heroForward, 1.0);

        const targetPos = new THREE.Vector3();
        this.target.getWorldPosition(targetPos);
        targetPos.y += 0.5;
        this.bulletModel.position.copy(startPos);
        this.isFlying = true;
        this.isHit = false;

        this.targetPos = targetPos;
        this.direction = new THREE.Vector3().subVectors(targetPos, startPos).normalize();

        this.bulletModel.lookAt(targetPos);
        this.bulletModel.rotateX(Math.PI / 2);
    }

    handleCollision(otherObject) {
        if (otherObject.tag == 'monster' || otherObject.tag == 'hero') {
            this.collisionManager.unregister(this.id);
            if (this.isHit) return;
            this.isHit = true;
            this.isFlying = false;
            this.destroy();
        }
    }

    update = (delta) => {
        if (this.isFlying && !this.isHit && this.bulletModel) {
            const moveDistance = this.speed * delta;
            this.bulletModel.position.addScaledVector(this.direction, moveDistance);
        }

        if (this.bulletModel && this.bulletModel.position.distanceTo(this.self.position) > 50) {
            this.destroy();
        }
    };

    destroy() {
        useGameStore.getState().removeLoop(this.updateFn);
        this.collisionManager.unregister(this.id);

        if (this.bulletModel) {
            if (this.scene) {
                this.scene.remove(this.bulletModel);
            }

            this.bulletModel.traverse((child) => {
                if (child.isMesh) {
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
            this.bulletModel = null;
        }
    }
}

export default MagicProjectile;