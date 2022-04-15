import { DynamicModule, Module } from '@nestjs/common';
import { BlockchainService } from './blockchaim.service';
import { BLOCK_CHAIN_INSTANCE, OWNER_INSTANCE } from './blockchain.constants';
import { createBlockChain } from './utils/create-blockchain';
import { createOrLoadOwner } from './utils/create-owner.utils';
import { TcpModule } from 'src/tcp/tcp.module';
import { UserService } from './services/user.service';
import { TransactionService } from './services/transactions.service';
import { BlockService } from './services/block.service';
import { AbortService } from './services/abort.service';

@Module({})
export class BlockchainModule {
  static register(fileName: string, ownerPath: string): DynamicModule {
    return {
      module: BlockchainModule,
      providers: [
        UserService,
        TransactionService,
        BlockService,
        AbortService,
        BlockchainService,
        {
          provide: OWNER_INSTANCE,
          useFactory: async () => {
            const owner = await createOrLoadOwner(ownerPath);
            return owner;
          },
        },
        {
          provide: BLOCK_CHAIN_INSTANCE,
          useFactory: async (user) => {
            const chain = await createBlockChain(fileName, user);
            return chain;
          },
          inject: [{ token: OWNER_INSTANCE, optional: true }],
        },
      ],
      exports: [BlockchainService],
      imports: [TcpModule],
    };
  }
}
