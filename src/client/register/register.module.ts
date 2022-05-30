import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RegisterService } from './register.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [RegisterService],
  exports: [RegisterService],
})
export class RegisterModule {}
