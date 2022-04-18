export class CreateTransactionClientDto {
  readonly address: string;
  readonly privateKey: string;
  readonly recipient: string;
  readonly value: number;
  readonly reason: string;
}
