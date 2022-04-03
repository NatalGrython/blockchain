import { WebSocketServer } from "ws";
import { PORT, SYSTEM_PORT } from "../constants/system";
import { eventEmitter } from "../events";
import { getSocketInfo } from "../utils";

const wsServer = new WebSocketServer({ port: PORT });

wsServer.on("connection", async (socket) => {
  const interval = setInterval(async () => {
    const blocks = await getSocketInfo(SYSTEM_PORT, "localhost", {
      type: "GET_FULL_CHAIN",
    });
    socket.send(blocks);
  }, 5000);

  eventEmitter.on("event", (event) => {
    socket.send(JSON.stringify(event));
  });

  socket.on("close", () => {
    clearInterval(interval);
  });
});
