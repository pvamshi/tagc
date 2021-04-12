import { exec } from 'child_process';
import { curry } from 'lodash/fp';
import { promisify } from 'util';
import { ChangeOld, ChangeType } from './models';

export const toChange = curry(
  (type: ChangeType, content: string): ChangeOld => ({ type, content })
);

export const asyncExec = promisify(exec);

export const getDiffCommand = (filePath: string, versions: [string, string]) =>
  `rcs diff -u -r${versions[0]} -r${versions[1]} ${filePath}`;
