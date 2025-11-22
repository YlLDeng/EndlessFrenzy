import { useGameStore } from '../Store/StoreManage';

class Btn {
    constructor() {
        this.setData = useGameStore.getState().setData;
        this.getState = useGameStore.getState;
        this.txt = ''
        this.init();
    }

    init() {
        this.txt = document.createElement("div")
        document.body.append(this.txt)
        this.txt.style = `    
                 user-select: none; position: fixed;left: 100px;top: 0px;width: 156px;height: 35px;background: rgb(0, 0, 0);color: rgb(255, 255, 255);display: flex;align-items: center;justify-content: center;cursor: pointer;`

        // this.getState.addLoop((delta) => {
        //     this.update(delta);
        // });
        this.txt.innerHTML = 'addMonsters'
        this.txt.onclick = () => {
            // this.getState().MonsterManage.addMonsters("normalMonster")
            this.getState().MonsterManage.addMonsters("rangedMonster")
        }
    }

    // update = (delta) => {
    //     this.txt.innerHTML = this.getState.HeroManage.HeroControl?.state?.currentState || ''
    // };
}

export default Btn;