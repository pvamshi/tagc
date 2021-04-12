import { diffArrays } from 'diff';
import { lineSeperator } from '../config.json';
import { DB } from '../db';
import { getText } from '../fileio';
import { Change } from './models';
import { asyncExec, getDiffCommand } from './utils';

export function getChanges(oldText: string[], newText: string[]) {
  const changes = diffArrays<string, string>(oldText, newText);
  // log({ changes });
  const changesUpdated: Map<number, Change[]> = new Map();
  let count = 0;
  for (let index = 0; index < changes.length; index++) {
    const change = changes[index];
    if (!change.added && !change.removed) {
      count = count + (change.count || 0);
    } else if (change.removed) {
      if (changes[index + 1]?.added) {
        changesUpdated.set(count, [
          { type: 'del' } as Change,
          { type: 'add', content: changes[index + 1].value } as Change,
        ]);
        index++;
      } else {
        changesUpdated.set(count, [{ type: 'del' }]);
      }
      count++;
    } else if (change.added) {
      changesUpdated.set(count, [
        { type: 'add', content: changes[index].value },
      ]);
      count++;
    }
  }
  return changesUpdated;
}
export async function getFileChanges(
  filePath: string,
  db: DB
): Promise<Map<number, Change[]>> {
  try {
    const text = await getText(filePath);
    const dbText = db
      .createOrGetFile(filePath)
      .children.map(db.getLine)
      .map((line) => line.content);
    return getChanges(dbText, text.split(lineSeperator));
  } catch (err) {
    throw new Error('Error while getting file changes' + err);
  }
}

export async function commitFile(filePath: string) {
  try {
    let { stderr } = await asyncExec(`echo "."| ci -l ${filePath}`);
    return stderr;
  } catch (err) {
    throw new Error('error while committing file');
  }
}

async function getDiff(
  filePath: string,
  versions: [string, string]
): Promise<string> {
  console.debug('versions', versions);
  let res = '';
  try {
    const command = getDiffCommand(filePath, versions);
    // console.log({ command });
    const diff = await asyncExec(command);
    // console.log({ stdout: diff.stdout });
    res = diff.stderr;
  } catch (err) {
    res = err.stderr + err.stdout;
    // console.log({ res });
    // throw new Error('Error while running diff command: ' + err);
  }
  return res;
}

// async function getAllLines(
//   filePath: string
// ): Promise<IterableIterator<[number, ChangeOld[]]>> {
//   const a = await getText(filePath);
//   return a
//     .split(lineSeperator) //convert file to list of lines
//     .map((content) => [toChange('add', content)]) // add all of them to db
//     .entries(); // array to Map<index, content>
// }

// function toAddDelChangeEntries(
//   change: AddChange | DeleteChange
// ): [number, ChangeOld] {
//   // console.log({ change });
//   return [change.ln - 1, toChange(change.type, change.content.slice(1))];
// }
