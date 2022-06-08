
FROM node:18 as build

WORKDIR /app

COPY tsconfig.json ./
COPY package*.json ./

RUN npm ci

COPY src src
COPY imageenv.json ./

RUN npm run build

FROM gcr.io/distroless/nodejs:18
COPY --from=build /app /app
WORKDIR /app

EXPOSE 80
EXPOSE 443

CMD ["dist/index.js"]

