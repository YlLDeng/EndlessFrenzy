import { useGameStore } from '../Store/StoreManage';
class MonsterAttack {
    constructor() {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.init()
    }

    init() {

    }

    startAttack() {

    }

}
export default MonsterAttack;
