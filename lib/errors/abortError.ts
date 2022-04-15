import { WorkerData } from "../types";

export class AbortError extends Error {
  public block: string;

  constructor(workerData: WorkerData) {
    super("Abort mining");
    this.block = workerData.block;
  }
}
