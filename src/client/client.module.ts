import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';

@Module({
  controllers: [],
  providers: [],
  imports: [ApiModule],
})
export class ClientModule {}
