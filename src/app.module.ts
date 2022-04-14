import { Module } from '@nestjs/common';
import { ClientModule } from './client/client.module';
import { ServerModule } from './server/server.module';

@Module({
  imports: [ClientModule, ServerModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
