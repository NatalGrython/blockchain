import { createServer } from "net";
import { loadChain } from "blockchain";

const GET_BALANCE = "GET_BALANCE";

type GetBalanceAction = {
  type: typeof GET_BALANCE;
  address: string;
};

type Action = GetBalanceAction;

const getChain = (fileName: string) => {};

const server = createServer();

server.listen(5000, "localhost", () => {
  console.log("tcp started");
});

const getData = async (action: Action) => {
  try {
    const { blockchain, close } = await loadChain("index.sqlite");

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
  socket.on("data", async (data) => {
    try {
      console.log("work");
      const action = JSON.parse(data.toString("utf-8")) as Action;
      socket.write(await getData(action));
    } catch (error) {
      socket.write(error.message);
    }
  });
});
