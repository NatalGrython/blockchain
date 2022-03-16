import { KeyObject } from "crypto";
import { Repository } from "typeorm";

declare class BlockChainEntity {
  id: number;
  hash: string;
  block: string;
}
export declare class User {
  private privateKey;
  private publicKey;
  constructor(privateKey: KeyObject, publicKey: KeyObject);
  get stringAddress(): string;
  get stringPrivate(): string;
  get address(): KeyObject;
  get private(): KeyObject;
}
export declare const createUser: () => Promise<User>;
export declare const loadUser: (address: string, purse: string) => User;
export declare class Transaction {
  sender: string;
  receiver: string;
  value: number;
  toStorage: number;
  signature: Buffer;
  currentHash: string;
  randomBytes: Buffer;
  previousBlock: string;
  constructor(
    lastHash: string,
    sender: string,
    to: string,
    value: number,
    randomBytes: Buffer
  );
  sign(privateKey: KeyObject): void;
  createTransactionHash(): string;
  hashIsValid(): boolean;
  signIsValid(): boolean;
}
export declare const newTransaction: (
  user: User,
  lastHash: string,
  to: string,
  value: number
) => Transaction;
export declare class Block {
  currentHash: string;
  previousHash: string;
  nonce: number;
  difficulty: number;
  miner: string;
  signature: Buffer;
  timestamp: number;
  transactions: Transaction[];
  mappingData: Record<string, number>;
  constructor(miner: string, previousHash: string, difficulty?: number);
  addBalance(chain: BlockChain, receiver: string, value: number): Promise<void>;
  addTransaction(chain: BlockChain, transactions: Transaction): Promise<void>;
  accept(chain: BlockChain, user: User, signal: AbortSignal): Promise<void>;
  transactionsValid(chain: BlockChain): Promise<boolean>;
  hash(): string;
  sign(privateKey: KeyObject): Buffer;
  proof(signal: AbortSignal): void;
  balanceIsValid(chain: BlockChain, address: string): Promise<boolean>;
  isValid(chain: BlockChain): Promise<boolean>;
  hashIsValid(chain: BlockChain, index: number): Promise<boolean>;
  signIsValid(): boolean;
  mappingIsValid(): boolean;
  timeIsValid(chain: BlockChain, index: number): Promise<boolean>;
}
export declare const createBlock: (
  miner: string,
  previousHash: string
) => Block;
export declare const deserializeBlock: (serializableBlock: any) => Block;
export declare const deserializeTransaction: (transaction: any) => Transaction;
export declare const serializeBlock: (block: Block) => string;
export declare const serializeTransaction: (transaction: Transaction) => string;
export declare const serializeTransactionJSON: (transaction: Transaction) => {
  signature: string;
  randomBytes: string;
  sender: string;
  receiver: string;
  value: number;
  toStorage: number;
  currentHash: string;
  previousBlock: string;
};
export declare const serializeBlockJSON: (block: Block) => {
  signature: string;
  transactions: {
    signature: string;
    randomBytes: string;
    sender: string;
    receiver: string;
    value: number;
    toStorage: number;
    currentHash: string;
    previousBlock: string;
  }[];
  currentHash: string;
  previousHash: string;
  nonce: number;
  difficulty: number;
  miner: string;
  timestamp: number;
  mappingData: Record<string, number>;
};
export declare class BlockChain {
  repository: Repository<BlockChainEntity>;
  index: number;
  constructor(repository: Repository<BlockChainEntity>);
  getBalance(address: string, size: number): Promise<number>;
  addNewBlock(block: Block): Promise<void>;
  size(): Promise<number>;
  lastHash(): Promise<string>;
  getAllChain(): Promise<{
    blocks: Block[];
  }>;
}
export declare const newChain: (
  fileName: string,
  receiver: string
) => Promise<void>;
export declare const loadChain: (fileName: string) => Promise<{
  blockchain: BlockChain;
  close: () => Promise<void>;
}>;

export {};
