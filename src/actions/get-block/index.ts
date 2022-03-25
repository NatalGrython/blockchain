import { BlockChain, serializeBlock } from "blockchain-library";
import { EventEmitter } from "events";

export const getBlock = async (
  chain: BlockChain,
  index: number,
  emitter: EventEmitter
) => {
  const { blocks } = await chain.getAllChain();
  emitter.emit("event", {
    type: "GET_BLOCK",
    payload: { block: serializeBlock(blocks[index]) },
  });
  return serializeBlock(blocks[index]);
};
