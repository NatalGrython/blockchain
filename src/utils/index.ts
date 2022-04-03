import { Socket } from "net";
import { Action } from "../types/actions";

export const getSocketInfo = (port: number, host: string, action: Action) =>
  new Promise<string>((resolve) => {
    const client = new Socket();

    client.connect(port, host, () => {
      console.log("connect " + port + " " + host + " " + action.type);
    });

    client.on("data", (data) => {
      resolve(data.toString("utf-8"));
    });

    client.on("error", (error) => {
      resolve("fail" + error.message);
    });
    client.write(JSON.stringify(action));
  });
