import { access } from "fs/promises";
import { createConnection } from "typeorm";
import { BlockChain as BlockChainEntity } from "../entity/Blockchain";

export const createConnectionDb = (fileName: string) =>
  createConnection({
    type: "sqlite",
    database: fileName,
    entities: [BlockChainEntity],
    synchronize: true,
  });

export const checkExistsFile = async (fileName: string) => {
  try {
    await access(fileName);
    return true;
  } catch (error) {
    return false;
  }
};
