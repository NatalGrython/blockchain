import { createServer } from "net";
import { eventEmitter } from "./events";
import { createBlockChain } from "./utils";
import { reduceAction } from "./actions";
import { parseAction } from "./actions/utils";
import { SYSTEM_PORT } from "../constants/system";

const server = createServer();

server.on("connection", async (socket) => {
  socket.on("data", async (data) => {
    const { blockchain, owner } = await createBlockChain();
    const action = parseAction(data);

    const response = await reduceAction(
      action,
      blockchain,
      owner,
      eventEmitter
    );
    socket.write(response);
  });
});

server.listen(Number(SYSTEM_PORT), () => {
  console.info(`Started tcp://localhost:${SYSTEM_PORT}`);
});
