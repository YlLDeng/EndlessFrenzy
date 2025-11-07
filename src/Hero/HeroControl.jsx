import { unwrapRad } from '../Utils/Utils';
import { useGameStore, useDefaultSetting } from '../Store/StoreManage';
import HeroBasics from './HeroBasics';
import * as THREE from 'three';

class HeroControl extends HeroBasics {
    constructor(model) {
        super();
        this.setData = useGameStore.getState().setData;
        this.heroAnimate = useGameStore.getState().HeroManage.HeroAnimate; // 修复：加括号
        this.getState = useGameStore.getState;
        this.model = model;
        this.checkAttackTime = null;
        this.lastSpeedCheck = null;

        this.rotateSmoothness = 30.0;
        this.minRotateAngle = 0.001;
        this.init();
    }

    init() {
        this.bindEvent();
        useGameStore.getState().addLoop((delta) => {
            this.update(delta);
        });
    }

    update = (delta) => {
        this.move(delta);
    };

    handleKeyDown = (event) => {
        const heroAttack = this.getState().HeroManage.HeroAttack;
        heroAttack?.interruptAttack();

        const key = this.state.key;
        switch (event.code) {
            case 'ArrowUp': case 'KeyW': case 'KeyZ':
                key[0] = -1;
                break;
            case 'ArrowDown': case 'KeyS':
                key[0] = 1;
                break;
            case 'ArrowLeft': case 'KeyA': case 'KeyQ':
                key[1] = -1;
                break;
            case 'ArrowRight': case 'KeyD':
                key[1] = 1;
                break;
            default: return;
        }
        this.state.currentState = (key[0] !== 0 || key[1] !== 0) ? 'Run' : 'Idle';
    };

    handleKeyUp = (event) => {
        const key = this.state.key;
        switch (event.code) {
            case 'ArrowUp': case 'KeyW': case 'KeyZ':
                key[0] = key[0] < 0 ? 0 : key[0];
                break;
            case 'ArrowDown': case 'KeyS':
                key[0] = key[0] > 0 ? 0 : key[0];
                break;
            case 'ArrowLeft': case 'KeyA': case 'KeyQ':
                key[1] = key[1] < 0 ? 0 : key[1];
                break;
            case 'ArrowRight': case 'KeyD':
                key[1] = key[1] > 0 ? 0 : key[1];
                break;
            default: return;
        }
        // 重新赋值，触发状态更新
        this.state.key = key;
        this.state.currentState = (key[0] !== 0 || key[1] !== 0) ? 'Run' : 'Idle';
    };

    bindEvent = () => {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('blur', () => {
            // 重置状态时生成新数组
            // this.state.key = [0, 0, 0];
            // this.state.currentState = 'Idle';
        });
    };

    move = (delta) => {
        const { orbitControls, camera, followGroup } = this.getState(); // 修复：加括号
        const { runVelocity } = this.state;

        const moveDir = new THREE.Vector3(
            this.state.key[1],
            0,
            this.state.key[0]
        );

        if (moveDir.lengthSq() > 0.001) {
            moveDir.normalize();
        }

        const moveDistance = runVelocity * delta;
        this.state.ease.copy(moveDir).multiplyScalar(moveDistance);

        const azimuth = orbitControls.controls.getAzimuthalAngle();
        this.state.ease.applyAxisAngle(this.state.up, azimuth);

        this.calculate360Rotation(moveDir, azimuth);

        this.state.position.add(this.state.ease);
        camera.position.add(this.state.ease);
        orbitControls.controls.target.copy(this.state.position).add({ x: 0, y: 1, z: 0 });
        this.model.position.copy(this.state.position);

        if (this.state.currentState === 'Run' || this.state.currentState === 'Walk') {
            this.smoothRotate(delta);
        }

        followGroup.position.copy(this.state.position);

        const floor = this.getState().floor; // 修复：加括号
        const dx = this.state.position.x - floor.plane.position.x;
        const dz = this.state.position.z - floor.plane.position.z;
        if (Math.abs(dx) > floor.floorDecal) floor.plane.position.x += dx;
        if (Math.abs(dz) > floor.floorDecal) floor.plane.position.z += dz;
    };

    calculate360Rotation = (moveDir, azimuth) => {
        const worldDir = moveDir.clone().applyAxisAngle(this.state.up, azimuth);

        const targetQuat = new THREE.Quaternion();
        targetQuat.setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            worldDir
        );

        const currentQuat = this.model.quaternion;
        if (currentQuat.dot(targetQuat) < 0) {
            targetQuat.x = -targetQuat.x;
            targetQuat.y = -targetQuat.y;
            targetQuat.z = -targetQuat.z;
            targetQuat.w = -targetQuat.w;
        }

        this.state.targetRotation = targetQuat;
    };

    smoothRotate = (delta) => {
        const { targetRotation } = this.state;
        if (!targetRotation) return;

        const angleDiff = this.model.quaternion.angleTo(targetRotation);
        if (angleDiff < this.minRotateAngle) {
            this.model.quaternion.copy(targetRotation);
            return;
        }

        const rotateStep = this.rotateSmoothness * delta * (angleDiff / Math.PI);
        this.model.quaternion.rotateTowards(targetRotation, rotateStep);
    };
}

export default HeroControl;