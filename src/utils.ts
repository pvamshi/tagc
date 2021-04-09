import { curry } from 'lodash/fp';
import { relative } from 'path';
import { asyncExec } from './commit-changes/utils';

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

asyncExec(
  ' rcs diff -u -r1.9 -r1.10 /Users/vamshi/Dropbox/life/diary/2021-04-08.md '
)
  .then(({ stdout, stderr }) => console.log({ stdout, stderr }))
  .catch((e) => console.error(e.stderr + e.stdout));
