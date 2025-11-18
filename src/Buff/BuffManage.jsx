import { useGameStore } from '../Store/StoreManage';

class BuffManage {
    constructor() {
        this.setData = useGameStore.getState().setData
        this.getState = useGameStore.getState
        this.updateFn = null
    }

    async init() {

    }

    dispose() {
        this.updateFn = null
    }
};

export default BuffManage;