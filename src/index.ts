// import { getText, writeText } from './fileio'
// import { getBlocks, getTargetBlocks, Block, mergeText } from './parser'
// import {
//   testDB,
// getHashTagBlocks,
// getIncludeTags,
// saveTags,
// TargetTemp,
// } from './db';
// import glob from 'glob'
// import { fromPairs } from 'lodash'
import { commitChanges } from './commit-changes';
import { of } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { changeFile } from './db';

// step 1: Get file to update
// step 2: get file changes :: commit-changes.ts
// step 3: add or update the changes
// step 4: Refresh the blocks

// of('/Users/vamshi/Dropbox/life/test-lists.md')
//   .pipe(
//     mergeMap(commitChanges),
//     filter((changes) => !!changes),
//     mergeMap(changeFile)
//   )
//   .subscribe((d) => console.log(d));
async function appendChanges(filePath: string) {
  const changes = await commitChanges(filePath);
  if (changes) {
    return await changeFile(changes);
  }
}
appendChanges('/Users/vamshi/Dropbox/life/test-lists.md').then(() =>
  console.log('done')
);

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
