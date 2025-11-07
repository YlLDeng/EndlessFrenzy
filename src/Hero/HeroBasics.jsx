import * as THREE from 'three';

class HeroBasics {
    static state = {
        currentState: 'Idle',
        isAlive: true,
        level: 0,
        health: 5,
        damage: 10,
        attackSpeed: 3.0
    };

    constructor() {
        this.state = HeroBasics.state;
    }
}
export default HeroBasics;
