import { Injectable } from '@nestjs/common';
import { BlockchainService } from './blockchain/blockchaim.service';
import { CreateTransactionServerDto } from './dto/create-transaction.dto.server';
import { PushBlockDto } from './dto/push-block.dto';

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

  createTransaction(createTransaction: CreateTransactionServerDto) {
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
