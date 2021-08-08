FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN apk add --no-cache --virtual .gyp python3 make g++ \
    && npm ci \
    && apk del .gyp
#RUN npm ci

COPY src src
COPY .commithash ./

RUN npm run build

EXPOSE 80
EXPOSE 443

CMD ["node", "dist/index.js"]

