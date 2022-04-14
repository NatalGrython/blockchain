import { appendFile, readFile } from 'fs/promises';
import { isFileExist } from './file-exists.utils';
import { createUser, loadUser } from 'blockchain-library';

export const createOrLoadOwner = async (ownerPath: string) => {
  if (!(await isFileExist(ownerPath))) {
    const user = await createUser();
    const userData = JSON.stringify({
      address: user.stringAddress,
      privateKey: user.stringPrivate,
    });
    await appendFile(ownerPath, userData, 'utf-8');
    return user;
  }

  const file = await readFile(ownerPath, 'utf-8');

  const userJSON = JSON.parse(file);

  const user = loadUser(userJSON.address, userJSON.privateKey);
  return user;
};
