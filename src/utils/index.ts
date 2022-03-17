import { access } from "fs/promises";
import { Socket } from "net";

export const isFileExist = async (fileName: string) => {
  try {
    await access(fileName);
    return true;
  } catch (error) {
    return false;
  }
};

export const getSocketInfo = (port: number, host: string, action: any) =>
  new Promise<string>((resolve, reject) => {
    const client = new Socket();

    client.connect(port, host, () => {
      console.log("connect" + port + host);
    });

    client.on("data", (data) => {
      resolve(data.toString("utf-8"));
    });

    client.on("error", (error) => {
      resolve("fail" + error.message);
    });
    client.write(JSON.stringify(action));
  });
