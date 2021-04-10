import { mergeWith, pipe, reduce } from 'lodash/fp';
import nearley from 'nearley';
import { getLine, ID, Line, Tags, TagsDocument } from './db';
import hashtag from './lib/hashtags';
import { log } from './main';

export function addTagsToChanges(
  lineIds: ID[],
  linesDB: Collection<Line>,
  tagsDB: Collection<Tags>
) {
  const tags = lineIds.map((lineId) => parseTags(lineId, linesDB));
  const addedTags = tagsDB.insert(tags);
  if (!addedTags) {
    throw new Error('error while adding tags');
  }
  return Array.isArray(addedTags) ? addedTags : [addedTags];
}

export function tagsInLines(lineIds: ID[], tagsDB: Collection<Tags>): string[] {
  const tags = tagsDB.find({ lineId: { $in: lineIds } });
  return [...new Set(tags.flatMap((tag: TagsDocument) => tag.hashtag))];
}
function parseTags(lineId: ID, lines: Collection<Line>): Tags {
  const line = getLine(lineId, lines);
  if (!line) {
    throw new Error('no line exists with blockId:' + lineId);
  }
  if (line.referenceLineId) {
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
  res.inheritedTags = [...res.hashtag];
  return res;
}

export function isQuery(lineId: ID, tagsDB: Collection<Tags>) {
  const tags = tagsDB.findOne({ lineId });
  if (!tags) {
    return false;
  }
  return !(tags.excludeTag.length === 0 && tags.includeTag.length === 0);
}
export function getTagsFromDeleteLines(
  deletedLines: ID[],
  linesDB: Collection<Line>,
  tagsDB: Collection<Tags>
): string[] {
  const tags = deletedLines
    .map((lineId) => getLine(lineId, linesDB))
    .filter((line) => line.type === 'BOUNDARY' || line.referenceLineId)
    .map((line) => tagsDB.findOne({ lineId: line.$loki }));

  log({ tags });
  return tags
    .filter((tag) => tag && tag.inheritedTags.length !== 0)
    .flatMap((tag) => tag?.inheritedTags) as string[];
}
