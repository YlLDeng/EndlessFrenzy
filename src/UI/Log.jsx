import { useGameStore } from '../Store/StoreManage';

class Log {
    constructor() {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState();
        this.txt = ''
        this.init();
    }

    init() {
        this.txt = document.createElement("div")
        document.body.append(this.txt)
        this.txt.style = `    
                position: fixed;
                left: 0;
                top: 0;
                color: #fff;`

        this.getState.addLoop((delta) => {
            this.update(delta);
        });
    }

    update = (delta) => {
        this.txt.innerHTML = this.getState.HeroManage.HeroControl?.state?.currentState || ''
    };
}

export default Log;