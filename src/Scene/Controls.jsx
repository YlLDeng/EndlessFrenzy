// src/components/Controls.jsx
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class Controls {
    constructor() {
        this.controls = null
        this.init()
    }

    init() {
        this.controls = new OrbitControls(ref.camera, ref.domElement);
        this.controls.target.set(0, 1, 0);
        this.controls.enableDamping = true;
        this.controls.enablePan = false;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
        this.controls.update();
    }

    update() {
        this.controls.update();
    }

}

export default Controls