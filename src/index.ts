import {
  Block,
  createUser,
  loadChain,
  loadUser,
  newChain,
} from "blockchain-library";
import { createServer } from "net";
import { parseAction, reduceAction } from "./actions";
import { isFileExist } from "./utils";
import { appendFile, readFile } from "fs/promises";

const PORT = process.env.PORT || 3000;
// const HOST = process.env.HOST || "localhost";
const DB = process.env.DB || "index.sqlite";

const createOrLoadOwner = async () => {
  if (!(await isFileExist("owner.json"))) {
    const user = await createUser();
    const userData = JSON.stringify({
      address: user.stringAddress,
      privateKey: user.stringPrivate,
    });
    await appendFile("owner.json", userData, "utf-8");
    return user;
  }

  const file = await readFile("owner.json", "utf-8");

  const userJSON = JSON.parse(file);

  const user = loadUser(userJSON.address, userJSON.privateKey);
  return user;
};

const createBlockChain = async () => {
  const owner = await createOrLoadOwner();
  if (!(await isFileExist(DB))) {
    await newChain(DB, owner.stringAddress);
  }
  return { blockchain: await loadChain(DB), owner };
};

const server = createServer();

server.on("connection", async (socket) => {
  socket.on("data", async (data) => {
    const { blockchain, owner } = await createBlockChain();
    const action = parseAction(data);

    const response = await reduceAction(action, blockchain, owner);
    socket.write(response);
  });
});

server.listen(Number(PORT), () => {
  console.log(`Server listen tcp://${PORT}`);
});
