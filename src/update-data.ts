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
  remove,
} from 'list/methods';
import { promisify } from 'util';
import fs from 'fs';
import { nanoid } from 'nanoid';
import Loki from 'lokijs';
export type ID = string;
export type Document = { _id: ID };
export interface File {
  filePath: string;
  children: ID[];
}

export type LineType =
  | 'TEXT'
  | 'LIST'
  | 'TASK'
  | 'REFERENCE'
  | 'HEADING'
  | 'BOUNDARY';
export interface Line {
  fileId: ID;
  parentId: ID | undefined;
  type: LineType;
  done?: boolean;
  content: string;
  children: ID[];
  depth: number;
  referenceLineId?: ID;
  referenceLines?: number;
}
export interface Tags {
  lineId: ID;
  includeTag: string[];
  excludeTag: string[];
  hashtag: string[];
  inheritedTags: string[];
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
    JSON.parse(
      await readFile('/Users/vamshi/code/personal/tagc/files.json', 'utf-8')
    ) as FileDocument[]
  );
  linesData = from(
    JSON.parse(
      await readFile('/Users/vamshi/code/personal/tagc/lines.json', 'utf-8')
    ) as LineDocument[]
  );
  tagsData = from(
    JSON.parse(
      await readFile('/Users/vamshi/code/personal/tagc/tags.json', 'utf-8')
    ) as TagsDocument[]
  );
}
export function saveData() {
  const f = JSON.stringify(toArray(filesData), null, 1);
  const l = JSON.stringify(toArray(linesData), null, 1);
  const t = JSON.stringify(toArray(tagsData), null, 1);
  writeFile(
    '/Users/vamshi/code/personal/tagc/files.json',
    f,
    'utf-8'
  ).then(() => console.log('done writing to files.json'));
  writeFile(
    '/Users/vamshi/code/personal/tagc/lines.json',
    l,
    'utf-8'
  ).then(() => console.log('done writing to lines.json'));
  writeFile('/Users/vamshi/code/personal/tagc/tags.json', t, 'utf-8').then(() =>
    console.log('done writing to tags.json')
  );
}

export function deleteLine(lineId: ID) {
  const lineIndex = findIndex(
    (line: LineDocument) => line._id === lineId,
    linesData
  );
  linesData = remove(lineIndex, 1, linesData);
  deleteTagsByLineId(lineId);
}
export function addLine(line: Line, _id = nanoid()): LineDocument {
  console.log('adding line', line);
  linesData = prepend({ _id, ...line, children: [] }, linesData);
  return first(linesData) as LineDocument;
}

// async function updateLine(_id: string, line: string) {
//   await linesDB.update({ _id }, { type: 'line', content: line, children: [] });
// }
export function getFileById(fileId: ID) {
  return find((f) => f._id === fileId, filesData) as FileDocument;
}

// TODO: WTF? seperate write and read
export function getFile(filePath: string, createNew = false): FileDocument {
  let fileData = find(
    (f) => f.filePath === filePath,
    filesData
  ) as FileDocument;
  if (!fileData && createNew) {
    filesData = prepend(
      { filePath, children: [], _id: nanoid() }, //TODO: we can use filepath as id
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
export function addTags(tags: Tags): TagsDocument {
  tagsData = prepend({ ...tags, _id: nanoid() }, tagsData);
  return first(tagsData) as TagsDocument;
}

export function deleteTagsByLineId(lineId: string) {
  filter((t) => t.lineId === lineId, tagsData).forEach((tag) =>
    deleteTags(tag._id)
  );
}

export function deleteTags(tagsId: ID) {
  const tagIndex = findIndex(
    (tag: TagsDocument) => tag._id === tagsId,
    tagsData
  );
  tagsData = remove(tagIndex, 1, tagsData);
}
export function getTagsByLine(lineId: ID) {
  return find((tag) => tag.lineId === lineId, tagsData);
}
export function getTags(): List<TagsDocument> {
  return filter(
    (tags) =>
      tags.excludeTag.length > 0 ||
      tags.includeTag.length > 0 ||
      tags.hashtag.length > 0 ||
      tags.inheritedTags.length > 0,
    tagsData
  );
}

// function addItem<T>(item: T, list: List<T & Document>) {
//   const newList = prepend(item, list);
//   return [first(newList), newList];
// }
export async function initDB(): Promise<{
  lines: Collection<Line>;
  files: Collection<File>;
  tags: Collection<Tags>;
}> {
  let lines: Collection<Line> | null;
  let files: Collection<File> | null;
  let tags: Collection<Tags> | null;
  return new Promise((resolve, reject): void => {
    try {
      const db = new Loki('tagc.db', {
        autoload: true,
        autoloadCallback: () => {
          lines = db.getCollection('lines');
          if (lines === null) {
            lines = db.addCollection('lines', { indices: ['fileId'] });
          }
          tags = db.getCollection('tags');
          if (tags === null) {
            tags = db.addCollection('tags', { indices: ['lineId'] });
          }
          files = db.getCollection('files');
          if (files === null) {
            files = db.addCollection('files', { indices: ['filePath'] });
          }
          if (lines !== null && files !== null && tags !== null) {
            resolve({ lines, files, tags });
          } else {
            reject('something went wrong while loading DB');
          }
        },
        autosave: true,
        autosaveInterval: 4000,
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function createOrGetFile(
  filePath: string,
  files: Collection<File>
): File & LokiObj {
  const fileResults = files.find({ filePath });
  if (fileResults.length === 0) {
    files.insertOne({ filePath, children: [] });
  }
  return fileResults[0];
}
