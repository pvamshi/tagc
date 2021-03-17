
@preprocessor typescript

MAIN -> LIST {% d =>d[0] %} | PARAGRAPH {% d =>d[0] %}
PARAGRAPH -> [\S ]:* {%(d,l,r)=>{
	const text = d[0].join('').trim();
	
	if(text.startsWith('- ') ){return r}
	return {type:"TEXT" };
} %}

 #LIST -> _:* LIST_TOKEN _ [\S ]:* {% d => ({...d[1], spaces: d[0].length})%}

LIST -> _:* [-*] " [ ]" _ [\S ]:* {% d => ({type: 'LIST', task:true, done: false,spaces: d[0].length}) %} 
      |  _:* [-*] " [" [xX]  "]" _ [\S ]:* {% d => ({type: 'LIST', task:true, done: true,spaces: d[0].length}) %}
	  |  _:* [-*] _ [\S ]:*  {% (d,l,r) => {
	const text = (d[3]||[]).join('').toLowerCase();						
if(text.startsWith('[ ]') || text.startsWith('[x]')){
							return r;
						 }						
return {type: 'LIST', task:false, done: true,spaces: d[0].length};
					} %}
	  
	  

_ -> " " {% d => ({type:"space"}) %}

