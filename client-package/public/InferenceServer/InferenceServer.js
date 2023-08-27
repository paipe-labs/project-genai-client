export const DefaultImageGenerationOptions = {
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
