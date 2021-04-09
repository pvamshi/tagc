import { keyBy } from 'lodash';
import { last } from 'lodash/fp';
import nearley from 'nearley';
import { Change } from './commit-changes/models';
import { softTabSize } from './config.json';
import {
  createOrGetFile,
  deleteLine,
  File,
  FileDocument,
  ID,
  Line,
  LineDocument,
  LineType,
  Tags,
  TagsDocument,
} from './db';
import linetype from './lib/linetype';

export function updateLines(
  changeMap: Map<number, Change[]>,
  filePath: string,
  lines: Collection<Line>,
  files: Collection<File>
): { addedLines: ID[]; fileId: ID } {
  const file = createOrGetFile(filePath, files);
  // make changes for each line
  let deletedLines: ID[] = [];
  let addedLines: ID[] = [];
  changeMap.forEach((changes, lineNo) => {
    if (hasAddChange(changes)) {
      const [delLines, addLines] = applyAddOrUpdateChanges(
        lineNo,
        changes,
        file,
        lines
      );
      deletedLines = deletedLines.concat(delLines);
      addedLines.push(addLines);
    } else {
      deletedLines = deletedLines.concat(file.children.splice(lineNo, 1));
    }
  });
  deletedLines.forEach((line) => deleteLine(line, lines));
  return { addedLines, fileId: file.$loki };
}

export function updateTreeStructure(
  fileId: ID,
  linesDB: Collection<Line>,
  filesDB: Collection<File>,
  tagsDB: Collection<Tags>
) {
  const file = filesDB.findOne({ $loki: fileId });
  if (!file) {
    throw new Error(
      'while trying to update tree scructure , cannot find file with id' +
        fileId
    );
  }
  const lines = file.children
    .map(($loki) => linesDB.findOne({ $loki }))
    .filter((line) => line !== null) as LineDocument[]; // TODO: do we need to throw an error here if lineid dont exist

  let parentStack: LineDocument[] = [];
  let difference = 0;
  for (let i = 1; i < lines.length; i++) {
    const current = lines[i];
    const previous = lines[i - 1];
    if (current.depth < previous.depth) {
      // invalid parent pointer TODO:
      difference = difference - (previous.depth - current.depth);
      if (difference <= 0) {
        let steps = Math.floor((previous.depth - current.depth) / softTabSize);
        while (steps > 0) {
          parentStack.pop();
          steps = steps - 1;
        }
      }
      const currentParent = last(parentStack);
      if (currentParent) {
        addChild(currentParent, current, tagsDB);
      }
    } else if (current.depth == previous.depth) {
      const currentParent = last(parentStack);
      if (currentParent) {
        addChild(currentParent, current, tagsDB);
      }
    } else if (current.depth > previous.depth) {
      parentStack.push(previous);
      addChild(previous, current, tagsDB);
      difference = current.depth - previous.depth;
    }
  }
  lines.forEach((line) => linesDB.update(line));
}

function addChild(
  parent: LineDocument,
  child: LineDocument,
  tagsDB: Collection<Tags>
) {
  parent.children.push(child.$loki);
  child.parentId = parent.$loki;
  let childTags = tagsDB.findOne({ lineId: child.$loki }) as
    | TagsDocument
    | undefined;
  const parentTags = tagsDB.findOne({ lineId: parent.$loki });
  if (!childTags) {
    childTags = tagsDB.insertOne({
      lineId: child.$loki,
      inheritedTags: [],
      hashtag: [],
      excludeTag: [],
      includeTag: [],
    });
    if (!childTags) {
      throw new Error('failed adding tag ');
    }
  }
  if (parentTags && childTags) {
    childTags.inheritedTags = [
      ...childTags.inheritedTags,
      ...parentTags.hashtag,
    ];
  }
}
function hasAddChange(changes: Change[]): boolean {
  return changes.filter((change) => change.type === 'add').length > 0;
}

function applyAddOrUpdateChanges(
  lineNo: number,
  changes: Change[],
  file: FileDocument,
  lines: Collection<Line>
): [ID[], ID] {
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
  return [
    file.children.splice(
      lineNo,
      changeByType['del'] ? 1 : 0,
      newLineItem.$loki
    ),
    newLineItem.$loki,
  ];
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
