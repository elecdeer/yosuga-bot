FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN apk add --no-cache --virtual .gyp python3 make g++ \
    && npm ci \
    && apk del .gyp

COPY src src
COPY imageenv.json ./

RUN npm run build

EXPOSE 80
EXPOSE 443

CMD ["node", "dist/index.js"]

