import { DefaultImageGenerationOptions, ImageGenerationOptions, ImageGenerationResponse, InferenceServer } from "./InferenceServer.js";
import { ComfyUIClient, type Prompt } from "comfy-ui-client";
import { uuidv4 } from "../helpers/uuid.js";

export type ComfyUIInferenceServerOptions = {
    inferenceServerUrl?: string;
};

export class ComfyUIInferenceServer implements InferenceServer {
    private _comfyClient: ComfyUIClient;
    private _inferenceServerUrl: string;

    private DefaultOptions: Required<ComfyUIInferenceServerOptions> = {
        inferenceServerUrl: '127.0.0.1:8188'
    };


    constructor({ inferenceServerUrl }: ComfyUIInferenceServerOptions) {
        this._inferenceServerUrl = inferenceServerUrl ?? this.DefaultOptions.inferenceServerUrl;

        const clientId = uuidv4();
        this._comfyClient = new ComfyUIClient(this._inferenceServerUrl, clientId);
    }

    async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
        const { _comfyClient } = this;

        if (options.comfyPipeline === undefined) {
            throw new Error('ComfyUI inference server requires comfyUI pipeline options');
        }
        const { pipelineData } = options.comfyPipeline;

        const comfyPrompt = JSON.parse(pipelineData) as Prompt;

        _comfyClient.connect();

        console.log('Attempt to generate image with comfyUI inference server');
        const imageResponses = await _comfyClient.getImages(comfyPrompt);

        const imagesUrls: string[] = [];

        for (const imageResponse of Object.values(imageResponses)) {
            for (const image of imageResponse) {
                const base64Url = await this.blobToBase64Url(image.blob);
                imagesUrls.push(base64Url);
            }
        }

        return { imagesUrls, info: 'Meow' };

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

    private async blobToBase64Url(blob: Blob) {
        const buffer = Buffer.from(await blob.text());
        return "data:" + blob.type + ';base64,' + buffer.toString('base64');
    }
}