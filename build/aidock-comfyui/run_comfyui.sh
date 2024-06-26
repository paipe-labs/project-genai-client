#!/bin/bash

if $CPU; then
    # Running on CPU
    export WEB_ENABLE_AUTH=false
    init.sh
else 
    # Running on GPU    
    script="/opt/ai-dock/bin/provisioning.sh"
    default_script="/genai-node/aidock-comfyui/default.sh"
    if [[ -n  $PROVISIONING_SCRIPT ]]; then
        curl -L -o ${file} ${PROVISIONING_SCRIPT}
    else 
        cp ${default_script} ${file}
    fi
    export WEB_ENABLE_AUTH=false
    init.sh
fi
