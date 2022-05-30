import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ClientProxyFactory,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  providers: [
    ApiService,
    {
      provide: 'BLOCK_SERVICE',
      useFactory: (configService) => {
        const microServicePort = configService.get('BLOCKCHAIN_SERVICE_PORT');
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: { port: microServicePort },
        });
      },
      inject: [ConfigService],
    },
  ],
  controllers: [ApiController],
  imports: [HttpModule],
  exports: [ApiService],
})
export class ApiModule {}
