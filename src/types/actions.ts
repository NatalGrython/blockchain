import { serializeBlockJSON } from "blockchain-library";
import {
  GET_BALANCE,
  GET_FULL_CHAIN,
  CREATE_USER,
  PUSH_BLOCK,
  CREATE_TRANSACTION,
  GET_BLOCK,
  GET_OWNER,
} from "../constants/actions";

type AddressNode = {
  port: number;
  host: string;
};

type GetBalanceAction = {
  type: typeof GET_BALANCE;
  address: string;
};

type GetFullChainAction = {
  type: typeof GET_FULL_CHAIN;
};

type CreateUserAction = {
  type: typeof CREATE_USER;
};

type PushBlockAction = {
  type: typeof PUSH_BLOCK;
  block: ReturnType<typeof serializeBlockJSON>;
  size: number;
  addressNode: AddressNode;
};

type CreateTransactionAction = {
  type: typeof CREATE_TRANSACTION;
  address: string;
  privateKey: string;
  recipient: string;
  value: number;
  reason: string;
  addresses: AddressNode[];
  hard?: boolean;
};

type GetBlockAction = {
  type: typeof GET_BLOCK;
  index: number;
};

type GetOwnerAction = {
  type: typeof GET_OWNER;
};

export type Action =
  | GetBalanceAction
  | GetFullChainAction
  | CreateUserAction
  | CreateTransactionAction
  | PushBlockAction
  | GetBlockAction
  | GetOwnerAction;
