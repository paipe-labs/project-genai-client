import { DefaultImageGenerationOptions, ImageGenerationOptions, ImageGenerationResponse, InferenceServer } from "./InferenceServer.js";
import sdwebui, { Client } from "node-sd-webui";

export type AutomaticInferenceServerOptions = {
    inferenceServerUrl?: string;
};

export class AutomaticInferenceServer implements InferenceServer {
    private _automaticClient: Client;
    private _inferenceServerUrl: string;

    private DefaultOptions: Required<AutomaticInferenceServerOptions> = {
        inferenceServerUrl: 'http://127.0.0.1:7860'
    };


    constructor({ inferenceServerUrl }: AutomaticInferenceServerOptions) {
        this._inferenceServerUrl = inferenceServerUrl ?? this.DefaultOptions.inferenceServerUrl;

        this._automaticClient = sdwebui({apiUrl: this._inferenceServerUrl});
    }

    async connectInference(): Promise<void> {
        return;
    }

    async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
        const { _automaticClient } = this;

        if (!options.standardPipeline) {
            throw new Error('Automatic inference server requires standard pipeline options');
        }

        const { positivePrompt, numberOfSteps, size = {width: 512, height: 512} } = options.standardPipeline;

        console.log('Attempt to generate image with automatic inference server');
        const images = await _automaticClient
            .txt2img({
                samplingMethod: 'DPM++ 2M Karras',
                width: size.width,
                height: size.height,
                prompt: positivePrompt,
                steps: numberOfSteps ?? DefaultImageGenerationOptions.standardPipeline.numberOfSteps
            })

        return { imagesUrls: images.images, info: images.info };

    }

    loadModel(modelName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    unloadModel(modelName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getLoadedModels(): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
}