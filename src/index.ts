import { getText } from "./fileio";
import { getBlocks, getTargetBlocks, Block, mergeText } from "./parser";
import {
  FileData,
  getHashTagBlocks,
  getIncludeTags,
  saveTags,
  TargetTemp,
} from "./db";

const fileTexts: { [file: string]: string } = {};
// get hashtags

async function saveHashtags(file: string) {
  const data = await getText(file);
  fileTexts[file] = data;
  const tagBlocks = getBlocks(data);
  saveTags(file, tagBlocks);
  // const existingTargetBlocks = getTargetBlocks(data.split("\n"));
  // const startingIndeOfExistingTargetBlocks = new Set(
  //   existingTargetBlocks.map(([start, end]) => start.index)
  // );
  // const filesWithIncludeTags: {
  //   [file: string]: TargetTemp[];
  // } = getIncludeTags();
  // Object.entries(filesWithIncludeTags).forEach(([file, targetTemp]) => {
  //   const updatedTargetTemp = targetTemp.map((t) => ({
  //     ...t,
  //     update: startingIndexOfExistingTargetBlocks.has(t.lineNumber + 1),
  //   }));
  // });
}

function replaceTags() {
  Object.entries(getIncludeTags()).forEach(([file, targetTemp]) =>
    updateHashText(file, targetTemp)
  );
}
function updateHashText(file: string, targetTemps: TargetTemp[]) {
  // lineNumber: number;
  // tags: string[];
  const fileText = fileTexts[file];
  const existingTargetBlocks = getTargetBlocks(fileText.split("\n"));
  console.log({ existingTargetBlocks });
  const str = targetTemps
    .sort((obj1, obj2) => {
      if (obj1.lineNumber < obj2.lineNumber) {
        return -1;
      } else if (obj1.lineNumber > obj1.lineNumber) {
        return 1;
      } else {
        return 0;
      }
    })
    .map(({ tags }) => {
      const tagname = tags[0];
      const targetBlockMap = getHashTagBlocks(tagname);
      return Object.entries(targetBlockMap)
        .map(([fileName, targetBlockList]: [string, Block[]]) => {
          const fileText = fileTexts[fileName].split("\n");
          return targetBlockList
            .map(
              (block: Block) =>
                fileText
                  .slice(block.startIndex, block.endIndex + 1)
                  .join("\n")
                  .replace(
                    new RegExp(`#${tagname}`, "g"),
                    `[${fileName}](${fileName})`
                  ) + ` ::${block.id}::`
            )
            .join("\n\n");
        })
        .join("\n\n");
    });
  const att = targetTemps.map((t) => t.lineNumber);
  console.log("-----");
  console.log(mergeText(fileTexts[file].split("\n"), str, att.sort()));
}

Promise.all(["test-lists.md"].map(saveHashtags)).then(() => {
  replaceTags();
  console.log("done");
});
