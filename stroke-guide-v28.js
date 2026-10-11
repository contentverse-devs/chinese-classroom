(()=>{'use strict';
const SAMPLE={
'你':['M110 72 Q82 140 44 180','M94 139 L94 300','M212 62 Q190 119 153 151','M205 104 L293 104 Q301 104 291 125 L278 151','M241 161 L241 272 Q241 300 214 292','M194 216 Q176 247 156 267','M283 219 Q303 241 317 264'],
'不':['M69 88 L292 88','M212 92 Q186 151 115 215 Q88 237 61 250','M197 149 L197 304','M216 188 Q269 220 311 271'],
'好':['M90 69 L69 203 Q68 212 90 213 L156 219','M142 100 Q135 216 65 286','M55 156 Q98 185 155 268','M206 88 L290 88 L254 140 L254 294 Q250 310 224 297','M190 175 L318 175','M253 178 L253 296'],
'一':['M69 180 L291 180'],
'二':['M92 126 L267 126','M64 250 L300 250'],
'三':['M94 92 L266 92','M111 177 L250 177','M67 272 L301 272'],
'人':['M174 74 Q176 190 65 288','M179 141 Q209 244 298 286'],
'大':['M76 158 L285 158','M182 72 Q185 224 66 294','M190 170 Q223 254 307 291'],
'十':['M72 146 L289 146','M183 66 L183 305'],
'口':['M100 95 L100 283','M100 103 L270 103 L270 283','M100 282 L270 282'],
'中':['M97 112 L97 245','M97 113 L271 113 L271 245','M97 244 L271 244','M183 66 L183 301'],
'小':['M184 80 L184 282 Q181 309 151 289','M114 167 Q93 231 61 258','M251 169 Q278 210 303 259'],
'上':['M175 65 L175 281','M176 167 L264 167','M62 281 L300 281'],
'下':['M67 91 L297 91','M183 91 L183 302','M193 157 Q240 182 267 210']
};
const $=id=>document.getElementById(id),g=$('strokePaths'),status=$('strokeAvailability'),count=$('strokeCount');
if(!g)return;
const NS='http://www.w3.org/2000/svg';
let char='你',index=0,playing=false,runId=0,entry=null;
const cache=new Map();
function stop(){playing=false;runId++;$('strokePlay').textContent='▶ Phát hoạt ảnh'}
function svgEl(name,attrs,parent){const el=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));(parent||g).append(el);return el}
function draw(){g.replaceChildren();if(!entry)return;for(let j=index;j<entry.paths.length;j++){if(entry.source==='official'&&entry.strokes?.[j])svgEl('path',{d:entry.strokes[j],fill:'#e2e8f0',transform:'translate(0 360) scale(0.3515625 -0.3515625)'},g);else svgEl('path',{d:entry.paths[j],stroke:'#e2e8f0','stroke-width':12,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'},g)}for(let i=0;i<index;i++){const official=entry.source==='official'&&entry.strokes?.[i];const group=svgEl('g',{},g);if(official){svgEl('path',{d:official,fill:i===index-1?'#1767c1':'#9bb0ca',transform:'translate(0 360) scale(0.3515625 -0.3515625)'},group)}else{svgEl('path',{d:entry.paths[i],stroke:i===index-1?'#1767c1':'#9bb0ca','stroke-width':12,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'},group)}}}
function refresh(){const ps=entry?.paths;count.textContent=ps?`${index}/${ps.length} nét`:'Chưa có dữ liệu';$('strokeCharacter').textContent=char;status.textContent=entry?(entry.source==='official'?'Dữ liệu nét chữ Hán · Hanzi Writer':'Bản nét minh họa · Chưa đối chiếu dữ liệu chuẩn'):'Chưa có dữ liệu nét. Bạn vẫn có thể tập tô bên dưới.';for(const id of ['strokePlay','strokePrev','strokeNext','strokeReplay'])$(id).disabled=!ps;$('strokePrev').disabled=!ps||index===0;$('strokeNext').disabled=!ps||index===ps.length}
function converted(medians){return medians.map(points=>'M'+points.map(([x,y])=>`${(x*360/1024).toFixed(1)} ${(360-y*360/1024).toFixed(1)}`).join(' L'))}
async function load(c,signal){if(cache.has(c))return cache.get(c);const saved=window.ccOfflineStrokes?.get(c);if(saved){const item={paths:converted(saved.medians),strokes:saved.strokes,source:'official'};cache.set(c,item);return item}try{const url='https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/'+encodeURIComponent(c)+'.json';const response=await fetch(url,{signal,mode:'cors'});if(!response.ok)throw Error('HTTP '+response.status);const obj=await response.json();if(!Array.isArray(obj.medians)||!obj.medians.length||!Array.isArray(obj.strokes)||obj.strokes.length!==obj.medians.length)throw Error('Invalid stroke data');const item={paths:converted(obj.medians),strokes:obj.strokes,source:'official'};cache.set(c,item);window.ccOfflineStrokes?.save(c,obj);return item}catch(e){if(signal.aborted)return null;return SAMPLE[c]?{paths:SAMPLE[c],source:'sample'}:null}}
let controller=null;
async function select(c){stop();if(controller)controller.abort();controller=new AbortController();const own=controller;char=c;index=0;entry=null;g.replaceChildren();status.textContent=`Đang tải dữ liệu nét cho chữ ${c}…`;count.textContent='';for(const id of ['strokePlay','strokePrev','strokeNext','strokeReplay'])$(id).disabled=true;const item=await load(c,own.signal);if(own.signal.aborted)return;entry=item;draw();refresh();document.dispatchEvent(new CustomEvent('cc-stroke-data',{detail:{char,entry}}))}
function next(){if(!entry||index>=entry.paths.length)return;index++;draw();refresh()}
$('strokeNext').onclick=()=>{stop();next()};$('strokePrev').onclick=()=>{stop();index=Math.max(0,index-1);draw();refresh()};$('strokeReplay').onclick=()=>{stop();index=0;draw();refresh()};
$('strokePlay').onclick=async()=>{if(playing){stop();return}if(!entry)return;if(index===entry.paths.length){index=0;draw()}playing=true;const own=++runId;$('strokePlay').textContent='⏸ Tạm dừng';while(playing&&own===runId&&index<entry.paths.length){const i=index;const official=entry.source==='official'&&entry.strokes?.[i];let animated;if(official){const defs=svgEl('defs',{},g);const mask=svgEl('mask',{id:'stroke-reveal-mask',maskUnits:'userSpaceOnUse',x:0,y:0,width:360,height:360},defs);const median=svgEl('path',{d:entry.paths[i],stroke:'#fff','stroke-width':32,'stroke-linecap':'round','stroke-linejoin':'round',fill:'none'},mask);const len=median.getTotalLength();median.style.strokeDasharray=String(len);median.style.strokeDashoffset=String(len);const shape=svgEl('path',{d:official,fill:'#1767c1',transform:'translate(0 360) scale(0.3515625 -0.3515625)',mask:'url(#stroke-reveal-mask)'},g);animated=median.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:850,fill:'forwards',easing:'ease-in-out'})}else{const p=svgEl('path',{d:entry.paths[i],stroke:'#1767c1','stroke-width':12,'stroke-linecap':'round',fill:'none'},g);const len=p.getTotalLength();p.style.strokeDasharray=String(len);p.style.strokeDashoffset=String(len);animated=p.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:850,fill:'forwards',easing:'ease-in-out'})}try{await animated.finished}catch{}if(own!==runId)return;index++;draw();refresh();await new Promise(resolve=>setTimeout(resolve,180))}if(own===runId)stop()};
window.ccStrokeGuide={select,getEntry:()=>entry,getChar:()=>char};document.dispatchEvent(new CustomEvent('cc-stroke-data',{detail:{char,entry}}));select('你');
})();