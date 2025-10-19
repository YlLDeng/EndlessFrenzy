import { loadHDRTexture, loadGLTFModel, updateMixer, unwrapRad } from '../Utils/Utils';
import React, { userefs, useEffect, useState } from 'react';

class Hero {
    constructor() {
        this.speed = 1.8
        this.model = null
        this.mixer = null
        this.key = [0, 0, 0]
        this.ease = new THREE.Vector3()
        this.position = new THREE.Vector3()
        this.up = new THREE.Vector3(0, 1, 0)
        this.rotate = new THREE.Quaternion()
        this.current = 'Idle'
        this.fadeDuration = 0.5
        this.runVelocity = 3
        this.walkVelocity = 1.8
        this.rotateSpeed = 0.05
        this.floorDecale = 0
        this.actions = {}
        this.init()
        this.bindEvent()
    }

    async init() {
        const gltf = await loadGLTFModel('/Model/Hero/pulsefire_caitlyn.glb');
        this.initModel(gltf);
    }

    handleKeyDown = (event) => {
        const key = this.key;

        switch (event.code) {
            case 'ArrowUp': case 'KeyW': case 'KeyZ': key[0] = -1; break;
            case 'ArrowDown': case 'KeyS': key[0] = 1; break;
            case 'ArrowLeft': case 'KeyA': case 'KeyQ': key[1] = -1; break;
            case 'ArrowRight': case 'KeyD': key[1] = 1; break;
            case 'ShiftLeft': case 'ShiftRight': key[2] = 1; break;
        }
    };

    handleKeyUp = (event) => {
        const key = this.key;
        switch (event.code) {
            case 'ArrowUp': case 'KeyW': case 'KeyZ': key[0] = key[0] < 0 ? 0 : key[0]; break;
            case 'ArrowDown': case 'KeyS': key[0] = key[0] > 0 ? 0 : key[0]; break;
            case 'ArrowLeft': case 'KeyA': case 'KeyQ': key[1] = key[1] < 0 ? 0 : key[1]; break;
            case 'ArrowRight': case 'KeyD': key[1] = key[1] > 0 ? 0 : key[1]; break;
            case 'ShiftLeft': case 'ShiftRight': key[2] = 0; break;
        }
    };

    bindEvent = () => {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }


    initModel = (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(0.01, 0.01, 0.01)
        ref.scene.add(this.model);

        // 处理模型材质
        this.model.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                object.material.metalness = 1.0;
                object.material.roughness = 0.2;
                object.material.color.set(1, 1, 1);
                object.material.metalnessMap = object.material.map;
            }
        });

        this.mixer = new THREE.AnimationMixer(this.model);
        const animations = gltf.animations;
        // 设置动画动作
        this.actions = {
            Idle: this.mixer.clipAction(animations.find(item => item.name == 'Idle1')),
            Walk: this.mixer.clipAction(animations.find(item => item.name == 'Run_Normal')),
            Run: this.mixer.clipAction(animations.find(item => item.name == 'Run_Normal'))
        };

        // 初始化动画状态
        Object.values(this.actions).forEach(action => {
            action.enabled = true;
            action.setEffectiveTimeScale(1);
        });
        this.actions.Walk.setEffectiveWeight(0);
        this.actions.Run.setEffectiveWeight(0);
        this.actions.Idle.play();
    };

    updateCharacter = (delta) => {
        const { orbitControls, followGroup, floor } = ref;
        // 确定当前动作
        const active = this.key[0] === 0 && this.key[1] === 0 ? false : true;
        const play = active ? (this.key[2] ? 'Run' : 'Walk') : 'Idle';

        // 切换动画
        if (this.current !== play) {
            const newAction = this.actions[play];
            const oldAction = this.actions[this.current];
            newAction.reset();
            newAction.weight = 1.0;
            newAction.stopFading();
            oldAction.stopFading();

            if (play !== 'Idle') {
                newAction.time = oldAction.time * (newAction.getClip().duration / oldAction.getClip().duration);
            }

            oldAction._scheduleFading(this.fadeDuration, oldAction.getEffectiveWeight(), 0);
            newAction._scheduleFading(this.fadeDuration, newAction.getEffectiveWeight(), 1);
            newAction.play();
            this.current = play; // 关键：更新当前动作状态
        }

        // 移动控制
        if (this.current !== 'Idle') {
            const velocity = this.current === 'Run' ? this.runVelocity : this.walkVelocity;
            const azimuth = orbitControls.controls.getAzimuthalAngle();

            // 计算移动方向
            this.ease.set(this.key[1], 0, this.key[0]).multiplyScalar(velocity * delta);
            const angle = unwrapRad(Math.atan2(this.ease.x, this.ease.z) + azimuth);
            this.rotate.setFromAxisAngle(this.up, angle);
            this.ease.applyAxisAngle(this.up, azimuth);

            // 更新位置
            this.position.add(this.ease);
            ref.camera.position.add(this.ease);
            this.model.position.copy(this.position);
            this.model.quaternion.rotateTowards(this.rotate, this.rotateSpeed);

            // 更新相机和灯光跟随
            orbitControls.controls.target.copy(this.position).add({ x: 0, y: 1, z: 0 });
            followGroup.position.copy(this.position);

            // 地板无限滚动效果
            const dx = this.position.x - floor.plane.position.x;
            const dz = this.position.z - floor.plane.position.z;
            if (Math.abs(dx) > this.floorDecale) floor.plane.position.x += dx;
            if (Math.abs(dz) > this.floorDecale) floor.plane.position.z += dz;
        }
    };

    update = (delta) => {
        this.updateCharacter(delta)
        updateMixer(this.mixer, delta)
    }

    dispose = () => {
        const disposeObject = (obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            obj.children.forEach(disposeObject);
        };
        ref.scene.traverse(disposeObject);
    }
};

export default Hero;
