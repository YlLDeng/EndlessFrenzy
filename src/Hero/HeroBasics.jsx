import * as THREE from 'three';

class HeroBasics {
    static state = {
        current: 'Idle', // 将 current 作为对象属性
        key: [0, 0, 0],
        ease: new THREE.Vector3(),
        rotate: new THREE.Quaternion(),
        fadeDuration: 0.5,
        runVelocity: 1.8,
        rotateSpeed: 15,
        rotationThreshold: 0.01,
        up: new THREE.Vector3(0, 1, 0),
        position: new THREE.Vector3(),
        targetQuaternion: new THREE.Quaternion(), // 目标旋转（朝向最近怪物）

        isAttacking: false,
        isMoving: false,
        isRotatingToTarget: false,

        isAlive: true,

        level: 0,
        health: 5,
        attack: 10,
        lastAttackTime: 0,
        attackTimer: null,
        attackSpeed: 2.0     //每秒攻击多少次
    };

    constructor() {
        this.state = HeroBasics.state;
    }
}
export default HeroBasics;
