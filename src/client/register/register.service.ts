import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RegisterService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  nodeExists(nodes: any[], currentNode: any) {
    return !!nodes.find(
      (item) =>
        item.host === currentNode.host && item.port === currentNode.port,
    );
  }

  async registerNode() {
    const proxyHost = this.configService.get('PROXY_SERVICE_HOST');
    const proxyPort = Number(this.configService.get('PROXY_SERVICE_PORT'));
    const currentHost = this.configService.get('SERVICE_HOST');
    const currentPort = Number(this.configService.get('HTTP_SERVICE_PORT'));

    const allNodes: any = await firstValueFrom(
      this.httpService.get(`http://${proxyHost}:${proxyPort}/node`),
    );

    if (
      !this.nodeExists(allNodes.data, { host: currentHost, port: currentPort })
    ) {
      return firstValueFrom<any>(
        this.httpService.post(`http://${proxyHost}:${proxyPort}/node`, {
          host: currentHost,
          port: currentPort,
        }),
      );
    }
  }
}
