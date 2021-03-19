@preprocessor typescript


Main -> StartLine {% d=>d[0] %}| EndLine {% d=>d[0] %}
StartLine-> AnyText  StartTag {% d=>({ type:"start" , value:d[1]}) %}
EndLine -> AnyText EndTag {% d=>({ type:"end" , value:{text : d[0], id: d[1]}}) %}
StartTag -> "[" path "](" path ")"  {% d=>({name: d[1], path:d[3]}) %}
path -> [\w-_.#/]:*  {% d=>d[0].join('') %}
EndTag -> "::" [\w0-9_-]:* "::"  {% d => d[1].join('') %}
AnyText -> [\s\S]:* {% d=>d[0].join('')%}

