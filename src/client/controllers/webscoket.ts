import { WebSocket } from "ws";
import { SERVER_PORT } from "../../constants/system";
import { eventEmitter } from "../events";
import { getSocketInfo } from "../../utils";

export const onConnect = (socket: WebSocket) => {
  const interval = setInterval(async () => {
    const blocks = await getSocketInfo(SERVER_PORT, "localhost", {
      type: "GET_FULL_CHAIN",
    });
    socket.send(
      JSON.stringify({ type: "GET_FULL_CHAIN", blocks: JSON.parse(blocks) })
    );
  }, 5000);

  eventEmitter.on("event", (event) => {
    socket.send(JSON.stringify(event));
  });

  socket.on("close", () => {
    clearInterval(interval);
  });
};
