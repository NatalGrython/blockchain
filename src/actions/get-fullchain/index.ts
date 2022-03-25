import { BlockChain, serializeBlockJSON } from "blockchain-library";

export const getFullChain = async (chain: BlockChain) => {
  const { blocks } = await chain.getAllChain();
  const blocksJson = blocks.map(serializeBlockJSON);
  const allBlocks = JSON.stringify(blocksJson);

  return allBlocks;
};
