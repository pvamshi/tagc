"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d) { return d[0]; }
;
;
;
;
var grammar = {
    Lexer: undefined,
    ParserRules: [
        { "name": "Hashtag$ebnf$1", "symbols": [] },
        { "name": "Hashtag$ebnf$1$subexpression$1$ebnf$1", "symbols": [] },
        { "name": "Hashtag$ebnf$1$subexpression$1$ebnf$1", "symbols": ["Hashtag$ebnf$1$subexpression$1$ebnf$1", /[\S]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$1$subexpression$1$ebnf$2", "symbols": [{ "literal": " " }] },
        { "name": "Hashtag$ebnf$1$subexpression$1$ebnf$2", "symbols": ["Hashtag$ebnf$1$subexpression$1$ebnf$2", { "literal": " " }], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$1$subexpression$1", "symbols": ["Hashtag$ebnf$1$subexpression$1$ebnf$1", "Hashtag$ebnf$1$subexpression$1$ebnf$2"] },
        { "name": "Hashtag$ebnf$1", "symbols": ["Hashtag$ebnf$1", "Hashtag$ebnf$1$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$2", "symbols": [/[\S]/] },
        { "name": "Hashtag$ebnf$2", "symbols": ["Hashtag$ebnf$2", /[\S]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$3", "symbols": [] },
        { "name": "Hashtag$ebnf$3$subexpression$1$ebnf$1", "symbols": [{ "literal": " " }] },
        { "name": "Hashtag$ebnf$3$subexpression$1$ebnf$1", "symbols": ["Hashtag$ebnf$3$subexpression$1$ebnf$1", { "literal": " " }], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$3$subexpression$1$ebnf$2", "symbols": [] },
        { "name": "Hashtag$ebnf$3$subexpression$1$ebnf$2", "symbols": ["Hashtag$ebnf$3$subexpression$1$ebnf$2", /[\S]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$3$subexpression$1", "symbols": ["Hashtag$ebnf$3$subexpression$1$ebnf$1", "Hashtag$ebnf$3$subexpression$1$ebnf$2"] },
        { "name": "Hashtag$ebnf$3", "symbols": ["Hashtag$ebnf$3", "Hashtag$ebnf$3$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag", "symbols": ["Hashtag$ebnf$1", { "literal": "#" }, "Hashtag$ebnf$2", "Hashtag$ebnf$3"], "postprocess": function (d) { return ({ type: "hashtag", value: d[2].join('') }); } },
        { "name": "Hashtag$ebnf$4", "symbols": [] },
        { "name": "Hashtag$ebnf$4$subexpression$1$ebnf$1", "symbols": [] },
        { "name": "Hashtag$ebnf$4$subexpression$1$ebnf$1", "symbols": ["Hashtag$ebnf$4$subexpression$1$ebnf$1", /[\S]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$4$subexpression$1$ebnf$2", "symbols": [{ "literal": " " }] },
        { "name": "Hashtag$ebnf$4$subexpression$1$ebnf$2", "symbols": ["Hashtag$ebnf$4$subexpression$1$ebnf$2", { "literal": " " }], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$4$subexpression$1", "symbols": ["Hashtag$ebnf$4$subexpression$1$ebnf$1", "Hashtag$ebnf$4$subexpression$1$ebnf$2"] },
        { "name": "Hashtag$ebnf$4", "symbols": ["Hashtag$ebnf$4", "Hashtag$ebnf$4$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$5", "symbols": [/[\S]/] },
        { "name": "Hashtag$ebnf$5", "symbols": ["Hashtag$ebnf$5", /[\S]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$6", "symbols": [] },
        { "name": "Hashtag$ebnf$6$subexpression$1$ebnf$1", "symbols": [{ "literal": " " }] },
        { "name": "Hashtag$ebnf$6$subexpression$1$ebnf$1", "symbols": ["Hashtag$ebnf$6$subexpression$1$ebnf$1", { "literal": " " }], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$6$subexpression$1$ebnf$2", "symbols": [] },
        { "name": "Hashtag$ebnf$6$subexpression$1$ebnf$2", "symbols": ["Hashtag$ebnf$6$subexpression$1$ebnf$2", /[\S]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$6$subexpression$1", "symbols": ["Hashtag$ebnf$6$subexpression$1$ebnf$1", "Hashtag$ebnf$6$subexpression$1$ebnf$2"] },
        { "name": "Hashtag$ebnf$6", "symbols": ["Hashtag$ebnf$6", "Hashtag$ebnf$6$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag", "symbols": ["Hashtag$ebnf$4", { "literal": "+" }, "Hashtag$ebnf$5", "Hashtag$ebnf$6"], "postprocess": function (d) { return ({ type: "includeTag", value: d[2].join('') }); } },
        { "name": "Hashtag$ebnf$7", "symbols": [] },
        { "name": "Hashtag$ebnf$7$subexpression$1$ebnf$1", "symbols": [] },
        { "name": "Hashtag$ebnf$7$subexpression$1$ebnf$1", "symbols": ["Hashtag$ebnf$7$subexpression$1$ebnf$1", /[\S]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$7$subexpression$1$ebnf$2", "symbols": [{ "literal": " " }] },
        { "name": "Hashtag$ebnf$7$subexpression$1$ebnf$2", "symbols": ["Hashtag$ebnf$7$subexpression$1$ebnf$2", { "literal": " " }], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$7$subexpression$1", "symbols": ["Hashtag$ebnf$7$subexpression$1$ebnf$1", "Hashtag$ebnf$7$subexpression$1$ebnf$2"] },
        { "name": "Hashtag$ebnf$7", "symbols": ["Hashtag$ebnf$7", "Hashtag$ebnf$7$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$8", "symbols": [/[\S]/] },
        { "name": "Hashtag$ebnf$8", "symbols": ["Hashtag$ebnf$8", /[\S]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$9", "symbols": [] },
        { "name": "Hashtag$ebnf$9$subexpression$1$ebnf$1", "symbols": [{ "literal": " " }] },
        { "name": "Hashtag$ebnf$9$subexpression$1$ebnf$1", "symbols": ["Hashtag$ebnf$9$subexpression$1$ebnf$1", { "literal": " " }], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$9$subexpression$1$ebnf$2", "symbols": [] },
        { "name": "Hashtag$ebnf$9$subexpression$1$ebnf$2", "symbols": ["Hashtag$ebnf$9$subexpression$1$ebnf$2", /[\S]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag$ebnf$9$subexpression$1", "symbols": ["Hashtag$ebnf$9$subexpression$1$ebnf$1", "Hashtag$ebnf$9$subexpression$1$ebnf$2"] },
        { "name": "Hashtag$ebnf$9", "symbols": ["Hashtag$ebnf$9", "Hashtag$ebnf$9$subexpression$1"], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "Hashtag", "symbols": ["Hashtag$ebnf$7", { "literal": "-" }, "Hashtag$ebnf$8", "Hashtag$ebnf$9"], "postprocess": function (d) { return ({ type: "excludeTag", value: d[2].join('') }); } }
    ],
    ParserStart: "Hashtag",
};
exports.default = grammar;
