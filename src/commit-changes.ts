import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import parseDiff, { AddChange, DeleteChange } from 'parse-diff';
// import { reduce, keyBy, mapValues, map, pipe, prop } from 'lodash/fp';
// var execShPromise = require('exec-sh').promise

// TODO: ugly code , refactor
const asyncExec = promisify(exec);

export type LineDiff = {
  [key: string]: { type: 'del' | 'add'; content: string }[];
};
export interface DiffType {
  filePath: string;
  changes: LineDiff;
}
export async function commitOnly(filePath: string) {
  let { stderr } = await asyncExec(`echo "."| ci -l ${filePath}`);
  return stderr;
}
export async function commitChanges(
  filePath: string
): Promise<DiffType | null> {
  let { stderr } = await asyncExec(`echo "."| ci -l ${filePath}`);
  const output = stderr.split('\n')[1].split(';');
  if (output[0] === 'file is unchanged') {
    return null;
  }

  if (output[0] === 'initial revision: 1.1') {
    const readFile = promisify(fs.readFile);
    const fileLines = await readFile(filePath, 'utf-8');
    return {
      filePath,
      changes: fileLines
        .split('\n')
        .map((content: string, index: number) => ({ index, content }))
        .reduce(
          (
            acc: LineDiff,
            { index, content }: { index: number; content: string }
          ): LineDiff => {
            acc[index] = [{ type: 'add', content }];
            return acc;
          },
          {}
        ),
    };
  }
  let diff = '';
  try {
    const diffOutput = await asyncExec(
      `rcs diff -u -r${output[1].split(':')[1].trim()} -r${output[0]
        .split(':')[1]
        .trim()} ${filePath}`
    );
    diff = diffOutput.stdout;
  } catch (err) {
    diff = err.stdout;
    console.error(err.stdout);
  }

  const changes = parseDiff(diff);
  return {
    filePath,
    changes: (changes[0].chunks[0].changes.filter(
      (change) =>
        (change.type === 'add' && change?.add) ||
        (change.type === 'del' && change.del)
    ) as (AddChange | DeleteChange)[]).reduce((acc: LineDiff, curr) => {
      const lineIndex = curr.ln - 1; // convert line number to index
      const temp: { type: 'del' | 'add'; content: string } = {
        type: curr.type,
        content: curr.content.slice(1),
      };
      acc[lineIndex] = acc[lineIndex] ? [...acc[lineIndex], temp] : [temp];
      return acc;
    }, {}),
  };
}
// commitChanges('/Users/vamshi/Dropbox/life/test-lists.md').then((r) =>
//   console.log({ r })
// )
