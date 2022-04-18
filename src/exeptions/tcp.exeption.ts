import { HttpException } from '@nestjs/common';
import { MappedError } from 'src/interfaces/mapped-error';

export class TcpException extends HttpException {
  public errors: MappedError;
  public host: string;
  public port: number;

  constructor(
    response: string,
    errors: MappedError,
    port: number,
    host: string,
  ) {
    super(response, 400);
    this.errors = errors;
    this.port = port;
    this.host = host;
  }
}
