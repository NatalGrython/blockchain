import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiService } from './api.service';
import { CreateTransactionDto } from '../../dto/create-transaction.dto';

@Controller('api')
export class ApiController {
  constructor(private apiService: ApiService) {}

  @Get('balance')
  getBalance(@Body('address') address: string) {
    return this.apiService.getBalance(address);
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
  createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.apiService.createTransaction(createTransactionDto);
  }
}
