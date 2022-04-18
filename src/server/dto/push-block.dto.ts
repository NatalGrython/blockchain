import { deserializeBlock } from 'blockchain-library';
import { Address } from '../../interfaces/address';

export class PushBlockDto {
  readonly block: ReturnType<typeof deserializeBlock>;
  readonly size: number;
  readonly addressNode: Address;
}
