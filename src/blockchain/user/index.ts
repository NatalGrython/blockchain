import { createKeyPairs } from "./utils";

export class User {
  private privateKey: string;
  private publicKey: string;

  constructor(privateKey: string, publicKey: string) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
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
