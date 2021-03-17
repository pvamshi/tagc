import hashtag from "./lib/hashtags";
import linetype from "./lib/linetype";
import nearley from "nearley";
import { assert } from "node:console";
export type BlockType = "LIST" | "TEXT";

export interface Block {
  startIndex: number; // inclusive
  endIndex: number; //exclusive
  type: BlockType;
  tags: Tags;
  done: boolean;
  spaces: number;
  task: boolean;
}

export interface Tags {
  includeTag: string[];
  excludeTag: string[];
  hashtag: string[];
}
export function parseTags(text: string): Tags {
  const tagsParser = new nearley.Parser(nearley.Grammar.fromCompiled(hashtag));
  tagsParser.feed(text);
  const results: Tags = tagsParser.results.reduce(
    (acc, { type, value }) => ({
      ...acc,
      [type]: removeDuplicates([...(acc[type] || []), value]).filter(validHash),
    }),
    {}
  );
  return results;
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
  lines: {
    type: "LIST";
    startIndex: number;
    endIndex: number;
    spaces: number;
  }[],
  startIndex: number,
  parentSpaces = 0
): number {
  let i = startIndex;
  while (i < lines.length) {
    const current = lines[i];
    const next = lines[i + 1];
    if (i + 1 === lines.length || next.spaces <= parentSpaces) {
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
  source: string[],
  texts: string[],
  positions: number[]
) {
  if (texts.length !== positions.length && texts.length === 0) {
    throw new Error(
      "Wrong set of input for merging text, all should be of same size and greater than zero"
    );
  }
  return [
    [0, positions[0] + 1],
    ...positions.map((start, index, arr) =>
      index + 1 === arr.length
        ? [start + 1, source.length]
        : [start + 1, arr[index + 1] + 1]
    ),
  ]
    .map(([start, end]) => source.slice(start, end).join("\n"))
    .map(
      (sourceChunk, index, arr) =>
        sourceChunk + "\n\n" + (index + 1 === arr.length ? "---" : texts[index])
    )
    .join("\n");
}
