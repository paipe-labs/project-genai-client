export class TasksManager {
    _tasksPromises = [];
    _inferenceServer;
    constructor(inferenceServer) {
        this._inferenceServer = inferenceServer;
    }
    async executeTask(task) {
        return new Promise((resolve, reject) => {
            const { _tasksPromises: _tasks } = this;
            _tasks.push({ task, resultResolve: resolve, resultReject: reject });
            if (_tasks.length === 0) {
                this.startTasksLoop();
            }
        });
    }
    getTasks() {
        return this._tasksPromises.map(({ task }) => task);
    }
    async handleTask() {
        const taskPromise = this._tasksPromises.shift();
        if (!taskPromise)
            return;
        const { options: { prompt, model, size, steps } } = taskPromise.task;
        try {
            const result = await this._inferenceServer.generateImage({ positivePrompt: prompt, modelName: model, size: { width: 512, height: 512 }, numberOfSteps: steps });
            console.log('Image generated inside TasksManager', result.info);
            taskPromise.resultResolve(result);
        }
        catch (error) {
            taskPromise.resultReject(new Error(JSON.stringify(error)));
        }
    }
    async startTasksLoop() {
        while (this._tasksPromises.length > 0) {
            await this.handleTask();
        }
    }
}
