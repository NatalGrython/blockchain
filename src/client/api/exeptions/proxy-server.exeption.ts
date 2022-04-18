import { HttpException } from '@nestjs/common';

export class ProxyServerNotAnswerException extends HttpException {
  public address: string;

  constructor(response: string, address: string) {
    super(response, 521);
    this.address = address;
  }
}
