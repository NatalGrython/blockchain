import { createServer } from "net";
import { loadChain } from "blockchain";

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || "localhost";
const DB = process.env.DB || "index.sqlite";

const GET_BALANCE = "GET_BALANCE";

type GetBalanceAction = {
  type: typeof GET_BALANCE;
  address: string;
};

type Action = GetBalanceAction;

const server = createServer();

server.listen(Number(PORT), HOST, () => {
  console.log(`tcp started ${HOST}:${PORT}`);
});

const getData = async (action: Action) => {
  try {
    const { blockchain, close } = await loadChain(DB);
    let data;
    switch (action.type) {
      case GET_BALANCE:
        data = await blockchain.getBalance(
          action.address,
          await blockchain.size()
        );
    }

    await close();
    return JSON.stringify(data);
  } catch (error) {
    throw new Error(error);
  }
};

server.on("connection", (socket) => {
  console.log("connect");
  socket.on("data", async (data) => {
    try {
      console.log("data");
      const action = JSON.parse(data.toString("utf-8")) as Action;
      socket.write(await getData(action));
    } catch (error) {
      socket.write(error.message);
    }
  });
});
