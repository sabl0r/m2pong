(function(i){var e={undHash:/_|-/,colons:/::/,words:/([A-Z]+)([A-Z][a-z])/g,lowUp:/([a-z\d])([A-Z])/g,dash:/([a-z\d])([A-Z])/g,replacer:/\{([^\}]+)\}/g,dot:/\./},l=function(a,b,c){return a[b]!==undefined?a[b]:c&&(a[b]={})},j=function(a){var b=typeof a;return a&&(b=="function"||b=="object")},m,k=i.String=i.extend(i.String||{},{getObject:m=function(a,b,c){a=a?a.split(e.dot):[];var f=a.length,d,h,g,n=0;b=i.isArray(b)?b:[b||window];if(f==0)return b[0];for(;d=b[n++];){for(g=0;g<f-1&&j(d);g++)d=l(d,a[g],
c);if(j(d)){h=l(d,a[g],c);if(h!==undefined){c===false&&delete d[a[g]];return h}}}},capitalize:function(a){return a.charAt(0).toUpperCase()+a.substr(1)},camelize:function(a){a=k.classize(a);return a.charAt(0).toLowerCase()+a.substr(1)},classize:function(a,b){a=a.split(e.undHash);for(var c=0;c<a.length;c++)a[c]=k.capitalize(a[c]);return a.join(b||"")},niceName:function(a){return k.classize(a," ")},underscore:function(a){return a.replace(e.colons,"/").replace(e.words,"$1_$2").replace(e.lowUp,"$1_$2").replace(e.dash,
"_").toLowerCase()},sub:function(a,b,c){var f=[];c=typeof c=="boolean"?!c:c;f.push(a.replace(e.replacer,function(d,h){d=m(h,b,c);if(j(d)){f.push(d);return""}else return""+d}));return f.length<=1?f[0]:f},_regs:e})})(jQuery);