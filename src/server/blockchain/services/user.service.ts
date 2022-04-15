import { Injectable } from '@nestjs/common';
import {
  createUser as createUserBlockchain,
  User,
  loadUser,
} from 'blockchain-library';

@Injectable()
export class UserService {
  private user: User | null = null;

  async createUser() {
    this.user = await createUserBlockchain();
    return this.user;
  }

  getTransaction() {
    if (this.user === null) {
      throw new Error('User not defined');
    }
    return this.user;
  }

  parseUser(address: string, purse: string) {
    return loadUser(address, purse);
  }

  hasInstance() {
    if (this.user === null) {
      return false;
    }
    return true;
  }
}
