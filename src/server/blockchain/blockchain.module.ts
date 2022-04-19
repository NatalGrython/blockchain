import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchaim.service';
import { BLOCK_CHAIN_INSTANCE, OWNER_INSTANCE } from './blockchain.constants';
import { createBlockChain } from './utils/create-blockchain';
import { createOrLoadOwner } from './utils/create-owner.utils';
import { UserService } from './services/user.service';
import { TransactionService } from './services/transactions.service';
import { BlockService } from './services/block.service';
import { AbortService } from './services/abort.service';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [
    UserService,
    TransactionService,
    BlockService,
    AbortService,
    BlockchainService,
    {
      provide: OWNER_INSTANCE,
      useFactory: async (configService: ConfigService) => {
        const ownerPath = configService.get('OWNER_PATH');
        const owner = await createOrLoadOwner(ownerPath);
        return owner;
      },
      inject: [ConfigService],
    },
    {
      provide: BLOCK_CHAIN_INSTANCE,
      useFactory: async (user, configService) => {
        const fileName = configService.get('DATABASE_PATH');
        const chain = await createBlockChain(fileName, user);
        return chain;
      },
      inject: [{ token: OWNER_INSTANCE, optional: true }, ConfigService],
    },
  ],
  exports: [BlockchainService],
  imports: [HttpModule],
})
export class BlockchainModule {}
