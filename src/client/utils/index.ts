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

export const getSocketInfo = <T>(port: number, host: string, action: Action) =>
  new Promise<T>((resolve, reject) => {
    const client = new Socket();

    client.connect(port, host);

    client.on("data", (data) => {
      resolve(data.toString("utf-8"));
    });

    client.on("error", (error) => {
      reject(error);
    });

    client.setTimeout(5000);

    client.on("timeout", () => {
      client.end();
      reject(new Error("Timeout"));
    });

    client.write(JSON.stringify(action));
  });
