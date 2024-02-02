FROM node:20-alpine3.18

RUN apk update && apk add jq

WORKDIR /genai-node

COPY client-package/package.json .
COPY client-package/yarn.lock .

RUN yarn install

# Dirty hack to make node-sd-webui work with our imports,
# remove when we replace library node-sd-webui
RUN jq '. + { "type": "module" }' node_modules/node-sd-webui/package.json > temp.json \
   && mv temp.json node_modules/node-sd-webui/package.json

COPY client-package .

RUN yarn build

#ENTRYPOINT [ "npx", "ts-node", "public/run.js" ]
