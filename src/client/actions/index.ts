import { GET_BALANCE } from "./constants";

type GetBalanceAction = {
  type: typeof GET_BALANCE;
  address: string;
};

export type Action = GetBalanceAction;
