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
        this._comfyClient.connect();
    }

    async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
        const { _comfyClient } = this;

        if (options.comfyPipeline === undefined) {
            throw new Error('ComfyUI inference server requires comfyUI pipeline options');
        }

        const { pipelineData } = options.comfyPipeline;

        const comfyPrompt = JSON.parse(pipelineData) as Prompt;

        console.log('Attempt to generate image with comfyUI inference server');
        const images = await _comfyClient.getImages(comfyPrompt);

        const base64Url = await this.blobToBase64((images as any)['9'][0]['blob']);

        console.log(base64Url);
        return { imagesUrls: [base64Url], info: 'Meow' };

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

    async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, _) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
}