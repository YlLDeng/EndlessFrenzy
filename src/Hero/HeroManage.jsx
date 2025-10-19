import { loadHDRTexture, loadGLTFModel, updateMixer, unwrapRad, checkSphereCollision, createModelWithCollisionProxy } from '../Utils/Utils';
import { useGameStore, useDefaultSetting, useHeroModelDict } from '../Store/StoreManage';
class HeroManage {
    constructor(scene, followGroup, camera, heroName) {
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState

        this.scene = scene
        this.followGroup = followGroup
        this.camera = camera

        this.speed = 1.8
        this.model = null
        this.mixer = null
        this.key = [0, 0, 0]
        this.ease = new THREE.Vector3()
        this.position = new THREE.Vector3()
        this.up = new THREE.Vector3(0, 1, 0)
        this.rotate = new THREE.Quaternion()
        this.current = 'Idle'
        this.fadeDuration = 0.5
        this.runVelocity = 3
        this.walkVelocity = 1.8
        this.rotateSpeed = 0.05
        this.loadModel = useHeroModelDict.getState()[heroName]
        this.actions = {}
        this.loadPromise = new Promise(async (resolve) => { // 注意这里添加 async
            await this.init(); // 等待 init 内部的异步操作完成
            resolve(); // 所有初始化完成后再 resolve
        });
    }

    async init() {
        const gltf = await loadGLTFModel(this.loadModel);
        this.initModel(gltf);
        this.bindEvent()
    }


    waitForLoad() {
        return this.loadPromise;
    }

    handleKeyDown = (event) => {
        const key = this.key;

        switch (event.code) {
            case 'ArrowUp': case 'KeyW': case 'KeyZ': key[0] = -1; break;
            case 'ArrowDown': case 'KeyS': key[0] = 1; break;
            case 'ArrowLeft': case 'KeyA': case 'KeyQ': key[1] = -1; break;
            case 'ArrowRight': case 'KeyD': key[1] = 1; break;
            case 'ShiftLeft': case 'ShiftRight': key[2] = 1; break;
        }
    };

    handleKeyUp = (event) => {
        const key = this.key;
        switch (event.code) {
            case 'ArrowUp': case 'KeyW': case 'KeyZ': key[0] = key[0] < 0 ? 0 : key[0]; break;
            case 'ArrowDown': case 'KeyS': key[0] = key[0] > 0 ? 0 : key[0]; break;
            case 'ArrowLeft': case 'KeyA': case 'KeyQ': key[1] = key[1] < 0 ? 0 : key[1]; break;
            case 'ArrowRight': case 'KeyD': key[1] = key[1] > 0 ? 0 : key[1]; break;
            case 'ShiftLeft': case 'ShiftRight': key[2] = 0; break;
        }
    };

    bindEvent = () => {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }


    initModel = (gltf) => {
        const animations = gltf.animations;
        gltf.scene.scale.set(0.01, 0.01, 0.01)
        // this.model = createModelWithCollisionProxy(gltf.scene);
        this.model = gltf.scene
        this.scene.add(this.model)

        // 处理模型材质
        this.model.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
                object.material.metalness = 1.0;
                object.material.roughness = 0.2;
                object.material.color.set(1, 1, 1);
                object.material.metalnessMap = object.material.map;
            }
        });

        this.mixer = new THREE.AnimationMixer(this.model);
        // 设置动画动作
        this.actions = {
            Idle: this.mixer.clipAction(animations.find(item => item.name == 'Idle1')),
            Walk: this.mixer.clipAction(animations.find(item => item.name == 'Run_Normal')),
            Run: this.mixer.clipAction(animations.find(item => item.name == 'Run_Normal'))
        };

        // 初始化动画状态
        Object.values(this.actions).forEach(action => {
            action.enabled = true;
            action.setEffectiveTimeScale(1);
        });
        this.actions.Walk.setEffectiveWeight(0);
        this.actions.Run.setEffectiveWeight(0);
        this.actions.Idle.play();
    };

    handelMove = (delta) => {
        const orbitControls = this.getState().orbitControls
        // 确定当前动作
        const active = this.key[0] === 0 && this.key[1] === 0 ? false : true;
        const play = active ? (this.key[2] ? 'Run' : 'Walk') : 'Idle';

        // 切换动画
        if (this.current !== play) {
            const newAction = this.actions[play];
            const oldAction = this.actions[this.current];
            newAction.reset();
            newAction.weight = 1.0;
            newAction.stopFading();
            oldAction.stopFading();

            if (play !== 'Idle') {
                newAction.time = oldAction.time * (newAction.getClip().duration / oldAction.getClip().duration);
            }

            oldAction._scheduleFading(this.fadeDuration, oldAction.getEffectiveWeight(), 0);
            newAction._scheduleFading(this.fadeDuration, newAction.getEffectiveWeight(), 1);
            newAction.play();
            this.current = play; // 关键：更新当前动作状态
        }

        // 移动控制
        if (this.current !== 'Idle') { // 非Idle时才处理移动
            // 根据当前动画（Run/Walk）设置移动速度
            const velocity = this.current === 'Run' ? this.runVelocity : this.walkVelocity;

            // 获取相机的方位角（绕Y轴的旋转角度，用于计算角色移动方向相对相机的偏移）
            const azimuth = orbitControls.controls.getAzimuthalAngle();

            // 计算移动方向向量（基于用户输入）
            this.ease.set(this.key[1], 0, this.key[0]) // x轴（左右）= key[1]，z轴（前后）= key[0]
                .multiplyScalar(velocity * delta); // 乘以速度和帧间隔（确保不同帧率下移动距离一致）

            // 计算角色朝向角度（结合相机方位角，确保移动方向相对相机正确）
            const angle = unwrapRad( // unwrapRad 用于处理角度环绕（如360°→0°）
                Math.atan2(this.ease.x, this.ease.z) + azimuth // 方向向量角度 + 相机方位角
            );
            this.rotate.setFromAxisAngle(this.up, angle); // 生成角色旋转四元数
            this.ease.applyAxisAngle(this.up, azimuth); // 调整移动方向向量，使其相对世界坐标系正确

            // 更新角色位置
            this.position.add(this.ease); // 角色位置 += 移动向量
            this.camera.position.add(this.ease); // 相机位置同步移动（保持相对距离）
            this.model.position.copy(this.position); // 模型位置同步到角色位置

            // 角色平滑转向目标方向
            this.model.quaternion.rotateTowards(this.rotate, this.rotateSpeed); // 旋转速度由 rotateSpeed 控制

            // 更新相机目标点（始终指向角色上方，确保相机跟随）
            orbitControls.controls.target.copy(this.position).add({ x: 0, y: 1, z: 0 }); // 目标点 = 角色位置 + Y轴偏移（看向角色腰部/头部）
            this.followGroup.position.copy(this.position); // 跟随组（包含灯光、特效）同步角色位置

            // 获取地板实例
            const floor = this.getState().floor;

            // 计算角色与地板中心的X、Z轴距离
            const dx = this.position.x - floor.plane.position.x;
            const dz = this.position.z - floor.plane.position.z;

            // 当距离超过地板贴花阈值（floorDecal）时，让地板跟随角色移动（营造无限地板效果）
            if (Math.abs(dx) > floor.floorDecal) floor.plane.position.x += dx;
            if (Math.abs(dz) > floor.floorDecal) floor.plane.position.z += dz;
        }
    };

    dispose = () => {

    }
};

export default HeroManage;
