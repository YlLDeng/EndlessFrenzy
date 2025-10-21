import { unwrapRad } from '../Utils/Utils';
import { useGameStore, useDefaultSetting } from '../Store/StoreManage';
import HeroBasics from './HeroBasics'
class HeroControl extends HeroBasics {
    constructor(model) {
        super()
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState
        this.model = model
        this.checkAttackTime = null
        this.lastSpeedCheck = null
        this.init()
    }

    init() {
        this.bindEvent()
        useGameStore.getState().addLoop((delta) => {
            this.update(delta);
        });
    }

    update = (delta) => {
        this.move(delta);
    };

    handleKeyDown = (event) => {
        const key = this.state.key; // 获取当前按键状态
        this.interruptAllAnimations();
        switch (event.code) {
            case 'ArrowUp': case 'KeyW': case 'KeyZ':
                if (key[0] !== -1) {
                    key[0] = -1;
                }
                break;
            case 'ArrowDown': case 'KeyS':
                if (key[0] !== 1) {
                    key[0] = 1;
                }
                break;
            case 'ArrowLeft': case 'KeyA': case 'KeyQ':
                if (key[1] !== -1) {
                    key[1] = -1;
                }
                break;
            case 'ArrowRight': case 'KeyD':
                if (key[1] !== 1) {
                    key[1] = 1;
                }
                break;
            default: return; // 非方向键不处理
        }

        this.state.isMoving = key[0] !== 0 || key[1] !== 0;
        this.state.current = 'Run'
    };

    interruptAllAnimations = () => {
        const heroAnimate = this.getState().HeroManage.HeroAnimate;
        if (this.state.isMoving) {
            return
        }
        // 1. 终止攻击和转向状态
        this.state.isAttacking = false;
        const autoAttack = this.getState().HeroManage.HeroAutoAttack;
        if (autoAttack) {
            autoAttack.isAttacking = false;
            autoAttack.isRotatingToTarget = false;
        }

        // 2. 强制停止所有当前动画（关键修复：移除错误的条件判断）
        Object.values(heroAnimate.actions).forEach(action => {
            action.stop(); // 立即停止攻击/Idle等动画
            action.stopFading(); // 终止过渡效果
        });
        // 3. 立即切换到跑步动画，确保动画状态正确
        heroAnimate.switchState('Run', 0);
    };

    handleKeyUp = (event) => {
        const key = this.state.key
        switch (event.code) {
            case 'ArrowUp': case 'KeyW': case 'KeyZ':
                key[0] = key[0] < 0 ? 0 : key[0]; // 只有当前是负方向时才归零
                break;
            case 'ArrowDown': case 'KeyS':
                key[0] = key[0] > 0 ? 0 : key[0]; // 只有当前是正方向时才归零
                break;
            case 'ArrowLeft': case 'KeyA': case 'KeyQ':
                key[1] = key[1] < 0 ? 0 : key[1];
                break;
            case 'ArrowRight': case 'KeyD':
                key[1] = key[1] > 0 ? 0 : key[1];
                break;
            default: return;
        }
        this.state.isMoving = key[0] !== 0 || key[1] !== 0;
    };

    bindEvent = () => {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        // 监听页面失去焦点（适用于点击其他窗口、桌面等）
        window.addEventListener('blur', () => {
            this.state.isMoving = false;
            this.state.key = [0, 0, 0]
        });
    }

    move = (delta) => {
        const { orbitControls, camera, followGroup } = this.getState();
        const { current, runVelocity, rotateSpeed } = this.state;

        let velocity = runVelocity;

        // 3. 移动方向计算（即使速度为0，仍需执行以保持状态同步）
        this.state.ease.set(this.state.key[1], 0, this.state.key[0])
            .multiplyScalar(velocity * delta);

        const azimuth = orbitControls.controls.getAzimuthalAngle();
        const angle = unwrapRad(
            Math.atan2(this.state.ease.x, this.state.ease.z) + azimuth
        );
        this.state.rotate.setFromAxisAngle(this.state.up, angle);
        this.state.ease.applyAxisAngle(this.state.up, azimuth);

        // 4. 更新位置（速度为0时，ease为0，位置不变）
        this.state.position.add(this.state.ease);
        // 相机位置同步：使用平滑插值替代直接相加，避免跳变
        camera.position.add(this.state.ease); // 相机位置同步移动（保持相对距离）

        orbitControls.controls.target.copy(this.state.position).add({ x: 0, y: 1, z: 0 });
        this.model.position.copy(this.state.position);

        // 5. 旋转控制：仅在移动状态（Run/Walk）时执行，Attack时让攻击旋转逻辑生效
        if (current === 'Run' || current === 'Walk') {
            this.model.quaternion.rotateTowards(this.state.rotate, rotateSpeed);
        }

        followGroup.position.copy(this.state.position);

        // 6. 地板移动逻辑保持不变
        const floor = this.getState().floor;
        const dx = this.state.position.x - floor.plane.position.x;
        const dz = this.state.position.z - floor.plane.position.z;
        if (Math.abs(dx) > floor.floorDecal) floor.plane.position.x += dx;
        if (Math.abs(dz) > floor.floorDecal) floor.plane.position.z += dz;
    };

}
export default HeroControl;
