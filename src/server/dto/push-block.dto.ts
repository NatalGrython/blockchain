import { deserializeBlock } from 'blockchain-library';

export class PushBlockDto {
  readonly block: ReturnType<typeof deserializeBlock>;
  readonly size: number;
  readonly addressNode: {
    host: string;
    port: number;
  };
}
