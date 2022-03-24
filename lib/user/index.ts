import { KeyObject } from "crypto";
import { EventEmitter } from "stream";
import { createKeyFromString, createKeyPairs } from "./utils";

export class User {
  private privateKey: KeyObject;
  private publicKey: KeyObject;

  constructor(privateKey: KeyObject, publicKey: KeyObject) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  get stringAddress() {
    return this.publicKey
      .export({ type: "pkcs1", format: "der" })
      .toString("base64");
  }

  get stringPrivate() {
    return this.privateKey
      .export({ type: "pkcs8", format: "der" })
      .toString("base64");
  }

  get address() {
    return this.publicKey;
  }

  get private() {
    return this.privateKey;
  }
}

export const createUser = async (emitter?: EventEmitter) => {
  const { privateKey, publicKey } = await createKeyPairs();
  const newUser = new User(privateKey, publicKey);
  if (emitter) {
    emitter.emit("event", {
      type: "CREATE_USER",
      payload: { address: newUser.stringAddress, purse: newUser.stringPrivate },
    });
  }
  return newUser;
};

export const loadUser = (address: string, purse: string) => {
  const publicKey = createKeyFromString(address, "public");
  const privateKey = createKeyFromString(purse, "private");
  return new User(privateKey, publicKey);
};
