import { Inject, Injectable } from '@nestjs/common';
import {
  BlockChain,
  User,
  Block,
  TXS_LIMIT,
  deserializeBlock,
  createConnectionDb,
  BlockChainEntity,
} from 'blockchain-library';
import { firstValueFrom, zip } from 'rxjs';
import { CreateTransactionDto } from 'src/dto/create-transaction.dto';
import { TcpService } from 'src/tcp/tcp.service';
import { BLOCK_CHAIN_INSTANCE, OWNER_INSTANCE } from './blockchain.constants';
import { AbortService } from './services/abort.service';
import { BlockService } from './services/block.service';
import { TransactionService } from './services/transactions.service';
import { UserService } from './services/user.service';

@Injectable()
export class BlockchainService {
  constructor(
    @Inject(BLOCK_CHAIN_INSTANCE) private blockchain: BlockChain,
    @Inject(OWNER_INSTANCE) private owner: User,
    private transactionService: TransactionService,
    private blockService: BlockService,
    private userService: UserService,
    private abortService: AbortService,
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
    const user = await this.userService.createUser();
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
    const user = this.userService.parseUser(
      createTransactionDto.address,
      createTransactionDto.privateKey,
    );
    const transaction = this.transactionService.createTransaction(
      user,
      await this.blockchain.lastHash(),
      createTransactionDto.recipient,
      createTransactionDto.value,
      createTransactionDto.reason,
    );

    let globalBlock: Block;
    let abortController: AbortController;

    if (!this.blockService.hasInstance()) {
      globalBlock = this.blockService.createBlock(
        this.owner.stringAddress,
        await this.blockchain.lastHash(),
      );
    } else {
      globalBlock = this.blockService.getBlock();
    }

    if (!this.abortService.hasInstance()) {
      abortController = this.abortService.createAbortController();
    } else {
      abortController = this.abortService.getAbortController();
    }

    if (globalBlock.transactions.length + 1 > TXS_LIMIT) {
      return 'fail';
    } else if (globalBlock.transactions.length + 1 === TXS_LIMIT) {
      try {
        await globalBlock.addTransaction(this.blockchain, transaction);
        await globalBlock.accept(this.blockchain, user, abortController.signal);
        console.log('work');
        await this.blockchain.addNewBlock(globalBlock);
        this.pushBlockToNet(
          createTransactionDto.addresses,
          globalBlock,
          await this.blockchain.size(),
        );
        this.blockService.createBlock(
          this.owner.stringAddress,
          await this.blockchain.lastHash(),
        );
      } catch (error) {
        return error;
      }
    } else {
      try {
        await globalBlock.addTransaction(this.blockchain, transaction);
        console.log(globalBlock);
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

    const abortController = this.abortService.getAbortController();
    abortController.abort();
    this.abortService.createAbortController();

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

    const abortController = this.abortService.getAbortController();
    abortController.abort();
    this.abortService.createAbortController();
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
