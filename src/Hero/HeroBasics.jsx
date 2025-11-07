import * as THREE from 'three';

class HeroBasics {
    static state = {
        currentState: 'Idle',
        key: [0, 0, 0],
        ease: new THREE.Vector3(),
        rotate: new THREE.Quaternion(),
        runVelocity: 1.8,
        up: new THREE.Vector3(0, 1, 0),
        position: new THREE.Vector3(),

        // 角色状态
        isAlive: true,
        level: 0,
        health: 5,
        damage: 10,
        attackSpeed: 1.0     //每秒攻击多少次
    };

    constructor() {
        this.state = HeroBasics.state;
    }
}
export default HeroBasics;
