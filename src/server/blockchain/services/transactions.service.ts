import { Injectable } from '@nestjs/common';
import { createTransaction, Transaction, User } from 'blockchain-library';

@Injectable()
export class TransactionService {
  private transaction: Transaction | null = null;

  createTransaction(
    user: User,
    lastHash: string,
    to: string,
    value: number,
    reason: string,
  ) {
    this.transaction = createTransaction(user, lastHash, to, value, reason);
    return this.transaction;
  }

  getTransaction() {
    if (this.transaction === null) {
      throw new Error('Transaction not defined');
    }
    return this.transaction;
  }
  hasInstance() {
    if (this.transaction === null) {
      return false;
    }
    return true;
  }
}
