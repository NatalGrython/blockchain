FROM node:latest

WORKDIR /node

COPY . /node

RUN npm i 

ARG PORT=5000

ARG DB='index.sqlite'

ENV PORT=${PORT} HOST=${HOST} DB=${DB}

EXPOSE 5000

CMD npm run dev