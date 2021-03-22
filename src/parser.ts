import hashtag from "./lib/hashtags";
import linetype from "./lib/linetype";
import nearley from "nearley";
import target from "./lib/target";
import { nanoid } from "nanoid";
import { chunk, zip } from "lodash";
export type BlockType = "LIST" | "TEXT";
import { mergeWith, pipe, reduce } from "lodash/fp";
export interface Block {
  id?: string;
  startIndex: number; // inclusive
  endIndex: number; //exclusive
  type: BlockType;
  tags: Tags;
  done: boolean;
  spaces: number;
  task: boolean;
}
export interface Line {
  startIndex: number; // inclusive
  endIndex: number; //exclusive
  type: BlockType;
  spaces: number;
}
export interface Tags {
  includeTag: string[];
  excludeTag: string[];
  hashtag: string[];
}
export function parseTags(text: string): Tags {
  const tagsParser = new nearley.Parser(nearley.Grammar.fromCompiled(hashtag));
  tagsParser.feed(text);
  const r = pipe(
    reduce(
      (acc, { type, value }) =>
        mergeWith((a, b) => a.concat(b), acc, { [type]: [value] }),
      { includeTag: [], excludeTag: [], hashtag: [] }
    )
  )(tagsParser.results);
  console.log({ r });
  return r;
}

export function removeDuplicates(tags: string[]): string[] {
  return Array.from(new Set(tags));
}

function validHash(hash: string): boolean {
  return !hash.startsWith("#");
}

export function parseLine(text: string, index: number): Block {
  const lineParser = new nearley.Parser(nearley.Grammar.fromCompiled(linetype));
  lineParser.feed(text);
  const line = lineParser.results[0];
  return {
    startIndex: index,
    endIndex: index,
    tags: parseTags(text),
    ...line,
  };
}

export function getLastIndex(
  lines: Line[],
  startIndex: number,
  parentSpaces = 0
): number {
  let i = startIndex;
  while (i < lines.length) {
    const current = lines[i];
    const next = lines[i + 1];
    if (i + 1 < lines.length && next.spaces === current.spaces) {
      i = i + 1;
    } else if (i + 1 === lines.length || next.spaces <= parentSpaces) {
      return i;
    } else if (next.spaces > current.spaces) {
      const lastIndex = getLastIndex(lines, i + 1, current.spaces);
      lines[i].endIndex = lastIndex;
      if (
        lines[lastIndex + 1] &&
        lines[lastIndex + 1].spaces === current.spaces
      ) {
        i = lastIndex + 1;
      } else {
        return lastIndex;
      }
    } else {
      i = i + 1;
    }
  }
  return lines.length;
}

function getSpacesForText(blocks: Block[], index: number): number {
  if (index === 0) {
    return 0;
  }
  for (let i = index - 1; i > 0; i--) {
    if (blocks[i].type === "LIST") {
      return blocks[i].spaces;
    }
  }
  return 0;
}
export function getBlocks(fileText: string): Block[] {
  const blocks = fileText
    .split("\n")
    .map(parseLine)
    .map((block, index, blocks) => {
      if (block.type === "TEXT") {
        block.spaces = getSpacesForText(blocks, index);
      }
      return block;
    });
  getLastIndex(blocks, 0);
  return blocks
    .filter(
      (block) =>
        block.tags.hashtag.length > 0 ||
        block.tags.excludeTag.length > 0 ||
        block.tags.includeTag.length > 0
    )
    .map((block) => ({ id: nanoid(15), ...block }));
}

export function getBlocksForTag(
  lines: string[],
  blocks: Block[],
  includeTag: string
): string[] {
  return blocks
    .filter(
      (block) =>
        block.tags.hashtag &&
        block.tags.hashtag.length > 0 &&
        block.tags.hashtag.includes(includeTag)
    )
    .map(({ startIndex, endIndex }) =>
      lines.slice(startIndex, endIndex + 1).join("\n")
    );
}

export function mergeText(
  target: string[],
  targetTexts: string[],
  positions: number[][]
) {
  if (targetTexts.length !== positions.length && targetTexts.length === 0) {
    throw new Error(
      "Wrong set of input for merging text, all should be of same size and greater than zero"
    );
  }
  return zip(
    chunk([0, ...positions.flat(), target.length], 2).map(([s, e]) =>
      target.slice(s, e).join("\n")
    ),
    targetTexts
  )
    .flat()
    .join("\n");
  // positions.forEach((pos, index) =>
  //   target.splice(pos + 1, 0, targetTexts[index])
  // );
  // return target.join("\n");
  // return [
  //   [0, positions[0] + 1],
  //   ...positions.map((start, index, arr) =>
  //     index + 1 === arr.length
  //       ? [start + 1, target.length]
  //       : [start + 1, arr[index + 1] + 1]
  //   ),
  // ]
  //   .map(([start, end]) => target.slice(start, end).join("\n"))
  //   .map(
  //     (sourceChunk, index, arr) =>
  //       sourceChunk +
  //       "\n" +
  //       (index + 1 === arr.length ? "" : targetTexts[index])
  //   )
  //   .join("\n");
}

// export function getUpdatedText(sourceFile: string, targetFile: string): string {
//   const blocks = sourceFile.split("\n").map(parseLine);
//   const blocks2 = targetFile.split("\n").map(parseLine);
//   const temp = blocks.filter(
//     (block) => block.tags.includeTag && block.tags.includeTag.length > 0
//   );
//   const positions = temp.map(({ startIndex }) => startIndex);
//   const texts = temp.map((block) =>
//     getBlocksForTag(
//       targetFile.split("\n"),
//       blocks2,
//       block.tags.includeTag![0]
//     ).join("\n")
//   );
//   return mergeText(sourceFile.split("\n"), texts, positions);
// }

export function getTargetBlocksType(
  text: string
):
  | { type: "start"; value: { name: string; path: string } }
  | { type: "single"; value: { id: string; name: string; path: string } }
  | { type: "end"; value: { id: string } } {
  const targetParser = new nearley.Parser(nearley.Grammar.fromCompiled(target));
  targetParser.feed(text);
  return targetParser.results[0];
}

export function getTargetBlocks(texts: string[]) {
  const types = texts.map((text, index) => ({
    ...getTargetBlocksType(text),
    index,
  }));
  const pairs = [];
  let currentStart = undefined;
  for (let i = 0; i < types.length; i++) {
    if (types[i].type === "single") {
      pairs.push([types[i], types[i]]);
    } else if (types[i].type === "start") {
      currentStart = types[i];
    } else if (types[i].type === "end") {
      if (currentStart) {
        pairs.push([currentStart, types[i]]);
        currentStart = undefined;
      }
    }
  }
  // pairs.map(([start, end])=> );
  return pairs;
}
