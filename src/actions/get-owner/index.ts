import { User } from "blockchain-library";
import { EventEmitter } from "events";

export const getOwner = (user: User, emitter: EventEmitter) => {
  const ownerString = JSON.stringify({
    address: user.stringAddress,
    privateKey: user.stringPrivate,
  });

  emitter.emit("event", {
    type: "GET_OWNER",
    payload: { owner: ownerString },
  });
  return ownerString;
};
