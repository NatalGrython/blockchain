import { Injectable } from '@nestjs/common';
import { TcpService } from 'src/tcp/tcp.service';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';

@Injectable()
export class ApiService {
  constructor(private tcpService: TcpService) {}

  private request(pattern: string, data?: any) {
    return this.tcpService.send(1907, 'localhost', {
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

  createTransaction(createTransactionDto: CreateTransactionDto) {
    return this.request('transaction', createTransactionDto);
  }
}
