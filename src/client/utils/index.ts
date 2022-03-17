import { readFile } from "fs/promises";
import { Socket } from "net";
import { Action } from "../actions";

export const getAddresses = async () => {
  const file = await readFile("../../addresses.json", "utf-8");
  const json = JSON.parse(file) as {
    addresses: { host: string; port: number }[];
  };
  return json.addresses;
};

export const getSocketInfo = (
  port: number,
  host: string,
  action: Action,
  signal: AbortSignal
) =>
  new Promise<string>((resolve, reject) => {
    const client = new Socket();

    // if (signal.aborted) {
    //   resolve("fail Timeout");
    //   client.end();
    // }

    // //@ts-ignore
    // signal.addEventListener("abort", () => {
    //   resolve("fail Timeout");
    //   client.end();
    // });

    client.connect(port, host, () => {
      console.log(`connect ${port} ${host} ${action.type}`);
    });

    client.on("data", (data) => {
      resolve(data.toString("utf-8"));
      client.end();
    });

    client.on("error", (error) => {
      resolve(`Fail node ${error.message}`);
      client.end();
    });

    client.write(JSON.stringify(action));
  });
