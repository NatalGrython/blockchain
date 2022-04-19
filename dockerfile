FROM node:latest

WORKDIR /node

COPY . /node

RUN npm i

RUN npm install sqlite3 --save

ENV OWNER_PATH=owner.json 
ENV DATABASE_PATH=index.sqlite
ENV PROXY_HOST=localhost
ENV PROXY_PORT=3000
ENV HOST=localhost
ENV MICROSERVICE_PORT=1907
ENV MICROSERVICE_DEV_PORT=1907 
ENV CLIENT_PORT=3000

EXPOSE 3000

CMD npm run start:dev