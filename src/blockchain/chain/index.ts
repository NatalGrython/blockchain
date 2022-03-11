import { appendFile } from "fs/promises";
import { Repository } from "typeorm";
import {
  GENESIS_BLOCK,
  STORAGE_CHAIN,
  STORAGE_VALUE,
  GENESIS_REWARD,
} from "./constants";
import { BlockChain as BlockChainEntity } from "../entity/Blockchain";
import { checkExistsFile, createConnectionDb } from "./utils";
import { Block, createBlock } from "../block";
import { newTransaction, Transaction } from "../transactions";
import { User } from "../user";

export class BlockChain {
  public repository: Repository<BlockChainEntity>;
  public index: number = 0;

  constructor(repository: Repository<BlockChainEntity>) {
    this.repository = repository;
  }

  async getBalance(address: string, index?: number) {
    const blocks = await this.repository.find();

    const block = blocks[index - 2 ?? this.index];
    const serializeBlock = JSON.parse(block.block) as Block;

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

  async getBlockIndex(block: Block) {
    const blockEntity = await this.repository.findOne({
      where: { hash: block.currentHash },
    });
    return blockEntity.id;
  }

  async getAllChain() {
    const allBlocks = await this.repository.find();
    const serializeBlocks = allBlocks.map(
      (item) => JSON.parse(item.block) as Block
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

export const deserializeBlock = (deserializeBlock: any) => {
  // console.error(stringBlock);
  // const deserializeBlock = JSON.parse(stringBlock) as Block;
  const block = createBlock(
    deserializeBlock.miner,
    deserializeBlock.previousHash
  );

  block.currentHash = deserializeBlock.currentHash;
  block.difficulty = deserializeBlock.difficulty;
  block.mappingData = deserializeBlock.mappingData;
  block.miner = deserializeBlock.miner;
  block.nonce = deserializeBlock.nonce;
  block.previousHash = deserializeBlock.previousHash;
  block.signature = deserializeBlock.signature
    ? Buffer.from(deserializeBlock.signature, "base64")
    : undefined;
  block.timestamp = deserializeBlock.timestamp;
  block.transactions = deserializeBlock.transactions.map(deserializeTx);

  return block;
};

const deserializeTx = (tx: any) => {
  //@ts-ignore
  const newTx = new Transaction("", {
    get addressString() {
      return tx.sender;
    },
  });

  newTx.currentHash = tx.currentHash;
  newTx.previousBlock = tx.previousBlock;
  (newTx.randomBytes = Buffer.from(tx.randomBytes, "base64")),
    (newTx.receiver = tx.receiver);
  newTx.sender = tx.sender;
  newTx.signature = tx.signature
    ? Buffer.from(tx.signature, "base64")
    : undefined;

  newTx.toStorage = tx.toStorage;
  newTx.value = tx.value;
  return newTx;
};

const serializeBlock = (block: Block) => {
  const blockToJSON = {
    ...block,
    signature: block.signature ? block.signature.toString("base64") : undefined,
    transactions: block.transactions.map((item) => ({
      ...item,
      signature: item.signature ? item.signature.toString("base64") : undefined,
      randomBytes: item.randomBytes.toString("base64"),
    })),
  };
  const blockString = JSON.stringify(blockToJSON);
  return blockString;
};

// const serializeTransactions = (tx: any) => {
//   const txToJSON = {
//     ...tx,
//     signature: tx.signature ? tx.signature.toString("base64") : undefined,
//     randomBytes: tx.randomBytes.toString("base64"),
//   };
//   const txString = JSON.stringify(txToJSON);
//   return txString;
// };
