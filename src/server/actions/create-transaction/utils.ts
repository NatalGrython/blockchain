import { Block, serializeBlockJSON } from "blockchain-library";
import { EventEmitter } from "events";
import { PUSH_BLOCK } from "../../../constants/actions";
import { CLIENT_PORT, HOST_IP } from "../../../constants/system";
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
      host: HOST_IP,
      port: CLIENT_PORT,
    },
  } as const;
  emitter.emit("event", { type: "PUSH_BLOCK_NET", payload: { ...action } });
  const requsts = Promise.all(
    addresses
      .filter((item) => item.port !== CLIENT_PORT)
      .map(({ host, port }) => getSocketInfo(port, host, action))
  );
  await requsts;
};
