import { HttpException, HttpStatus } from '@nestjs/common';
import { MappedError } from '../interfaces/mapped-error';

export class ValidationExceptionClient extends HttpException {
  public errors: MappedError;

  constructor(response: string, errors: MappedError) {
    super(response, HttpStatus.BAD_REQUEST);
    this.errors = errors;
  }
}

export class ValidationExceptionServer extends Error {
  public errors: MappedError;

  constructor(response: string, errors: MappedError) {
    super(response);
    this.errors = errors;
  }
}

export const ValidationFabric = (
  response: string,
  errors: MappedError,
  isHttp: boolean = true,
) => {
  if (isHttp) {
    return new ValidationExceptionClient(response, errors);
  }
  return new ValidationExceptionServer(response, errors);
};
