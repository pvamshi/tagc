"use strict";
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
Object.defineProperty(exports, "__esModule", { value: true });
var parser_1 = require("../parser");
describe("parser.ts", function () {
  // TODO: Check if the order is fixed or random
  it("should parse hashtags", function () {
    var hashtags = parser_1.parseTags("# a simple #text with lot of #hashtags");
    expect(hashtags).toEqual({ hashtag: ["hashtags", "text"] });
  });
  it("should parse excludeTags and includeTags", function () {
    var hashtags = parser_1.parseTags(
      "a simple #text with lot of #hashtags +todo +text -header"
    );
    expect(hashtags).toEqual({
      excludeTag: ["header"],
      hashtag: ["text", "hashtags"],
      includeTag: ["todo", "text"],
    });
  });
  test("`removeDuplicates` should remove duplicate elements in array", function () {
    expect(parser_1.removeDuplicates(["abc", "def", "abc"])).toEqual([
      "abc",
      "def",
    ]);
  });
  test("`parseLine` should parse line type", function () {
    expect(parser_1.parseLine("- this is a list +tag #tag2", 0)).toEqual({
      startIndex: 0,
      endIndex: 0,
      spaces: 0,
      task: false,
      type: "LIST",
      done: true,
      tags: { hashtag: ["tag2"], includeTag: ["tag"] },
    });
  });
  test("get blocks", function () {
    var lines = [
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
    parser_1.getLastIndex(lines, 0);
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
    parser_1.getLastIndex(lines, 0);
    expect(lines[0].endIndex).toBe(4);
    expect(lines[1].endIndex).toBe(1);
    expect(lines[3].endIndex).toBe(4);
  });
  test("get list tree when indentation is odd", function () {
    var lines = [
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
    parser_1.getLastIndex(lines, 0);
    expect(lines[0].endIndex).toBe(3);
    expect(lines[1].endIndex).toBe(1);
    expect(lines[3].endIndex).toBe(3);
  });
  test("getBlocksForTag should give correct text snips", function () {
    var lines =
      "line 1\nline2\nline 3 #tag1\nline 4 #tag2\nline 5 \nline 6\nline 7 #tag1\nline 8 #tag1";
    var blocks = [
      {
        startIndex: 0,
        endIndex: 0,
        type: "LIST",
        tags: {},
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 1,
        endIndex: 1,
        type: "LIST",
        tags: {},
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 2,
        endIndex: 6,
        type: "LIST",
        tags: { hashtag: ["tag1"] },
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 3,
        endIndex: 4,
        type: "LIST",
        tags: { hashtag: ["tag2"] },
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 4,
        endIndex: 4,
        type: "LIST",
        tags: {},
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 5,
        endIndex: 5,
        type: "LIST",
        tags: {},
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 6,
        endIndex: 6,
        type: "LIST",
        tags: { hashtag: ["tag1"] },
        done: false,
        spaces: 0,
        task: true,
      },
      {
        startIndex: 7,
        endIndex: 7,
        type: "LIST",
        tags: { hashtag: ["tag1"] },
        done: false,
        spaces: 0,
        task: true,
      },
    ];
    var result = parser_1.getBlocksForTag(lines.split("\n"), blocks, "tag1");
    expect(result).toEqual([
      "line 3 #tag1\nline 4 #tag2\nline 5 \nline 6\nline 7 #tag1",
      "line 7 #tag1",
      "line 8 #tag1",
    ]);
  });
  test("`mergeText` to merge two text array blocks", function () {
    var temp = parser_1.mergeText(
      "line 0\nline 1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10".split(
        "\n"
      ),
      ["merge text1", "merge text 2", "merge text 3"],
      [0, 5, 8]
    );
    expect(temp).toEqual(
      "line 0\nmerge text1\n---\nline 1\nline2\nline3\nline4\nline5\nmerge text 2\n---\nline6\nline7\nline8\nmerge text 3\n---\nline9\nline10\n"
    );
  });
  test("if integrating all will work the magic", function () {
    var file1 =
      "\n- line 1\n- line 2\n- line 3 +tag1\n- line 4\n- line 5 +tag2\n- line 6\n- line 7\n";
    var file2 =
      "\n- line merge text 1\n- line merge text 2 #tag1\n- line merge text 3 \n- line merge text 4 #tag1\n- line merge text 5 \n- line merge text 6 #tag2\n- line merge text 7\n";
    var final = parser_1.getUpdatedText(file1, file2);
    expect(final).toEqual(
      "\n- line 1\n- line 2\n- line 3 +tag1\n- line merge text 2 #tag1\n- line merge text 4 #tag1\n---\n- line 4\n- line 5 +tag2\n- line merge text 6 #tag2\n---\n- line 6\n- line 7\n\n"
    );
  });
  describe("`getTargetBlocks` should give targetblock for a text", function () {
    test("for start block", function () {
      var result = parser_1.getTargetBlocksType("[index](index.md)");
      expect(result).toEqual({
        type: "start",
        value: { name: "index", path: "index.md" },
      });
    });
    test("for end block", function () {
      var resultForEnd = parser_1.getTargetBlocksType(
        "-asdfsdfasdf asd saf asdfs.asdf asd@*&^*@$#@ ::asf234sdf534sdsd::"
      );
      expect(resultForEnd).toEqual({
        type: "end",
        value: {
          id: "asf234sdf534sdsd",
          text: "-asdfsdfasdf asd saf asdfs.asdf asd@*&^*@$#@ ",
        },
      });
    });
    test("get the blocks: happy path", function () {
      var result = parser_1.getTargetBlocks([
        "some text",
        "[index](index.md)",
        "sdfasf",
        "asdsfdasdf",
        "asdfsdfsd::sfds::",
      ]);
      expect(
        result.map(function (_a) {
          var _b = __read(_a, 2),
            start = _b[0],
            end = _b[1];
          return [start.index, end.index];
        })
      ).toEqual([[1, 4]]);
    });
    test("get the blocks: multiple happy path", function () {
      var result = parser_1.getTargetBlocks([
        "some text",
        "[index](index.md)",
        "sdfasf",
        "asdsfdasdf",
        "asdfsdfsd::sfds::",
        "some text",
        "some text",
        "some text",
        "some text",
        "[index](index.md)",
        "sdfasf",
        "asdsfdasdf",
        "asdfsdfsd::sfds::",
        "some text",
        "some text",
        "some text",
      ]);
      expect(
        result.map(function (_a) {
          var _b = __read(_a, 2),
            start = _b[0],
            end = _b[1];
          return [start.index, end.index];
        })
      ).toEqual([
        [1, 4],
        [9, 12],
      ]);
    });
    test("get the blocks: multiple unhappy path", function () {
      var result = parser_1.getTargetBlocks([
        "some text",
        "[index](index.md)",
        "sdfasf",
        "asdsfdasdf",
        "asdfsdfsd::sfds::",
        "some text",
        "[index](index.md)",
        "some text",
        "some text",
        "some text",
        "[index](index.md)",
        "sdfasf",
        "asdsfdasdf",
        "asdfsdfsd::sfds::",
        "some text",
        "some text",
        "some text",
      ]);
      expect(
        result.map(function (_a) {
          var _b = __read(_a, 2),
            start = _b[0],
            end = _b[1];
          return [start.index, end.index];
        })
      ).toEqual([
        [1, 4],
        [10, 13],
      ]);
    });
  });
  test("debugging getLastIndex", function () {
    var blocks = [
      {
        startIndex: 0,
        endIndex: 0,
        tags: {},
        type: "LIST",
        task: false,
        done: true,
        spaces: 0,
      },
      {
        startIndex: 1,
        endIndex: 1,
        tags: {},
        type: "LIST",
        task: false,
        done: true,
        spaces: 0,
      },
      {
        startIndex: 2,
        endIndex: 2,
        tags: {},
        type: "LIST",
        task: false,
        done: true,
        spaces: 2,
      },
      {
        startIndex: 3,
        endIndex: 3,
        tags: {},
        type: "LIST",
        task: false,
        done: true,
        spaces: 0,
      },
      // {
      //   startIndex: 4,
      //   endIndex: 4,
      //   tags: { hashtag: ["tag1"] },
      //   type: "LIST",
      //   task: false,
      //   done: true,
      //   spaces: 2,
      // },
      // {
      //   startIndex: 5,
      //   endIndex: 5,
      //   tags: {},
      //   type: "LIST",
      //   task: false,
      //   done: true,
      //   spaces: 2,
      // },
      // {
      //   startIndex: 6,
      //   endIndex: 6,
      //   tags: { hashtag: ["tag2"] },
      //   type: "LIST",
      //   task: false,
      //   done: true,
      //   spaces: 2,
      // },
      // {
      //   startIndex: 7,
      //   endIndex: 7,
      //   tags: {},
      //   type: "LIST",
      //   task: false,
      //   done: true,
      //   spaces: 4,
      // },
      // {
      //   startIndex: 8,
      //   endIndex: 8,
      //   tags: {},
      //   type: "LIST",
      //   task: false,
      //   done: true,
      //   spaces: 6,
      // },
      // {
      //   startIndex: 9,
      //   endIndex: 9,
      //   tags: {},
      //   type: "LIST",
      //   task: false,
      //   done: true,
      //   spaces: 6,
      // },
      // {
      //   startIndex: 10,
      //   endIndex: 10,
      //   tags: {},
      //   type: "LIST",
      //   task: false,
      //   done: true,
      //   spaces: 2,
      // },
      // {
      //   startIndex: 11,
      //   endIndex: 11,
      //   tags: {},
      //   type: "LIST",
      //   task: false,
      //   done: true,
      //   spaces: 2,
      // },
    ];
    var las = parser_1.getLastIndex(blocks, 0);
    expect(las).toBe(0);
    expect(blocks[1].endIndex).toBe(2);
  });
});
