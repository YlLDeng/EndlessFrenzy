// src/components/Camera.jsx

export const createMainCamera = (fov = 45, near = 0.1, far = 100) => {
    const camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        near,
        far
    );
    camera.position.copy({
        "x": -6.519497596566737,
        "y": 6.688921816040412,
        "z": -9.482592008647357
    });
    return camera;
};