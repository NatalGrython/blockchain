import { workerData, parentPort } from "worker_threads";
import { createHashSha } from "../utils";

const blockJson = workerData.json;

let nonce = blockJson.nonce;

while (
  createHashSha(JSON.stringify({ ...blockJson, nonce })).substring(0, 4) !==
  Array(4).fill("0").join("")
) {
  nonce++;
}
parentPort.postMessage({
  type: "DONE",
  nonce,
});
