import express from "express";
import bodyParser from "body-parser";
import coreRouter from "./routes";
import { createServer } from "http";
import {
  CLIENT_PORT,
  HOST_IP,
  PROXY_HOST,
  PROXY_PORT,
} from "../constants/system";
import { WebSocketServer } from "ws";
import { onConnect } from "./controllers/webscoket";
import axios from "axios";

const app = express();

const server = createServer(app);

const wsServer = new WebSocketServer({ server, path: "/events" });

wsServer.on("connection", onConnect);

app.use(bodyParser.json());

app.use("/", coreRouter);

server.listen(CLIENT_PORT, () => {
  console.log(`Server started http://localhost:${CLIENT_PORT}`);
  console.log({
    PROXY_HOST,
    PROXY_PORT,
  });
  axios
    .post(`http://${PROXY_HOST}:${PROXY_PORT}/node`, {
      address: HOST_IP,
      port: CLIENT_PORT,
    })
    .then(() => {
      console.log("Node register");
    });
});

process.on("beforeExit", () => {
  axios
    .post(`http://${PROXY_HOST}:${PROXY_PORT}/node/delete`, {
      address: HOST_IP,
      port: CLIENT_PORT,
    })
    .then(() => {
      console.log("Node delete");
    });
});
