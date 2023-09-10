import { DefaultImageGenerationOptions } from "./InferenceServer";
import sdwebui from "node-sd-webui";
export class AutomaticInferenceServer {
    _automaticClient;
    _inferenceServerUrl;
    DefaultOptions = {
        inferenceServerUrl: 'http://127.0.0.1:7860'
    };
    constructor({ inferenceServerUrl }) {
        this._inferenceServerUrl = inferenceServerUrl ?? this.DefaultOptions.inferenceServerUrl;
        this._automaticClient = sdwebui({ apiUrl: this._inferenceServerUrl });
    }
    async generateImage(options) {
        const { _automaticClient } = this;
        const { positivePrompt, numberOfSteps } = options;
        const images = await _automaticClient
            .txt2img({
            prompt: positivePrompt,
            steps: numberOfSteps ?? DefaultImageGenerationOptions.numberOfSteps
        });
        return { imagesUrls: images.images, info: images.info };
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
