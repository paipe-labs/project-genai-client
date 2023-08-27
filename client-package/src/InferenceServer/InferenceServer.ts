export type ImageGenerationOptions = {
    modelName?: string;
    positivePrompt: string;
    negativePrompt?: string;
    size?: {
        width: number;
        height: number;
    };
    numberOfSteps?: number;
    guidanceScale?: number;
    seed?: number;
    batchSize?: number;
    batchCount?: number;
    textToImage?: {
        imageUrl: string;
    }
};

export type ImageGenerationResponse = {
    imagesUrls: string[];
    info: string;
};

export interface InferenceServer {
    generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse>;
    loadModel(modelName: string): Promise<void>;
    unloadModel(modelName: string): Promise<void>;
    getLoadedModels(): Promise<string[]>;
}

export const DefaultImageGenerationOptions: Required<ImageGenerationOptions> = {
    modelName: 'stabilityai/stable-diffusion-2-1',
    positivePrompt: '',
    negativePrompt: '',
    size: {
        width: 512,
        height: 512,
    },
    numberOfSteps: 25,
    guidanceScale: 8,
    seed: 123,
    batchSize: 1,
    batchCount: 1,
    textToImage: {
        imageUrl: ''
    }
};