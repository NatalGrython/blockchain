import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CreateTransactionServerDto } from './dto/create-transaction.dto.server';
import { PushBlockDto } from './dto/push-block.dto';
import { ServerService } from './server.service';

@Controller()
export class ServiceController {
  constructor(private serverService: ServerService) {}

  @MessagePattern('balance')
  getBalance(address: string) {
    return this.serverService.getBalance(address);
  }

  @MessagePattern('block')
  getBlock(index: number) {
    this.serverService.getBlock(index);
  }

  @MessagePattern('chain')
  getAllChain() {
    return this.serverService.getFullChain();
  }

  @MessagePattern('user')
  createUser() {
    return this.serverService.createUser();
  }

  @MessagePattern('owner')
  getOwner() {
    return this.serverService.getOwner();
  }

  @MessagePattern('transaction')
  createTransaction(createTransactionDto: CreateTransactionServerDto) {
    return this.serverService.createTransaction(createTransactionDto);
  }

  @MessagePattern('push')
  pushBlocks(pushBlockDto: PushBlockDto) {
    return this.serverService.pushBlocks(pushBlockDto);
  }
}
