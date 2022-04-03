import { Block, serializeBlockJSON } from "blockchain-library";
import { EventEmitter } from "events";
import { PUSH_BLOCK } from "../../../constants/actions";
import { getSocketInfo } from "../../../utils";

export const pushBlockToNet = async (
  addresses: { host: string; port: number }[],
  block: Block,
  size: number,
  emitter: EventEmitter
) => {
  const action = {
    type: PUSH_BLOCK,
    block: serializeBlockJSON(block),
    size,
    addressNode: {
      host: "localhost",
      port: Number(process.env.PORT),
    },
  } as const;
  emitter.emit("event", { type: "PUSH_BLOCK_NET", payload: { ...action } });
  const requsts = Promise.all(
    addresses
      .filter((item) => item.port !== Number(process.env.PORT))
      .map(({ host, port }) => getSocketInfo(port, host, action))
  );
  await requsts;
};
