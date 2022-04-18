import { Address } from '../interfaces/address';

export class CreateTransactionServerDto {
  readonly address: string;
  readonly privateKey: string;
  readonly recipient: string;
  readonly value: number;
  readonly reason: string;
  readonly addresses: Address[];
}
