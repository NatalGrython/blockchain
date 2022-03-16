import { KeyObject, randomBytes } from "crypto";
import { BlockChain } from "../chain";
import { STORAGE_CHAIN } from "../chain/constants";
import { createConnectionDb } from "../chain/utils";
import { BlockChainEntity } from "../entity/Blockchain";
import { Transaction } from "../transactions";
import { START_PERCENT, STORAGE_REWARD } from "../transactions/constants";
import { User } from "../user";
import { createHashSha, signStruct, verifyStruct } from "../utils";
import { DIFFICULTY, TXS_LIMIT } from "./constants";

export class Block {
  public currentHash: string;
  public previousHash: string = "";
  public nonce: number = 0;
  public difficulty: number = DIFFICULTY;
  public miner: string;
  public signature: Buffer;
  public timestamp: number;
  public transactions: Transaction[] = [];
  public mappingData: Record<string, number>;

  constructor(miner: string, previousHash: string, difficulty?: number) {
    this.previousHash = previousHash;
    this.miner = miner;
    this.mappingData = {};
    if (difficulty) {
      this.difficulty = difficulty;
    }
  }

  async addBalance(chain: BlockChain, receiver: string, value: number) {
    let balanceChain: number = 0;
    if (this.mappingData[receiver]) {
      balanceChain = this.mappingData[receiver];
    } else {
      balanceChain = await chain.getBalance(receiver, await chain.size());
    }
    this.mappingData[receiver] = balanceChain + value;
  }

  async addTransaction(chain: BlockChain, transactions: Transaction) {
    if (transactions.value === 0) {
      throw new Error("Transaction value 0");
    }
    if (
      this.transactions.length === TXS_LIMIT &&
      transactions.sender !== STORAGE_CHAIN
    ) {
      throw new Error("Len tx === lm");
    }
    let balanceChain: number = 0;
    const balanceTransaction = transactions.value + transactions.toStorage;

    if (this.mappingData[transactions.sender]) {
      balanceChain = this.mappingData[transactions.sender];
    } else {
      balanceChain = await chain.getBalance(
        transactions.sender,
        await chain.size()
      );
    }

    if (
      transactions.value > START_PERCENT &&
      transactions.toStorage !== STORAGE_REWARD
    ) {
      throw new Error("Storage reward pass");
    }

    if (balanceTransaction > balanceChain) {
      throw new Error("Balance >");
    }

    this.mappingData[transactions.sender] = balanceChain - balanceTransaction;

    await this.addBalance(chain, transactions.receiver, transactions.value);

    await this.addBalance(chain, STORAGE_CHAIN, transactions.toStorage);

    this.transactions.push(transactions);
  }

  async accept(chain: BlockChain, user: User, signal: AbortSignal) {
    if (!(await this.transactionsValid(chain))) {
      throw new Error("No valid");
    }

    const newTx = new Transaction(
      await chain.lastHash(),
      STORAGE_CHAIN,
      user.stringAddress,
      STORAGE_REWARD,
      randomBytes(20)
    );

    await this.addTransaction(chain, newTx);

    this.timestamp = Date.now();
    this.currentHash = this.hash();
    this.proof(signal);

    this.signature = this.sign(user.private);
  }

  async transactionsValid(chain: BlockChain) {
    const length = this.transactions.length;
    let plusStorage = 0;
    for (let i = 0; i < length; i++) {
      if (this.transactions[i].sender === STORAGE_CHAIN) {
        plusStorage = 1;
        break;
      }
    }

    if (length === 0 || length > TXS_LIMIT + plusStorage) {
      return false;
    }

    for (let i = 0; i < length - 1; i++) {
      for (let j = i + 1; j < length; j++) {
        if (
          this.transactions[i].randomBytes.equals(
            this.transactions[j].randomBytes
          )
        ) {
          return false;
        }

        if (
          this.transactions[i].sender === STORAGE_CHAIN &&
          this.transactions[j].sender === STORAGE_CHAIN
        ) {
          return false;
        }
      }
    }

    for (let i = 0; i < length; i++) {
      const tx = this.transactions[i];

      if (tx.sender == STORAGE_CHAIN) {
        if (tx.receiver !== this.miner || tx.value !== STORAGE_REWARD) {
          return false;
        }
      } else {
        if (!tx.hashIsValid()) {
          return false;
        }
        if (!tx.signIsValid()) {
          return false;
        }
      }

      if (!(await this.balanceIsValid(chain, tx.sender))) {
        return false;
      }
      if (!(await this.balanceIsValid(chain, tx.receiver))) {
        return false;
      }
    }
    return true;
  }

