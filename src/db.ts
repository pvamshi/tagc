import {
  findIndex,
  empty,
  find,
  first,
  from,
  prepend,
  toArray,
  update,
  filter,
  List,
} from 'list/methods';
import { keyBy } from 'lodash';
import { promisify } from 'util';
import fs from 'fs';
import { DiffType, LineDiff } from './commit-changes';
import { relativePath } from './utils';
import { nanoid } from 'nanoid';

export type ID = string;
export type Document = { _id: ID };
export interface File {
  filePath: string;
  children: ID[];
}

export type LineType = 'TEXT' | 'LIST' | 'TASK' | 'REFERENCE' | 'HEADING';
export interface Line {
  fileId: ID;
  parentId: ID | undefined;
  type: LineType;
  done?: boolean;
  content: string;
  children: ID[];
  depth: number;
  referenceLineId?: ID;
}
export interface Tags {
  lineId: ID;
  includeTag: string[];
  excludeTag: string[];
  hashtag: string[];
}
export type TagsDocument = Tags & Document;
export type FileDocument = File & Document;
export type LineDocument = Line & Document;

let filesData = empty<FileDocument>();
let linesData = empty<LineDocument>();
let tagsData = empty<TagsDocument>();
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
export async function loadData() {
  filesData = from(
    JSON.parse(await readFile('files.json', 'utf-8')) as FileDocument[]
  );
  linesData = from(
    JSON.parse(await readFile('lines.json', 'utf-8')) as LineDocument[]
  );
  tagsData = from(
    JSON.parse(await readFile('tags.json', 'utf-8')) as TagsDocument[]
  );
}
export function saveData() {
  const f = JSON.stringify(toArray(filesData), null, 1);
  const l = JSON.stringify(toArray(linesData), null, 1);
  const t = JSON.stringify(toArray(tagsData), null, 1);
  writeFile('files.json', f, 'utf-8').then(() =>
    console.log('done writing to files.json')
  );
  writeFile('lines.json', l, 'utf-8').then(() =>
    console.log('done writing to lines.json')
  );
  writeFile('tags.json', t, 'utf-8').then(() =>
    console.log('done writing to tags.json')
  );
}

export function addLine(line: Line, _id = nanoid()): LineDocument {
  linesData = prepend({ _id, ...line, children: [] }, linesData);
  return first(linesData) as LineDocument;
}

// async function updateLine(_id: string, line: string) {
//   await linesDB.update({ _id }, { type: 'line', content: line, children: [] });
// }
export function getFileById(fileId: ID) {
  return find((f) => f._id === fileId, filesData) as FileDocument;
}
export function getFile(relativePath: string, createNew = false): FileDocument {
  let fileData = find(
    (f) => f.filePath === relativePath,
    filesData
  ) as FileDocument;
  if (!fileData && createNew) {
    filesData = prepend(
      { filePath: relativePath, children: [], _id: nanoid() }, //TODO: we can use relativepath as id
      filesData
    );
    fileData = first(filesData) as FileDocument;
  }
  return fileData;
}
export function getLine(_id: ID, fileId?: ID): LineDocument {
  let line = find((data) => data._id === _id, linesData);
  if (!line && fileId) {
    return addLine(
      {
        content: '',
        fileId,
        parentId: undefined,
        children: [],
        depth: 0,
        type: 'TEXT',
      },
      _id
    );
  }
  return line as LineDocument;
}

export function updateLine(line: LineDocument) {
  const lineIndex = findIndex(
    (l: LineDocument) => l._id === line._id,
    linesData
  );
  if (lineIndex > -1) {
    linesData = update(lineIndex, line, linesData);
  }
}

// TAGS
export function addTags(tags: Tags) {
  tagsData = prepend({ ...tags, _id: nanoid() }, tagsData);
  return first(tagsData);
}

export function getTags(): List<TagsDocument> {
  return filter(
    (tags) =>
      tags.excludeTag.length > 0 ||
      tags.includeTag.length > 0 ||
      tags.hashtag.length > 0,
    tagsData
  );
}

// function addItem<T>(item: T, list: List<T & Document>) {
//   const newList = prepend(item, list);
//   return [first(newList), newList];
// }
