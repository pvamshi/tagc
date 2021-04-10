import { Tags, TagsDocument } from './db';

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
        {
          //hashtag
          $or: [
            { hashtag: { $contains: includeTag } },
            { inheritedTag: { $contains: includeTag } },
          ],
        },
        {
          // includetag
          $and: [
            { hashtag: { $containsNone: excludeTag } },
            { inheritedTag: { $containsNone: excludeTag } },
          ],
        },
      ],
    }),
  }));
}

// if includes in hashtag or include tags
// and
//  not include in hashtag and iclude ag
