import { Tags } from '../db';
import { getQueries, getQueryResults } from '../query';
import { prepareDB } from './lines.test';

describe('query', () => {
  let tags: Collection<Tags>;
  beforeAll(async () => {
    const db = await prepareDB();
    tags = db.tags;
  });
  it('getQueries', () => {
    const tagsRaw: Tags[] = [
      {
        lineId: 0,
        hashtag: [],
        excludeTag: ['tag1'],
        includeTag: [],
        inheritedTags: [],
      },
      {
        lineId: 1,
        hashtag: [],
        excludeTag: ['tag2'],
        includeTag: [],
        inheritedTags: [],
      },
      {
        lineId: 2,
        hashtag: [],
        excludeTag: ['tag3', 'tag1'],
        includeTag: [],
        inheritedTags: [],
      },
      {
        lineId: 3,
        hashtag: [],
        excludeTag: ['tag2'],
        includeTag: ['tag1'],
        inheritedTags: [],
      },
    ];
    tags.insert(tagsRaw);
    const results = getQueries(['tag1'], tags);
    expect(results.length).toBe(3);
  });
  it('getQueries', () => {
    tags.clear();
    const tagsRaw: Tags[] = [
      {
        lineId: 0,
        hashtag: ['tag1', 'tag2'],
        excludeTag: [],
        includeTag: [],
        inheritedTags: [],
      },
      {
        lineId: 1,
        hashtag: ['tag2'],
        excludeTag: [],
        includeTag: [],
        inheritedTags: [],
      },
      {
        lineId: 2,
        hashtag: ['tag3', 'tag1'],
        excludeTag: [],
        includeTag: [],
        inheritedTags: [],
      },
      {
        lineId: 3,
        hashtag: [],
        excludeTag: [],
        includeTag: [],
        inheritedTags: [],
      },
    ];
    tags.insert(tagsRaw);
    const results = getQueryResults(
      [
        {
          lineId: 0,
          includeTag: ['tag1'],
          excludeTag: [],
          hashtag: [],
          inheritedTags: [],
        },
        {
          lineId: 0,
          includeTag: ['tag3'],
          excludeTag: [],
          hashtag: [],
          inheritedTags: [],
        },
        {
          // fail
          lineId: 0,
          includeTag: ['tag1', 'tag2'],
          excludeTag: [],
          hashtag: [],
          inheritedTags: [],
        },
        {
          lineId: 0,
          includeTag: ['tag1'],
          excludeTag: ['tag3'],
          hashtag: [],
          inheritedTags: [],
        },
        {
          lineId: 0,
          includeTag: ['tag2'],
          excludeTag: ['tag3'],
          hashtag: [],
          inheritedTags: [],
        },
      ],
      tags
    );
    expect(results.map(({ results }) => results.length)).toEqual([
      2,
      1,
      1,
      1,
      2,
    ]);
  });
  // consider inherited tags too while querying
});
