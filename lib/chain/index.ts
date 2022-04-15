import { appendFile } from "fs/promises";
import {
  GENESIS_BLOCK,
  STORAGE_CHAIN,
  STORAGE_VALUE,
  GENESIS_REWARD,
} from "./constants";
import { BlockChainEntity } from "../entity/Blockchain";
import {
  checkExistsFile,
  createConnectionDb,
  deserializeBlock,
  serializeBlock,
} from "./utils";
import { Block } from "../block";
import {
  ChainNotCreatedError,
  FileExistError,
  ChainNotLoadedError,
  ConnectionError,
} from "../errors";
export {
  deserializeBlock,
  serializeBlock,
  deserializeTransaction,
  serializeTransaction,
  serializeBlockJSON,
  serializeTransactionJSON,
  checkExistsFile,
  createConnectionDb,
} from "./utils";

export class BlockChain {
  public fileName: string;
  public index: number = 0;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  async getBalance(address: string) {
    try {
      const connection = await createConnectionDb(this.fileName);
      const repository = connection.getRepository(BlockChainEntity);
      const blocks = await repository.find();
      await connection.close();

      const findBlocks = blocks.reverse();

      for (const block of findBlocks) {
        const serializeBlock = deserializeBlock(block.block);
        if (serializeBlock.mappingData.has(address)) {
          return serializeBlock.mappingData.get(address);
        }
      }

      return 0;
    } catch (error) {
      throw new ConnectionError(error);
    }
  }

  async addNewBlock(block: Block) {
    try {
      const connection = await createConnectionDb(this.fileName);
      const repository = connection.getRepository(BlockChainEntity);
      const newBlock = new BlockChainEntity();
      newBlock.block = serializeBlock(block);
      newBlock.hash = block.currentHash;
      await repository.save(newBlock);
      this.index++;
      await connection.close();
    } catch (error) {
      throw new ConnectionError(error);
    }
  }

  async size() {
    try {
      const connection = await createConnectionDb(this.fileName);
      const repository = connection.getRepository(BlockChainEntity);
      const data = await repository.find();
      await connection.close();
      return data.length;
    } catch (error) {
      throw new ConnectionError(error);
    }
  }

  async lastHash() {
    try {
      const connection = await createConnectionDb(this.fileName);
      const repository = connection.getRepository(BlockChainEntity);
      const allBlocks = await repository.find();
      const hash = allBlocks[allBlocks.length - 1].hash;
      await connection.close();
      return hash;
    } catch (error) {
      throw new ConnectionError(error);
    }
  }

  async getAllChain() {
    try {
      const connection = await createConnectionDb(this.fileName);
      const repository = connection.getRepository(BlockChainEntity);
      const allBlocks = await repository.find();
      const serializeBlocks = allBlocks.map((item) =>
        deserializeBlock(item.block)
      );
      await connection.close();

      return { blocks: serializeBlocks };
    } catch (error) {
      throw new ConnectionError(error);
    }
  }
}

export const newChain = async (fileName: string, receiver: string) => {
  try {
    if (await checkExistsFile(fileName)) {
      throw new FileExistError(fileName);
    }
    await appendFile(fileName, "");
    const blockchain = new BlockChain(fileName);
    const genesisBlock = new Block(receiver, GENESIS_BLOCK);
    genesisBlock.mappingData.set(STORAGE_CHAIN, STORAGE_VALUE);
    genesisBlock.mappingData.set(receiver, GENESIS_REWARD);
    genesisBlock.currentHash = genesisBlock.hash();
    await blockchain.addNewBlock(genesisBlock);
  } catch (error) {
    throw new ChainNotCreatedError(fileName, error);
  }
};

export const loadChain = async (fileName: string) => {
  try {
    const blockchain = new BlockChain(fileName);
    blockchain.index = await blockchain.size();
    return blockchain;
  } catch (error) {
    throw new ChainNotLoadedError(fileName, error);
  }
};
