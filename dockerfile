FROM node:latest

WORKDIR /node

COPY . /node

RUN npm i

# RUN npm run build
RUN npm install sqlite3 --save

# ARG CLIENT_PORT=3000
# ARG SERVER_PORT=1907
# ARG DB='index.sqlite'
# ARG OWNER='owner.json'
# ARG PROXY_HOST='localhost'
# ARG PROXY_PORT=5000
# ARG HOST_IP='docker.host.internal'


# ENV CLIENT_PORT=${CLIENT_PORT} DB=${DB} OWNER=${OWNER} SERVER_PORT=${SERVER_PORT} PROXY_HOST=${PROXY_HOST} PROXY_PORT=${PROXY_PORT} HOST_IP=${HOST_IP}
EXPOSE 3000

CMD npm run start:dev