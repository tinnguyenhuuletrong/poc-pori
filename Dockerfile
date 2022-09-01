# syntax=docker/dockerfile:1

FROM node:14
ENV NODE_ENV=production

ENV TZ="Asia/Saigon"
ARG ARCHIVE_PASS

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY ./archived/repo_backup.zip ./archived/repo_backup.zip
RUN unzip -P ${ARCHIVE_PASS} ./archived/repo_backup.zip -d ./archived

COPY ./dist/packages/examples/simple-tele-bot ./dist/packages/examples/simple-tele-bot

CMD [ "node", "./dist/packages/examples/simple-tele-bot/main.js" ]