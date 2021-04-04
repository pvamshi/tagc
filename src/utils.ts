import { curry } from 'lodash/fp';
import { relative } from 'path';

export const BASE_PATH = '/Users/vamshi/Dropbox/life';

export const relativePath = curry((filePath: string) =>
  relative(BASE_PATH, filePath)
);
