import Log from './Log'
import Btn from './Btn'
class UIManage {
    constructor() {
        this.init()
    }

    init() {
        this.log = new Log()
        this.btn = new Btn()
    }
}
export default UIManage;
