import { BinaryLike, createHash } from "crypto";

export const createHashSha = <T extends BinaryLike>(value: T) => {
  const hash = createHash("sha256");
  hash.update(value);

  return hash.digest("hex");
};
