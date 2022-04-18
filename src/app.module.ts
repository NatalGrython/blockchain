import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientModule } from './client/client.module';
import { ServerModule } from './server/server.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientModule,
    ServerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
