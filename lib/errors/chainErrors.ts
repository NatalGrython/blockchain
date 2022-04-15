export class ChainNotCreatedError extends Error {
  public chainFileName: string;
  public originalError: Error;

  constructor(fileName: string, error: Error) {
    super(`Chain for ${fileName} is not created: ${error.message}`);
    this.chainFileName = fileName;
    this.originalError = error;
  }
}

export class ChainNotLoadedError extends Error {
  public chainFileName: string;
  public originalError: Error;

  constructor(fileName: string, error: Error) {
    super(`Chain for ${fileName} is not loaded: ${error.message}`);
    this.chainFileName = fileName;
    this.originalError = error;
  }
}
