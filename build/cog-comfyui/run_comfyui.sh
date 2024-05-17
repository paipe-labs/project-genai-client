#!/bin/bash

if $CPU; then
    # Running on CPU
    python /src/ComfyUI/main.py --cpu
else 
    # Running on GPU    
    python /src/ComfyUI/main.py
fi
