import { randomBytes, sign } from "crypto";
import { User } from "../user";
import { START_PERCENT, STORAGE_REWARD } from "./constants";
import { createHashSha } from "./utils";

export class Transaction {
  private sender: string;
  private receiver: string;
  private value: number;
  private toStorage: number = 0;
  private signature: Buffer;
  private currentHash: string;
  private randomBytes: Buffer;
  private previousBlock: string;

  constructor(
    lastHash: string,
    user: User,
    to: string,
    value: number,
    randomBytes: Buffer
  ) {
    this.randomBytes = randomBytes;
    this.previousBlock = lastHash;
    this.sender = user.address;
    this.receiver = to;
    this.value = value;
  }

  get transactionValue() {
    return this.value;
  }

  get transactionSender() {
    return this.sender;
  }

  get transactionReceiver() {
    return this.receiver;
  }

  sign(privateKey: string) {
    if (this.currentHash) {
      this.signature = sign(
        "sha256",
        Buffer.from(this.currentHash),
        privateKey
      );
    }
  }

  set storage(value: number) {
    this.toStorage = value;
  }

  get storage() {
    return this.storage;
  }

  createTransactionHash() {
    const currentHash = createHashSha(
      JSON.stringify({
        randBytes: this.randomBytes,
        previousBlock: this.previousBlock,
        sender: this.sender,
        receiver: this.receiver,
        value: this.value,
        toStorage: this.toStorage,
      })
    );
    this.currentHash = currentHash;
  }
}

export const newTransaction = (
  user: User,
  lastHash: string,
  to: string,
  value: number
) => {
  const transactionRandomBytes = randomBytes(20);
  const transaction = new Transaction(
    lastHash,
    user,
    to,
    value,
    transactionRandomBytes
  );

  if (value > START_PERCENT) {
    transaction.storage = STORAGE_REWARD;
  }
  transaction.createTransactionHash();
  transaction.sign(user.private);
  return transaction;
};
