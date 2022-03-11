import express from "express";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { createUser, loadUser } from "../blockchain";

const PORT = 3000;
const HOST = "localhost";

const app = express();

app.get("/user", async (req, res) => {
  const user = await createUser();
  res.status(201).json({
    address: user.stringAddress,
    privateKey: user.stringPrivate,
  });
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
