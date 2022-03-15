FROM node:latest

COPY . ./node

RUN npm i -g ts-node

ARG PORT=5000
ARG HOST='localhost'
ARG DB='index.sqlite'

ENV PORT=${PORT} HOST=${HOST} DB=${DB}

EXPOSE ${PORT}

CMD ts-node ./node/index.ts