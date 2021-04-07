// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: undefined,
  ParserRules: [
    {"name": "Main", "symbols": ["Both"], "postprocess": d=>d[0]},
    {"name": "Main", "symbols": ["StartLine"], "postprocess": d=>d[0]},
    {"name": "Main", "symbols": ["EndLine"], "postprocess": d=>d[0]},
    {"name": "Both$string$1", "symbols": [{"literal":" "}, {"literal":"="}, {"literal":"="}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "Both", "symbols": ["AnyText", "StartTag", {"literal":" "}, "EndTag", "Both$string$1"], "postprocess": d=>({type:"single", value:{...d[1],...d[3]}})},
    {"name": "StartLine$string$1", "symbols": [{"literal":" "}, {"literal":"-"}, {"literal":"-"}, {"literal":"-"}], "postprocess": (d) => d.join('')},
    {"name": "StartLine", "symbols": ["AnyText", "StartTag", "StartLine$string$1"], "postprocess": d=>({ type:"start" , value:d[1]})},
    {"name": "StartTag$string$1", "symbols": [{"literal":"]"}, {"literal":"("}], "postprocess": (d) => d.join('')},
    {"name": "StartTag", "symbols": [{"literal":"["}, "path", "StartTag$string$1", "path", {"literal":")"}], "postprocess": d=>({name: d[1], path:d[3]})},
    {"name": "path$ebnf$1", "symbols": []},
    {"name": "path$ebnf$1", "symbols": ["path$ebnf$1", /[\w-_.#/]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "path", "symbols": ["path$ebnf$1"], "postprocess": d=>d[0].join('')},
    {"name": "EndLine$string$1", "symbols": [{"literal":" "}, {"literal":"-"}, {"literal":"-"}, {"literal":"-"}], "postprocess": (d) => d.join('')},
    {"name": "EndLine", "symbols": ["AnyText", "EndTag", "EndLine$string$1"], "postprocess": d=>({ type:"end" , value: d[1]})},
    {"name": "EndTag$string$1", "symbols": [{"literal":":"}, {"literal":":"}], "postprocess": (d) => d.join('')},
    {"name": "EndTag$ebnf$1", "symbols": []},
    {"name": "EndTag$ebnf$1", "symbols": ["EndTag$ebnf$1", /[\w0-9_-]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "EndTag$string$2", "symbols": [{"literal":":"}, {"literal":":"}], "postprocess": (d) => d.join('')},
    {"name": "EndTag", "symbols": ["EndTag$string$1", "EndTag$ebnf$1", "EndTag$string$2"], "postprocess": d => ({ id: d[1].join('')})},
    {"name": "AnyText$ebnf$1", "symbols": []},
    {"name": "AnyText$ebnf$1", "symbols": ["AnyText$ebnf$1", /[\s\S]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "AnyText", "symbols": ["AnyText$ebnf$1"], "postprocess": d=>d[0].join('')}
  ],
  ParserStart: "Main",
};

export default grammar;
