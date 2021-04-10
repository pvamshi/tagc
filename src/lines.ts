import { keyBy } from 'lodash';
import { last, prop } from 'lodash/fp';
import nearley from 'nearley';
import { log } from './main';
import { Change } from './commit-changes/models';
import {
  lineSeperator,
  softTabSize,
  queryResultBorderStart,
  queryResultBorderEnd,
} from './config.json';
import {
  addLine,
  createOrGetFile,
  deleteLine,
  File,
  FileDocument,
  getFile,
  getLine,
  ID,
  Line,
  LineDocument,
  LineType,
  Tags,
  TagsDocument,
} from './db';
import linetype from './lib/linetype';
import { isQuery } from './tags';

export function updateLines(
  changeMap: Map<number, Change[]>,
  filePath: string,
  lines: Collection<Line>,
  files: Collection<File>,
  tags: Collection<Tags>
): { addedLines: ID[]; deletedLines: ID[]; fileId: ID } {
  const file = createOrGetFile(filePath, files);
  // make changes for each line
  let deletedLines: ID[] = [];
  let addedLines: ID[] = [];
  changeMap.forEach((changes, lineNo) => {
    if (
      shouldIgnore(
        changes.length === 1 && changes[0].type === 'add',
        file,
        lineNo,
        lines
      )
    ) {
      return;
    }
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
      const linesToDelete = isQuery(file.children[lineNo], tags)
        ? getLine(file.children[lineNo], lines).queryResults
        : 1;

      deletedLines = deletedLines.concat(
        file.children.splice(lineNo, linesToDelete)
      );
    }
  });
  return { addedLines, deletedLines, fileId: file.$loki };
}

function shouldIgnore(
  isAddOnly: boolean,
  file: File,
  lineIndex: number,
  linesDB: Collection<Line>
) {
  if (lineIndex === 0) {
    return false;
  }
  if (isAddOnly) {
    // if adding , check the previous line
    const line = getLine(file.children[lineIndex - 1], linesDB);
    return !!line.referenceLineId;
  }
  // if update check the line being updated
  const line = getLine(file.children[lineIndex], linesDB);
  return !!(line.referenceLineId || line.type === 'BOUNDARY');
}
export function deleteLines(
  lineIds: ID[],
  linesDB: Collection<Line>,
  tagsDB: Collection<Tags>
) {
  linesDB.removeWhere({ $loki: { $in: lineIds } });
  tagsDB.removeWhere({ lineId: { $in: lineIds } });
}

// TODO:  Handle references
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
  const lines = file.children.map(($loki) => getLine($loki, linesDB));

  let parentStack: LineDocument[] = [];
  let difference = 0;
  for (let i = 1; i < lines.length; i++) {
    const current = lines[i];
    const previous = lines[i - 1];
    if (current.type === 'BOUNDARY' || current.referenceLineId) {
      continue; // if they are responses dont bother about them
    }
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

export function updateQueryResults(
  queryResults: { queryLineId: ID; results: LineDocument[] }[],
  linesDB: Collection<Line>,
  filesDB: Collection<File>
) {
  const fileIds = queryResults.map(({ queryLineId, results }) => {
    const queryLine = getLine(queryLineId, linesDB);
    const file = getFile(queryLine.fileId, filesDB);
    const currentResults = queryLine.queryResults;
    const lineIndex = file.children.indexOf(queryLineId);
    const newResults = addBorders(results, queryLine.fileId, linesDB);
    const deletedLines = file.children.splice(
      lineIndex + 1,
      currentResults || 0,
      ...newResults.map((res: LineDocument) => res.$loki)
    );
    queryLine.queryResults = newResults.length;
    linesDB.update(queryLine);
    filesDB.update(file);
    deletedLines.forEach((line) => deleteLine(line, linesDB));
    return file.$loki;
  });
  return [...new Set(fileIds)]; // dont update file twice
}

function addBorders(
  results: LineDocument[],
  fileId: ID,
  linesDB: Collection<Line>
) {
  return [
    addLine(
      {
        type: 'BOUNDARY',
        content: queryResultBorderStart,
        fileId,
        parentId: undefined,
        children: [],
        depth: 0,
      },
      linesDB
    ),
    ...results,
    addLine(
      {
        type: 'BOUNDARY',
        content: queryResultBorderEnd,
        fileId,
        parentId: undefined,
        children: [],
        depth: 0,
      },
      linesDB
    ),
  ];
}
export function getQueryResultsLines(
  queryResults: { queryLineId: ID; results: Tags[] }[],
  linesDB: Collection<Line>
) {
  const output = queryResults.map(({ queryLineId, results }) => {
    return {
      queryLineId,
      results: results
        .map((result) =>
          createReference(
            result.lineId,
            undefined,
            getLine(queryLineId, linesDB).fileId,
            linesDB
          )
        )
        .flatMap((reference) => getResultWithChildren(reference, linesDB)),
    };
  });
  log({ output });
  return output;
}

export function getFileText(
  fileID: ID,
  linesDB: Collection<Line>,
  filesDB: Collection<File>
): { filePath: string; text: string } {
  const { filePath, children } = getFile(fileID, filesDB);
  return {
    filePath,
    text: children
      .map((lineID) => getLine(lineID, linesDB))
      .map((line) => line.content)
      .join(lineSeperator),
  };
}

function getResultWithChildren(
  line: LineDocument,
  linesDB: Collection<Line>
): LineDocument[] {
  const children = line.children.flatMap((childId) =>
    getResultWithChildren(getLine(childId, linesDB), linesDB)
  );
  return [line, ...children];
}

function createReference(
  lineId: ID,
  parentLineId: ID | undefined,
  fileId: ID,
  linesDB: Collection<Line>
): LineDocument {
  const line = getLine(lineId, linesDB);
  const addedRef = linesDB.insertOne({
    type: line.type,
    content: line.content,
    children: line.children
      .map((childId) => createReference(childId, line.$loki, fileId, linesDB))
      .map((child) => child.$loki),
    fileId,
    done: line.done,
    referenceLineId: line.$loki,
    parentId: parentLineId,
    depth: line.depth,
  });
  if (!addedRef) {
    throw new Error('error while adding reference');
  }
  return addedRef;
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
