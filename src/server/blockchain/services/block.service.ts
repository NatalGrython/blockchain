import { Injectable } from '@nestjs/common';
import { Block, createBlock } from 'blockchain-library';

@Injectable()
export class BlockService {
  private block: Block | null = null;

  createBlock(miner: string, lastHash: string) {
    this.block = createBlock(miner, lastHash);
    return this.block;
  }

  getBlock() {
    if (this.block === null) {
      throw new Error('Block not defined');
    }
    return this.block;
  }
  hasInstance() {
    if (this.block === null) {
      return false;
    }
    return true;
  }
}
