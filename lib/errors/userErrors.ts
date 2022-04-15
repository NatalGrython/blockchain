export class UserNotCreatedError extends Error {
  public originalError: Error;

  constructor(error: Error) {
    super(`User not created: ${error.message}`);
    this.originalError = error;
  }
}
