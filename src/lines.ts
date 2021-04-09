import { keyBy } from 'lodash';
import { Change } from './commit-changes/models';
import { deleteLine, FileDocument, ID, LineDocument } from './db';
import { createOrGetFile, Line, File, LineType } from './db';

import linetype from './lib/linetype';
import nearley from 'nearley';
export function updateLines(
  changeMap: Map<number, Change[]>,
  filePath: string,
  lines: Collection<Line>,
  files: Collection<File>
) {
  const file = createOrGetFile(filePath, files);
  // make changes for each line
  let deletedLines: ID[] = [];
  changeMap.forEach((changes, lineNo) => {
    if (hasAddChange(changes)) {
      deletedLines = deletedLines.concat(
        applyAddOrUpdateChanges(lineNo, changes, file, lines)
      );
    } else {
      deletedLines = deletedLines.concat(file.children.splice(lineNo, 1));
    }
  });
  deletedLines.forEach((line) => deleteLine(line, lines));
}

function hasAddChange(changes: Change[]): boolean {
  return changes.filter((change) => change.type === 'add').length > 0;
}

function applyAddOrUpdateChanges(
  lineNo: number,
  changes: Change[],
  file: FileDocument,
  lines: Collection<Line>
): ID[] {
  const changeByType = keyBy(changes, 'type');

  const lineData = getLineType(changeByType['add'].content);
  const newLineItem: LineDocument | undefined = lines.insertOne({
    content: changeByType['add'].content,
    children: [],
    parentId: undefined,
    fileId: file.$loki,
    depth: lineData.depth,
    type: lineData.type,
    done: lineData.done,
  });
  if (newLineItem === undefined) {
    throw new Error('failed to add line');
  }
  return file.children.splice(
    lineNo,
    changeByType['del'] ? 1 : 0,
    newLineItem.$loki
  );
}

function getLineType(
  content: string
):
  | { type: Exclude<LineType, 'TASK'>; depth: number; done: undefined }
  | { type: 'TASK'; done: boolean; depth: number } {
  const lineParser = new nearley.Parser(nearley.Grammar.fromCompiled(linetype));
  lineParser.feed(content);
  const line = lineParser.results[0];
  if (line.type === 'LIST') {
    if (line.task) {
      return { type: 'TASK', depth: line.spaces, done: line.done };
    }
    return { type: 'LIST', depth: line.spaces, done: undefined };
  } else {
    return { type: 'TEXT', depth: 0, done: undefined }; // TODO: handle rest of the types
  }
}
