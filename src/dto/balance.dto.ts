import { IsNotEmpty, IsString } from 'class-validator';

export class GetBalanceDto {
  @IsString({ message: 'Должен быть строкой' })
  @IsNotEmpty({ message: 'Не должен быть пустым' })
  readonly address: string;
}
