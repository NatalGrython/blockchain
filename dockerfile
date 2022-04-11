FROM node:latest

WORKDIR /node

COPY . /node

RUN npm i 
RUN npm run build
RUN npm install sqlite3 --save

ARG CLIENT_PORT=3000
ARG SERVER_PORT=1907
ARG DB='index.sqlite'
ARG OWNER='owner.json'
ARG NET='localhost'


ENV CLIENT_PORT=${CLIENT_PORT} DB=${DB} OWNER=${OWNER} SERVER_PORT=${SERVER_PORT} NET=${NET}
EXPOSE 3000

CMD npm run docker-dev