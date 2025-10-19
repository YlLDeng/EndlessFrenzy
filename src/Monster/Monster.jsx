import { loadHDRTexture, loadGLTFModel, updateMixer, unwrapRad } from '../Utils/Utils';
import React, { userefs, useEffect, useState } from 'react';

class Monster {
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
    }

    async init() {
        const gltf = await loadGLTFModel('/Model/Monster/melee_minion_-_chaos.glb');
        this.initModel(gltf);
    }

    initModel = (gltf) => {
        this.model = gltf.scene;
        this.model.scale.set(0.005, 0.005, 0.005)
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
        console.log(this.model)
        this.mixer = new THREE.AnimationMixer(this.model);
        const animations = gltf.animations;
        this.actions = {
            Idle: this.mixer.clipAction(animations.find(item => item.name == 'Idle2'))
        };

        // 初始化动画状态
        Object.values(this.actions).forEach(action => {
            action.enabled = true;
            action.setEffectiveTimeScale(1);
        });
        this.actions.Idle.play();

    };

    update = (delta) => {
        // 1. 更新动画
        updateMixer(this.mixer, delta);

        // 检查模型是否加载完成
        if (!ref.hero?.model || !this.model) return;

        // 2. 获取位置
        const monsterPos = new THREE.Vector3();
        const heroPos = new THREE.Vector3();
        this.model.getWorldPosition(monsterPos);
        ref.hero.model.getWorldPosition(heroPos);

        // 3. 计算方向向量（指向英雄）
        const direction = new THREE.Vector3()
            .subVectors(heroPos, monsterPos) // 英雄 - 怪物 = 指向英雄的向量
            .setY(0) // 忽略Y轴，只在水平面上移动
            .normalize(); // 归一化方向（确保移动速度稳定）

        // 4. 计算与英雄的距离（用于判断是否需要停止移动）
        const distanceToHero = monsterPos.distanceTo(heroPos);
        const stopDistance = 1.5; // 距离英雄小于此值时停止移动

        // 5. 望向英雄（平滑转向）
        const targetRotationY = Math.atan2(direction.x, direction.z);
        const rotationDiff = this.normalizeAngle(targetRotationY - this.model.rotation.y);
        this.model.rotation.y += rotationDiff * 0.1; // 转向速度

        // 6. 走向英雄（距离足够远时才移动）
        if (distanceToHero > stopDistance) {
            const moveSpeed = 1; // 移动速度（可根据需要调整）
            const moveStep = direction.multiplyScalar(moveSpeed * delta); // 每帧移动距离
            this.model.position.add(moveStep); // 应用移动
        }
    };

    normalizeAngle = (angle) => {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    };
    
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

export default Monster;
