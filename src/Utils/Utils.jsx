// src/utils/util.jsx
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

// 加载HDR环境贴图
export const loadHDRTexture = (path) => {
    return new Promise((resolve, reject) => {
        new HDRLoader()
            .load(path, (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                resolve(texture);
            }, undefined, reject);
    });
};

// 加载GLTF模型
export const loadGLTFModel = (url) => {
    return new Promise((resolve, reject) => {
        new GLTFLoader().load(url, resolve, undefined, reject);
    });
};

// 动画混合器更新
export const updateMixer = (mixer, delta) => {
    if (mixer) mixer.update(delta);
};

// 角度处理工具
export const unwrapRad = (r) => {
    return Math.atan2(Math.sin(r), Math.cos(r));
};