import { EventEmitter } from "events";

import { sendRequest } from "./utils";

export const eventEmitter = new EventEmitter();

eventEmitter.on("event", (data) => {
  sendRequest(data);
});
