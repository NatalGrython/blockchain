import { createPrivateKey, createPublicKey, KeyObject } from "crypto";
import { createKeyPairs } from "./utils";

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

export const createUser = async () => {
  const { privateKey, publicKey } = await createKeyPairs();

  return new User(privateKey, publicKey);
};

export const loadUser = (address: string, purse: string) => {
  const publicKey = createPublicKey({
    key: Buffer.from(address, "base64"),
    type: "pkcs1",
    format: "der",
  });

  const privateKey = createPrivateKey({
    key: Buffer.from(purse, "base64"),
    type: "pkcs8",
    format: "der",
  });
  const user = new User(publicKey, privateKey);

  return user;
};
