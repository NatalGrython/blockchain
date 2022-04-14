import { Module } from '@nestjs/common';
import { TcpModule } from 'src/tcp/tcp.module';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  providers: [ApiService],
  controllers: [ApiController],
  imports: [TcpModule],
})
export class ApiModule {}
