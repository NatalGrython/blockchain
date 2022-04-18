import { Controller, UseFilters, UsePipes } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { GetBalanceDto } from 'src/dto/balance.dto';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { CreateTransactionDto } from '../dto/transaction.dto';
import { PushBlockDto } from './dto/push-block.dto';
import { ValidationExceptionFilter } from './filter/validation.filter';
import { ServerService } from './server.service';

@UseFilters(new ValidationExceptionFilter())
@Controller()
export class ServiceController {
  constructor(private serverService: ServerService) {}

  @UsePipes(new ValidationPipe(false))
  @MessagePattern('balance')
  getBalance(getBalanceDto: GetBalanceDto) {
    return this.serverService.getBalance(getBalanceDto.address);
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
  @UsePipes(new ValidationPipe(false))
  createTransaction(createTransactionDto: CreateTransactionDto) {
    return this.serverService.createTransaction(createTransactionDto);
  }

  @MessagePattern('push')
  pushBlocks(pushBlockDto: PushBlockDto) {
    return this.serverService.pushBlocks(pushBlockDto);
  }
}
