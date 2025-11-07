// src/components/Camera.jsx

export const createMainCamera = (fov = 45, near = 0.1, far = 100) => {
    const camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        near,
        far
    );
    camera.position.copy({
        "x": -10.15622141140296,
        "y": 12.690749895896344,
        "z": 2.3886981606873547
    });
    return camera;
};