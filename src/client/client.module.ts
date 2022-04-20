import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { EventGateway } from './webscoket/events.gateway';

@Module({
  controllers: [],
  providers: [EventGateway],
  imports: [ApiModule],
})
export class ClientModule {}
