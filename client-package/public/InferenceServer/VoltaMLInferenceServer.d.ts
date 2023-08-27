import { ImageGenerationOptions, ImageGenerationResponse, InferenceServer } from "./InferenceServer";
export type VoltaMLInferenceServerOptions = {
    inferenceServerUrl?: string;
};
export declare class VoltaMLInferenceServer implements InferenceServer {
    private _inferenceServerUrl;
    private DefaultOptions;
    constructor({ inferenceServerUrl }: VoltaMLInferenceServerOptions);
    generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse>;
    loadModel(modelName: string): Promise<void>;
    unloadModel(modelName: string): Promise<void>;
    getLoadedModels(): Promise<string[]>;
}
