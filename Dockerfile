FROM node:13-alpine

COPY package*.json /app/
COPY tsconfig.json /app/

WORKDIR /app

RUN npm install

COPY /src /src

RUN npm run build

EXPOSE 80
EXPOSE 443
CMD ["node", "dist/index.js"]

