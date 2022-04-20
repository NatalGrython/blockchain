import { Injectable } from '@nestjs/common';
import { PushBlockDto } from 'src/dto/push-block.dto';
import { CreateTransactionDto } from '../dto/transaction.dto';
import { BlockchainService } from './blockchain/blockchaim.service';

@Injectable()
export class ServerService {
  constructor(private blockChainService: BlockchainService) {}

  async getBalance(address: string) {
    return this.blockChainService.getBalance(address);
  }

  getFullChain() {
    return this.blockChainService.getFullChain();
  }

  getBlock(index: number) {
    return this.blockChainService.getBlock(index);
  }

  createUser() {
    return this.blockChainService.createUser();
  }

  getOwner() {
    return this.blockChainService.getOwner();
  }

  createTransaction(createTransaction: CreateTransactionDto) {
    return this.blockChainService.createTransaction(createTransaction);
  }

  pushBlocks(pushBlockDto: PushBlockDto) {
    return this.blockChainService.pushBlocks(
      pushBlockDto.block,
      pushBlockDto.size,
      pushBlockDto.addressNode,
    );
  }
}
