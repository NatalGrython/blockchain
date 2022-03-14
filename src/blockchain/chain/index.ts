import { appendFile } from "fs/promises";
import { Repository } from "typeorm";
import {
  GENESIS_BLOCK,
  STORAGE_CHAIN,
  STORAGE_VALUE,
  GENESIS_REWARD,
} from "./constants";
import { BlockChain as BlockChainEntity } from "../entity/Blockchain";
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
} from "./utils";

export class BlockChain {
  public repository: Repository<BlockChainEntity>;
  public index: number = 0;

  constructor(repository: Repository<BlockChainEntity>) {
    this.repository = repository;
  }

  async getBalance(address: string, size: number) {
    const blocks = await this.repository.find();

    const block = blocks[size];
    const serializeBlock = deserializeBlock(block.block);

    if (serializeBlock.mappingData[address]) {
      return serializeBlock.mappingData[address];
    }
    return 0;
  }

  async addNewBlock(block: Block) {
    const newBlock = new BlockChainEntity();
    newBlock.block = serializeBlock(block);
    newBlock.hash = block.currentHash;
    await this.repository.save(newBlock);
    this.index++;
  }

  async size() {
    const data = await this.repository.find();
    return data.length - 1;
  }

  async lastHash() {
    const allBlocks = await this.repository.find();
    return allBlocks[allBlocks.length - 1].hash;
  }

  async getAllChain() {
    const allBlocks = await this.repository.find();
    const serializeBlocks = allBlocks.map((item) =>
      deserializeBlock(item.block)
    );
    return { blocks: serializeBlocks };
  }
}

export const newChain = async (fileName: string, receiver: string) => {
  try {
    if (await checkExistsFile(fileName)) {
      throw new Error("File exist");
    }
    await appendFile(fileName, "");
    const db = await createConnectionDb(fileName);

    const blockchain = new BlockChain(db.getRepository(BlockChainEntity));

    const genesisBlock = new Block(receiver, GENESIS_BLOCK);

    genesisBlock.mappingData[STORAGE_CHAIN] = STORAGE_VALUE;
    genesisBlock.mappingData[receiver] = GENESIS_REWARD;

    genesisBlock.currentHash = genesisBlock.hash();

    await blockchain.addNewBlock(genesisBlock);

    await db.close();
  } catch (error) {
    console.error(error);
    throw new Error("Chain is not created");
  }
};

export const loadChain = async (fileName: string) => {
  try {
    const db = await createConnectionDb(fileName);
    const blockchain = new BlockChain(db.getRepository(BlockChainEntity));
    blockchain.index = await blockchain.size();

    const close = () => db.close();

    return { blockchain, close };
  } catch (error) {
    console.error(error);
    throw new Error("Chain is not loaded");
  }
};
