import { createUser, loadChain, loadUser, newChain } from "blockchain-library";
import { createServer } from "net";
import { parseAction, reduceAction } from "./actions";
import { isFileExist } from "./utils";
import { appendFile, readFile } from "fs/promises";
import { WebSocketServer } from "ws";
import { EventEmitter } from "events";

const PORT = process.env.PORT;
const DB = process.env.DB;
const OWNER = process.env.OWNER;

const emitter = new EventEmitter();

const createOrLoadOwner = async () => {
  if (!(await isFileExist(OWNER))) {
    const user = await createUser();
    const userData = JSON.stringify({
      address: user.stringAddress,
      privateKey: user.stringPrivate,
    });
    await appendFile(OWNER, userData, "utf-8");
    return user;
  }

  const file = await readFile(OWNER, "utf-8");

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

    const response = await reduceAction(action, blockchain, owner, emitter);
    socket.write(response);
  });
});

server.listen(Number(PORT), () => {
  console.log(`Server listen tcp://${PORT}`);
});

const wsServer = new WebSocketServer({ port: Number(PORT) + 1 });

wsServer.on("connection", (socket) => {
  emitter.on("event", (event) => {
    socket.send(JSON.stringify(event));
  });
});
