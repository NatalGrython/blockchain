import { generateKeyPair } from "crypto";
import { promisify } from "util";

const generateKeyPairPromises = promisify(generateKeyPair);

export const createKeyPairs = () =>
  generateKeyPairPromises("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      format: "pem",
      type: "spki",
    },
    privateKeyEncoding: {
      format: "pem",
      type: "pkcs8",
    },
  });
