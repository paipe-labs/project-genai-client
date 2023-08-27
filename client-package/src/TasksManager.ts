import { ImageGenerationResponse, InferenceServer } from "./InferenceServer/InferenceServer.js";
import { Task } from "./types.js";

export class TasksManager {
    private _tasksPromises: {
        task: Task,
        resultResolve: (result: ImageGenerationResponse) => void,
        resultReject: (error: Error) => void,
    }[] = [];
    private _inferenceServer: InferenceServer;

    constructor(inferenceServer: InferenceServer) {
        this._inferenceServer = inferenceServer;
    }   

    public async executeTask(task: Task): Promise<ImageGenerationResponse> {
        return new Promise((resolve, reject) => {
            const { _tasksPromises: _tasks } = this;
            
            if (_tasks.length > 0) {
                _tasks.push({ task, resultResolve: resolve, resultReject: reject });
                return;
            }
                
            _tasks.push({ task, resultResolve: resolve, resultReject: reject });
            this.startTasksLoop();
            
        });
    }

    public getTasks() {
        return this._tasksPromises.map(({task}) => task);
    }

    private async handleTask() {
        const taskPromise = this._tasksPromises.shift();

        if (!taskPromise) 
            return;

        const { options: { prompt, model, size, steps } } = taskPromise.task;
        
        try {
            const result = await this._inferenceServer.generateImage({ positivePrompt: prompt, modelName: model, size: { width: 512, height: 512 }, numberOfSteps: steps });
            console.log('Image generated inside TasksManager', taskPromise.task.taskId);
            
            taskPromise.resultResolve(result);
        } catch (error) {
            taskPromise.resultReject(new Error(JSON.stringify(error)));
        }
    }

    private async startTasksLoop() {
        while (this._tasksPromises.length > 0) {
            await this.handleTask();
        }
    }

}