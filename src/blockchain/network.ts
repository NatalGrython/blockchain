import { createHash, RsaPublicKey } from "crypto";
import { appendFile } from "fs/promises";
import { createConnection, Repository } from "typeorm";
import { BlockChain as BlockChainEntity } from "../entity/Blockchain";

const GENESIS_BLOCK = "GENESIS_BLOCK";
const STORAGE_VALUE = 100;
const GENESIS_REWARD = 100;
const STORAGE_CHAIN = "STORAGE_CHAIN";
const START_PERCENT = 10;
const STORAGE_REWARD = 1;
const DIFFICULTY = 20;

class BlockChain {
  private repository: Repository<BlockChainEntity>;
  private index: number = 0;

  constructor(repository: Repository<BlockChainEntity>) {
    this.repository = repository;
  }

  async addNewBlock(block: Block) {
    const newBlock = new BlockChainEntity();

    newBlock.block = JSON.stringify(block);
    newBlock.hash = block.getHash();

    await this.repository.save(newBlock);
    this.index++;
  }
  setIndex(index: number) {
    this.index = index;
  }
  async size() {
    const data = await this.repository.find();
    return data.length - 1;
  }
}

class Block {
  private currentHash: string;
  private previousHash: string = "";
  private nonce: number = 0;
  private difficulty: number = 0;
  private miner: string;
  private signature: string = "";
  private timestamp: number;
  private transactions: Transaction[] = [];
  private mapping: Map<string, number>;

  constructor(miner: string, hash: string, difficulty?: number) {
    if (arguments.length > 2) {
      this.previousHash = hash;
      this.difficulty = difficulty;
    } else {
      this.currentHash = hash;
    }

    this.miner = miner;
    this.mapping = new Map();
    this.timestamp = Date.now();
  }

  setMappingValue(key: string, value: number) {
    this.mapping.set(key, value);
  }
  getMappingValue(key: string) {
    return this.mapping.get(key);
  }

  getHash() {
    return this.currentHash;
  }
}

class Transaction {
  private sender: string;
  private receiver: string;
  private value: number;
  private toStorage: number = 0;
  private signature: string;
  private currentHash: string;
  private randomBytes: string;
  private previousBlock: string;

  constructor(lastHash: string, user: User, to: string, value: number) {
    this.randomBytes = String(Math.random() * 1000000);
    this.previousBlock = lastHash;
    this.sender = user.getAddress();
    this.receiver = to;
    this.value = value;
    this.signature = user.private();
  }

  setStorageValue(value: number) {
    this.toStorage = value;
  }

  hash() {
    const str = JSON.stringify(this);
    const hash = createHash("sha256");
    hash.update(str);
    return hash.digest("hex");
  }

  sign(privateKey: string) {
    return Sign(privateKey, this.currentHash);
  }

  setHash(hash: string) {
    this.currentHash = hash;
  }
}

class User {
  private privateKey: string;

  getAddress() {
    return StringPublic(user.Public());
  }

  private() {
    return this.privateKey;
  }
}

const newChain = async (fileName: string, receiver: string) => {
  try {
    await appendFile(fileName, "");
    const db = await createConnection({
      type: "sqlite",
      database: fileName,
      entities: [BlockChainEntity],
      synchronize: true,
    });

    const blockchain = new BlockChain(db.getRepository(BlockChainEntity));

    const genesisBlock = new Block(GENESIS_BLOCK, receiver);

    genesisBlock.setMappingValue(STORAGE_CHAIN, STORAGE_VALUE);
    genesisBlock.setMappingValue(receiver, GENESIS_REWARD);

    await blockchain.addNewBlock(genesisBlock);

    await db.close();
  } catch (error) {
    console.log(error);
  }
};

const loadChain = async (fileName: string) => {
  try {
    const db = await createConnection({
      type: "sqlite",
      database: fileName,
      entities: [BlockChainEntity],
      synchronize: true,
    });
    const blockchain = new BlockChain(db.getRepository(BlockChainEntity));
    blockchain.setIndex(await blockchain.size());
    await db.close();
    return blockchain;
  } catch (error) {
    console.log("🚀 ~ file: network.ts ~ line 118 ~ loadChain ~ error", error);
  }
};

const newBlock = (miner: string, previousHash: string) => {
  const block = new Block(miner, previousHash, DIFFICULTY);
  return block;
};

const newTransaction = (
  user: User,
  lastHash: string,
  to: string,
  value: number
) => {
  const transaction = new Transaction(lastHash, user, to, value);

  if (value > START_PERCENT) {
    transaction.setStorageValue(STORAGE_REWARD);
  }

  transaction.setHash(transaction.hash());

  return transaction;
};

newChain("block.sqlite", "kek").then(() => {
  loadChain("block.sqlite").then(console.log);
});

function StringPublic(publicKey: string) {
  throw new Error("Function not implemented.");
}
