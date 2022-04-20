import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GetBalanceDto } from 'src/dto/balance.dto';
import { PushBlockDto } from 'src/dto/push-block.dto';
import { CreateTransactionDto } from '../dto/transaction.dto';

import { ServerService } from './server.service';

@Controller()
export class ServiceController {
  constructor(private serverService: ServerService) {}

  @MessagePattern('balance')
  getBalance(getBalanceDto: GetBalanceDto) {
    return this.serverService.getBalance(getBalanceDto.address);
  }

  @MessagePattern('block')
  getBlock(index: number) {
    return this.serverService.getBlock(Number(index));
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
  createTransaction(createTransactionDto: CreateTransactionDto) {
    return this.serverService.createTransaction(createTransactionDto);
  }

  @MessagePattern('push')
  pushBlocks(pushBlockDto: PushBlockDto) {
    console.log(
      '🚀 ~ file: server.controller.ts ~ line 45 ~ ServiceController ~ pushBlocks ~ pushBlockDto',
      pushBlockDto,
    );
    return this.serverService.pushBlocks(pushBlockDto);
  }
}
