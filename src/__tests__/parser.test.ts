import {
  getBlocksForTag,
  Block,
  getLastIndex,
  parseLine,
  parseTags,
  removeDuplicates,
  mergeText,
  getTargetBlocksType,
  getTargetBlocks,
} from '../parser'
describe('parser.ts', () => {
  // TODO: Check if the order is fixed or random
  it('should parse hashtags', () => {
    const hashtags = parseTags('# a simple #text with lot of #hashtags')
    expect(hashtags).toEqual({
      excludeTag: [],
      hashtag: ['text', 'hashtags'],
      includeTag: [],
    })
  })
  it('should parse excludeTags and includeTags', () => {
    const hashtags = parseTags(
      'a simple #text with lot of #hashtags +todo +text -header'
    )
    expect(hashtags).toEqual({
      excludeTag: ['header'],
      hashtag: ['hashtags', 'text'],
      includeTag: ['text', 'todo'],
    })
  })

  test('`removeDuplicates` should remove duplicate elements in array', () => {
    expect(removeDuplicates(['abc', 'def', 'abc'])).toEqual(['abc', 'def'])
  })

  test('`parseLine` should parse line type', () => {
    expect(parseLine(`- this is a list +tag #tag2`, 0)).toEqual({
      startIndex: 0,
      endIndex: 0,
      spaces: 0,
      task: false,
      type: 'LIST',
      done: true,
      tags: { hashtag: ['tag2'], includeTag: ['tag'], excludeTag: [] },
    })
  })

  test('get blocks', () => {
    let lines: {
      type: 'LIST'
      startIndex: number
      endIndex: number
      spaces: number
    }[] = [
      {
        startIndex: 0,
        endIndex: 0,
        spaces: 0,
        type: 'LIST',
      },
      {
        startIndex: 1,
        endIndex: 1,
        spaces: 2,
        type: 'LIST',
      },
    ]
    getLastIndex(lines, 0)
    expect(lines[0].endIndex).toBe(1)
    expect(lines[1].endIndex).toBe(1)
    lines = [
      {
        startIndex: 0,
        endIndex: 0,
        spaces: 0,
        type: 'LIST',
      },
      {
        startIndex: 1,
        endIndex: 1,
        spaces: 2,
        type: 'LIST',
      },
      {
        startIndex: 2,
        endIndex: 2,
        spaces: 2,
        type: 'LIST',
      },
      {
        startIndex: 3,
        endIndex: 3,
        spaces: 2,
        type: 'LIST',
      },
      {
        startIndex: 4,
        endIndex: 4,
        spaces: 4,
        type: 'LIST',
      },
      {
        startIndex: 5,
        endIndex: 5,
        spaces: 0,
        type: 'LIST',
      },
      {
        startIndex: 6,
        endIndex: 6,
        spaces: 0,
        type: 'LIST',
      },
    ]
    getLastIndex(lines, 0)
    expect(lines[0].endIndex).toBe(4)
    expect(lines[1].endIndex).toBe(1)
    expect(lines[3].endIndex).toBe(4)
  })
  test('get list tree when indentation is odd', () => {
    const lines: {
      type: 'LIST'
      startIndex: number
      endIndex: number
      spaces: number
    }[] = [
      {
        startIndex: 0,
        endIndex: 0,
        spaces: 0,
        type: 'LIST',
      },
      {
        startIndex: 1,
        endIndex: 1,
        spaces: 4,
        type: 'LIST',
      },
      {
        startIndex: 2,
        endIndex: 2,
        spaces: 4,
        type: 'LIST',
      },
      {
        startIndex: 3,
        endIndex: 3,
        spaces: 2,
        type: 'LIST',
      },
      {
        startIndex: 4,
        endIndex: 4,
        spaces: 0,
        type: 'LIST',
      },
    ]
    getLastIndex(lines, 0)
    expect(lines[0].endIndex).toBe(3)
    expect(lines[1].endIndex).toBe(1)
    expect(lines[3].endIndex).toBe(3)
  })
  test('getBlocksForTag should give correct text snips', () => {
    const lines = `line 1
line2
line 3 #tag1
line 4 #tag2
line 5 
line 6
line 7 #tag1
line 8 #tag1`
    const blocks: Block[] = [
      {
        startIndex: 0,
        endIndex: 0,
        type: 'LIST',
        tags: { hashtag: [], includeTag: [], excludeTag: [] },
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 1,
        endIndex: 1,
        type: 'LIST',
        tags: { hashtag: [], includeTag: [], excludeTag: [] },
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 2,
        endIndex: 6,
        type: 'LIST',
        tags: { hashtag: ['tag1'], includeTag: [], excludeTag: [] },
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 3,
        endIndex: 4,
        type: 'LIST',
        tags: { hashtag: ['tag2'], includeTag: [], excludeTag: [] },
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 4,
        endIndex: 4,
        type: 'LIST',
        tags: { hashtag: [], includeTag: [], excludeTag: [] },
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 5,
        endIndex: 5,
        type: 'LIST',
        tags: { hashtag: [], includeTag: [], excludeTag: [] },
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 6,
        endIndex: 6,
        type: 'LIST',
        tags: { hashtag: ['tag1'], includeTag: [], excludeTag: [] },
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 7,
        endIndex: 7,
        type: 'LIST',
        tags: { hashtag: ['tag1'], includeTag: [], excludeTag: [] },
        done: false,
        spaces: 0,
        task: true,
      },
    ]
    const result = getBlocksForTag(lines.split('\n'), blocks, 'tag1')

    expect(result).toEqual([
      `line 3 #tag1
line 4 #tag2
line 5 
line 6
line 7 #tag1`,
      `line 7 #tag1`,
      `line 8 #tag1`,
    ])
  })

  test('`mergeText` to merge two text array blocks', () => {
    const temp = mergeText(
      `line 0
line 1
line2
line3
line4
line5
line6
line7
line8
line9
line10`.split('\n'),
      ['merge text1', 'merge text 2', 'merge text 3'],
      [
        [3, 3],
        [6, 6],
        [9, 9],
      ]
    )
    expect(temp).toEqual(
      `line 0
line 1
line2
merge text1
line3
line4
line5
merge text 2
line6
line7
line8
merge text 3
line9
line10
`
    )
  })
  test('`mergeText` to merge two text array blocks with existing elements', () => {
    const temp = mergeText(
      `line 0
line 1
line2
line3
line4
line5
line6
line7
line8
line9
line10`.split('\n'),
      ['merge text1', 'merge text 2', 'merge text 3'],
      [
        [3, 5],
        [6, 6],
        [9, 9],
      ]
    )
    expect(temp).toEqual(
      `line 0
line 1
line2
merge text1
line5
merge text 2
line6
line7
line8
merge text 3
line9
line10
`
    )
  })
  //   test("if integrating all will work the magic", () => {
  //     const file1 = `
  // - line 1
  // - line 2
  // - line 3 +tag1
  // - line 4
  // - line 5 +tag2
  // - line 6
  // - line 7
  // `;
  //     const file2 = `
  // - line merge text 1
  // - line merge text 2 #tag1
  // - line merge text 3
  // - line merge text 4 #tag1
  // - line merge text 5
  // - line merge text 6 #tag2
  // - line merge text 7
  // `;
  //     const final = getUpdatedText(file1, file2);
  //     expect(final).toEqual(
  //       `
  // - line 1
  // - line 2
  // - line 3 +tag1
  // - line merge text 2 #tag1
  // - line merge text 4 #tag1
  // - line 4
  // - line 5 +tag2
  // - line merge text 6 #tag2
  // - line 6
  // - line 7

  // `
  //     );
  //   });
  describe('`getTargetBlocks` should give targetblock for a text', () => {
    test('for start block', () => {
      const result = getTargetBlocksType('[index](index.md) ---')
      expect(result).toEqual({
        type: 'start',
        value: { name: 'index', path: 'index.md' },
      })
    })
    test('for end block', () => {
      const resultForEnd = getTargetBlocksType(
        '-asdfsdfasdf asd saf asdfs.asdf asd@*&^*@$#@ ::asf234sdf534sdsd:: ---'
      )
      expect(resultForEnd).toEqual({
        type: 'end',
        value: {
          id: 'asf234sdf534sdsd',
        },
      })
    })

    test('get the blocks: happy path', () => {
      const result = getTargetBlocks([
        'some text',
        '[index](index.md) ---',
        'sdfasf',
        'asdsfdasdf',
        'asdfsdfsd::sfds:: ---',
      ])
      expect(result.map(([start, end]) => [start.index, end.index])).toEqual([
        [1, 4],
      ])
    })
    test('get the blocks: multiple happy path', () => {
      const result = getTargetBlocks([
        'some text',
        '[index](index.md) ---',
        'sdfasf',
        'asdsfdasdf',
        'asdfsdfsd::sfds:: ---',
        'some text',
        'some text',
        'some text',
        'some text',
        '[index](index.md) ---',
        'sdfasf',
        'asdsfdasdf',
        'asdfsdfsd::sfds:: ---',
        'some text',
        'some text',
        'some text',
      ])
      expect(result.map(([start, end]) => [start.index, end.index])).toEqual([
        [1, 4],
        [9, 12],
      ])
    })
    test('get the blocks: multiple unhappy path', () => {
      const result = getTargetBlocks([
        'some text',
        '[index](index.md) ---',
        'sdfasf',
        'asdsfdasdf',
        'asdfsdfsd::sfds:: ---',
        'some text',
        '[index](index.md)',
        'some text',
        'some text',
        'some text',
        '[index](index.md) ---',
        'sdfasf',
        'asdsfdasdf',
        'asdfsdfsd::sfds:: ---',
        'some text',
        'some text',
        'some text',
      ])
      expect(result.map(([start, end]) => [start.index, end.index])).toEqual([
        [1, 4],
        [10, 13],
      ])
    })
    test('get the blocks: same line happy path', () => {
      const result = getTargetBlocks([
        'some text',
        ' asdfs dfasdfd    [index](index.md) ::sfds:: ===',
        'sdfasf',
        'asdsfdasdf',
        'asdfsdfsd',
        'some text',
        'some text',
        'some text',
      ])
      expect(result.map(([start, end]) => [start.index, end.index])).toEqual([
        [1, 1],
      ])
    })
  })

  test('debugging getLastIndex', () => {
    const blocks: Block[] = [
      {
        startIndex: 0,
        endIndex: 0,
        tags: { hashtag: [], includeTag: [], excludeTag: [] },
        type: 'LIST',
        task: false,
        done: true,
        spaces: 0,
      },
      {
        startIndex: 1,
        endIndex: 1,
        tags: { hashtag: [], includeTag: [], excludeTag: [] },
        type: 'LIST',
        task: false,
        done: true,
        spaces: 0,
      },
      {
        startIndex: 2,
        endIndex: 2,
        tags: { hashtag: [], includeTag: [], excludeTag: [] },
        type: 'LIST',
        task: false,
        done: true,
        spaces: 2,
      },
      {
        startIndex: 3,
        endIndex: 3,
        tags: { hashtag: [], includeTag: [], excludeTag: [] },
        type: 'LIST',
        task: false,
        done: true,
        spaces: 0,
      },
    ]
    getLastIndex(blocks, 0)
    expect(blocks[1].endIndex).toBe(2)
  })
})
