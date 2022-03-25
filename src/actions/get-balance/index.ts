import { BlockChain } from "blockchain-library";
import { EventEmitter } from "events";

export const getBalance = async (
  address: string,
  chain: BlockChain,
  emitter: EventEmitter
) => {
  const balance = await chain.getBalance(address, await chain.size());
  emitter.emit("event", { type: "GET_BALANCE", payload: { address, balance } });
  return String(balance);
};
