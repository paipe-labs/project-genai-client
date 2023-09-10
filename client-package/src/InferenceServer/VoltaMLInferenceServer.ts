import axios from "axios";
import { DefaultImageGenerationOptions, ImageGenerationOptions, ImageGenerationResponse, InferenceServer } from "./InferenceServer.js";
import { uuidv4 } from "../helpers/uuid.js";

export type VoltaMLInferenceServerOptions = {
    inferenceServerUrl?: string;
};

export class VoltaMLInferenceServer implements InferenceServer {
    private _inferenceServerUrl: string;

    private DefaultOptions: Required<VoltaMLInferenceServerOptions> = {
        inferenceServerUrl: 'http://127.0.0.1:7860',
    };

    constructor({ inferenceServerUrl }: VoltaMLInferenceServerOptions) {
        this._inferenceServerUrl = inferenceServerUrl ?? this.DefaultOptions.inferenceServerUrl;
    }
    
    async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
        const { positivePrompt, negativePrompt, size, numberOfSteps, guidanceScale, batchCount, batchSize } = options;

        const generation = await axios.post(`${this._inferenceServerUrl}/generate/txt2img`, {
            backend: 'PyTorch',
            autoload: false,
            data: {
                id: uuidv4(),
                prompt: positivePrompt ?? DefaultImageGenerationOptions.positivePrompt,
                negative_prompt: negativePrompt ?? DefaultImageGenerationOptions.negativePrompt,
                width: size?.width ?? DefaultImageGenerationOptions.size.width,
                height: size?.height ?? DefaultImageGenerationOptions.size.height,
                steps: numberOfSteps ?? DefaultImageGenerationOptions.numberOfSteps,
                guidance_scale: guidanceScale ?? DefaultImageGenerationOptions.guidanceScale,
                seed: Math.floor(Math.random() * 1000000000),
                batch_size: batchSize ?? DefaultImageGenerationOptions.batchSize,
                batch_count: batchCount ?? DefaultImageGenerationOptions.batchCount,
                scheduler: 5,
                self_attention_scale: 0
            },
            model: 'stabilityai/stable-diffusion-2-1' //SD2.1-base 
        });

        return { imagesUrls: generation.data.images, info: JSON.stringify(generation.data) };

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