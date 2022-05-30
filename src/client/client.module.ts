import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { RegisterModule } from './register/register.module';
import { EventGateway } from './webscoket/events.gateway';

@Module({
  controllers: [],
  providers: [EventGateway],
  imports: [ApiModule, RegisterModule],
})
export class ClientModule {}
