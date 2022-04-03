import { KeyObject, randomBytes } from "crypto";
import { START_PERCENT, STORAGE_REWARD } from "./constants";
import { User } from "../user";
import { createHashSha, signStruct, verifyStruct } from "../utils";

export class Transaction {
  public sender: string;
  public receiver: string;
  public value: number;
  public toStorage: number = 0;
  public signature: Buffer;
  public currentHash: string;
  public randomBytes: Buffer;
  public previousBlock: string;
  public reason: string;

  constructor(
    lastHash: string,
    sender: string,
    to: string,
    value: number,
    reason: string,
    randomBytes: Buffer
  ) {
    this.randomBytes = randomBytes;
    this.previousBlock = lastHash;
    this.sender = sender;
    this.receiver = to;
    this.value = value;
    this.reason = reason;
  }

  sign(privateKey: KeyObject) {
    if (this.currentHash) {
      this.signature = signStruct(privateKey, this.currentHash);
    }
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
    return currentHash;
  }

  hashIsValid() {
    return this.currentHash === this.createTransactionHash();
  }

  signIsValid() {
    return verifyStruct(this.sender, this.currentHash, this.signature);
  }
}

export const newTransaction = (
  user: User,
  lastHash: string,
  to: string,
  value: number,
  reason: string
) => {
  const transactionRandomBytes = randomBytes(20);
  const transaction = new Transaction(
    lastHash,
    user.stringAddress,
    to,
    value,
    reason,
    transactionRandomBytes
  );

  if (value > START_PERCENT) {
    transaction.toStorage = STORAGE_REWARD;
  }
  transaction.currentHash = transaction.createTransactionHash();
  transaction.sign(user.private);
  return transaction;
};
