import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map } from 'rxjs';
import { GetBalanceDto } from 'src/dto/balance.dto';
import { CreateTransactionClientDto } from 'src/dto/transaction.dto';
import { TcpService } from '../../tcp/tcp.service';
import { ProxyServerNotAnswerException } from './exeptions/proxy-server.exeption';

@Injectable()
export class ApiService {
  constructor(
    private tcpService: TcpService,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  getBalance(getBalanceDto: GetBalanceDto) {
    return this.request('balance', getBalanceDto);
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

  async createTransaction(createTransactionDto: CreateTransactionClientDto) {
    const allNodes = await this.getAllNodes();

    return this.request('transaction', {
      ...createTransactionDto,
      addresses: allNodes,
    });
  }

  private request(pattern: string, data?: any) {
    const microservicePort = this.configService.get('MICROSERVICE_PORT');
    return this.tcpService.send(microservicePort, 'localhost', {
      pattern,
      data,
    });
  }

  private async getAllNodes() {
    const proxyPort = this.configService.get('PROXY_PORT');
    const proxyHost = this.configService.get('PROXY_HOST');
    return [];
    // try {
    //   const nodes = await firstValueFrom(
    //     this.httpService
    //       .get(`http://${proxyHost}:${proxyPort}`)
    //       .pipe(map((item) => item.data)),
    //   );

    //   return nodes;
    // } catch (error) {
    //   throw new ProxyServerNotAnswerException(
    //     'Server not answer',
    //     `http://${proxyHost}:${proxyPort}`,
    //   );
    // }
  }
}
