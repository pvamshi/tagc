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
  if (block.type === 'REFERENCE') {
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
