import parseDiff, { AddChange, DeleteChange } from 'parse-diff';
import { lineSeperator } from '../config.json';
import { getText } from '../fileio';
import { Change } from './models';
import { asyncExec, getDiffCommand, toChange } from './utils';

export async function getFileChanges(
  filePath: string
): Promise<Map<number, Change[]>> {
  try {
    const [commitStatus, versionsStatus] = (await commitFile(filePath))
      .split(lineSeperator)[1] //get second line
      .split(';');
    switch (commitStatus) {
      case 'file is unchanged':
        console.debug('file is unchanged');
        return new Map();
      case 'initial revision: 1.1':
        console.debug('file is new');
        const res = new Map(await getAllLines(filePath));
        return res;
      default:
        const diffText = await getDiff(filePath, [
          versionsStatus.split(':')[1].trim(),
          commitStatus.split(':')[1].trim(),
        ]);
        return (
          (parseDiff(diffText)[0]
            .chunks[0].changes //we only have one file and interested in only changes
            // ignore normal lines
            .filter(({ type }) => type === 'add' || type === 'del') as (
            | AddChange
            | DeleteChange
          )[])
            .map(toAddDelChangeEntries)
            .reduce((acc, [key, obj]) => {
              acc.set(key, acc.get(key) ? acc.get(key).concat(obj) : [obj]);
              return acc;
            }, new Map())
        );
    }
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
    console.log({ command });
    const diff = await asyncExec(command);
    console.log({ stdout: diff.stdout });
    res = diff.stderr;
  } catch (err) {
    res = err.stderr + err.stdout;
    console.log({ res });
    // throw new Error('Error while running diff command: ' + err);
  }
  return res;
}

async function getAllLines(
  filePath: string
): Promise<IterableIterator<[number, Change[]]>> {
  const a = await getText(filePath);
  return a
    .split(lineSeperator) //convert file to list of lines
    .map((content) => [toChange('add', content)]) // add all of them to db
    .entries(); // array to Map<index, content>
}

function toAddDelChangeEntries(
  change: AddChange | DeleteChange
): [number, Change] {
  console.log({ change });
  return [change.ln - 1, toChange(change.type, change.content.slice(1))];
}
