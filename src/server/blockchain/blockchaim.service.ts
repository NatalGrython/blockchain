import { Inject, Injectable } from '@nestjs/common';
import {
  BlockChain,
  createUser as createUserBlockchain,
  User,
  Block,
  TXS_LIMIT,
  newTransaction,
  createBlock,
  loadUser,
  deserializeBlock,
  createConnectionDb,
  BlockChainEntity,
} from 'blockchain-library';
import { firstValueFrom, from, zip } from 'rxjs';
import { CreateTransactionDto } from 'src/dto/create-transaction.dto';
import { TcpService } from 'src/tcp/tcp.service';
import {
  ABORT_CONTROLLER,
  BLOCK_CHAIN_INSTANCE,
  CREATE_USER_INSTANCE,
  GLOBAL_BLOCK,
  OWNER_INSTANCE,
  CREATE_BLOCK_INSTANCE,
  CREATE_TRANSACTION_INSTANCE,
  LOAD_USER_INSTANCE,
} from './blockchain.constants';

@Injectable()
export class BlockchainService {
  constructor(
    @Inject(BLOCK_CHAIN_INSTANCE) private blockchain: BlockChain,
    @Inject(OWNER_INSTANCE) private owner: User,
    @Inject(ABORT_CONTROLLER) private abortController: AbortController,
    @Inject(GLOBAL_BLOCK) private globalBlock: Block,
    @Inject(CREATE_USER_INSTANCE)
    private createUserFunc: typeof createUserBlockchain,
    @Inject(CREATE_BLOCK_INSTANCE)
    private createBlockFunc: typeof createBlock,
    @Inject(CREATE_TRANSACTION_INSTANCE)
    private createTransactionFunc: typeof newTransaction,
    @Inject(LOAD_USER_INSTANCE)
    private loadUserFunc: typeof loadUser,
    private tcpService: TcpService,
  ) {}

  async getBalance(address: string) {
    const size = await this.blockchain.size();
    return this.blockchain.getBalance(address, size);
  }

  getFullChain() {
    return this.blockchain.getAllChain();
  }

  async getBlock(index: number) {
    const { blocks } = await this.blockchain.getAllChain();
    return blocks[index];
  }

  async createUser() {
    console.log(this.globalBlock);
    const user = await this.createUserFunc();
    return {
      address: user.stringAddress,
      privateKey: user.stringPrivate,
    };
  }

  getOwner() {
    return {
      address: this.owner.stringAddress,
      privateKey: this.owner.stringPrivate,
    };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    const user = this.loadUserFunc(
      createTransactionDto.address,
      createTransactionDto.privateKey,
    );
    const transaction = this.createTransactionFunc(
      user,
      await this.blockchain.lastHash(),
      createTransactionDto.recipient,
      createTransactionDto.value,
      createTransactionDto.reason,
    );
    if (this.globalBlock.transactions.length + 1 > TXS_LIMIT) {
      return 'fail';
    } else if (this.globalBlock.transactions.length + 1 === TXS_LIMIT) {
      try {
        await this.globalBlock.addTransaction(this.blockchain, transaction);
        await this.globalBlock.accept(
          this.blockchain,
          user,
          this.abortController.signal,
        );
        this.pushBlockToNet(
          createTransactionDto.addresses,
          this.globalBlock,
          await this.blockchain.size(),
        );
      } catch (error) {
        return error;
      }
    } else {
      try {
        await this.globalBlock.addTransaction(this.blockchain, transaction);
      } catch (error) {
        return error;
      }
    }

    return transaction;
  }

  async pushBlocks(
    block: Block,
    size: number,
    addressNode: { port: number; host: string },
  ) {
    const currentBlock = deserializeBlock(block);

    if (
      !(await currentBlock.isValid(
        this.blockchain,
        await this.blockchain.size(),
        'check',
      ))
    ) {
      const currentSize = await this.blockchain.size();

      if (currentSize < size) {
        await this.compareBlocks(addressNode, size);
        return 'ok';
      }
      return 'fail';
    }

    await this.blockchain.addNewBlock(currentBlock);

    this.abortController.abort();
    this.abortController = new AbortController();

    return 'ok';
  }

  private async compareBlocks(
    addressNode: {
      port: number;
      host: string;
    },
    size: number,
  ) {
    const block = await firstValueFrom(
      this.tcpService.send(addressNode.port, addressNode.host, {
        pattern: 'block',
        data: 0,
      }),
    );

    const genesis = deserializeBlock(block);

    if (!(genesis.currentHash === genesis.hash())) {
      return;
    }

    const connection = await createConnectionDb(this.blockchain.fileName);
    const repository = connection.getRepository(BlockChainEntity);

    await repository.clear();
    await connection.close();

    await this.blockchain.addNewBlock(genesis);

    for (let i = 1; i < size; i++) {
      const stringCurrentBlock = await firstValueFrom(
        this.tcpService.send(addressNode.port, addressNode.host, {
          pattern: 'block',
          data: i,
        }),
      );
      const currentBlock = deserializeBlock(stringCurrentBlock);

      if (!(await currentBlock.isValid(this.blockchain, i, 'compare'))) {
        return;
      }

      await this.blockchain.addNewBlock(currentBlock);
    }
  }

  private pushBlockToNet(
    address: { host: string; port: number }[],
    block: Block,
    size: number,
  ) {
    zip(
      address.map((address) =>
        this.tcpService.send(address.port, address.host, {
          pattern: 'push',
          data: { block, size, addressNode: { host: 'localhost', port: 1907 } },
        }),
      ),
    );
  }
}
