#FROM jrottenberg/ffmpeg:4.1-alpine
FROM node:15-alpine
#COPY --from=0 / /


WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./


RUN npm install


COPY src src

#RUN ls -lra

RUN npm run build

EXPOSE 80
EXPOSE 443

CMD ["node", "dist/index.js"]

