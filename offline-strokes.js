(()=>{'use strict';
const KEY='cc_strokes_v29';let cache={};try{cache=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
const valid=o=>o&&Array.isArray(o.strokes)&&Array.isArray(o.medians)&&o.strokes.length>0&&o.strokes.length===o.medians.length;
const get=c=>{const embedded=window.CC_STROKES_DATA?.[c];return valid(embedded)?embedded:(valid(cache[c])?cache[c]:null)};
const save=(c,data)=>{if(!valid(data))return false;cache[c]={strokes:data.strokes,medians:data.medians};try{localStorage.setItem(KEY,JSON.stringify(cache));return true}catch{return false}};
window.ccOfflineStrokes={get,save};
})();
