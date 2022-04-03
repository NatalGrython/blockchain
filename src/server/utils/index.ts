import { createUser, loadUser, newChain, loadChain } from "blockchain-library";
import { access, appendFile, readFile } from "fs/promises";
import { OWNER, DB } from "../../constants/system";

export const isFileExist = async (fileName: string) => {
  try {
    await access(fileName);
    return true;
  } catch (error) {
    return false;
  }
};

export const createOrLoadOwner = async () => {
  if (!(await isFileExist(OWNER))) {
    const user = await createUser();
    const userData = JSON.stringify({
      address: user.stringAddress,
      privateKey: user.stringPrivate,
    });
    await appendFile(OWNER, userData, "utf-8");
    return user;
  }

  const file = await readFile(OWNER, "utf-8");

  const userJSON = JSON.parse(file);

  const user = loadUser(userJSON.address, userJSON.privateKey);
  return user;
};

export const createBlockChain = async () => {
  const owner = await createOrLoadOwner();
  if (!(await isFileExist(DB))) {
    await newChain(DB, owner.stringAddress);
  }
  return { blockchain: await loadChain(DB), owner };
};
