import { Block, loadChain, newChain } from "blockchain-library";
import { createServer } from "net";
import { parseAction, reduceAction } from "./actions";
import { isFileExist } from "./utils";

const PORT = process.env.PORT || 3000;
// const HOST = process.env.HOST || "localhost";
const DB = process.env.DB || "index.sqlite";

const createBlockChain = async () => {
  if (!(await isFileExist(DB))) {
    await newChain(DB, "Universy");
  }
  return await loadChain(DB);
};

const server = createServer();

server.on("connection", async (socket) => {
  socket.on("data", async (data) => {
    const { blockchain, close } = await createBlockChain();
    const action = parseAction(data);

    const response = await reduceAction(action, blockchain);
    socket.write(response);
    await close();
  });
});

server.listen(Number(PORT), () => {
  console.log(`Server listen tcp://${PORT}`);
});
