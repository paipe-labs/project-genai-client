import { ImageGenerationOptions, ImageGenerationResponse, InferenceServer } from "./InferenceServer";
export type AutomaticInferenceServerOptions = {
    inferenceServerUrl?: string;
};
export declare class AutomaticInferenceServer implements InferenceServer {
    private _automaticClient;
    private _inferenceServerUrl;
    private DefaultOptions;
    constructor({ inferenceServerUrl }: AutomaticInferenceServerOptions);
    generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse>;
    loadModel(modelName: string): Promise<void>;
    unloadModel(modelName: string): Promise<void>;
    getLoadedModels(): Promise<string[]>;
}
