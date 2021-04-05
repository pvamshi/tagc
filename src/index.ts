// import { getText, writeText } from './fileio'
// import { getBlocks, getTargetBlocks, Block, mergeText } from './parser'
// import {
//   testDB, // getHashTagBlocks,
// getIncludeTags,
// saveTags,
// TargetTemp,
// } from './db';
// import glob from 'glob'
// import { fromPairs } from 'lodash'
import { commitChanges, DiffType, LineDiff } from './commit-changes';
import {
  addLine,
  addTags,
  getFile,
  getLine,
  ID,
  loadData,
  saveData,
  LineDocument,
  updateLine,
  getTags,
  getFileById,
} from './db';
import { writeText } from './fileio';
import { relativePath } from './utils';
import { keyBy } from 'lodash';
import { getLineType, parseTags } from './parser';
import { toArray, append, empty, filter, last, pop, list, find } from 'list';

// step 1: Get file to update
// step 2: get file changes :: commit-changes.ts
// step 3: add or update the changes
// step 4: Refresh the blocks
// step 5: get all queries
//
// step 6: replace their data with results

const testFile = '/Users/vamshi/Dropbox/life/test-lists.md';
loadData().then(
  () =>
    appendChanges(testFile)
      .then(async (results: { file: string; content: string }[]) => {
        return Promise.all(
          results.map(({ file, content }) => writeText(file, content))
        );
      })
      .then(saveData)
  // .then(() => console.log(logFile(testFile)))
);

async function appendChanges(
  filePath: string
): Promise<{ file: string; content: string }[]> {
  const changes = await commitChanges(filePath);
  if (changes) {
    const changedFile = await changeFile(changes);
  }
  return getQueries();
}

function changeFile({ filePath, changes }: DiffType) {
  const path = relativePath(filePath);
  const fileData = getFile(path, true);
  applyChanges(fileData._id, fileData.children, changes);
  updateTreeStructure(fileData.children);
  return fileData;
}

function applyChanges(fileId: ID, children: ID[], changes: LineDiff) {
  Object.keys(changes).forEach((index: string) => {
    const actions = keyBy(changes[index], 'type');
    let deletedLines: any[];
    if (actions['add']) {
      const newLine = addNewLine(actions['add'].content, fileId);
      deletedLines = children.splice(
        Number(index),
        actions['del'] ? 1 : 0,
        newLine._id
      );
    } else {
      deletedLines = children.splice(Number(index), actions['del'] ? 1 : 0);
    }
    //TODO: Delete lines from db, and corresponding tags
    // console.log('deleted lines', deletedLines);
  });
}
function addNewLine(content: string, fileId: ID) {
  const lineType = getLineType(content);
  const newLine = addLine({
    content,
    fileId,
    parentId: undefined,
    type: lineType.type,
    done: lineType.type === 'TASK' ? lineType.done : undefined,
    depth: lineType.depth || 0, // TODO: why ?
    children: [],
  });
  const tags = parseTags(newLine._id);
  if (
    tags.excludeTag.length > 0 ||
    tags.includeTag.length > 0 ||
    tags.hashtag.length > 0
  ) {
    addTags(tags);
  }
  return newLine;
}

function updateTreeStructure(lineIds: ID[], stepLength = 1) {
  const lines = lineIds.map((lineId) => getLine(lineId));
  let parentStack = empty<LineDocument>();
  let difference = 0;
  for (let i = 1; i < lines.length; i++) {
    const current = lines[i];
    const previous = lines[i - 1];
    if (current.depth < previous.depth) {
      // invalid parent pointer TODO:
      difference = difference - (previous.depth - current.depth);
      if (difference <= 0) {
        let steps = Math.floor((previous.depth - current.depth) / stepLength);
        while (steps > 0) {
          parentStack = pop(parentStack);
          steps = steps - 1;
        }
      }
      const currentParent = last(parentStack);
      if (currentParent) {
        currentParent.children.push(current._id);
        current.parentId = currentParent._id;
      }
    } else if (current.depth == previous.depth) {
      const currentParent = last(parentStack);
      if (currentParent) {
        currentParent.children.push(current._id);
        current.parentId = currentParent._id;
      }
    } else if (current.depth > previous.depth) {
      parentStack = append(previous, parentStack);
      previous.children.push(current._id);
      current.parentId = previous._id;
      difference = current.depth - previous.depth;
    }
  }
  lines.forEach(updateLine);
}

