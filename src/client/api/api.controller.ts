import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseFilters,
  UsePipes,
} from '@nestjs/common';
import { GetBalanceDto } from '../../dto/balance.dto';
import { CreateTransactionClientDto } from '../../dto/transaction.dto';
import { ValidationExceptionFilter } from './filters/validation-exeption.filter';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { ApiService } from './api.service';
import { ProxyServerNotAnswerExceptionFilter } from './filters/proxy-server.filter';
import { PushBlockDto } from 'src/dto/push-block.dto';

@Controller('api')
@UseFilters(new ValidationExceptionFilter())
export class ApiController {
  constructor(private apiService: ApiService) {}

  @Get('balance')
  @UsePipes(new ValidationPipe())
  getBalance(@Body() getBalanceDto: GetBalanceDto) {
    return this.apiService.getBalance(getBalanceDto);
  }

  @Get('chain')
  getAllChain() {
    return this.apiService.getFullChain();
  }

  @Get('user')
  createUser() {
    return this.apiService.createUser();
  }

  @Get('owner')
  getOwner() {
    return this.apiService.getOwnerChain();
  }

  @Post('transaction')
  @UsePipes(new ValidationPipe())
  @UseFilters(new ProxyServerNotAnswerExceptionFilter())
  createTransaction(@Body() createTransactionDto: CreateTransactionClientDto) {
    return this.apiService.createTransaction(createTransactionDto);
  }

  @Post('push')
  @UsePipes(new ValidationPipe())
  pushBlock(@Body() pushBlockDto: PushBlockDto) {
    return this.apiService.pushBlock(pushBlockDto);
  }

  @Get('block/:index')
  getBlock(@Param('index') index: string) {
    return this.apiService.getBlock(index);
  }
}
