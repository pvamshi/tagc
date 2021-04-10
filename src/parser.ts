import hashtag from './lib/hashtags';
import linetype from './lib/linetype';
import target from './lib/target';
import { mergeWith, pipe, reduce } from 'lodash/fp';
import nearley from 'nearley';
import { getLine, LineType, Tags } from './update-data';
export type BlockType = 'TEXT' | 'LIST' | 'TASK' | 'REFERENCE' | 'HEADING';
export interface Block {
  type: BlockType;
  parent: Block;
  _id: string;
  children: Block[];
}

export function parseTags(lineId: string): Tags {
  const block = getLine(lineId);
  if (!block) {
    throw new Error('no line exists with blockId:' + lineId);
  }
  if (block.referenceLineId) {
    return {
      lineId,
      includeTag: [],
      excludeTag: [],
      hashtag: [],
      inheritedTags: [],
    };
  }
  const text = block.content;
  const tagsParser = new nearley.Parser(nearley.Grammar.fromCompiled(hashtag));
  tagsParser.feed(text);
  const res: Tags = pipe(
    reduce(
      (acc, { type, value }) =>
        mergeWith((a, b) => a.concat(b), acc, { [type]: [value] }),
      { lineId, includeTag: [], excludeTag: [], hashtag: [], inheritedTags: [] }
    )
  )(tagsParser.results);
  res.hashtag = res.hashtag.filter((tag) => !tag.match(/#+/));
  return res;
}

export function getLineType(
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
