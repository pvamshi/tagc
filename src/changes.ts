import { diffArrays } from 'diff';
import { lineSeperator } from './config.json';
import { DB } from './db';
import { getText } from './fileio';

export type LineDiff = {
  [key: string]: { type: 'del' | 'add'; content: string }[];
};
export interface DiffType {
  filePath: string;
  changes: LineDiff;
}
export type AddChange = { type: 'add'; content: string[] };
export type DeleteChange = { type: 'del' };
export type Change = AddChange | DeleteChange;
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
