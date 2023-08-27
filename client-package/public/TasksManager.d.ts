import { ImageGenerationResponse, InferenceServer } from "./InferenceServer/InferenceServer";
import { Task } from "./types";
export declare class TasksManager {
    private _tasksPromises;
    private _inferenceServer;
    constructor(inferenceServer: InferenceServer);
    executeTask(task: Task): Promise<ImageGenerationResponse>;
    getTasks(): {
        options: {
            prompt: string;
            model: string;
            size?: number | undefined;
            steps?: number | undefined;
        };
        taskId: string;
    }[];
    private handleTask;
    private startTasksLoop;
}
