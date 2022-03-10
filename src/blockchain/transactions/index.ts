import { createPublicKey, KeyObject, randomBytes, sign, verify } from "crypto";
import { User } from "../user";
import { START_PERCENT, STORAGE_REWARD } from "./constants";
import { createHashSha } from "./utils";

export class Transaction {
  public sender: string;
  public receiver: string;
  public value: number;
  public toStorage: number = 0;
  public signature: Buffer;
  public currentHash: string;
  public randomBytes: Buffer;
  public previousBlock: string;

  constructor(
    lastHash: string,
    user: User,
    to: string,
    value: number,
    randomBytes: Buffer
  ) {
    this.randomBytes = randomBytes;
    this.previousBlock = lastHash;
    this.sender = user.stringAddress;
    this.receiver = to;
    this.value = value;
  }

  sign(privateKey: KeyObject) {
    if (this.currentHash) {
      this.signature = sign(
        "sha256",
        Buffer.from(this.currentHash),
        privateKey
      );
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
    return verify(
      "sha256",
      Buffer.from(this.currentHash),
      createPublicKey(this.sender),
      this.signature
    );
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
    transaction.toStorage = STORAGE_REWARD;
  }
  transaction.currentHash = transaction.createTransactionHash();
  console.log("kww");
  transaction.sign(user.private);
  console.log("kww1");
  return transaction;
};
