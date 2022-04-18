import { Injectable, UsePipes } from '@nestjs/common';
import { CreateTransactionDto } from 'src/dto/transaction.dto';
import { BlockchainService } from './blockchain/blockchaim.service';
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
