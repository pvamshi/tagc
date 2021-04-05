import { empty, find, first, from, prepend, toArray } from 'list';
import { keyBy } from 'lodash';
import { promisify } from 'util';
import fs from 'fs';
import { DiffType, LineDiff } from './commit-changes';
import { relativePath } from './utils';
import { nanoid } from 'nanoid';

async function amap<T, U>(
  items: T[],
  fun: (item: T) => Promise<U>
): Promise<U[]> {
  return Promise.all(items.map(fun));
}

interface LineDocument {
  parent: string;
  content: string;
  children: string[];
  _id: string;
}
interface FileDocument {
  filePath: string;
  children: string[];
  _id: string;
}
let filesData = empty<FileDocument>();
let linesData = empty<LineDocument>();
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
export async function loadData() {
  filesData = from(
    JSON.parse(await readFile('files.json', 'utf-8')) as FileDocument[]
  );
  linesData = from(
    JSON.parse(await readFile('lines.json', 'utf-8')) as LineDocument[]
  );
}
export function saveData() {
  const f = JSON.stringify(toArray(filesData), null, 1);
  const l = JSON.stringify(toArray(linesData), null, 1);
  writeFile('files.json', f, 'utf-8').then(() =>
    console.log('done writing to files.json')
  );
  writeFile('lines.json', l, 'utf-8').then(() =>
    console.log('done writing to lines.json')
  );
}
export function logFile(filePath: string) {
  const relPath = relativePath(filePath);
  const file = find((file) => file.filePath === relPath, filesData);
  if (file) {
    console.log(
      file.children
        .map((lineId) => getLine(file._id, lineId))
        .map((line) => (line !== undefined ? line.content : '<no-data>'))
        .join('\n')
    );
  }
}
export function changeFile({ filePath, changes }: DiffType) {
  const path = relativePath(filePath);
  let fileData = find((f) => f.filePath === path, filesData) as FileDocument;
  if (!fileData) {
    filesData = prepend(
      { filePath: path, children: [], _id: nanoid() },
      filesData
    );
    fileData = first(filesData) as FileDocument;
  }
  applyChanges(fileData._id, fileData.children, changes);
  return fileData;
}

function applyChanges(parent: string, children: string[], changes: LineDiff) {
  Object.keys(changes).forEach((index: string) => {
    const actions = keyBy(changes[index], 'type');
    let deletedLines: any[];
    if (actions['add']) {
      const newLine = addLine(actions['add'].content, parent);
      deletedLines = children.splice(
        Number(index),
        actions['del'] ? 1 : 0,
        newLine._id
      );
    } else {
      deletedLines = children.splice(Number(index), actions['del'] ? 1 : 0);
    }
    //TODO: Delete lines from db
    // console.log('deleted lines', deletedLines);
  });
}

function addLine(
  content: string,
  parent: string,
  _id = nanoid()
): LineDocument {
  linesData = prepend({ _id, content, parent, children: [] }, linesData);
  return first(linesData) as LineDocument;
}
// async function updateLine(_id: string, line: string) {
//   await linesDB.update({ _id }, { type: 'line', content: line, children: [] });
// }
function getLine(parent: string, _id: string, readOnly = true): LineDocument {
  let line = find((data) => data._id === _id, linesData);
  if (!line && !readOnly) {
    return addLine('', parent, _id);
  }
  return line as LineDocument;
}
// export type FileData = { name: string } & Block
// var fileDatas = db.addCollection<FileData>('fileData')
//
// export function saveTags(file: string, blocks: Block[]) {
//   const fileDataList: FileData[] = blocks.map((block) => ({
//     ...block,
//     name: file,
//   }))
//   fileDatas.insert(fileDataList)
// }
//
// export function getHashTagBlocks(tag: string) {
//   const files: FileData[] = fileDatas.where(
//     (file) => file.tags.hashtag.length > 0 && file.tags.hashtag.includes(tag)
//   )
//   return files.reduce((acc: { [file: string]: FileData[] }, curr: FileData) => {
//     acc[curr.name] = [...(acc[curr.name] || []), curr]
//     return acc
//   }, {})
// }
// export interface TargetTemp {
//   lineNumber: number
//   tags: string[]
//   update: boolean
// }
// export function getIncludeTags(): { [file: string]: TargetTemp[] } {
//   const includeTags = fileDatas.where((file) => file.tags.includeTag.length > 0)
//   return includeTags.reduce(
//     (acc: { [file: string]: TargetTemp[] }, curr: FileData) => {
//       acc[curr.name] = [
//         ...(acc[curr.name] || []),
//         {
//           lineNumber: curr.startIndex,
//           tags: curr.tags.includeTag,
//           update: false,
//         },
//       ]
//       return acc
//     },
//     {}
//   )
// }
