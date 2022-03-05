import { BlockChain } from "../chain";
import { STORAGE_CHAIN } from "../chain/constants";
import { Transaction } from "../transactions";
import { START_PERCENT, STORAGE_REWARD } from "../transactions/constants";
import { User } from "../user";
import { DIFFICULTY } from "./constants";

export class Block {
  private currentHash: string;
  private previousHash: string = "";
  private nonce: number = 0;
  private difficulty: number = 0;
  private miner: string;
  private signature: string = "";
  private timestamp: number;
  private transactions: Transaction[] = [];
  private mappingData: Record<string, number>;

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

  set mapping(value: [string, number]) {
    this.mappingData[value[0]] = value[1];
  }

  getMappingValue(key: string) {
    return this.mappingData[key];
  }

  get hash() {
    return this.currentHash;
  }

  async addBalance(chain: BlockChain, receiver: string, value: number) {
    let balanceChain: number;
    if (this.mappingData[receiver]) {
      balanceChain = this.mapping[receiver];
    } else {
      balanceChain = await chain.getBalance(receiver);
    }
    this.mappingData[receiver] = balanceChain + value;
  }

  async addTransaction(chain: BlockChain, transactions: Transaction) {
    if (transactions.transactionValue === 0) {
      throw new Error("Transaction value 0");
    }
    if (
      this.transactions.length === 10 &&
      transactions.transactionSender !== STORAGE_CHAIN
    ) {
      throw new Error("Len tx === lm");
    }
    let balanceChain: number;
    const balanceTransaction =
      transactions.transactionValue + transactions.storage;
    if (this.mappingData[transactions.transactionSender]) {
      balanceChain = this.mappingData[transactions.transactionSender];
    } else {
      balanceChain = await chain.getBalance(transactions.transactionSender);
    }

    if (
      transactions.transactionValue > START_PERCENT &&
      transactions.storage !== STORAGE_REWARD
    ) {
      throw new Error("Storage reward pass");
    }

    if (balanceTransaction > balanceChain) {
      throw new Error("Balance >");
    }

    this.mappingData[transactions.transactionSender] =
      balanceChain - balanceTransaction;

    await this.addBalance(
      chain,
      transactions.transactionReceiver,
      transactions.transactionValue
    );

    await this.addBalance(chain, STORAGE_CHAIN, transactions.storage);

    this.transactions.push(transactions);
  }

  accept(chain: BlockChain, user: User) {
    if (this.transactionsValid(chain)) {
      throw new Error("No valid");
    }
  }
}

export const createBlock = (miner: string, previousHash: string) => {
  const block = new Block(miner, previousHash, DIFFICULTY);
  return block;
};
