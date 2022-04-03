import { Action } from "../../types/actions";

export const parseAction = (action: Buffer) =>
  JSON.parse(action.toString("utf-8")) as Action;
