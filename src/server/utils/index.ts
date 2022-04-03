import { createUser, loadUser, newChain, loadChain } from "blockchain-library";
import { access, appendFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { OWNER, DB } from "../../constants/system";
import { fileURLToPath } from "url";

//@ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const isFileExist = async (fileName: string) => {
  try {
    await access(fileName);
    return true;
  } catch (error) {
    return false;
  }
};

export const createOrLoadOwner = async () => {
  const ownerPath = join(__dirname, "..", "..", "public", OWNER);
  if (!(await isFileExist(ownerPath))) {
    const user = await createUser();
    const userData = JSON.stringify({
      address: user.stringAddress,
      privateKey: user.stringPrivate,
    });
    await appendFile(ownerPath, userData, "utf-8");
    return user;
  }

  const file = await readFile(OWNER, "utf-8");

  const userJSON = JSON.parse(file);

  const user = loadUser(userJSON.address, userJSON.privateKey);
  return user;
};

export const createBlockChain = async () => {
  const owner = await createOrLoadOwner();
  const dbPath = join(__dirname, "..", "..", "public", DB);
  if (!(await isFileExist(dbPath))) {
    await newChain(dbPath, owner.stringAddress);
  }
  return { blockchain: await loadChain(DB), owner };
};
