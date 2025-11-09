// src/components/SceneElements.jsx
import { useGameStore } from '../Store/StoreManage';

class Floor {
    constructor(scene, renderer) {
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState
        this.scene = scene

        this.size = 200;
        this.repeat = 16;
        this.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
        this.plane = null
        this.init()
    }

    init() {
        this.createFloor()
    }

    createFloor = () => {
        // 加载漫反射纹理（基础颜色纹理）
        const floorT = new THREE.TextureLoader().load('/textures/FloorsCheckerboard_S_Diffuse.jpg');
        floorT.colorSpace = THREE.SRGBColorSpace; // 正确映射颜色空间（确保颜色显示正常）
        floorT.repeat.set(this.repeat, this.repeat); // 设置纹理重复次数（由this.repeat控制，如4表示重复4x4次）
        floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; // 纹理超出边界时重复（而非拉伸）
        floorT.anisotropy = this.maxAnisotropy; // 提高斜视角下的纹理清晰度（值通常为渲染器的maxAnisotropy）

        // 加载法线纹理（用于表现凹凸细节，增强立体感）
        const floorN = new THREE.TextureLoader().load('/textures/FloorsCheckerboard_S_Normal.jpg');
        floorN.repeat.set(this.repeat, this.repeat); // 与漫反射纹理保持相同的重复次数
        floorN.wrapS = floorN.wrapT = THREE.RepeatWrapping; // 重复模式
        floorN.anisotropy = this.maxAnisotropy; // 提高清晰度

        // 创建地板材质和网格
        const mat = new THREE.MeshStandardMaterial({
            map: floorT, // 漫反射纹理
            normalMap: floorN, // 法线纹理
            normalScale: new THREE.Vector2(0.5, 0.5), // 减弱法线效果（值越小，凹凸感越弱）
            color: 0x404040, // 基础颜色（深灰色，与纹理叠加）
            depthWrite: false, // 关闭深度写入（避免地板遮挡下方物体，适合作为场景底部）
            roughness: 0.8 // 粗糙度（值越高，表面越粗糙，反光越弱）
        });

        const geometry = new THREE.PlaneGeometry(this.size, this.size, 50, 50);
        geometry.rotateX(-Math.PI / 2);

        const floor = new THREE.Mesh(geometry, mat);
        floor.receiveShadow = true;

        this.plane = floor
        this.scene.add(floor);
        this.floorDecal = (this.size / this.repeat) * 4
    };
}

export default Floor