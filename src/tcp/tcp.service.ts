import { Inject, Injectable, Scope } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'net';
import { TCP_INSTANCE_TOKEN } from './tcp.constants';
import { Packet } from './interfaces/packet.interface';
import { transformPatternToRoute } from './utils/transform-pattern.utils';
import { MsPattern } from './interfaces/patter.interface';
import { randomUUID } from 'crypto';
import { TcpException } from 'src/exeptions/tcp.exeption';

@Injectable()
export class TcpService {
  private readonly delimiter = '#';

  constructor(@Inject(TCP_INSTANCE_TOKEN) private socket: Socket) {}

  send<T = any>(port: number, host: string, packet: Packet) {
    const pattern = this.normalizePattern(packet.pattern);

    return this.sendMessage<T>(port, host, {
      ...packet,
      pattern,
      id: randomUUID(),
    });
  }

  private sendMessage<T>(port: number, host: string, data: any) {
    return this.makeObservable<T>(port, host, this.formatMessageData(data));
  }

  private formatMessageData(message: any) {
    const messageData = JSON.stringify(message);
    const length = messageData.length;
    const data = length + this.delimiter + messageData;
    return data;
  }

  private makeObservable<T>(port: number, host: string, data: string) {
    return new Observable<T>((subscriber) => {
      console.log(port, host);
      this.socket.connect(Number(port), host);

      this.socket.on('data', (data) => {
        const dataJson = this.parseData<T>(data);
        if (dataJson.err) {
          subscriber.error(
            new TcpException(
              'Incorrect data',
              dataJson.err,
              this.socket.remotePort,
              this.socket.remoteAddress,
            ),
          );
        } else {
          subscriber.next(dataJson.response);
        }
        subscriber.complete();
      });

      this.socket.on('error', (error) => {
        subscriber.error(error);
      });

      this.socket.write(data, 'utf-8');
    });
  }

  private parseData<T>(data: Buffer): any {
    const message = data.toString('utf-8');

    const [_, messageBody] = message.split(this.delimiter);
    const dataJson = JSON.parse(messageBody);

    return dataJson;
  }

  private normalizePattern(pattern: MsPattern): string {
    return transformPatternToRoute(pattern);
  }
}
