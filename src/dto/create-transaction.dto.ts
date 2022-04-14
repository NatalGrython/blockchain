export class CreateTransactionDto {
  readonly address: string;
  readonly privateKey: string;
  readonly recipient: string;
  readonly value: number;
  readonly reason: string;
  readonly addresses: { host: string; port: number }[];
}
