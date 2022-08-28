
FROM node:18 as build

WORKDIR /app

COPY tsconfig.json ./
COPY package*.json ./

RUN npm ci --ignore-scripts=true

COPY src src
COPY imageenv.json ./
COPY rollup.config.js ./

RUN npm run build

#FROM rust:1.63-alpine as prisma
#
#ENV RUSTFLAGS="-C target-feature=-crt-static"
#
#RUN apk --no-cache add openssl direnv git musl-dev openssl-dev build-base perl protoc
#RUN git clone --depth=1 --branch=3.12.0 https://github.com/prisma/prisma-engines.git /prisma && cd /prisma
#
#WORKDIR /prisma
#
#RUN cargo build --release

FROM node:18 as deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma prisma

#RUN apt-get update
#RUN apt-get install -y openssl
#
#ENV PRISMA_QUERY_ENGINE_BINARY=/prisma-engines/query-engine \
#  PRISMA_MIGRATION_ENGINE_BINARY=/prisma-engines/migration-engine \
#  PRISMA_INTROSPECTION_ENGINE_BINARY=/prisma-engines/introspection-engine \
#  PRISMA_FMT_BINARY=/prisma-engines/prisma-fmt \
#  PRISMA_CLI_QUERY_ENGINE_TYPE=binary \
#  PRISMA_CLIENT_ENGINE_TYPE=binary
#
#COPY --from=prisma /prisma/target/release/query-engine /prisma/target/release/migration-engine /prisma/target/release/introspection-engine /prisma/target/release/prisma-fmt  /prisma-engines/

RUN npx prisma generate

FROM gcr.io/distroless/nodejs:18-debug
#FROM node:18-slim

WORKDIR /app

COPY package*.json ./
COPY prisma prisma

COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 80
EXPOSE 443

#RUN ./node_modules/prisma/build/index.js generate
#RUN ["/app/node_modules/prisma/build/index.js", "generate"]

#RUN ["./node_modules/prisma/build/index.js", "generate"]

#CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
CMD ["--enable-source-maps", "./dist/index.mjs"]

