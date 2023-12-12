FROM node:20-alpine3.18

WORKDIR /genai-node

COPY package.json .
COPY package-lock.json .

RUN npm install
COPY . .

RUN npm run build

ENTRYPOINT [ "node", "public/index.js" ]