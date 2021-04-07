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
    {"name": "Hashtag$ebnf$1", "symbols": []},
    {"name": "Hashtag$ebnf$1", "symbols": ["Hashtag$ebnf$1", /[\s\S]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "Hashtag$ebnf$2", "symbols": [/[\S]/]},
    {"name": "Hashtag$ebnf$2", "symbols": ["Hashtag$ebnf$2", /[\S]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "Hashtag", "symbols": ["Hashtag$ebnf$1", "Tag", "Hashtag$ebnf$2", "Tail"], "postprocess": d=>({ type: d[1],value: d[2].join('') })},
    {"name": "Tag", "symbols": [{"literal":"#"}], "postprocess": d=> "hashtag"},
    {"name": "Tag", "symbols": [{"literal":"+"}], "postprocess": d=> "includeTag"},
    {"name": "Tag", "symbols": [{"literal":"-"}], "postprocess": d=> "excludeTag"},
    {"name": "Tail$ebnf$1", "symbols": []},
    {"name": "Tail$ebnf$1", "symbols": ["Tail$ebnf$1", /[\s\S]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "Tail", "symbols": [{"literal":" "}, "Tail$ebnf$1"]},
    {"name": "Tail", "symbols": []}
  ],
  ParserStart: "Hashtag",
};

export default grammar;
