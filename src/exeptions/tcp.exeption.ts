import { MappedError } from 'src/interfaces/mapped-error';

export class TcpException extends Error {
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
