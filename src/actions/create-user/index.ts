import { createUser as createUserBlockchain } from "blockchain-library";
import { EventEmitter } from "events";

export const createUser = async (emitter: EventEmitter) => {
  const user = await createUserBlockchain();
  emitter.emit("event", {
    type: "CREATE_USER",
    payload: { address: user.stringAddress, privateKey: user.stringPrivate },
  });
  return JSON.stringify({
    address: user.stringAddress,
    privateKey: user.stringPrivate,
  });
};
