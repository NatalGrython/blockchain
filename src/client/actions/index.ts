import { CREATE_USER, GET_BALANCE, GET_FULL_CHAIN } from "./constants";

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

export type Action = GetBalanceAction | GetFullChain | CreateUserAction;
