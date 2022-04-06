FROM node:latest

WORKDIR /node

COPY . /node

RUN npm i 
RUN npm run build

ARG PORT=3000
ARG DB='index.sqlite'
ARG OWNER='owner.json'

ENV PORT=${PORT} DB=${DB} OWNER=${OWNER}

EXPOSE 3000

CMD npm run docker-dev