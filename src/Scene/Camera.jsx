// src/components/Camera.jsx

export const createMainCamera = (fov = 45, near = 0.1, far = 100) => {
    const camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        near,
        far
    );
    camera.position.copy({
        "x": 18.69925615566655,
        "y": 24.082446463491827,
        "z": 3.3116969480642267
    });
    return camera;
};