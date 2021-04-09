import fs, { promises as fsPromises } from 'fs';
import { commitFile } from './commit-changes';

export async function getText(file: string) {
  return await fsPromises.readFile(file, 'utf8');
}

export async function writeText(file: string, content: string) {
  console.log('writing to ', file, 'content ', content);
  await fsPromises.writeFile(file, content, 'utf-8');
  console.log('done writing to ', file);
  await commitFile(file);
  return true;
}
