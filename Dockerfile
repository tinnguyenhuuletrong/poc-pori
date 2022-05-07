# syntax=docker/dockerfile:1

FROM node:14
ENV NODE_ENV=production

ENV TZ="Asia/Saigon"

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY ./dist ./dist
COPY ./archived/repo ./archived/repo

CMD [ "node", "./dist/packages/examples/simple-tele-bot/main.js" ]