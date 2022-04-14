import { access } from 'fs/promises';

export const isFileExist = async (fileName: string) => {
  try {
    await access(fileName);
    return true;
  } catch (error) {
    return false;
  }
};
