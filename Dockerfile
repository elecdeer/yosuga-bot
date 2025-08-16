
FROM node:24 AS build

WORKDIR /app

COPY tsconfig.json ./
COPY package*.json ./

ENV NODE_ENV=production
RUN npm ci

COPY src src
COPY imageenv.json ./

FROM node:24-slim AS runtime
COPY --from=build /app /app
WORKDIR /app

EXPOSE 80
EXPOSE 443

CMD ["node_modules/vite-node/vite-node.mjs", "src/index.ts"]
