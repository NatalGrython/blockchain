import { Action } from "./types";

export const parseAction = (action: Buffer) =>
  JSON.parse(action.toString("utf-8")) as Action;
