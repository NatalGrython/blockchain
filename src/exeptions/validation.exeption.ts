import { HttpException, HttpStatus } from '@nestjs/common';
import { MappedError } from '../interfaces/mapped-error';

export class ValidationException extends HttpException {
  public errors: MappedError;

  constructor(response: string, errors: MappedError) {
    super(response, HttpStatus.BAD_REQUEST);
    this.errors = errors;
  }
}
