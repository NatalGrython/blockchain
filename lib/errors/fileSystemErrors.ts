export class FileExistError extends Error {
  public fileName: string;

  constructor(fileName: string) {
    super(`File ${fileName} already exists`);
    this.fileName = fileName;
  }
}

export class ConnectionError extends Error {
  public originalError: Error;
  constructor(error: Error) {
    super(`Connection error: ${error.message}`);

    this.originalError = error;
  }
}
