import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TcpModule } from 'src/tcp/tcp.module';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  providers: [ApiService],
  controllers: [ApiController],
  imports: [TcpModule, HttpModule],
})
export class ApiModule {}
