import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, map } from 'rxjs';
import { GetBalanceDto } from 'src/dto/balance.dto';
import { PushBlockDto } from 'src/dto/push-block.dto';
import { CreateTransactionClientDto } from 'src/dto/transaction.dto';
import { ProxyServerNotAnswerException } from './exeptions/proxy-server.exeption';

@Injectable()
export class ApiService {
  constructor(
    @Inject('BLOCK_SERVICE') private tcpService: ClientProxy,
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  getBalance(getBalanceDto: GetBalanceDto) {
    return this.tcpService.send('balance', getBalanceDto);
  }

  getFullChain() {
    return this.tcpService.send('chain', '');
  }

  createUser() {
    return this.tcpService.send('user', '');
  }

  getOwnerChain() {
    return this.tcpService.send('owner', '');
  }

  async createTransaction(createTransactionDto: CreateTransactionClientDto) {
    const allNodes = await this.getAllNodes();

    return this.tcpService.send('transaction', {
      ...createTransactionDto,
      addresses: allNodes,
    });
  }

  getBlock(index: string) {
    return this.tcpService.send('block', index);
  }

  pushBlock(pushBlockDto: PushBlockDto) {
    return this.tcpService.send('push', pushBlockDto);
  }

  private async getAllNodes() {
    const proxyPort = this.configService.get('PROXY_SERVICE_PORT');
    const proxyHost = this.configService.get('PROXY_SERVICE_HOST');
    try {
      const nodes = await firstValueFrom(
        this.httpService
          .get(`http://${proxyHost}:${proxyPort}/node`)
          .pipe(map((item) => item.data)),
      );

      return nodes;
    } catch (error) {
      throw new ProxyServerNotAnswerException(
        'Server not answer',
        `http://${proxyHost}:${proxyPort}`,
      );
    }
  }
}
