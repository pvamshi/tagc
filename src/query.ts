import { Tags, TagsDocument } from './db';
import { log } from './main';

export function getQueries(hashes: string[], tagsDB: Collection<Tags>) {
  const result = tagsDB.find({
    $or: [
      { excludeTag: { $containsAny: hashes } },
      { includeTag: { $containsAny: hashes } },
    ],
  });
  return result;
}

export function getQueryResults(queryTags: Tags[], tagsDB: Collection<Tags>) {
  return queryTags.map(({ lineId, excludeTag, includeTag }) => ({
    queryLineId: lineId,
    results: tagsDB.find({
      $and: [
        { inheritedTags: { $contains: includeTag } },
        {
          $and: [
            { hashtag: { $containsNone: excludeTag } },
            { inheritedTags: { $containsNone: excludeTag } },
          ],
        },
        { hashtag: { $containsAny: includeTag } },
      ],
    }),
  }));
}
