import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TcpService } from 'src/tcp/tcp.service';
import { CreateTransactionClientDto } from './dto/create-transaction.dto.client';

@Injectable()
export class ApiService {
  constructor(
    private tcpService: TcpService,
    private configService: ConfigService,
  ) {}

  private request(pattern: string, data?: any) {
    const microservicePort = this.configService.get('MICROSERVICE_PORT');
    return this.tcpService.send(microservicePort, 'localhost', {
      pattern,
      data,
    });
  }

  getBalance(address: string) {
    return this.request('balance', address);
  }

  getFullChain() {
    return this.request('chain');
  }

  createUser() {
    return this.request('user');
  }

  getOwnerChain() {
    return this.request('owner');
  }

  createTransaction(createTransactionDto: CreateTransactionClientDto) {
    return this.request('transaction', createTransactionDto);
  }
}
