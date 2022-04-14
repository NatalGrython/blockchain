import { isFileExist } from './file-exists.utils';
import { newChain, loadChain, User } from 'blockchain-library';

export const createBlockChain = async (fileName: string, owner: User) => {
  const dbPath = fileName;
  if (!(await isFileExist(dbPath))) {
    await newChain(dbPath, owner.stringAddress);
  }
  return loadChain(dbPath);
};
