import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlockChain,
  User,
  Block,
  TXS_LIMIT,
  deserializeBlock,
  createConnectionDb,
  BlockChainEntity,
  serializeTransactionJSON,
  serializeBlockJSON,
} from 'blockchain-library';
import { firstValueFrom, map, zip } from 'rxjs';
import { CreateTransactionDto } from 'src/dto/transaction.dto';
import { Address } from '../../interfaces/address';
import { BLOCK_CHAIN_INSTANCE, OWNER_INSTANCE } from './blockchain.constants';
import { AbortService } from './services/abort.service';
import { BlockService } from './services/block.service';
import { TransactionService } from './services/transactions.service';
import { UserService } from './services/user.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BlockchainService {
  constructor(
    @Inject(BLOCK_CHAIN_INSTANCE) private blockchain: BlockChain,
    @Inject(OWNER_INSTANCE) private owner: User,
    private transactionService: TransactionService,
    private blockService: BlockService,
    private userService: UserService,
    private abortService: AbortService,
    private httpService: HttpService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getBalance(address: string) {
    this.eventEmitter.emit('balance', {
      balance: await this.blockchain.getBalance(address),
      address,
    });
    return this.blockchain.getBalance(address);
  }

  async getFullChain() {
    const { blocks } = await this.blockchain.getAllChain();
    const currentBlocks = blocks.map(serializeBlockJSON);
    return currentBlocks;
  }

  async getBlock(index: number) {
    const { blocks } = await this.blockchain.getAllChain();
    const currentBlock = serializeBlockJSON(blocks[index]);
    this.eventEmitter.emit('block', { currentBlock, index });
    return currentBlock;
  }

  async createUser() {
    const user = await this.userService.createUser();
    this.eventEmitter.emit('user', { user });
    return {
      address: user.stringAddress,
      privateKey: user.stringPrivate,
    };
  }

  getOwner() {
    this.eventEmitter.emit('owner', { owner: this.owner });
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
        this.eventEmitter.emit('mining', { status: 'on' });
        await globalBlock.accept(this.blockchain, user, abortController.signal);
        this.eventEmitter.emit('mining', { status: 'off' });
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
      } catch (error) {
        return error;
      }
    }
    this.eventEmitter.emit('transaction', {
      transaction: serializeTransactionJSON(transaction),
    });
    return serializeTransactionJSON(transaction);
  }

  async pushBlocks(
    block: ReturnType<typeof serializeBlockJSON>,
    size: number,
    addressNode: Address,
  ) {
    const currentBlock = deserializeBlock(block);

    if (!(await currentBlock.isValid(this.blockchain))) {
      const currentSize = await this.blockchain.size();

      if (currentSize < size) {
        await this.compareBlocks(addressNode, size);
        return 'ok';
      }
      return 'fail';
    }

    await this.blockchain.addNewBlock(currentBlock);

    if (this.abortService.hasInstance()) {
      const abortController = this.abortService.getAbortController();
      abortController.abort();
      this.abortService.createAbortController();
    }

    return 'ok';
  }

  private async compareBlocks(addressNode: Address, size: number) {
    const block = await firstValueFrom(
      this.httpService
        .get(`http://${addressNode.host}:${addressNode.port}/api/block/0`)
        .pipe(map((item) => item.data)),
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
        this.httpService
          .get(`http://${addressNode.host}:${addressNode.port}/api/block/${i}`)
          .pipe(map((item) => item.data)),
      );
      const currentBlock = deserializeBlock(stringCurrentBlock);

      if (!(await currentBlock.isValid(this.blockchain))) {
        return;
      }

      await this.blockchain.addNewBlock(currentBlock);
    }

    if (this.abortService.hasInstance()) {
      const abortController = this.abortService.getAbortController();
      abortController.abort();
      this.abortService.createAbortController();
    }
  }

  private pushBlockToNet(address: Address[], block: Block, size: number) {
    const currentAddress = address.filter(
      (address) =>
        address.port !== Number(this.configService.get('HTTP_SERVICE_PORT')),
    );

    const $responses = zip(
      currentAddress.map((address) => {
        return this.httpService.post(
          `http://${address.host}:${address.port}/api/push`,
          {
            block: serializeBlockJSON(block),
            size,
            addressNode: {
              host: this.configService.get('SERVICE_HOST'),
              port: this.configService.get('HTTP_SERVICE_PORT'),
            },
          },
        );
      }),
    );

    $responses.subscribe(
      (value) => {
        console.log(value.map((item) => item.data));
      },
      (error) => console.log(error),
    );
  }
}
