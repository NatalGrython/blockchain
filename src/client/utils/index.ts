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

export const getSocketInfo = (port: number, host: string, action: Action) =>
  new Promise<string>((resolve, reject) => {
    const client = new Socket();

    client.connect(port, host, () => {
      console.log("connect");
    });

    client.on("data", (data) => {
      resolve(data.toString("utf-8"));
    });

    client.on("error", (error) => {
      reject(error);
    });
    client.write(JSON.stringify(action));
  });
