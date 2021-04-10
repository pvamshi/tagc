import Loki from 'lokijs';
export type ID = number;
export type Document = { _id: ID };
export interface File {
  filePath: string;
  children: ID[];
}

export type LineType = 'TEXT' | 'LIST' | 'TASK' | 'HEADING' | 'BOUNDARY';
export interface Line {
  fileId: ID;
  parentId: ID | undefined;
  type: LineType;
  done?: boolean;
  content: string;
  children: ID[];
  depth: number;
  referenceLineId?: ID;
  queryResults?: number;
}
export interface Tags {
  lineId: ID;
  includeTag: string[];
  excludeTag: string[];
  hashtag: string[];
  inheritedTags: string[];
}
export type TagsDocument = Tags & LokiObj;
export type FileDocument = File & LokiObj;
export type LineDocument = Line & LokiObj;

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
): FileDocument {
  const fileResults = files.find({ filePath });
  if (fileResults.length === 0) {
    const newFile = files.insertOne({ filePath, children: [] });
    if (newFile === undefined) {
      throw new Error('error while adding file');
    }
    return newFile;
  }
  return fileResults[0];
}

export function deleteLine($loki: ID, lines: Collection<Line>) {
  lines.removeWhere({ $loki });
}

export function getLine($loki: ID, lines: Collection<Line>): LineDocument {
  const line = lines.findOne({ $loki });
  if (!line) {
    throw new Error('error while fetching line with id ' + $loki);
  }
  return line;
}

export function getFile($loki: ID, filesDB: Collection<File>): FileDocument {
  const file = filesDB.findOne({ $loki });
  if (!file) {
    throw new Error('error while fetching file with id ' + $loki);
  }
  return file;
}
export function addLine(line: Line, linesDB: Collection<Line>) {
  const newLine = linesDB.insertOne(line);
  if (!newLine) {
    throw new Error('Error while adding new line');
  }
  return newLine;
}
