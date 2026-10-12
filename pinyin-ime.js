/* Chinese Classroom: offline Pinyin suggestions, no network or license changes. */
(()=>{'use strict';
const dictionary=new Map();
const norm=s=>String(s||'').toLowerCase().replace(/u:/g,'ü').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ü/g,'v').replace(/[^a-zv\s']/g,' ').replace(/\s+/g,' ').trim();
function add(py,han,priority=false){const k=norm(py),h=String(han||'').trim();if(!k||!h||!/\p{Script=Han}/u.test(h))return;const a=dictionary.get(k)||[];if(!a.includes(h)){priority?a.unshift(h):a.push(h);dictionary.set(k,a)}}
const common={wo:'我',ni:'你',ta:'他',women:'我们',nimen:'你们',shi:'是',bu:'不',mei:'没',you:'有',mai:'买',mai2:'卖',yi:'一',fu:'服',yifu:'衣服',he:'喝',shui:'水',cha:'茶',kafei:'咖啡',xiang:'想',yao:'要',qu:'去',lai:'来',zai:'在',zhe:'这',na:'那',ge:'个','yi ge':'一个','yi bei':'一杯',hen:'很',hao:'好','ni hao':'你好',xiexie:'谢谢','xie xie':'谢谢',zaijian:'再见','zai jian':'再见','jin tian':'今天','ming tian':'明天','zuo tian':'昨天','xian zai':'现在','xue sheng':'学生','lao shi':'老师','tong xue':'同学',jia:'家','ba ba':'爸爸','ma ma':'妈妈','peng you':'朋友','gong zuo':'工作','shang ban':'上班','xue xiao':'学校','yi yuan':'医院','yi fu':'衣服','duo shao':'多少','duo shao qian':'多少钱',qian:'钱',tai:'太',gui:'贵','pian yi':'便宜','he shi':'合适','ke yi':'可以','bu ke yi':'不可以',dui:'对','dui bu qi':'对不起','mei guan xi':'没关系',qing:'请',wen:'问','zhe ge':'这个','na ge':'那个','yi dian':'一点',da:'大',xiao:'小',hong:'红',lan:'蓝',bai:'白',hei:'黑',ling:'零',er:'二',san:'三',si:'四',wu:'五',liu:'六',qi:'七',ba:'八',jiu:'九','shi fen':'十分','yi bai':'一百',ji:'几',ren:'人',chi:'吃',fan:'饭','mi fan':'米饭','mian tiao':'面条',kan:'看',ting:'听',shuo:'说',du:'读',xie:'写','han yu':'汉语','zhong wen':'中文','zhong guo':'中国','yue nan':'越南','ying yu':'英语','ren shi':'认识',jiao:'叫',gaoxing:'高兴','gao xing':'高兴',xihuan:'喜欢','xi huan':'喜欢','bu xiang':'不想','bu shi':'不是',hui:'会','bu hui':'不会',neng:'能','bu neng':'不能','yi jing':'已经','zheng zai':'正在','fei chang':'非常',le:'了',ma:'吗',ne:'呢',de:'的',di:'地',ba:'把',bei:'被',he2:'和',gen:'跟',dou:'都',ye:'也',hai:'还',zai2:'再',jiu:'就',cai:'才','dou shao':'多少',zuo:'做','zhe jian':'这件','ku zi':'裤子','qun zi':'裙子','yan se':'颜色','chi cun':'尺寸','shi yi shi':'试一试'};
for(const [k,v] of Object.entries(common))if(!/\d/.test(k))add(k,v,true);
// Prefer a general-purpose dictionary. Lesson vocabulary may supplement it,
// but never index complete exercise sentences or dialogues as candidate answers.
const homophones={
 shi:['是','十','时','事','试','市','师','室','使','世','式','石','食','识'],
 mai:['买','卖','麦','迈','脉','埋'],wo:['我','握','窝'],ni:['你','呢','泥'],
 yi:['一','衣','医','依','意','以','已','易','义','艺','亿','椅'],
 fu:['服','福','付','父','夫','复','副','富','府','扶'],
 he:['喝','和','河','合','何','盒','贺'],
 shui:['水','谁','睡','税'],xiang:['想','向','像','象','香','乡','相'],
 yao:['要','药','摇','咬','腰','遥'],zai:['在','再','载','灾'],
 zhe:['这','着','者','折'],na:['那','哪','拿','纳'],
 ge:['个','各','歌','哥','格','隔'],hao:['好','号','毫','豪'],
 kan:['看','刊','砍'],xie:['写','谢','鞋','些','血'],
 yi_fu:['衣服','依附'],
};

for(const [py,values] of Object.entries(homophones))for(const h of values)add(py.replace(/_/g,' '),h);
for(const l of window.CC_LESSONS||[]){
 for(const w of [...(l.focusWords||[]),...(l.vocabulary||[])])add(w.pinyin,w.han);
 for(const s of [...(l.steps||[]),...(l.items||[])])if(!Array.isArray(s))for(const t of s.tokens||[])add(t.pinyin,t.han);
 for(const line of l.dialogue||[])for(const t of line.tokens||[])add(t.pinyin,t.han);
}
for(const [k,values] of [...dictionary])if(k.includes(' '))for(const h of values)add(k.replace(/ /g,''),h);
function tokenize(text){
 const words=norm(text).split(' ').filter(Boolean),parts=[];
 for(let i=0;i<words.length;){
  let found=null;
  for(let len=Math.min(5,words.length-i);len>0;len--){
   const key=words.slice(i,i+len).join(' ');
   if(dictionary.has(key)){found={key,values:dictionary.get(key).slice(0,12),len};break}
  }
  if(found){parts.push(found);i+=found.len}
  else{parts.push({key:words[i],values:[],len:1});i++}
 }
 return parts;
}
function convert(text){
 const parts=tokenize(text),unknown=parts.filter(p=>!p.values.length).map(p=>p.key);
 const exact=dictionary.get(norm(text))||[];
 return {value:parts.map(p=>p.values[0]||p.key).join(''),unknown,choices:exact.slice(0,12),parts};
}
function attach(panel,field){
 const box=document.createElement('div');box.className='cc-ime';
 const label=document.createElement('label');label.textContent='⌨️ Bộ gõ Pinyin → chữ Hán (offline)';
 const input=document.createElement('input');input.type='text';input.autocomplete='off';input.spellcheck=false;
 input.placeholder='Ví dụ: wo mai yi fu';input.setAttribute('aria-label','Nhập Pinyin không dấu');
 const preview=document.createElement('div');preview.className='cc-ime-preview';preview.setAttribute('aria-live','polite');
 const segments=document.createElement('div');segments.className='cc-ime-segments';
 const choices=document.createElement('div');choices.className='cc-ime-suggestions';
 const controls=document.createElement('div');controls.className='cc-ime-controls';
 const insert=document.createElement('button');insert.type='button';insert.textContent='Chèn chữ Hán vào bài viết';
 const erase=document.createElement('button');erase.type='button';erase.className='secondary';erase.textContent='Xóa Pinyin';
 const note=document.createElement('p');note.className='cc-ime-note';
 note.textContent='Chọn từng từ bên dưới để xem nhiều chữ đồng âm. Bấm phím 1–9 để chọn gợi ý đang mở. Bộ gõ không tự hiển thị đáp án bài tập.';
 const style=document.createElement('style');style.textContent=`
 .cc-ime-segments{display:flex;flex-wrap:wrap;gap:7px;margin:9px 0}
 .cc-ime-segments button{padding:7px 12px;border-radius:8px;border:1px solid #9bbce5;background:#fff;color:#164c87;cursor:pointer}
 .cc-ime-segments button[aria-pressed="true"]{background:#155eb0;color:#fff}
 .cc-ime-suggestions{display:flex;flex-wrap:wrap;gap:7px;margin:8px 0}
 .cc-ime-suggestions button{padding:8px 12px;border:1px solid #9bbce5;border-radius:8px;background:#fff;color:#124d92;cursor:pointer}
 .cc-ime-suggestions button[aria-pressed="true"]{background:#1769c2;color:#fff}
 .cc-ime-note{font-size:.87em}
 `;box.append(style);
 let parts=[],selected=[],active=0;
 function show(){
  preview.textContent=parts.length?parts.map((p,i)=>selected[i]||p.key).join(''):'Chữ Hán sẽ xuất hiện tại đây';
  segments.replaceChildren();choices.replaceChildren();
  parts.forEach((p,i)=>{
   const b=document.createElement('button');b.type='button';b.textContent=`${p.key} → ${selected[i]||'?'}`;
   b.setAttribute('aria-pressed',String(i===active));b.onclick=()=>{active=i;show()};segments.append(b);
  });
  const p=parts[active];
  if(p&&p.values.length){
   p.values.forEach((value,i)=>{
    const b=document.createElement('button');b.type='button';b.textContent=(i<9?`${i+1}. `:'')+value;
    b.setAttribute('aria-pressed',String(selected[active]===value));
    b.onclick=()=>{selected[active]=value;show()};choices.append(b);
   });
  }else if(p){const msg=document.createElement('span');msg.textContent='Chưa có chữ Hán cho âm tiết này.';choices.append(msg)}
  insert.disabled=!parts.length||parts.some(p=>!p.values.length);
 }
 function update(){parts=tokenize(input.value);selected=parts.map(p=>p.values[0]||'');active=Math.min(active,Math.max(0,parts.length-1));show()}
 input.addEventListener('input',()=>{active=0;update()});
 input.addEventListener('keydown',e=>{
  if(e.key==='Enter'){e.preventDefault();insert.click()}
  else if(/^[1-9]$/.test(e.key)&&parts[active]?.values[Number(e.key)-1]){
   e.preventDefault();selected[active]=parts[active].values[Number(e.key)-1];
   if(active<parts.length-1)active++;show();
  }
 });
 insert.onclick=()=>{
  if(insert.disabled)return;const value=selected.join('');if(!value)return;
  const a=field.selectionStart??field.value.length,b=field.selectionEnd??a;
  field.setRangeText(value,a,b,'end');field.dispatchEvent(new Event('input',{bubbles:true}));
  input.value='';active=0;update();field.focus();
 };
 erase.onclick=()=>{input.value='';active=0;update();input.focus()};
 controls.append(insert,erase);box.append(label,input,preview,segments,choices,controls,note);panel.append(box);update();
}
window.CCPinyinIME={attach,convert};
})();
