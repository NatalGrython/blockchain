import { Server, WebSocket } from "ws";

const webSocketServer = new Server({ port: 3000 });

const LOADING_CHAIN = "LOADING_CHAIN";

type LoadingChainActionType = {
  type: "LOADING_CHAIN";
};

type Action = LoadingChainActionType;

const deserializeMessage = <T>(data: Buffer) => {
  const stringData = data.toString("utf8");
  const deserializedData = JSON.parse(stringData) as T;
  return deserializedData;
};

const connectionListener = (wsClient: WebSocket) => {
  wsClient.on("message", (data) => {
    if (data instanceof Buffer) {
      const action = deserializeMessage<LoadingChainActionType>(data);
      switch (action.type) {
        case LOADING_CHAIN: {
          wsClient.send("LOADING_CHAIN");
          break;
        }
        default:
          wsClient.send("Fuck you");
      }
    }
  });
};

webSocketServer.addListener("connection", connectionListener);
