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
        { "name": "Main", "symbols": ["StartLine"], "postprocess": function (d) { return d[0]; } },
        { "name": "Main", "symbols": ["EndLine"], "postprocess": function (d) { return d[0]; } },
        { "name": "StartLine", "symbols": ["StartTag"], "postprocess": function (d) { return ({ type: "start", value: d[0] }); } },
        { "name": "EndLine", "symbols": ["AnyText", "EndTag"], "postprocess": function (d) { return ({ type: "end", value: { text: d[0], id: d[1] } }); } },
        { "name": "StartTag$string$1", "symbols": [{ "literal": "]" }, { "literal": "(" }], "postprocess": function (d) { return d.join(''); } },
        { "name": "StartTag", "symbols": [{ "literal": "[" }, "path", "StartTag$string$1", "path", { "literal": ")" }], "postprocess": function (d) { return ({ name: d[1], path: d[3] }); } },
        { "name": "path$ebnf$1", "symbols": [] },
        { "name": "path$ebnf$1", "symbols": ["path$ebnf$1", /[\w-_.#/]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "path", "symbols": ["path$ebnf$1"], "postprocess": function (d) { return d[0].join(''); } },
        { "name": "EndTag$string$1", "symbols": [{ "literal": ":" }, { "literal": ":" }], "postprocess": function (d) { return d.join(''); } },
        { "name": "EndTag$ebnf$1", "symbols": [] },
        { "name": "EndTag$ebnf$1", "symbols": ["EndTag$ebnf$1", /[\w0-9]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "EndTag$string$2", "symbols": [{ "literal": ":" }, { "literal": ":" }], "postprocess": function (d) { return d.join(''); } },
        { "name": "EndTag", "symbols": ["EndTag$string$1", "EndTag$ebnf$1", "EndTag$string$2"], "postprocess": function (d) { return d[1].join(''); } },
        { "name": "AnyText$ebnf$1", "symbols": [] },
        { "name": "AnyText$ebnf$1", "symbols": ["AnyText$ebnf$1", /[\s\S]/], "postprocess": function (d) { return d[0].concat([d[1]]); } },
        { "name": "AnyText", "symbols": ["AnyText$ebnf$1"], "postprocess": function (d) { return d[0].join(''); } }
    ],
    ParserStart: "Main",
};
exports.default = grammar;
