// src/components/SceneElements.jsx
class Floor {
    constructor() {
        this.size = 50;
        this.repeat = 16;
        this.maxAnisotropy = ref.renderer.capabilities.getMaxAnisotropy();
        this.plane = null
        this.init()
        this.createFloor()
    }
    init() {
    }

    createFloor = () => {

        // 加载地板纹理
        const floorT = new THREE.TextureLoader().load('/textures/FloorsCheckerboard_S_Diffuse.jpg');
        floorT.colorSpace = THREE.SRGBColorSpace;
        floorT.repeat.set(this.repeat, this.repeat);
        floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping;
        floorT.anisotropy = this.maxAnisotropy;

        const floorN = new THREE.TextureLoader().load('/textures/FloorsCheckerboard_S_Normal.jpg');
        floorN.repeat.set(this.repeat, this.repeat);
        floorN.wrapS = floorN.wrapT = THREE.RepeatWrapping;
        floorN.anisotropy = this.maxAnisotropy;

        // 创建地板材质和网格
        const mat = new THREE.MeshStandardMaterial({
            map: floorT,
            normalMap: floorN,
            normalScale: new THREE.Vector2(0.5, 0.5),
            color: 0x404040,
            depthWrite: false,
            roughness: 0.85
        });

        const geometry = new THREE.PlaneGeometry(this.size, this.size, 50, 50);
        geometry.rotateX(-Math.PI / 2);

        const floor = new THREE.Mesh(geometry, mat);
        floor.receiveShadow = true;

        this.plane = floor
        ref.scene.add(floor);
        ref.hero.floorDecale = (this.size / this.repeat) * 4;
    };
}

export default Floor