import { createPrivateKey, createPublicKey, generateKeyPair } from "crypto";
import { promisify } from "util";

const generateKeyPairPromises = promisify(generateKeyPair);

export const createKeyPairs = () =>
  generateKeyPairPromises("rsa", {
    modulusLength: 512,
  });

export const createKeyFromString = (
  key: string,
  type: "public" | "private"
) => {
  if (type === "public") {
    return createPublicKey({
      key: Buffer.from(key, "base64"),
      format: "der",
      type: "pkcs1",
    });
  } else {
    return createPrivateKey({
      key: Buffer.from(key, "base64"),
      format: "der",
      type: "pkcs8",
    });
  }
};
