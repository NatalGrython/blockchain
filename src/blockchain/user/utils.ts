import { createPublicKey, generateKeyPair } from "crypto";
import { promisify } from "util";

const generateKeyPairPromises = promisify(generateKeyPair);

export const createKeyPairs = () =>
  generateKeyPairPromises("rsa", {
    modulusLength: 512,
  });
