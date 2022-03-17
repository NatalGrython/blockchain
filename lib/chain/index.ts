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
  public fileName: string; //Repository<BlockChainEntity>
  public index: number = 0;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  async getBalance(address: string, size: number) {
    const connection = await createConnectionDb(this.fileName);
    const repository = connection.getRepository(BlockChainEntity);
    const blocks = await repository.find();

    const block = blocks[size];
    const serializeBlock = deserializeBlock(block.block);

    await connection.close();
    if (serializeBlock.mappingData[address]) {
      return serializeBlock.mappingData[address];
    }
    return 0;
  }

  async addNewBlock(block: Block) {
    const connection = await createConnectionDb(this.fileName);
    const repository = connection.getRepository(BlockChainEntity);
    const newBlock = new BlockChainEntity();
    newBlock.block = serializeBlock(block);
    newBlock.hash = block.currentHash;
    await repository.save(newBlock);
    this.index++;
    await connection.close();
  }

  async size() {
    const connection = await createConnectionDb(this.fileName);
    const repository = connection.getRepository(BlockChainEntity);
    const data = await repository.find();
    await connection.close();
    return data.length - 1;
  }

  async lastHash() {
    const connection = await createConnectionDb(this.fileName);
    const repository = connection.getRepository(BlockChainEntity);
    const allBlocks = await repository.find();
    await connection.close();
    return allBlocks[allBlocks.length - 1].hash;
  }

  async getAllChain() {
    const connection = await createConnectionDb(this.fileName);
    const repository = connection.getRepository(BlockChainEntity);
    const allBlocks = await repository.find();
    const serializeBlocks = allBlocks.map((item) =>
      deserializeBlock(item.block)
    );
    await connection.close();
    return { blocks: serializeBlocks };
  }
}

export const newChain = async (fileName: string, receiver: string) => {
  try {
    if (await checkExistsFile(fileName)) {
      throw new Error("File exist");
    }
    await appendFile(fileName, "");
    const blockchain = new BlockChain(fileName);
    const genesisBlock = new Block(receiver, GENESIS_BLOCK);
    genesisBlock.mappingData[STORAGE_CHAIN] = STORAGE_VALUE;
    genesisBlock.mappingData[receiver] = GENESIS_REWARD;
    genesisBlock.currentHash = genesisBlock.hash();
    await blockchain.addNewBlock(genesisBlock);
  } catch (error) {
    console.error(error);
    throw new Error("Chain is not created");
  }
};

export const loadChain = async (fileName: string) => {
  try {
    const blockchain = new BlockChain(fileName);
    blockchain.index = await blockchain.size();
    return blockchain;
  } catch (error) {
    console.error(error);
    throw new Error("Chain is not loaded");
  }
};
