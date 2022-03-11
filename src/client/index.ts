import bodyParser from "body-parser";
import express from "express";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import {
  createBlock,
  createUser,
  loadChain,
  loadUser,
  newChain,
  newTransaction,
} from "../blockchain";
import { deserializeBlock } from "../blockchain/chain";

const PORT = 3000;
const HOST = "localhost";

const app = express();

app.use(bodyParser.json());

app.get("/user", async (req, res) => {
  try {
    const user = await createUser();
    res.status(201).json({
      address: user.stringAddress,
      privateKey: user.stringPrivate,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post("/chain", async (req, res) => {
  const { fileName, address } = req.body;

  try {
    await newChain(fileName, address);

    res.status(201).json({
      message: "ok",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/chain", async (req, res) => {
  const { fileName } = req.body;
  try {
    const { blockchain, close } = await loadChain(fileName);

    res.status(200).json({ ...(await blockchain.getAllChain()) });
    await close();
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post("/transaction", async (req, res) => {
  const { fileName, address, privateKey, to, value } = req.body;
  const { blockchain, close } = await loadChain(fileName);

  const newBlock = createBlock(address, await blockchain.lastHash());

  const user = loadUser(address, privateKey);

  const newTx = newTransaction(
    loadUser(address, privateKey),
    await blockchain.lastHash(),
    to,
    value
  );

  await newBlock.addTransaction(blockchain, newTx);

  await newBlock.accept(blockchain, user);

  await blockchain.addNewBlock(newBlock);

  //   const file = await readFile(
  //     join(__dirname, "..", "..", "addresses.json"),
  //     "utf-8"
  //   );
  //   const fileJson = JSON.parse(file) as { addresses: string[] };

  res.status(201).json(newTx);

  await close();
});

app.post("/block", async (req, res) => {
  const { block, fileName } = req.body;

  const newd = deserializeBlock(block);

  const { blockchain, close } = await loadChain(fileName);

  res.send(
    await newd.isValid(blockchain, await blockchain.getBlockIndex(newd))
  );
  await close();
});

const onConnect = async () => {
  const file = await readFile(
    join(__dirname, "..", "..", "addresses.json"),
    "utf-8"
  );
  const fileJson = JSON.parse(file) as { addresses: string[] };

  if (
    !fileJson.addresses ||
    !fileJson.addresses.length ||
    !fileJson.addresses.includes(`http://${HOST}:${PORT}`)
  ) {
    const newAddreses = [...(fileJson.addresses ?? [])];
    newAddreses.push(`http://${HOST}:${PORT}`);
    const newJSON = JSON.stringify({
      addresses: newAddreses,
    });
    await writeFile(join(__dirname, "..", "..", "addresses.json"), newJSON);
  }
};
app.listen(PORT, HOST, onConnect);
