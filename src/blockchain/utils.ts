import { KeyObject, sign, verify, BinaryLike, createHash } from "crypto";
import { createKeyFromString } from "./user/utils";

export const signStruct = (privateKey: KeyObject, data: string) => {
  return sign("sha256", Buffer.from(data), privateKey);
};

export const verifyStruct = (
  publicKey: string | KeyObject,
  data: string,
  signature: Buffer
) => {
  if (typeof publicKey === "string") {
    console.log({ publicKey, data, signature });

    return verify(
      "sha256",
      Buffer.from(data),
      createKeyFromString(publicKey, "public"),
      signature
    );
  }
  console.log({ publicKey, data, signature });

  return verify("sha256", Buffer.from(data), publicKey, signature);
};

export const createHashSha = <T extends BinaryLike>(value: T) => {
  const hash = createHash("sha256");
  hash.update(value);

  return hash.digest("hex");
};
