import { ComfyUIClient } from "comfy-ui-client";
import type { UploadImageResult, Prompt } from "comfy-ui-client";

import { WebSocket } from 'ws';

import { ComfyPipelineDependencies, ImageGenerationOptions, ImageGenerationResponse, InferenceServer } from "./InferenceServer.js";
import { waitForWebSocketConnection, uuidv4 } from "../helpers/index.js";

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

    async setupInferenceSession(): Promise<void> {
        const comfyWebSocketUrl = `ws://${this._inferenceServerUrl}/ws`
        await waitForWebSocketConnection(comfyWebSocketUrl);

        this._comfyClient.connect();
        console.log("ComfyUI WebSocket connection opened")
    }

    async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
        const { _comfyClient } = this;

        if (options.comfyPipeline === undefined) {
            throw new Error('ComfyUI inference server requires comfyUI pipeline options');
        }

        const { pipelineData } = options.comfyPipeline;
        const { pipelineDependencies } = options.comfyPipeline
        
        if (pipelineDependencies !== undefined) {
            this.resolvePipelineDependencies(pipelineData, pipelineDependencies);
        }

        try {
            const queue = await _comfyClient.getQueue();

            const isConnected = queue?.queue_running !== undefined;

            if (!isConnected) {
                _comfyClient.connect();
            }
        } catch (error) {
            _comfyClient.connect();
        }

        console.log('Attempt to generate image with comfyUI inference server');
        const comfyPrompt = JSON.parse(pipelineData) as Prompt;
        const imageResponses = await _comfyClient.getImages(comfyPrompt);

        const imagesUrls: string[] = [];

        for (const imageResponse of Object.values(imageResponses)) {
            for (const image of imageResponse) {
                const base64Url = await this.blobToBase64Url(image.blob);
                imagesUrls.push(base64Url);
            }
        }

        return { imagesUrls, info: 'Image created' };

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
        const buffer = Buffer.from(await blob.arrayBuffer());
        return "data:" + blob.type + ';base64,' + buffer.toString('base64');
    }

    private async resolvePipelineDependencies(pipelineData: string, pipelineDependencies: ComfyPipelineDependencies) {
        const argumentToValue = new Map<string, string>();

        const { images } = pipelineDependencies;
        if (images !== undefined) {
            const imageNameToImage = Object.entries<string>(JSON.parse(images));
            for (const [imageName, image] of imageNameToImage) {
                const response: UploadImageResult = await this._comfyClient.uploadImage(Buffer.from(image, 'base64'), imageName);
                argumentToValue.set(imageName, response.name);
            }
        }

        for (const [argument, value] of argumentToValue) {
            pipelineData.replace(argument, value);
        }
    }
}