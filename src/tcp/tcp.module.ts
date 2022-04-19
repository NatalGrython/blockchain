import { DynamicModule, Module, Scope } from '@nestjs/common';
import { Socket, SocketConstructorOpts } from 'net';
import { TCP_INSTANCE_TOKEN } from './tcp.constants';
import { TcpService } from './tcp.service';

@Module({
  providers: [
    TcpService,
    {
      provide: TCP_INSTANCE_TOKEN,
      useClass: Socket,
      scope: Scope.TRANSIENT,
    },
  ],
  exports: [TcpService],
})
export class TcpModule {
  static register(config: SocketConstructorOpts): DynamicModule {
    return {
      module: TcpModule,
      providers: [
        {
          provide: TCP_INSTANCE_TOKEN,
          useFactory: () => new Socket(config),
        },
      ],
    };
  }
}
