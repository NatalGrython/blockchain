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
    await appendFile(ownerPath, userData, {
      encoding: 'utf-8',
      flag: 'w+',
    });
    return user;
  }

  const file = await readFile(ownerPath, {
    encoding: 'utf-8',
    flag: 'a+',
  });

  const userJSON = JSON.parse(file);

  const user = loadUser(userJSON.address, userJSON.privateKey);
  return user;
};
