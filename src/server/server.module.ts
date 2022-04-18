import { Module } from '@nestjs/common';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ServiceController } from './server.controller';
import { ServerService } from './server.service';

@Module({
  controllers: [ServiceController],
  providers: [ServerService],
  imports: [BlockchainModule],
})
export class ServerModule {}
