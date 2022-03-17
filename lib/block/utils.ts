import { Worker } from "worker_threads";

type WorkerData = {
  json: any;
};

export const workerJob = (
  workerPath: string,
  workerData: WorkerData,
  signal: AbortSignal
) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, { workerData });
    if (signal.aborted) {
      reject("abort");
    }

    //@ts-ignore
    signal.addEventListener("abort", () => {
      reject("abort");
    });

    worker.on("message", (message) => {
      if (message.type === "DONE") {
        resolve(message.nonce);
        worker.terminate();
      }
    });
  });