function getQueries(): { file: string; content: string }[] {
  const tags = getTags();

  const isEqual = (tagA: string) => (tagB: string) => tagA === tagB;
  const isNotEqual = (tagA: string) => (tagB: string) => tagA !== tagB;
  const compare = (
    includeTags: string[],
    excludeTags: string[],
    hashes: string[]
  ) =>
    includeTags.every((tag) => hashes.map(isEqual).some((fn) => fn(tag))) &&
    excludeTags.every((tag) => hashes.map(isNotEqual).every((fn) => fn(tag)));

  const queries = filter(
    (tag) => tag.includeTag.length > 0 || tag.excludeTag.length > 0,
    tags
  );
  const hashes = filter((tag) => tag.hashtag.length > 0, tags);
  const results = queries
    .map(({ lineId, excludeTag, includeTag }) => ({
      lineId,
      results: hashes.filter(({ hashtag }) =>
        compare(includeTag, excludeTag, hashtag)
      ),
    }))
    .map(({ results, lineId }) => ({
      line: getLine(lineId),
      results: results.map((result) => result.lineId).map(getLine),
    }))
    .reduce<{
      [key: string]: { line: LineDocument; results: LineDocument[] }[];
    }>((acc, { line, results }) => {
      const fileId = line.fileId;
      if (!acc[fileId]) {
        acc[fileId] = [];
      }
      acc[fileId].push({ line, results: toArray(results) });
      return acc;
    }, {});
  return writeToFiles(results);
}

function writeToFiles(totalResults: {
  [key: string]: { line: LineDocument; results: LineDocument[] }[];
}): { file: string; content: string }[] {
  return Object.keys(totalResults).map((fileId) => {
    const results = totalResults[fileId];
    const file = getFileById(fileId);
    results.forEach(({ line, results }) => {
      const linesToAdd = results.flatMap((result) =>
        addReferenceLine(fileId, result).map((l) => l._id)
      );
      const queryLineId = file.children.indexOf(line._id);
      file.children.splice(queryLineId + 1, 0, ...linesToAdd);
    });
    return { file: file.filePath, content: logFile(fileId).join('\n') };
  });
}

function addReferenceLine(fileId: ID, reference: LineDocument): LineDocument[] {
  const parentLine = addLine({
    content: reference.content,
    type: 'REFERENCE',
    parentId: undefined,
    children: [],
    depth: reference.depth,
    fileId: fileId,
    referenceLineId: reference._id,
  });
  const lines: LineDocument[] = [parentLine];
  if (parentLine.children.length > 0) {
    reference.children.forEach((childLineId) => {
      const l = getLine(childLineId);
      const addedLines = addReferenceLine(fileId, l);
      lines.concat(addedLines);
    });
    parentLine.children = lines.map(({ _id }) => _id);
    updateLine(parentLine);
  }
  return lines;
}

export function logFile(fileId: ID): string[] {
  const file = getFileById(fileId);
  if (file) {
    return file.children.map((lineId) => getLine(lineId).content);
  }
  return [];
}

// import chokidar from 'chokidar'

