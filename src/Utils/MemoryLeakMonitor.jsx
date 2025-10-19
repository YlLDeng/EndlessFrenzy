class MemoryMonitor {
    constructor() {
        this.isRunning = false; // 监控状态
        this.intervalId = null; // 定时器ID
        this.updateInterval = 1000; // 监控间隔（毫秒，默认1秒）
        this.memoryHistory = []; // 内存历史记录 [{ time, usedMB }]
        this.maxHistoryLength = 60; // 最多保留60条记录（1分钟）

        // 检查浏览器是否支持内存API
        this.supported = typeof window !== 'undefined' &&
            window.performance &&
            window.performance.memory;

        if (!this.supported) {
            console.warn('当前浏览器不支持内存监控API，无法获取内存使用量');
        }
    }

    /**
     * 启动内存监控
     * @param {number} interval - 监控间隔（毫秒）
     */
    start(interval = 1000) {
        if (!this.supported || this.isRunning) return;

        this.isRunning = true;
        this.updateInterval = interval;

        // 立即获取一次内存
        this.updateMemory();

        // 定时更新内存
        this.intervalId = setInterval(() => {
            this.updateMemory();
        }, this.updateInterval);

        console.log(`内存监控已启动（间隔：${this.updateInterval}ms）`);
    }

    /**
     * 停止内存监控
     */
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        clearInterval(this.intervalId);
        this.intervalId = null;
        console.log('内存监控已停止');
    }

    /**
     * 手动更新一次内存数据
     * @returns {number|null} - 当前内存使用量（MB），不支持则返回null
     */
    updateMemory() {
        if (!this.supported) return null;

        // 获取JS堆内存使用量（字节）
        const usedBytes = window.performance.memory.usedJSHeapSize;
        // 转换为MB（保留2位小数）
        const usedMB = (usedBytes / 1024 / 1024).toFixed(2);

        // 记录时间和内存
        const record = {
            time: new Date().toLocaleTimeString(), // 本地时间
            usedMB: parseFloat(usedMB)
        };

        this.memoryHistory.push(record);

        // 限制历史记录长度
        if (this.memoryHistory.length > this.maxHistoryLength) {
            this.memoryHistory.shift(); // 移除最旧的记录
        }

        // 实时打印（可选）
        console.log(`内存使用：${usedMB} MB`);

        return parseFloat(usedMB);
    }

    /**
     * 获取内存使用趋势（最近n条记录）
     * @param {number} count - 要获取的记录数
     * @returns {Array} - 内存记录数组
     */
    getMemoryTrend(count = 10) {
        return this.memoryHistory.slice(-count); // 返回最近count条记录
    }

    /**
     * 设置内存增长报警阈值（超过则报警）
     * @param {number} threshold - 阈值（MB）
     */
    setAlertThreshold(threshold) {
        // 监控内存增长（比较最近2次记录）
        if (this.memoryHistory.length >= 2) {
            const prev = this.memoryHistory[this.memoryHistory.length - 2].usedMB;
            const current = this.memoryHistory[this.memoryHistory.length - 1].usedMB;
            const growth = current - prev;

            if (growth > threshold) {
                console.warn(`⚠️ 内存增长过快：${growth.toFixed(2)} MB（阈值：${threshold} MB）`);
            }
        }
    }
}
export default MemoryMonitor