import { appendFile } from "fs/promises";
import { Repository } from "typeorm";
import {
  GENESIS_BLOCK,
  STORAGE_CHAIN,
  STORAGE_VALUE,
  GENESIS_REWARD,
} from "./constants";
import { BlockChain as BlockChainEntity } from "../../entity/Blockchain";
import { createConnectionDb } from "./utils";
import { Block } from "../block";

export class BlockChain {
  private repository: Repository<BlockChainEntity>;
  private blockIndex: number = 0;

  constructor(repository: Repository<BlockChainEntity>) {
    this.repository = repository;
  }

  set index(value: number) {
    if (value < 0) {
      this.blockIndex = 0;
    } else {
      this.blockIndex = value;
    }
  }

  get index() {
    return this.blockIndex;
  }

  async getBalance(address: string) {
    const blocks = await this.repository.find();
    const block = blocks[this.index];
    const serializeBlock = JSON.parse(block.block);
    if (serializeBlock.mappingData[address]) {
      return serializeBlock.mappingData[address] as number;
    }
    return 0;
  }

  async addNewBlock(block: Block) {
    const newBlock = new BlockChainEntity();
    newBlock.block = JSON.stringify(block);
    newBlock.hash = block.hash;
    console.log(newBlock);
    await this.repository.save(newBlock);
    this.blockIndex++;
  }

  async size() {
    const data = await this.repository.find();
    return data.length - 1;
  }
}

export const newChain = async (fileName: string, receiver: string) => {
  try {
    await appendFile(fileName, "");
    const db = await createConnectionDb(fileName);

    const blockchain = new BlockChain(db.getRepository(BlockChainEntity));

    const genesisBlock = new Block(receiver, GENESIS_BLOCK);

    genesisBlock.mapping = [STORAGE_CHAIN, STORAGE_VALUE];
    genesisBlock.mapping = [receiver, GENESIS_REWARD];

    console.log(genesisBlock);

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
    await db.close();
    return blockchain;
  } catch (error) {
    console.error(error);
    throw new Error("Chain is not loaded");
  }
};
