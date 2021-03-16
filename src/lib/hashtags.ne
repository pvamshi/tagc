@preprocessor typescript

Hashtag -> ([\S]:* " ":+):*   "#" [\S]:+ (" ":+ [\S]:*):* {%d => ({ type: "hashtag" , value: d[2].join('')}) %}
      | ([\S]:* " ":+):*   "+" [\S]:+ (" ":+ [\S]:*):* {%d => ({ type: "includeTag" , value: d[2].join('')}) %}
	  | ([\S]:* " ":+):*   "-" [\S]:+ (" ":+ [\S]:*):* {%d => ({ type: "excludeTag" , value: d[2].join('')}) %}
