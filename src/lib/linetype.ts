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
    {"name": "MAIN", "symbols": ["LIST"], "postprocess": d =>d[0]},
    {"name": "MAIN", "symbols": ["PARAGRAPH"], "postprocess": d =>d[0]},
    {"name": "PARAGRAPH$ebnf$1", "symbols": []},
    {"name": "PARAGRAPH$ebnf$1", "symbols": ["PARAGRAPH$ebnf$1", /[\S ]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "PARAGRAPH", "symbols": ["PARAGRAPH$ebnf$1"], "postprocess": (d,l,r)=>{
        	const text = d[0].join('').trim();
        	
        	if(text.startsWith('- ') ){return r}
        	return {type:"TEXT" };
        } },
    {"name": "LIST$ebnf$1", "symbols": []},
    {"name": "LIST$ebnf$1", "symbols": ["LIST$ebnf$1", "_"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "LIST$string$1", "symbols": [{"literal":" "}, {"literal":"["}, {"literal":" "}, {"literal":"]"}], "postprocess": (d) => d.join('')},
    {"name": "LIST$ebnf$2", "symbols": []},
    {"name": "LIST$ebnf$2", "symbols": ["LIST$ebnf$2", /[\S ]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "LIST", "symbols": ["LIST$ebnf$1", /[-*]/, "LIST$string$1", "_", "LIST$ebnf$2"], "postprocess": d => ({type: 'LIST', task:true, done: false,spaces: d[0].length})},
    {"name": "LIST$ebnf$3", "symbols": []},
    {"name": "LIST$ebnf$3", "symbols": ["LIST$ebnf$3", "_"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "LIST$string$2", "symbols": [{"literal":" "}, {"literal":"["}], "postprocess": (d) => d.join('')},
    {"name": "LIST$ebnf$4", "symbols": []},
    {"name": "LIST$ebnf$4", "symbols": ["LIST$ebnf$4", /[\S ]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "LIST", "symbols": ["LIST$ebnf$3", /[-*]/, "LIST$string$2", /[xX]/, {"literal":"]"}, "_", "LIST$ebnf$4"], "postprocess": d => ({type: 'LIST', task:true, done: true,spaces: d[0].length})},
    {"name": "LIST$ebnf$5", "symbols": []},
    {"name": "LIST$ebnf$5", "symbols": ["LIST$ebnf$5", "_"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "LIST$ebnf$6", "symbols": []},
    {"name": "LIST$ebnf$6", "symbols": ["LIST$ebnf$6", /[\S ]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "LIST", "symbols": ["LIST$ebnf$5", /[-*]/, "_", "LIST$ebnf$6"], "postprocess":  (d,l,r) => {
        	const text = (d[3]||[]).join('').toLowerCase();						
        if(text.startsWith('[ ]') || text.startsWith('[x]')){
        							return r;
        						 }						
        return {type: 'LIST', task:false, done: true,spaces: d[0].length};
        					} },
    {"name": "_", "symbols": [{"literal":" "}], "postprocess": d => ({type:"space"})}
  ],
  ParserStart: "MAIN",
};

export default grammar;
