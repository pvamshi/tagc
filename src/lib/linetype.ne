
@preprocessor typescript

MAIN -> LIST {% d =>d[0] %} | PARAGRAPH {% d =>d[0] %}
PARAGRAPH -> [\S ]:* {%(d,l,r)=>{
	const text = d[0].join('').trim();
	
	if(text.startsWith('- ') ){return r}
	return {type:"TEXT" };
} %}

 #LIST -> _:* LIST_TOKEN _ [\S ]:* {% d => ({...d[1], spaces: d[0].length})%}

LIST -> _:* [-*] " [ ]" _ [\S ]:* {% d => ({type: 'LIST', task:true, done: false,spaces: d[0].length>0 ? d[0].length * d[0][0].size: 0}) %} 
      |  _:* [-*] " [" [xX]  "]" _ [\S ]:* {% d => ({type: 'LIST', task:true, done: true,spaces:  d[0].length>0 ? d[0].length * d[0][0].size: 0 }) %}
	  |  _:* [-*] _ [\S ]:*  {% (d,l,r) => {
	const text = (d[3]||[]).join('').toLowerCase();						
if(text.startsWith('[ ]') || text.startsWith('[x]')){
							return r;
						 }						
return {type: 'LIST', task:false, done: true,spaces:  d[0].length>0 ? d[0].length * d[0][0].size: 0 };
					} %}
	  
	  

_ -> " " {% d => ({type:"space", size:1}) %}
  | "\t" {% d => ({type:"space", size:2}) %}