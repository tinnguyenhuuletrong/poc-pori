# syntax=docker/dockerfile:1

FROM node:14-slim
ENV NODE_ENV=production

ENV TZ="Asia/Saigon"

WORKDIR /app

COPY ./archived/repo ./archived/repo
COPY ./dist/packages/examples/simple-tele-bot ./dist/packages/examples/simple-tele-bot
RUN cd ./dist/packages/examples/simple-tele-bot && npm install --production

CMD [ "node", "./dist/packages/examples/simple-tele-bot/main.js" ]