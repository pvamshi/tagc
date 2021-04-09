import { Tags } from '../db';
import { tagsInLines } from '../tags';
import { prepareDB } from '../__tests__/lines.test';

describe('tags', () => {
  let tags: Collection<Tags>;
  beforeAll(async () => {
    const { tags } = await prepareDB();
  });
  it('should collect all hashes from different lines', () => {
    const tagsRaw: Tags[] = [
      {
        lineId: 0,
        hashtag: ['tag1'],
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
        hashtag: ['tag2'],
        excludeTag: [],
        includeTag: [],
        inheritedTags: [],
      },
    ];
    tags.insert(tagsRaw);
    const tagsCollected = tagsInLines([0, 1, 2, 3], tags);
    expect(tagsCollected.includes('tag1')).toBeTruthy();
    expect(tagsCollected.includes('tag2')).toBeTruthy();
    expect(tagsCollected.includes('tag3')).toBeTruthy();
    expect(tagsCollected.includes('tag4')).toBeFalsy();
  });
});
