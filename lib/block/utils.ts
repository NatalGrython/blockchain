import { Worker } from "worker_threads";
import { AbortError } from "../errors";
import { WorkerData } from "../types";

export const workerJob = (
  workerPath: string,
  workerData: WorkerData,
  signal: AbortSignal
) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, {
      workerData,
    });

    if (signal.aborted) {
      reject(new AbortError(workerData));
    }

    //@ts-ignore
    signal.addEventListener("abort", () => {
      reject(new AbortError(workerData));
    });

    worker.on("message", (message) => {
      if (message.type === "DONE") {
        resolve(message);
        worker.terminate();
      }
    });
  });
