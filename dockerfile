FROM node:latest

WORKDIR /node

COPY . /node

RUN npm i

RUN npm install sqlite3 --save

RUN npm run build

CMD npm run start:prod