  hash() {
    const blockString = JSON.stringify({
      transactions: this.transactions.map((item) => item.currentHash),
      mapping: this.mappingData,
      miner: this.miner,
      previousHash: this.previousHash,
      difficulty: this.difficulty,
      timestamp: this.timestamp,
      nonce: this.nonce,
    });

    return createHashSha(blockString);
  }

  sign(privateKey: KeyObject) {
    return signStruct(privateKey, this.currentHash);
  }

  proof(signal: AbortSignal) {
    while (
      this.currentHash.substring(0, this.difficulty) !==
        Array(this.difficulty).fill("0").join("") &&
      !signal.aborted
    ) {
      this.nonce++;
      this.currentHash = this.hash();
    }
  }

  async balanceIsValid(chain: BlockChain, address: string) {
    if (!this.mappingData[address]) {
      return false;
    }

    const length = this.transactions.length;
    let balanceChain = await chain.getBalance(address, await chain.size());

    let balanceSubBlock = 0;
    let balanceAddBlock = 0;

    for (let j = 0; j < length; j++) {
      const tx = this.transactions[j];

      if (tx.sender === address) {
        balanceSubBlock = balanceSubBlock + tx.value + tx.toStorage;
      }
      if (tx.receiver === address) {
        balanceAddBlock = balanceAddBlock + tx.value;
      }
      if (address === STORAGE_CHAIN) {
        balanceAddBlock = balanceAddBlock + tx.toStorage;
      }
    }

    if (
      balanceChain + balanceAddBlock - balanceSubBlock !==
      this.mappingData[address]
    ) {
      return false;
    }

    return true;
  }

  async isValid(chain: BlockChain) {
    if (this === null) {
      return false;
    }

    if (this.difficulty !== DIFFICULTY) {
      return false;
    }

    if (!(await this.hashIsValid(chain, await chain.size()))) {
      return false;
    }
    if (!this.signIsValid()) {
      return false;
    }

    if (!this.mappingIsValid()) {
      return false;
    }
    if (!(await this.timeIsValid(chain, await chain.size()))) {
      return false;
    }
    if (!(await this.transactionsValid(chain))) {
      return false;
    }
    return true;
  }
  async hashIsValid(chain: BlockChain, index: number) {
    if (this.currentHash !== this.hash()) {
      return false;
    }

    const { getRepository, close } = await createConnectionDb(chain.fileName);
    const repository = getRepository(BlockChainEntity);

    const currentBlock = await repository.findOne({
      where: {
        hash: this.currentHash,
      },
    });

    await close();

    return currentBlock && currentBlock.id !== index;
  }

  signIsValid() {
    return verifyStruct(this.miner, this.currentHash, this.signature);
  }

  mappingIsValid() {
    for (const [address, value] of Object.entries(this.mappingData)) {
      if (address === STORAGE_CHAIN) {
        continue;
      }
      let flag = false;
      for (const tx of this.transactions) {
        if (tx.sender === address || tx.receiver === address) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        return false;
      }
    }
    return true;
  }

  async timeIsValid(chain: BlockChain, index: number) {
    if (!this.timestamp) {
      return false;
    }
    const date = new Date(this.timestamp);
    if (Date.now() - date.getMilliseconds() < 0) {
      return false;
    }

    const { getRepository, close } = await createConnectionDb(chain.fileName);
    const repository = getRepository(BlockChainEntity);

    const currentBlock = await repository.findOne({
      where: {
        hash: this.currentHash,
      },
    });

    await close();
    const block = JSON.parse(currentBlock.block) as Block;
    if (block.timestamp !== this.timestamp) {
      return false;
    }
    return true;
  }
}

export const createBlock = (miner: string, previousHash: string) => {
  const block = new Block(miner, previousHash, DIFFICULTY);
  return block;
};
