import { HttpException } from '@nestjs/common';
import { MappedError } from 'src/interfaces/mapped-error';

export class TcpExceptionClient extends HttpException {
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

export class TcpExceptionServer extends Error {
  public errors: MappedError;
  public host: string;
  public port: number;

  constructor(
    response: string,
    errors: MappedError,
    port: number,
    host: string,
  ) {
    super(response);
    this.errors = errors;
    this.port = port;
    this.host = host;
  }
}

export const TcpExceptionFabric = (
  response: string,
  errors: MappedError,
  port: number,
  host: string,
  isHttp: boolean = true,
) => {
  if (isHttp) {
    return new TcpExceptionClient(response, errors, port, host);
  }
  return new TcpExceptionServer(response, errors, port, host);
};
