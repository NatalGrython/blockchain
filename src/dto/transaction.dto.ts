import {
  IsString,
  IsInt,
  IsPositive,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { Address } from '../interfaces/address';

export class CreateTransactionDto {
  @IsString({ message: 'Должно быть строкой' })
  readonly address: string;
  @IsString({ message: 'Должно быть строкой' })
  readonly privateKey: string;
  @IsString({ message: 'Должно быть строкой' })
  readonly recipient: string;
  @IsInt({ message: 'Должно быть числом' })
  @IsPositive({ message: 'Должно быть положительным' })
  readonly value: number;
  @IsString({ message: 'Должно быть строкой' })
  readonly reason: string;
  @IsArray({ message: 'Должен быть массив' })
  readonly addresses: Address[];
}

export class CreateTransactionClientDto extends PickType(CreateTransactionDto, [
  'privateKey',
  'address',
  'reason',
  'recipient',
  'value',
]) {}
