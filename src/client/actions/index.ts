import {
  CREATE_TRANSACTION,
  CREATE_USER,
  GET_BALANCE,
  GET_FULL_CHAIN,
  GET_OWNER,
} from "./constants";

type GetBalanceAction = {
  type: typeof GET_BALANCE;
  address: string;
};

type GetFullChain = {
  type: typeof GET_FULL_CHAIN;
};

type CreateUserAction = {
  type: typeof CREATE_USER;
};

type CreateTransactionAction = {
  type: typeof CREATE_TRANSACTION;
  address: string;
  privateKey: string;
  recipient: string;
  value: number;
  addresses: {
    port: number;
    host: string;
  }[];
};

type GetOwnerAction = {
  type: typeof GET_OWNER;
};

export type Action =
  | GetBalanceAction
  | GetFullChain
  | CreateUserAction
  | CreateTransactionAction
  | GetOwnerAction;
