import { BlockChain, User } from "blockchain-library";
import { EventEmitter } from "events";
import {
  GET_BALANCE,
  GET_FULL_CHAIN,
  CREATE_USER,
  CREATE_TRANSACTION,
  PUSH_BLOCK,
  GET_BLOCK,
  GET_OWNER,
} from "../../constants/actions";
import { Action } from "../../types/actions";
import { createTransaction, addBlock } from "./create-transaction";
import { createUser } from "./create-user";
import { getBalance } from "./get-balance";
import { getBlock } from "./get-block";
import { getFullChain } from "./get-fullchain";
import { getOwner } from "./get-owner";

export const reduceAction = (
  action: Action,
  chain: BlockChain,
  owner: User,
  emitter: EventEmitter
) => {
  switch (action.type) {
    case GET_BALANCE:
      return getBalance(action.address, chain, emitter);
    case GET_FULL_CHAIN:
      return getFullChain(chain);
    case CREATE_USER:
      return createUser(emitter);
    case CREATE_TRANSACTION:
      return createTransaction({
        address: action.address,
        addressesNode: action.addresses,
        privateKey: action.privateKey,
        recipient: action.recipient,
        value: action.value,
        reason: action.reason,
        chain,
        owner,
        emitter,
      });
    case PUSH_BLOCK:
      return addBlock(
        action.block,
        chain,
        action.size,
        action.addressNode,
        owner,
        emitter
      );
    case GET_BLOCK:
      return getBlock(chain, action.index, emitter);
    case GET_OWNER:
      return getOwner(owner, emitter);
    default:
      return "Error";
  }
};
