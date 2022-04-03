import express from "express";
import bodyParser from "body-parser";
import coreRouter from "./routes";
import { createServer } from "http";
import { PORT } from "../constants/system";
import { WebSocketServer } from "ws";
import { onConnect } from "./controllers/webscoket";

const app = express();

const server = createServer(app);

const wsServer = new WebSocketServer({ server, path: "/events" });

wsServer.on("connection", onConnect);

app.use(bodyParser.json());

app.use("/", coreRouter);

server.listen(PORT, () => {
  console.log(`Server started http://localhost:${PORT}`);
});
