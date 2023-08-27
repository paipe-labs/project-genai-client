import axios from "axios";
import { DefaultImageGenerationOptions } from "./InferenceServer";
import { uuidv4 } from "../helpers/uuid";
export class VoltaMLInferenceServer {
    _inferenceServerUrl;
    DefaultOptions = {
        inferenceServerUrl: 'http://127.0.0.1:7860',
    };
    constructor({ inferenceServerUrl }) {
        this._inferenceServerUrl = inferenceServerUrl ?? this.DefaultOptions.inferenceServerUrl;
    }
    async generateImage(options) {
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
            model: 'stabilityai/stable-diffusion-2-1'
        });
        return { imagesUrls: generation.data.images, info: JSON.stringify(generation.data) };
    }
    loadModel(modelName) {
        throw new Error("Method not implemented.");
    }
    unloadModel(modelName) {
        throw new Error("Method not implemented.");
    }
    getLoadedModels() {
        throw new Error("Method not implemented.");
    }
}
