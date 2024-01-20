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
        if (options.standardPipeline === undefined) {
            throw new Error('VoltaML inference server requires standard pipeline options');
        }

        const { positivePrompt, negativePrompt, size, numberOfSteps, guidanceScale, batchCount, batchSize } = options.standardPipeline;

        const generation = await axios.post(`${this._inferenceServerUrl}/generate/txt2img`, {
            backend: 'PyTorch',
            autoload: false,
            data: {
                id: uuidv4(),
                prompt: positivePrompt ?? DefaultImageGenerationOptions.standardPipeline.positivePrompt,
                negative_prompt: negativePrompt ?? DefaultImageGenerationOptions.standardPipeline.negativePrompt,
                width: size?.width ?? DefaultImageGenerationOptions.standardPipeline.size.width,
                height: size?.height ?? DefaultImageGenerationOptions.standardPipeline.size.height,
                steps: numberOfSteps ?? DefaultImageGenerationOptions.standardPipeline.numberOfSteps,
                guidance_scale: guidanceScale ?? DefaultImageGenerationOptions.standardPipeline.guidanceScale,
                seed: Math.floor(Math.random() * 1000000000),
                batch_size: batchSize ?? DefaultImageGenerationOptions.standardPipeline.batchSize,
                batch_count: batchCount ?? DefaultImageGenerationOptions.standardPipeline.batchCount,
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