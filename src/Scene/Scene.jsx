// src/CharacterController.jsx
import React, { useRef, useEffect, useState } from 'react';
import { createMainCamera } from './Camera';
import Hero from '../Hero/Hero'
import Monster from '../Monster/Monster'

import Light from './Light'
import Floor from './Floor'
import Controls from './Controls'
const Scene = () => {
    const containerRef = useRef(null);
    const [status, setStatus] = useState("初始化中...");

    // 核心对象引用
    const refs = useRef({
        scene: null,
        renderer: null,
        camera: null,
        orbitControls: null,
        clock: null,
        light: null,
        hero: null,
        monster: null,
        floor: null,
        followGroup: null,
    });

    window.ref = refs.current


    // 初始化场景
    useEffect(() => {
        refs.current.scene = new THREE.Scene();
        refs.current.scene.background = new THREE.Color(0x5e5d5d);
        refs.current.scene.fog = new THREE.Fog(0x5e5d5d, 2, 40);

        refs.current.clock = new THREE.Clock();
        refs.current.followGroup = new THREE.Group();
        refs.current.scene.add(refs.current.followGroup);

        // 创建相机
        refs.current.camera = createMainCamera();

        // 创建渲染器
        refs.current.renderer = new THREE.WebGLRenderer({ antialias: true });
        refs.current.renderer.setPixelRatio(window.devicePixelRatio);
        refs.current.renderer.setSize(window.innerWidth, window.innerHeight);
        refs.current.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        refs.current.renderer.toneMappingExposure = 0.5;
        refs.current.renderer.shadowMap.enabled = true;
        refs.current.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(refs.current.renderer.domElement);

        refs.current.orbitControls = new Controls()
        refs.current.hero = new Hero()
        refs.current.monster = new Monster()
        refs.current.floor = new Floor()
        refs.current.light = new Light()

        const animate = () => {
            const delta = refs.current.clock.getDelta();
            refs.current.hero.update(delta)
            refs.current.monster.update(delta)
            refs.current.orbitControls.update(delta)
            refs.current.renderer.render(refs.current.scene, refs.current.camera);
            requestAnimationFrame(animate);
        };

        animate();

        window.addEventListener('resize', handleResize);
        return () => {
            dispose()
        };
    }, []);

    const handleResize = () => {
        const { camera, renderer } = refs.current;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const dispose = () => {
        window.removeEventListener('resize', handleResize);

        // 清理渲染器
        if (containerRef.current && refs.current.renderer) {
            containerRef.current.removeChild(refs.current.renderer.domElement);
            refs.current.renderer.dispose();
        }

        // 清理场景资源
        if (refs.current.scene) {
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
            refs.current.scene.traverse(disposeObject);
        }
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: '100vw',
                height: '100vh',
                margin: 0,
                padding: 0,
                overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '14px',
                zIndex: 100
            }}>
                {status}
            </div>
        </div>
    );
};

export default Scene;
