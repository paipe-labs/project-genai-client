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
            "image": "paipe://input_image",
            "upload": "image"
        },
        "class_type": "LoadImage"
    }
};

const images = {
    "paipe://input_image": "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"
}

sessionManager.sendTestTask({
    options: null,
    comfyOptions: {
        pipelineData: JSON.stringify(comfyPipeline),
        pipelineDependencies: {
            images: JSON.stringify(images)
        },
    },
    taskId: 'test',
})