
FROM node:18 as build

WORKDIR /app

COPY tsconfig.json ./
COPY package*.json ./

ENV NODE_ENV=production
RUN npm ci --omit=dev

COPY src src
COPY imageenv.json ./

FROM gcr.io/distroless/nodejs:18
COPY --from=build /app /app
WORKDIR /app

EXPOSE 80
EXPOSE 443

CMD ["node_modules/vite-node/vite-node.mjs", "src/index.ts"]

