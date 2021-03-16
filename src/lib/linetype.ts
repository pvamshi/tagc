// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "MAIN", "symbols": ["LIST"], "postprocess": d =>d[0]},
    {"name": "MAIN", "symbols": ["PARAGRAPH"], "postprocess": d =>d[0]},
    {"name": "PARAGRAPH$ebnf$1", "symbols": []},
    {"name": "PARAGRAPH$ebnf$1", "symbols": ["PARAGRAPH$ebnf$1", /[\S ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "PARAGRAPH", "symbols": ["PARAGRAPH$ebnf$1"], "postprocess": (d,l,r)=>{
        	const text = d[0].join('').trim();
        	
        	if(text.startsWith('- ') ){return r}
        	return {type:"text" };
        } },
    {"name": "LIST$ebnf$1", "symbols": []},
    {"name": "LIST$ebnf$1", "symbols": ["LIST$ebnf$1", "_"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LIST$string$1", "symbols": [{"literal":" "}, {"literal":"["}, {"literal":" "}, {"literal":"]"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "LIST$ebnf$2", "symbols": []},
    {"name": "LIST$ebnf$2", "symbols": ["LIST$ebnf$2", /[\S ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LIST", "symbols": ["LIST$ebnf$1", /[-*]/, "LIST$string$1", "_", "LIST$ebnf$2"], "postprocess": d => ({type: 'List', task:true, done: false,spaces: d[0].length})},
    {"name": "LIST$ebnf$3", "symbols": []},
    {"name": "LIST$ebnf$3", "symbols": ["LIST$ebnf$3", "_"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LIST$string$2", "symbols": [{"literal":" "}, {"literal":"["}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "LIST$ebnf$4", "symbols": []},
    {"name": "LIST$ebnf$4", "symbols": ["LIST$ebnf$4", /[\S ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LIST", "symbols": ["LIST$ebnf$3", /[-*]/, "LIST$string$2", /[xX]/, {"literal":"]"}, "_", "LIST$ebnf$4"], "postprocess": d => ({type: 'List', task:true, done: true,spaces: d[0].length})},
    {"name": "LIST$ebnf$5", "symbols": []},
    {"name": "LIST$ebnf$5", "symbols": ["LIST$ebnf$5", "_"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LIST$ebnf$6", "symbols": []},
    {"name": "LIST$ebnf$6", "symbols": ["LIST$ebnf$6", /[\S ]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "LIST", "symbols": ["LIST$ebnf$5", /[-*]/, "_", "LIST$ebnf$6"], "postprocess":  (d,l,r) => {
        	const text = (d[3]||[]).join('').toLowerCase();						
        if(text.startsWith('[ ]') || text.startsWith('[x]')){
        							return r;
        						 }						
        return {type: 'List', task:false, done: true,spaces: d[0].length};
        					} },
    {"name": "_", "symbols": [{"literal":" "}], "postprocess": d => ({type:"space"})}
]
  , ParserStart: "MAIN"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
