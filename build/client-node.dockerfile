ARG INFERENCE_IMAGE
ARG INFERENCE_TAG

FROM ${INFERENCE_IMAGE}:${INFERENCE_TAG}


################################## install curl & jq ####################################
RUN apt-get update \
    && apt install -y curl \ 
    && apt install -y jq


############################### install node & npm & yarn ###############################
ENV NODE_VERSION=20.9.0
ENV NVM_DIR=/root/.nvm
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
RUN npm install -g yarn


###################################### build node #######################################
WORKDIR /genai-node

COPY client-package/package.json .
COPY client-package/yarn.lock .
RUN yarn install

# dirty hack to make node-sd-webui work with our imports,
# remove when we replace library node-sd-webui
RUN jq '. + { "type": "module" }' node_modules/node-sd-webui/package.json > temp.json \
    && mv temp.json node_modules/node-sd-webui/package.json

COPY client-package .
RUN yarn build


################################### configure comfyUI ###################################
COPY build .
