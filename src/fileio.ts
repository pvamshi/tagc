import fs, { promises as fsPromises } from 'fs';
import { commitOnly } from './commit-changes';
const BASE_PATH = '/Users/vamshi/Dropbox/life';
export const fullPath = (path: string) => BASE_PATH + '/' + path;

export async function getText(file: string) {
  return await fsPromises.readFile(fullPath(file), 'utf8');
}

export async function writeText(file: string, content: string) {
  console.log('writing to ', file, 'content ', content);
  const fullPathStr = fullPath(file);
  await fsPromises.writeFile(fullPathStr, content, 'utf-8');
  console.log('done writing to ', file);
  await commitOnly(fullPathStr);
  return true;
}
