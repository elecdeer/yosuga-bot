
FROM node:18 as build

WORKDIR /app

COPY tsconfig.json ./
COPY package*.json ./

RUN npm ci

COPY src src
COPY imageenv.json ./
COPY rollup.config.js ./

RUN npm run build


FROM node:18-slim as node


FROM ubuntu:jammy as base

ENV NODE_ENV=production
COPY --from=node /usr/local/include/ /usr/local/include/
COPY --from=node /usr/local/lib/ /usr/local/lib/
COPY --from=node /usr/local/bin/ /usr/local/bin/
RUN corepack disable && corepack enable

RUN apt update && apt install -y openssl

RUN groupadd --gid 1000 node \
    && useradd --uid 1000 --gid node --shell /bin/bash --create-home node


FROM base as deps

RUN apt install -y python3 make g++

WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --omit=dev


FROM base as prod

USER node

WORKDIR /app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

ENV NODE_ENV=production


#EXPOSE 80
#EXPOSE 443

CMD ["node", "--enable-source-maps", "./dist/index.mjs"]

