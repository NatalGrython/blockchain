import { Injectable } from '@nestjs/common';

@Injectable()
export class AbortService {
  private abortController: AbortController | null = null;

  createAbortController() {
    this.abortController = new AbortController();
    return this.abortController;
  }

  getAbortController() {
    if (this.abortController === null) {
      throw new Error('Abort controller not defined');
    }
    return this.abortController;
  }

  hasInstance() {
    if (this.abortController === null) {
      return false;
    }
    return true;
  }
}
