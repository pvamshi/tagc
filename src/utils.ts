import { curry } from 'lodash/fp';
import { relative } from 'path';

export const BASE_PATH = '/Users/vamshi/Dropbox/life';

export const relativePath = curry((filePath: string) =>
  relative(BASE_PATH, filePath)
);

export function addToArray<T>(arr: T[], a: T | T[]): T[] {
  if (arr && Array.isArray(arr)) {
    return arr.concat(Array.isArray(a) ? a : [a]);
  }
  return Array.isArray(a) ? [...a] : [a];
}
