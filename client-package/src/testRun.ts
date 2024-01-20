import { parseSessionManagerOptions, SessionManager } from './SessionManager.js';

const sessionManagerOptions = parseSessionManagerOptions();
const sessionManager = new SessionManager({ ...sessionManagerOptions, inferenceServerType: 'comfyUI' });

const comfyPipeline = {
    "3": {
        "inputs": {
            "seed": 982636331365580,
            "steps": 25,
            "cfg": 8,
            "sampler_name": "ddim",
            "scheduler": "normal",
            "denoise": 1,
            "model": [
                "4",
                0
            ],
            "positive": [
                "6",
                0
            ],
            "negative": [
                "7",
                0
            ],
            "latent_image": [
                "5",
                0
            ]
        },
        "class_type": "KSampler"
    },
    "4": {
        "inputs": {
            "ckpt_name": "hassakuModel_v12.safetensors"
        },
        "class_type": "CheckpointLoaderSimple"
    },
    "5": {
        "inputs": {
            "width": 512,
            "height": 768,
            "batch_size": 1
        },
        "class_type": "EmptyLatentImage"
    },
    "6": {
        "inputs": {
            "text": "beautiful scenery nature, 1 girl, orange hair, portrait, closeup",
            "clip": [
                "4",
                1
            ]
        },
        "class_type": "CLIPTextEncode"
    },
    "7": {
        "inputs": {
            "text": "text, watermark, bad quality, nsfw",
            "clip": [
                "4",
                1
            ]
        },
        "class_type": "CLIPTextEncode"
    },
    "8": {
        "inputs": {
            "samples": [
                "3",
                0
            ],
            "vae": [
                "4",
                2
            ]
        },
        "class_type": "VAEDecode"
    },
    "9": {
        "inputs": {
            "filename_prefix": "ComfyUI",
            "images": [
                "8",
                0
            ]
        },
        "class_type": "SaveImage"
    }
};

sessionManager.sendTestTask({
    taskId: 'test', 
    comfyOptions: {
        pipelineData: JSON.stringify(comfyPipeline)
    }
})