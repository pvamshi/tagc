@preprocessor typescript

Hashtag -> [\s\S]:* " " Tag  [\S]:+ Tail {% d=>({ type: d[2],value: d[3].join('') }) %}
Tag -> "#" {% d=> "hashtag" %}
  | "+"  {% d=> "includeTag" %}
  | "-" {% d=> "excludeTag" %}
Tail ->  " " [\s\S]:* | null