// //
// commitChanges('/Users/vamshi/Dropbox/life/test-lists.md')
// // chokidar
// //   .watch('/Users/vamshi/Dropbox')
// //   .on('all', (event, path) => {
// //     console.log({ event, path })
// //   })
// //   .on('raw', (ev, path, details) => {
// //     console.log({ ev, path, details })
// //   })
// //
// const fileTexts: { [file: string]: string } = {}
// // get hashtags
// //
// //
// //
//
// async function saveHashtags(file: string) {
//   const data = await getText(file)
//   fileTexts[file] = data
//   const tagBlocks = getBlocks(data)
//   saveTags(file, tagBlocks)
//   // const existingTargetBlocks = getTargetBlocks(data.split("\n"));
//   // const startingIndeOfExistingTargetBlocks = new Set(
//   //   existingTargetBlocks.map(([start, end]) => start.index)
//   // );
//   // const filesWithIncludeTags: {
//   //   [file: string]: TargetTemp[];
//   // } = getIncludeTags();
//   // Object.entries(filesWithIncludeTags).forEach(([file, targetTemp]) => {
//   //   const updatedTargetTemp = targetTemp.map((t) => ({
//   //     ...t,
//   //     update: startingIndexOfExistingTargetBlocks.has(t.lineNumber + 1),
//   //   }));
//   // });
// }
//
// function replaceTags() {
//   Object.entries(getIncludeTags()).forEach(([file, targetTemp]) =>
//     updateHashText(file, targetTemp)
//   )
// }
// function updateHashText(file: string, targetTemps: TargetTemp[]) {
//   // lineNumber: number;
//   // tags: string[];
//   const fileText = fileTexts[file]
//   const existingTargetBlocks = getTargetBlocks(fileText.split('\n'))
//   const targetTempsSorted = targetTemps.sort((obj1, obj2) => {
//     if (obj1.lineNumber < obj2.lineNumber) {
//       return -1
//     } else if (obj1.lineNumber > obj1.lineNumber) {
//       return 1
//     } else {
//       return 0
//     }
//   })
//
//   const str = targetTempsSorted.map(({ tags }) => {
//     const tagname = tags[0]
//     const targetBlockMap = getHashTagBlocks(tagname)
//     return Object.entries(targetBlockMap)
//       .map(([fileName, targetBlockList]: [string, Block[]]) => {
//         const fileText = fileTexts[fileName].split('\n')
//         return targetBlockList
//           .map((block: Block) => {
//             const textForBlock = fileText.slice(
//               block.startIndex,
//               block.endIndex + 1
//             )
//             return (
//               textForBlock
//                 .join('\n')
//                 .replace(
//                   new RegExp(`#${tagname}`, 'g'),
//                   `[${fileName}](${fileName})${
//                     textForBlock.length === 1 ? '' : ' ---'
//                   }`
//                 ) +
//               ` ::${block.id}:: ${textForBlock.length === 1 ? '===' : '---'}`
//             )
//           })
//           .join('\n\n')
//       })
//       .join('\n\n')
//   })
//   const att = targetTempsSorted.map((t) => t.lineNumber)
//   const existingTargetBlocksMap = fromPairs(
//     existingTargetBlocks.map(([start, end]) => [start.index, end.index])
//   )
//   const pos = att.map((b) => [
//     b + 1,
//     existingTargetBlocksMap[b + 1] + 1 || b + 1,
//   ])
//   writeText(file, mergeText(fileTexts[file].split('\n'), str, pos))
//   console.log(`done writing ${file}`)
// }
//
// Promise.all(
//   [
//     'test-lists.md',
//     'test-lists2.md',
//     'diary/2021-03-20.md',
//     'diary/2021-03-21.md',
//   ].map(saveHashtags)
// ).then(() => {
//   replaceTags()
//   console.log('done')
// })
//
// glob('/Users/vamshi/Dropbox/**/*.md', (err: Error | null, files: string[]) => {
//   console.error(err?.message)
//   console.log(files)
// })

// export function main(fileNames: string[]) {
//   return from(fileNames).pipe(mergeMap(getText), map(parseText))
// }

// function getFileText(fileName: string): string {}

// testDB().then((data) => console.log(data))
//
//
