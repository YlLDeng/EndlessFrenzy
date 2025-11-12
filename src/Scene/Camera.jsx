// src/components/Camera.jsx

export const createMainCamera = (fov = 45, near = 0.1, far = 100) => {
    const camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        near,
        far
    );
    camera.position.copy({
        "x": 12.501936702968868,
        "y": 19.61866302615502,
        "z": -13.530903404718691
    });
    return camera;
};