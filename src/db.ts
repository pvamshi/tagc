// import loki from 'lokijs'
// import { Block } from './parser'
// const db = new loki('tagc.db')
import { keyBy } from 'lodash';
import Datastore from 'nedb-promises';
import { Observable, of } from 'rxjs';
import { mergeMap, filter } from 'rxjs/operators';
import { DiffType } from './commit-changes';
import { relativePath } from './utils';

const linesDB = Datastore.create('/Users/vamshi/code/personal/tagc/lines.db');
interface LineDocument {
  type: 'line';
  parent: 'string';
  children: string[];
  _id: string;
}
interface FileDocument {
  type: 'file';
  filePath: string;
  children: string[];
  _id: string;
}
// export function testDB() {
//   return db.insert([{ name: 'vamshi' }])
// }
export async function changeFile({ filePath, changes }: DiffType) {
  let fileData = await linesDB.findOne({
    type: 'file',
    filePath: relativePath(filePath),
  });
  if (!fileData) {
    fileData = await linesDB.insert({ type: 'file', filePath, children: [] });
  }
  console.log(fileData);
  // applyChanges(fileData.children, changes);
  // console.log(fileData.children);
  return fileData;
}

function applyChanges(children: string[], { changes }: DiffType) {
  Object.keys(changes).forEach((index: string) => {
    const actions = keyBy(changes[index], 'type');
    if (actions['add']) {
      children.splice(
        Number(index),
        actions['del'] ? 1 : 0,
        actions['add'].content
      );
    } else {
      children.splice(Number(index), actions['del'] ? 1 : 0);
    }
  });
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
