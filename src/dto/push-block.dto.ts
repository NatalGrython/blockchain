import { serializeBlockJSON } from 'blockchain-library';
import { IsObject, IsNotEmptyObject, IsNumber } from 'class-validator';
import { Address } from '../interfaces/address';

export class PushBlockDto {
  @IsObject({ message: 'Это объект' })
  @IsNotEmptyObject({ nullable: false }, { message: 'Не пустой объект' })
  readonly block: ReturnType<typeof serializeBlockJSON>;
  @IsNumber({}, { message: 'Это число' })
  readonly size: number;
  @IsObject({ message: 'Это объект' })
  @IsNotEmptyObject({ nullable: false }, { message: 'Не пустой объект' })
  readonly addressNode: Address;
}
