"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
      to[j] = from[i];
    return to;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTargetBlocks = exports.getTargetBlocksType = exports.getUpdatedText = exports.mergeText = exports.getBlocksForTag = exports.getBlocks = exports.getLastIndex = exports.parseLine = exports.removeDuplicates = exports.parseTags = void 0;
var hashtags_1 = __importDefault(require("./lib/hashtags"));
var linetype_1 = __importDefault(require("./lib/linetype"));
var nearley_1 = __importDefault(require("nearley"));
var target_1 = __importDefault(require("./lib/target"));
function parseTags(text) {
  var tagsParser = new nearley_1.default.Parser(
    nearley_1.default.Grammar.fromCompiled(hashtags_1.default)
  );
  tagsParser.feed(text);
  var results = tagsParser.results.reduce(function (acc, _a) {
    var _b;
    var type = _a.type,
      value = _a.value;
    return __assign(
      __assign({}, acc),
      ((_b = {}),
      (_b[type] = removeDuplicates(
        __spreadArray(__spreadArray([], __read(acc[type] || [])), [value])
      ).filter(validHash)),
      _b)
    );
  }, {});
  return results;
}
exports.parseTags = parseTags;
function removeDuplicates(tags) {
  return Array.from(new Set(tags));
}
exports.removeDuplicates = removeDuplicates;
function validHash(hash) {
  return !hash.startsWith("#");
}
function parseLine(text, index) {
  var lineParser = new nearley_1.default.Parser(
    nearley_1.default.Grammar.fromCompiled(linetype_1.default)
  );
  lineParser.feed(text);
  var line = lineParser.results[0];
  return __assign(
    { startIndex: index, endIndex: index, tags: parseTags(text) },
    line
  );
}
exports.parseLine = parseLine;
function getLastIndex(lines, startIndex, parentSpaces) {
  if (parentSpaces === void 0) {
    parentSpaces = 0;
  }
  var i = startIndex;
  while (i < lines.length) {
    var current = lines[i];
    var next = lines[i + 1];
    if (i + 1 === lines.length || next.spaces <= parentSpaces) {
      return i;
    } else if (next.spaces > current.spaces) {
      var lastIndex = getLastIndex(lines, i + 1, current.spaces);
      lines[i].endIndex = lastIndex;
      if (
        lines[lastIndex + 1] &&
        lines[lastIndex + 1].spaces === current.spaces
      ) {
        i = lastIndex + 1;
      } else {
        return lastIndex;
      }
    } else {
      i = i + 1;
    }
  }
  return lines.length;
}
exports.getLastIndex = getLastIndex;
function getBlocks(fileText) {
  var blocks = fileText.split("\n").map(parseLine);
  // .filter((block) => block.tags.hashtag && block.tags.hashtag.length > 0);
  // const lineBlocks = blocks.filter((block) => block.type === "LIST");
  // console.log(JSON.stringify(blocks));
  blocks[0].endIndex = getLastIndex(blocks, 0);
  return blocks;
}
exports.getBlocks = getBlocks;
function getBlocksForTag(lines, blocks, includeTag) {
  return blocks
    .filter(function (block) {
      return (
        block.tags.hashtag &&
        block.tags.hashtag.length > 0 &&
        block.tags.hashtag.includes(includeTag)
      );
    })
    .map(function (_a) {
      var startIndex = _a.startIndex,
        endIndex = _a.endIndex;
      return lines.slice(startIndex, endIndex + 1).join("\n");
    });
}
exports.getBlocksForTag = getBlocksForTag;
function mergeText(source, texts, positions) {
  if (texts.length !== positions.length && texts.length === 0) {
    throw new Error(
      "Wrong set of input for merging text, all should be of same size and greater than zero"
    );
  }
  return __spreadArray(
    [[0, positions[0] + 1]],
    __read(
      positions.map(function (start, index, arr) {
        return index + 1 === arr.length
          ? [start + 1, source.length]
          : [start + 1, arr[index + 1] + 1];
      })
    )
  )
    .map(function (_a) {
      var _b = __read(_a, 2),
        start = _b[0],
        end = _b[1];
      return source.slice(start, end).join("\n");
    })
    .map(function (sourceChunk, index, arr) {
      return (
        sourceChunk + "\n" + (index + 1 === arr.length ? "" : texts[index])
      );
    })
    .join("\n---\n");
}
exports.mergeText = mergeText;
function getUpdatedText(sourceFile, targetFile) {
  var blocks = sourceFile.split("\n").map(parseLine);
  var blocks2 = targetFile.split("\n").map(parseLine);
  var temp = blocks.filter(function (block) {
    return block.tags.includeTag && block.tags.includeTag.length > 0;
  });
  var positions = temp.map(function (_a) {
    var startIndex = _a.startIndex;
    return startIndex;
  });
  var texts = temp.map(function (block) {
    return getBlocksForTag(
      targetFile.split("\n"),
      blocks2,
      block.tags.includeTag[0]
    ).join("\n");
  });
  return mergeText(sourceFile.split("\n"), texts, positions);
}
exports.getUpdatedText = getUpdatedText;
function getTargetBlocksType(text) {
  var targetParser = new nearley_1.default.Parser(
    nearley_1.default.Grammar.fromCompiled(target_1.default)
  );
  targetParser.feed(text);
  return targetParser.results[0];
}
exports.getTargetBlocksType = getTargetBlocksType;
function getTargetBlocks(texts) {
  var types = texts.map(function (text, index) {
    return __assign(__assign({}, getTargetBlocksType(text)), { index: index });
  });
  var pairs = [];
  var currentStart = undefined;
  for (var i = 0; i < types.length; i++) {
    if (types[i].type === "start") {
      currentStart = types[i];
    } else if (types[i].type === "end") {
      if (currentStart) {
        pairs.push([currentStart, types[i]]);
        currentStart = undefined;
      }
    }
  }
  // pairs.map(([start, end])=> );
  return pairs;
}
exports.getTargetBlocks = getTargetBlocks;
