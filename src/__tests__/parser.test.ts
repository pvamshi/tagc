import {
  getLastIndex,
  parseLine,
  parseTags,
  removeDuplicates,
} from "../parser";
describe("parser.ts", () => {
  // TODO: Check if the order is fixed or random
  it("should parse hashtags", () => {
    const hashtags = parseTags("# a simple #text with lot of #hashtags");
    expect(hashtags).toEqual({ hashtag: ["hashtags", "text"] });
  });
  it("should parse excludeTags and includeTags", () => {
    const hashtags = parseTags(
      "a simple #text with lot of #hashtags +todo +text -header"
    );
    expect(hashtags).toEqual({
      excludeTag: ["header"],
      hashtag: ["text", "hashtags"],
      includeTag: ["todo", "text"],
    });
  });

  test("`removeDuplicates` should remove duplicate elements in array", () => {
    expect(removeDuplicates(["abc", "def", "abc"])).toEqual(["abc", "def"]);
  });

  test("`parseLine` should parse line type", () => {
    expect(parseLine(`- this is a list`, 0)).toEqual({
      startIndex: 0,
      endIndex: 0,
      spaces: 0,
      task: false,
      type: "LIST",
      done: true,
      tags: {},
    });
  });

  test("get blocks", () => {
    let lines = [
      {
        startIndex: 0,
        endIndex: 0,
        spaces: 0,
        type: "LIST",
      },
      {
        startIndex: 1,
        endIndex: 1,
        spaces: 2,
        type: "LIST",
      },
    ];
    getLastIndex(lines, 0);
    expect(lines[0].endIndex).toBe(1);
    expect(lines[1].endIndex).toBe(1);
    lines = [
      {
        startIndex: 0,
        endIndex: 0,
        spaces: 0,
        type: "LIST",
      },
      {
        startIndex: 1,
        endIndex: 1,
        spaces: 2,
        type: "LIST",
      },
      {
        startIndex: 2,
        endIndex: 2,
        spaces: 2,
        type: "LIST",
      },
      {
        startIndex: 3,
        endIndex: 3,
        spaces: 2,
        type: "LIST",
      },
      {
        startIndex: 4,
        endIndex: 4,
        spaces: 4,
        type: "LIST",
      },
      {
        startIndex: 5,
        endIndex: 5,
        spaces: 0,
        type: "LIST",
      },
      {
        startIndex: 6,
        endIndex: 6,
        spaces: 0,
        type: "LIST",
      },
    ];
    getLastIndex(lines, 0);
    expect(lines[0].endIndex).toBe(4);
    expect(lines[1].endIndex).toBe(1);
    expect(lines[3].endIndex).toBe(4);
  });
  test("get list tree when indentation is odd", () => {
    const lines = [
      {
        startIndex: 0,
        endIndex: 0,
        spaces: 0,
        type: "LIST",
      },
      {
        startIndex: 1,
        endIndex: 1,
        spaces: 4,
        type: "LIST",
      },
      {
        startIndex: 2,
        endIndex: 2,
        spaces: 4,
        type: "LIST",
      },
      {
        startIndex: 3,
        endIndex: 3,
        spaces: 2,
        type: "LIST",
      },
      {
        startIndex: 4,
        endIndex: 4,
        spaces: 0,
        type: "LIST",
      },
    ];
    getLastIndex(lines, 0);
    expect(lines[0].endIndex).toBe(3);
    expect(lines[1].endIndex).toBe(1);
    expect(lines[3].endIndex).toBe(3);
  });
});
