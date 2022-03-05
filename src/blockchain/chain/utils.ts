import { createConnection } from "typeorm";
import { BlockChain as BlockChainEntity } from "../../entity/Blockchain";

export const createConnectionDb = (fileName: string) =>
  createConnection({
    type: "sqlite",
    database: fileName,
    entities: [BlockChainEntity],
    synchronize: true,
  });
