import { parseSessionManagerOptions, SessionManager } from './SessionManager.js';

const sessionManagerOptions = parseSessionManagerOptions();
const sessionManager = new SessionManager({ ...sessionManagerOptions, inferenceServerType: 'comfyUI' });

const comfyPipeline = {
    "9": {
        "inputs": {
            "filename_prefix": "ComfyUI",
            "images": [
                "10",
                0
            ]
        },
        "class_type": "SaveImage"
    },
    "10": {
        "inputs": {
            "image": "image.png",
            "upload": "image"
        },
        "class_type": "LoadImage"
    }
};

const comfyImages = {
    "image.png": "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
}

sessionManager.sendTestTask({
    taskId: 'test', 
    comfyOptions: {
        pipelineData: JSON.stringify(comfyPipeline),
        pipelineImages: JSON.stringify(comfyImages),
    }
})