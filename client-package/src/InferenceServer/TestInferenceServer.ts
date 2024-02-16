import { DefaultImageGenerationOptions, ImageGenerationOptions, ImageGenerationResponse, InferenceServer } from "./InferenceServer.js";

export class TestInferenceServer implements InferenceServer {

    async connectInference(): Promise<void> {
        return;
    }

    async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResponse> {
        console.log('Attempt to generate image with test inference server', options);

        //dummy promise that waits for 1 second and returns a string
        const images = await new Promise<string[]>((resolve, reject) => {
            setTimeout(() => {
                resolve(["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"]);
            }, 1000);
        });

        return { imagesUrls: images, info: 'Nice cats' };

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