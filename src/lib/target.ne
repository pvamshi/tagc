@preprocessor typescript



Main -> Both {% d=>d[0] %} | StartLine {% d=>d[0] %}| EndLine {% d=>d[0] %}

Both -> AnyText  StartTag " " EndTag " ===" {% d=>({type:"single", value:{...d[1],...d[3]}}) %}

StartLine-> AnyText  StartTag " ---"{% d=>({ type:"start" , value:d[1]}) %}
StartTag -> "[" path "](" path ")"  {% d=>({name: d[1], path:d[3]}) %}
path -> [\w-_.#/]:*  {% d=>d[0].join('') %}


EndLine -> AnyText EndTag " ---" {% d=>({ type:"end" , value: d[1]}) %}
EndTag -> "::" [\w0-9_-]:* "::"  {% d => ({ id: d[1].join('')}) %}

AnyText -> [\s\S]:* {% d=>d[0].join('')%}
