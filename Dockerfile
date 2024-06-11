# syntax = docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install -g pm2

RUN yarn install

RUN yarn build:css

EXPOSE 3000
CMD ["yarn", "start"]