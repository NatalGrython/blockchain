import express from "express";
import { readFile } from "fs/promises";
import { Socket } from "net";
import bodyParser from "body-parser";

const getAddresses = async () => {
  const file = await readFile("../../addresses.json", "utf-8");
  const json = JSON.parse(file) as {
    addresses: { host: string; port: number }[];
  };
  return json.addresses;
};

const app = express();

app.use(bodyParser.json());

const GET_BALANCE = "GET_BALANCE";

type GetBalanceAction = {
  type: typeof GET_BALANCE;
  address: string;
};

type Action = GetBalanceAction;

app.get("/balance", async (req, res) => {
  const { address } = req.body;

  const addresses = await getAddresses();

  const data = {};

  console.log(addresses);
  for (const { host, port } of addresses) {
    const balance = await getSocketInfo(port, host, {
      type: "GET_BALANCE",
      address,
    });
    data[`${host}:${port}`] = balance;
    console.log(data);
  }

  res.send(data);
});

app.listen(3000, () => {
  console.log("server started");
});

const getSocketInfo = (port: number, host: string, action: Action) =>
  new Promise((resolve, reject) => {
    const client = new Socket();

    client.connect(port, host, () => {
      console.log("connc");
    });

    client.on("data", (data) => {
      resolve(data.toString("utf-8"));
    });

    client.on("error", (error) => {
      reject(error);
    });

    client.write(JSON.stringify(action));
  });
