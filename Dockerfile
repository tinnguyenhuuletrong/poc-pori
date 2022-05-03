# syntax=docker/dockerfile:1

FROM node:14
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY ./dist/packages/examples/simple-tele-bot .

CMD [ "node", "main.js" ]