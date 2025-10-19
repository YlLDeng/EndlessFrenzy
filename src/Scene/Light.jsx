import { loadHDRTexture, updateMixer, unwrapRad } from '../Utils/Utils';

class Light {
    constructor(scene, followGroup) {
        this.dirLight = null
        this.scene = scene
        this.followGroup = followGroup
        this.init()
        this.loadHDR()
    }

    init() {
        this.dirLight = new THREE.DirectionalLight(0xffffff, 5);
        this.dirLight.position.set(-2, 5, -3);
        this.dirLight.castShadow = true;

        // 配置阴影相机
        const shadowCam = this.dirLight.shadow.camera;
        shadowCam.top = shadowCam.right = 2;
        shadowCam.bottom = shadowCam.left = -2;
        shadowCam.near = 3;
        shadowCam.far = 8;
        this.dirLight.shadow.mapSize.set(1024, 1024);

        this.followGroup.add(this.dirLight);
        this.followGroup.add(this.dirLight.target);

    }

    async loadHDR() {
        const hdrTexture = await loadHDRTexture('/textures/lobe.hdr');
        this.scene.environment = hdrTexture;
        this.scene.environmentIntensity = 1.5;
    }

}


export default Light;