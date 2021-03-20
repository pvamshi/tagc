@preprocessor typescript

Hashtag -> [\s\S]:* Tag  [\S]:+ Tail {% d=>({ type: d[1],value: d[2].join('') }) %}
Tag -> "#" {% d=> "hashtag" %}
  | "+"  {% d=> "includeTag" %}
  | "-" {% d=> "excludeTag" %}
Tail ->  " " [\s\S]:* | null
