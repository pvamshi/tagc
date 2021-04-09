import hashtag from './lib/hashtags';
import { mergeWith, pipe, reduce } from 'lodash/fp';
import nearley from 'nearley';
import { getLine, Line, Tags, ID } from './db';

export function addTagsToChanges(
  lineIds: ID[],
  lines: Collection<Line>,
  tags: Collection<Tags>
) {
  lineIds.forEach((lineId) => {
    const tagsObj = parseTags(lineId, lines);
    tags.insertOne(tagsObj);
  });
}

function parseTags(lineId: ID, lines: Collection<Line>): Tags {
  const line = getLine(lineId, lines);
  if (!line) {
    throw new Error('no line exists with blockId:' + lineId);
  }
  if (line.type === 'REFERENCE') {
    return {
      lineId,
      includeTag: [],
      excludeTag: [],
      hashtag: [],
      inheritedTags: [],
    };
  }
  const text = line.content;
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
