import { DynamicModule, Module } from '@nestjs/common';
import { BlockchainService } from './blockchaim.service';
import {
  BLOCK_CHAIN_INSTANCE,
  CREATE_USER_INSTANCE,
  OWNER_INSTANCE,
  ABORT_CONTROLLER,
  GLOBAL_BLOCK,
  CREATE_TRANSACTION_INSTANCE,
  CREATE_BLOCK_INSTANCE,
  LOAD_USER_INSTANCE,
} from './blockchain.constants';
import { createBlockChain } from './utils/create-blockchain';
import { createOrLoadOwner } from './utils/create-owner.utils';
import {
  createUser,
  createBlock,
  newTransaction,
  loadUser,
} from 'blockchain-library';
import { TcpModule } from 'src/tcp/tcp.module';

@Module({})
export class BlockchainModule {
  static register(fileName: string, ownerPath: string): DynamicModule {
    return {
      module: BlockchainModule,
      providers: [
        {
          provide: ABORT_CONTROLLER,
          useClass: AbortController,
        },
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
        {
          provide: GLOBAL_BLOCK,
          useFactory: async (chain, user) => {
            const block = createBlock(
              user.stringAddress,
              await chain.lastHash(),
            );
            return { block };
          },
          inject: [
            { token: BLOCK_CHAIN_INSTANCE, optional: true },
            { token: OWNER_INSTANCE, optional: true },
          ],
        },
        {
          provide: CREATE_USER_INSTANCE,
          useFactory: () => createUser,
        },
        {
          provide: CREATE_TRANSACTION_INSTANCE,
          useFactory: () => newTransaction,
        },
        {
          provide: CREATE_BLOCK_INSTANCE,
          useFactory: () => createBlock,
        },
        {
          provide: LOAD_USER_INSTANCE,
          useFactory: () => loadUser,
        },
        BlockchainService,
      ],
      exports: [BlockchainService],
      imports: [TcpModule],
    };
  }
}
