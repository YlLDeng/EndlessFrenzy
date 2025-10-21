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
    clonedGroup.name = `${sourceGroup.name}_clone_${Date.now()}`;

    // 递归克隆子物体（关键：先克隆子物体，再复制根节点属性）
    const cloneChild = (sourceChild, parentGroup) => {
        let clonedChild;

        // 1. 克隆 Mesh（含几何体、材质、变换）
        if (sourceChild.isMesh || sourceChild.isSkinnedMesh) {
            clonedChild = new THREE.Mesh(
                sourceChild.geometry.clone(),
                sourceChild.material.clone()
            );
            clonedChild.copy(sourceChild); // 复制所有变换（缩放、旋转、位置）
        }

        // 2. 克隆嵌套 Group（含变换）
        else if (sourceChild.isGroup) {
            clonedChild = new THREE.Group();
            clonedChild.copy(sourceChild); // 复制 Group 的缩放、旋转等
        }

        // 3. 其他类型（如 Light、Bone 等）
        else {
            clonedChild = sourceChild.clone(); // 原生 clone 已含变换
        }

        // 2. 恢复父子关系
        parentGroup.add(clonedChild);

        // 3. 递归克隆子物体的子节点
        sourceChild.children.forEach((grandChild) => {
            cloneChild(grandChild, clonedChild);
        });
    };

    // 开始递归克隆（从原始模型的子物体开始）
    sourceGroup.children.forEach((child) => {
        cloneChild(child, clonedGroup);
    });

    // 4. 复制原始模型根节点的变换（缩放、旋转、位置）
    clonedGroup.copy(sourceGroup);

    return clonedGroup;
};