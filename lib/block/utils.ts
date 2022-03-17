import { Worker } from "worker_threads";

type WorkerData = {
  block: any;
  path: string;
};

export const workerJob = (
  workerPath: string,
  workerData: WorkerData,
  signal: AbortSignal
) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, {
      workerData,
      stdout: true,
      stdin: true,
      stderr: true,
    });

    if (signal.aborted) {
      reject("abort");
    }

    //@ts-ignore
    signal.addEventListener("abort", () => {
      reject("abort");
    });

    worker.on("message", (message) => {
      if (message.type === "DONE") {
        resolve(message);
        worker.terminate();
      }
    });
  });
