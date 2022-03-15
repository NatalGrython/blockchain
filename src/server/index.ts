import { EventEmitter } from "events";
import { Server } from "ws";
import { loadChain, newChain, serializeBlockJSON } from "blockchain";
import { checkExistsFile } from "blockchain";

const HOST = "localhost";
const PORT = 3000;

const server = new Server({ port: PORT, host: HOST });

const ee = new EventEmitter();

const createBlockChain = async (fileName: string) => {
  if (!(await checkExistsFile(fileName))) {
    await newChain(fileName, "not");
  }

  return await loadChain(fileName);
};

server.on("connection", (socket) => {
  socket.on("open", () => {
    socket.send("Hello");
  });

  socket.on("message", async (data) => {
    if (data instanceof Buffer) {
      const { fileName } = JSON.parse(data.toString("utf-8"));
      if (fileName) {
        const { blockchain, close } = await createBlockChain(fileName);

        const allChain = await blockchain.getAllChain();

        socket.send(
          JSON.stringify({ blocks: allChain.blocks.map(serializeBlockJSON) })
        );

        await close();
      }
    }
  });

  socket.send("Lol");
});
