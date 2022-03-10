import { BlockChain } from "../chain";
import { STORAGE_CHAIN } from "../chain/constants";
import { Transaction } from "../transactions";
import { START_PERCENT, STORAGE_REWARD } from "../transactions/constants";
import { User } from "../user";
import { DIFFICULTY } from "./constants";

export class Block {
  public currentHash: string;
  public previousHash: string = "";
  public nonce: number = 0;
  public difficulty: number = 0;
  public miner: string;
  public signature: string = "";
  public timestamp: number;
  public transactions: Transaction[] = [];
  public mappingData: Record<string, number>;

  constructor(miner: string, hash: string, difficulty?: number) {
    if (arguments.length > 2) {
      this.previousHash = hash;
      this.difficulty = difficulty;
    } else {
      this.currentHash = hash;
    }

    this.miner = miner;
    this.mappingData = {};
    this.timestamp = Date.now();
  }

  async addBalance(chain: BlockChain, receiver: string, value: number) {
    let balanceChain: number;
    if (this.mappingData[receiver]) {
      balanceChain = this.mappingData[receiver];
    } else {
      balanceChain = await chain.getBalance(receiver);
    }
    this.mappingData[receiver] = balanceChain + value;
  }

  async addTransaction(chain: BlockChain, transactions: Transaction) {
    if (transactions.value === 0) {
      throw new Error("Transaction value 0");
    }
    if (
      this.transactions.length === 10 &&
      transactions.sender !== STORAGE_CHAIN
    ) {
      throw new Error("Len tx === lm");
    }
    let balanceChain: number;
    const balanceTransaction = transactions.value + transactions.toStorage;
    if (this.mappingData[transactions.sender]) {
      balanceChain = this.mappingData[transactions.sender];
    } else {
      balanceChain = await chain.getBalance(transactions.sender);
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

  accept(chain: BlockChain, user: User) {
    // if (this.transactionsValid(chain)) {
    //   throw new Error("No valid");
    // }
  }
}

export const createBlock = (miner: string, previousHash: string) => {
  const block = new Block(miner, previousHash, DIFFICULTY);
  return block;
};
