import React, { useRef, useEffect } from 'react';

import HeroManage from '../Hero/HeroManage';
import MonsterManage from '../Monster/MonsterManage';
import ActionManage from '../Action/ActionManage';

import { createMainCamera } from './Camera';
import Controls from './Controls';
import Light from './Light';
import Floor from './Floor';

import { useGameStore, useDefaultSetting, useHeroModelDict } from '../Store/StoreManage';


class GameScene {
    constructor(container) {
        // 1. 保存 DOM 容器到全局状态
        useGameStore.getState().setData('container', container);

        // 2. 初始化核心资源（场景、相机、渲染器等）
        this.initCore();

        // 3. 初始化子模块（灯光、角色、地板等）

    }

    // 初始化核心资源（场景、相机、渲染器、时钟等）
    async initCore() {
        const { setData } = useGameStore.getState();
        const container = useGameStore.getState().container;

        // 场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x5e5d5d);
        scene.fog = new THREE.Fog(0x5e5d5d, 2, 40);
        setData('scene', scene);

        // 相机
        const camera = createMainCamera();
        setData('camera', camera);

        // 渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.5;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        setData('renderer', renderer);

        setData('clock', new THREE.Clock());

        // 跟随组（用于相机/角色跟随）
        const followGroup = new THREE.Group();
        scene.add(followGroup);
        setData('followGroup', followGroup);

        await this.initModules();

        // 5. 监听窗口大小变化
        this.addEventListeners();
    }

    // 初始化子模块（灯光、角色、地板等）
    async initModules() { // 改为 async 函数
        const { scene, camera, renderer, followGroup, setData } = useGameStore.getState();

        // 1. 轨道控制器（无依赖，同步初始化）
        setData('orbitControls', new Controls(camera, renderer.domElement));

        // 2. 灯光（无依赖，同步初始化）
        setData('light', new Light(scene, followGroup));

        // 3. 地板（无依赖，同步初始化）
        setData('floor', new Floor(scene, renderer));

        // 4. 英雄（有模型加载，异步初始化，等待加载完成）
        console.log(0)
        const heroManage = new HeroManage(scene, followGroup, camera, useDefaultSetting.getState().defaultHero);
        setData('HeroManage', heroManage);
        await heroManage.waitForLoad(); // 关键：等待英雄模型加载完成
        console.log(4)

        // 5. 怪物（依赖英雄，必须在英雄加载完成后初始化）
        const monsterManage = new MonsterManage(scene, heroManage); // 此时 heroManage.model 已存在
        setData('MonsterManage', monsterManage);

        // 6. 动作管理（无依赖，最后初始化）
        setData('ActionManage', new ActionManage());
    }

    // 事件监听（窗口大小变化）
    addEventListeners() {
        const handleResize = () => {
            const { container, camera, renderer } = useGameStore.getState();
            if (!container || !camera || !renderer) return;

            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('resize', handleResize);
        // 保存清理函数到状态，便于组件卸载时调用
        useGameStore.getState().setData('resizeHandler', handleResize);
    }

    // 销毁场景（释放所有资源）
    dispose() {
        const {
            container, scene, renderer, orbitControls,
            HeroManage, MonsterManage, light, floor,
            animationId, resizeHandler, setData
        } = useGameStore.getState();

        // 停止动画循环
        if (animationId) cancelAnimationFrame(animationId);

        // 移除事件监听
        if (resizeHandler) window.removeEventListener('resize', resizeHandler);

        // 销毁子模块
        HeroManage?.dispose();
        MonsterManage?.dispose();
        light?.dispose();
        floor?.dispose();
        orbitControls?.dispose();

        // 清理渲染器
        if (container && renderer?.domElement) {
            container.removeChild(renderer.domElement);
            renderer.dispose();
        }

        // 清空场景
        scene?.clear();

        // 重置全局状态
        setData('scene', null);
        setData('renderer', null);
        setData('camera', null);
        setData('orbitControls', null);
        setData('clock', null);
        setData('container', null);
    }
}

const CharacterController = () => {
    // DOM 容器引用（渲染器挂载点）
    const containerRef = useRef(null);
    // 游戏场景实例引用（避免重复创建）
    const sceneInstanceRef = useRef(null);

    // 初始化场景（组件挂载时）
    useEffect(() => {
        if (!containerRef.current) return;

        // 创建游戏场景实例（传入 DOM 容器）
        sceneInstanceRef.current = new GameScene(containerRef.current);

        // 组件卸载时销毁场景
        return () => {
            sceneInstanceRef.current?.dispose();
            sceneInstanceRef.current = null;
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
            }}
        />
    );
};

export default CharacterController;