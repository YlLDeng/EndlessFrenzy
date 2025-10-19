// src/utils/util.jsx
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

// 创造包围盒
export const createModelWithCollisionProxy = (group, options = {}) => {
    const { debug = true, padding = 0.1 } = options;

    // 1. 计算Group的整体包围盒（自动包含所有子物体）
    const groupBox = new THREE.Box3().setFromObject(group);

    // 2. 计算包围盒的尺寸（宽、高、深）
    const size = new THREE.Vector3();
    groupBox.getSize(size); // size.x=宽，size.y=高，size.z=深

    // 3. 计算Group的中心（用于后续将模型居中到代理中）
    const center = new THREE.Vector3();
    groupBox.getCenter(center);

    // 4. 创建碰撞代理几何体（立方体），添加padding避免穿模
    const proxyGeometry = new THREE.BoxGeometry(
        size.x + padding * 2, // 宽度+两侧padding
        size.y + padding * 2, // 高度+上下padding
        size.z + padding * 2  // 深度+前后padding
    );

    // 5. 创建碰撞代理材质（默认不可见，调试时显示线框）
    const proxyMaterial = new THREE.MeshBasicMaterial({
        visible: debug, // 调试模式显示
        wireframe: debug, // 线框模式
        color: 0xff0000, // 代理颜色（调试用）
        transparent: true,
        opacity: 0.5 // 半透明，避免遮挡模型
    });

    // 6. 创建碰撞代理Mesh
    const collisionProxy = new THREE.Mesh(proxyGeometry, proxyMaterial);

    // 7. 将原Group添加到代理中，并调整位置使其居中
    // （因为代理的原点在中心，需将模型从原Group的中心移到代理中心）
    group.position.sub(center); // 原Group的中心归零（相对于代理）
    collisionProxy.add(group);

    return collisionProxy;
}

// 判断碰撞
export const checkSphereCollision = (mesh1, mesh2) => {
    // 更新包围球
    mesh1.geometry.computeBoundingSphere();
    mesh2.geometry.computeBoundingSphere();

    // 获取世界坐标系下的球心和半径
    const sphere1 = mesh1.geometry.boundingSphere.clone();
    const sphere2 = mesh2.geometry.boundingSphere.clone();
    sphere1.center.applyMatrix4(mesh1.matrixWorld); // 球心转换到世界坐标
    sphere2.center.applyMatrix4(mesh2.matrixWorld);

    // 计算两球心距离，若小于半径之和则碰撞
    const distance = sphere1.center.distanceTo(sphere2.center);
    return distance <= sphere1.radius + sphere2.radius;
}

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

// 克隆
/**
 * 克隆模型（不含动画）：仅复制模型结构、材质、骨骼，忽略动画数据
 * @param {THREE.Group} sourceGroup - 原始模型根节点
 * @returns {THREE.Group} 克隆后的模型（无动画相关数据）
 */
export const cloneGroupWithoutAnim = (sourceGroup) => {
    const clonedGroup = new THREE.Group();
    clonedGroup.copy(sourceGroup); // 复制根节点属性（位置、旋转、缩放等）
    clonedGroup.name = `${sourceGroup.name}_clone_${Date.now()}`;

    const boneMap = new Map();

    // 递归克隆子物体
    sourceGroup.traverse((sourceChild) => {
        if (sourceChild === sourceGroup) return;

        let clonedChild;

        if (sourceChild.isMesh) {
            clonedChild = new THREE.Mesh(
                sourceChild.geometry.clone(),
                sourceChild.material.clone()
            );
            clonedChild.copy(sourceChild);
        }

        // 克隆嵌套 Group
        else if (sourceChild.isGroup) {
            clonedChild = new THREE.Group();
            clonedChild.copy(sourceChild);
        }

        // 其他类型（如 Light 等）
        else {
            clonedChild = sourceChild.clone();
        }

        // 恢复父子关系
        const sourceParent = sourceChild.parent;
        const clonedParent = sourceParent === sourceGroup
            ? clonedGroup
            : boneMap.get(sourceParent) || clonedGroup.getObjectByName(sourceParent.name);

        if (clonedParent) clonedParent.add(clonedChild);
    });

    return clonedGroup; // 不包含动画混合器和动画片段
}