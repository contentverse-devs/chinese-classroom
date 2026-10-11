(()=>{
'use strict';
const get=id=>document.getElementById(id);
const levels=['Cập nhật bài mới','HSK 1','HSK 2','HSK 3','Mở rộng từ','Số đếm','Thời gian','Phó từ'];
let activeLevel='Cập nhật bài mới',activeLesson=null,activeStep=0,showMeaning=true;
function speakChinese(han,rate){if(!('speechSynthesis'in window))return; speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(han);u.lang='zh-CN';u.rate=rate;const v=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('zh'));if(v)u.voice=v;speechSynthesis.speak(u)}
const saved=()=>{try{return JSON.parse(localStorage.getItem('cc_v22_progress')||'{}')}catch{return {}}};
function saveStep(){const p=saved();p[activeLesson.id]=Math.max(p[activeLesson.id]||0,activeStep+1);localStorage.setItem('cc_v22_progress',JSON.stringify(p))}
// Bản nháp luyện viết chỉ tồn tại trong phiên mở trang; không đụng tới license hoặc tiến độ.
const practiceDrafts=new Map();
function addWritingPractice(body,lesson,step,source){
 const key=lesson.id+'::'+step;
 const panel=document.createElement('section');panel.className='cc-writing-exercise';
 const heading=document.createElement('h3');heading.textContent='✍️ Luyện viết câu / từ';panel.append(heading);
 const instruction=document.createElement('p');instruction.className='cc-writing-instruction';instruction.textContent='Nhìn nghĩa tiếng Việt rồi tự viết chữ Hán. Có thể gõ hoặc viết tay bên dưới.';panel.append(instruction);
 const question=document.createElement('div');question.className='cc-writing-question';question.textContent='Tiếng Việt: '+(Array.isArray(source)?source[2]||'':source.vi||'');panel.append(question);
 const label=document.createElement('label');label.className='cc-writing-label';label.textContent='Nhập câu trả lời bằng bàn phím';
 const field=document.createElement('textarea');field.rows=3;field.placeholder='Viết chữ Hán tại đây…';field.value=practiceDrafts.get(key)||'';field.setAttribute('aria-label','Câu trả lời bằng chữ Hán');field.addEventListener('input',()=>practiceDrafts.set(key,field.value));label.append(field);panel.append(label);
 const canvasLabel=document.createElement('div');canvasLabel.className='cc-writing-label';canvasLabel.textContent='Hoặc tập viết tay bằng chuột / ngón tay';panel.append(canvasLabel);
 const canvas=document.createElement('canvas');canvas.className='cc-writing-canvas';canvas.width=900;canvas.height=270;canvas.setAttribute('aria-label','Bảng viết tay chữ Hán');panel.append(canvas);
 const ctx=canvas.getContext('2d');ctx.strokeStyle='#172b4d';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round';let drawing=false;
 function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
 canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;const a=point(e);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x+.01,a.y+.01);ctx.stroke()});
 canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const a=point(e);ctx.lineTo(a.x,a.y);ctx.stroke()});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drawing=false);
 const controls=document.createElement('div');controls.className='cc-writing-controls';
 const reveal=document.createElement('button');reveal.type='button';reveal.textContent='Xem đáp án mẫu';
 const clear=document.createElement('button');clear.type='button';clear.className='secondary';clear.textContent='Xóa để viết lại';
 const answer=document.createElement('div');answer.className='cc-writing-answer hide';answer.textContent='Đáp án mẫu: '+(Array.isArray(source)?source[0]:source.han||'');
 reveal.onclick=()=>{answer.classList.toggle('hide');reveal.textContent=answer.classList.contains('hide')?'Xem đáp án mẫu':'Ẩn đáp án mẫu'};
 clear.onclick=()=>{field.value='';practiceDrafts.delete(key);ctx.clearRect(0,0,canvas.width,canvas.height);answer.classList.add('hide');reveal.textContent='Xem đáp án mẫu';field.focus()};
 controls.append(reveal,clear);panel.append(controls,answer);body.append(panel);
}
let catalogPage=0;
const PAGE_SIZE=12;
function lessonCategory(l){
 const explicit=String(l.category||l.topic||'').toLocaleLowerCase('vi');
 const title=String(l.title||'').toLocaleLowerCase('vi');
 const description=String(l.description||'').toLocaleLowerCase('vi');
 const words=title+' '+description;
 if(explicit.includes('số đếm')||/(số đếm|con số|đếm số|数字|数字学习)/u.test(words))return 'Số đếm';
 if(explicit.includes('thời gian')||/(thời gian|ngày tháng|giờ giấc|kế hoạch|时间|今天|明天)/u.test(words))return 'Thời gian';
 if(explicit.includes('phó từ')||/(phó từ|副词|非常|已经|正在)/u.test(words))return 'Phó từ';
 if(explicit.includes('mở rộng')||/(mở rộng|ghép câu|bài gốc)/u.test(words)||l.level==='Mở rộng')return 'Mở rộng từ';
 return l.level||'HSK 1';
}
function newestFirst(entries){
 // Bài mới thêm vào lessons.js xuất hiện trước; không thay đổi ID hay dữ liệu bài.
 return [...entries].reverse();
}
const savedOriginalStep=()=>{try{return JSON.parse(localStorage.getItem('cc_progress')||'{}').step||0}catch{return 0}};
const pictureFor=(l)=>{
 const words=(l.title+' '+(l.description||'')).toLowerCase();
 if(words.includes('gia đình'))return 'assets/family.svg';
 if(words.includes('uống')||words.includes('喝水'))return 'assets/water.svg';
 if(words.includes('mua sắm'))return 'assets/shopping.svg';
 if(words.includes('thời gian'))return 'assets/calendar.svg';
 if(words.includes('lớp học'))return 'assets/classroom.svg';
 if(words.includes('chào hỏi'))return 'assets/hello.svg';
 if(words.includes('不'))return 'assets/words.svg';
 return 'assets/book.svg';
};
function renderCatalog(){
 const filters=get('levelFilters');filters.replaceChildren();
 for(const level of levels){const b=document.createElement('button');b.className='filter'+(level===activeLevel?' active':'');b.textContent=level;b.onclick=()=>{activeLevel=level;catalogPage=0;renderCatalog()};filters.append(b)}
 const q=(get('lessonSearch').value||'').trim().toLocaleLowerCase();
 const entries=newestFirst([{id:'cc-original',level:'HSK 2',title:'Bài 01 – 不 (bù)',description:'8 nhánh ghép câu, luyện nghe và kiểm tra',original:true},...(window.CC_LESSONS||[])]);
 const filtered=entries.filter(l=>(activeLevel==='Cập nhật bài mới'||lessonCategory(l)===activeLevel)&&(!q||[l.title,l.level,l.description||'',...(l.steps||[]).slice(0,2).map(s=>Array.isArray(s)?s[0]:s.han||'')].join(' ').toLocaleLowerCase().includes(q)));
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));catalogPage=Math.min(catalogPage,pages-1);
 const grid=get('lessonCatalog');grid.replaceChildren();
 for(const l of filtered.slice(catalogPage*PAGE_SIZE,(catalogPage+1)*PAGE_SIZE)){
  const b=document.createElement('button');b.type='button';b.className='lesson-tile cc-lesson-tile';
  const img=document.createElement('img');img.src=pictureFor(l);img.alt='';img.loading='lazy';img.className='cc-lesson-image';
  const inner=document.createElement('span');inner.className='cc-tile-body';
  const tag=document.createElement('span');tag.className='tag';tag.textContent=l.level;
  const title=document.createElement('strong');title.textContent=l.title;
  const desc=document.createElement('small');desc.textContent=l.description||'Bài học tiếng Trung';
  const progress=document.createElement('small');progress.className='cc-tile-progress';
  const total=l.original?5:(l.steps?.length||l.items?.length||0);
  const done=l.original?Math.min(+(savedOriginalStep()||0)+1,total):Math.min(saved()[l.id]||0,total);
  progress.textContent=`${done}/${total} bước`;
  inner.append(tag,title,desc,progress);b.append(img,inner);
  b.onclick=()=>{
   if(l.original){activeLesson=null;get('originalLesson').classList.remove('hide');get('originalQuiz').classList.remove('hide');get('newLesson').classList.add('hide');get('originalLesson').scrollIntoView({behavior:'smooth'})}
   else openLesson(l);
  };grid.append(b);
 }
 get('catalogCount').textContent=`${filtered.length} bài học` + (activeLevel==='Cập nhật bài mới'?' · Bài bổ sung gần đây hiển thị trước':'');
 get('catalogPage').textContent=`Trang ${catalogPage+1}/${pages}`;
 get('catalogPrev').disabled=catalogPage===0;
 get('catalogNext').disabled=catalogPage>=pages-1;
 get('catalogPrev').parentElement.hidden=pages===1;
}
get('lessonSearch').addEventListener('input',()=>{catalogPage=0;renderCatalog()});
get('catalogPrev').onclick=()=>{catalogPage--;renderCatalog()};
get('catalogNext').onclick=()=>{catalogPage++;renderCatalog()};
function showArea(area){
 const writing=area==='writing';
 get('writingPractice').classList.toggle('hide',!writing);
 get('library').classList.toggle('hide',writing);
 get('navLessons').classList.toggle('active',!writing);
 get('navWriting').classList.toggle('active',writing);
 get('originalLesson').classList.add('hide');get('originalQuiz').classList.add('hide');get('newLesson').classList.add('hide');
 (writing?get('writingPractice'):get('library')).scrollIntoView({behavior:'smooth',block:'start'});
}
get('navLessons').onclick=()=>showArea('lessons');
get('navWriting').onclick=()=>showArea('writing');
function openLesson(l){activeLesson=l;activeStep=0;showMeaning=true;get('originalLesson').classList.add('hide');get('originalQuiz').classList.add('hide');get('newLesson').classList.remove('hide');renderLesson();get('newLesson').scrollIntoView({behavior:'smooth'})}
function renderLesson(){if(!activeLesson)return;const l=activeLesson;const s=(l.steps?.length?l.steps:l.items)[activeStep];const body=get('newLessonBody');body.replaceChildren();
 const title=document.createElement('h2');title.textContent=l.level+' · '+l.title;body.append(title);
 const meter=document.createElement('div');meter.className='meter';const fill=document.createElement('div');fill.style.width=((activeStep+1)/(l.steps?.length||l.items?.length||0)*100)+'%';meter.append(fill);body.append(meter);
 const count=document.createElement('p');count.textContent='Bước '+(activeStep+1)+'/'+(l.steps?.length||l.items?.length||0);body.append(count);
 const card=document.createElement('div');card.className='study-card';
 if(s&& !Array.isArray(s)){
  const tokens=document.createElement('div');tokens.className='v210-tokens';
  (s.tokens||[{han:s.han,pinyin:s.pinyin,vi:s.vi}]).forEach(t=>{const b=document.createElement('button');b.type='button';b.className='v210-token'+((s.added||[]).includes(t.han)?' v210-new':'');b.textContent=t.han;b.title='Xem nghĩa từ '+t.han;b.onclick=()=>{const box=body.querySelector('.v210-word');box.replaceChildren();const strong=document.createElement('strong');strong.textContent=t.han+' · '+t.pinyin+' · '+t.vi;const btn=document.createElement('button');btn.textContent='🔊 Nghe từ';btn.onclick=()=>speakChinese(t.han,1);box.append(strong,btn)};tokens.append(b)});
  card.append(tokens);const py=document.createElement('div');py.className='study-py';(s.tokens||[]).length?(s.tokens||[]).forEach((t,i)=>{const span=document.createElement('span');span.className='v210-pinyin-token'+((s.added||[]).includes(t.han)?' new':'');if((s.added||[]).includes(t.han))span.setAttribute('aria-label','Pinyin từ mới: '+t.pinyin);span.textContent=t.pinyin+(i<(s.tokens||[]).length-1?' ':'');py.append(span)}):py.textContent=s.pinyin;card.append(py);
  const vi=document.createElement('div');vi.className='v210-meaning';if(showMeaning)(s.viParts||[{text:s.vi}]).forEach(p=>{const span=document.createElement('span');span.textContent=p.text+' ';if(p.new)span.className='v210-new-meaning';vi.append(span)});card.append(vi);
  const word=document.createElement('div');word.className='v210-word';word.textContent='Chạm vào từng từ để xem Pinyin và nghĩa tiếng Việt';body.append(card,word);
  const fresh=(s.tokens||[]).filter(t=>(s.added||[]).includes(t.han));if(fresh.length){const newbox=document.createElement('div');newbox.className='v210-newbox';newbox.textContent='TỪ MỚI: '+fresh.map(t=>t.han+' · '+t.pinyin+' · '+t.vi).join(' | ');body.append(newbox)}
 }else{for(const [cls,txt] of [['study-han',s[0]],['study-py',s[1]],['study-vi',showMeaning?s[2]:'']]){const el=document.createElement('div');el.className=cls;el.textContent=txt;card.append(el)}body.append(card)}
 const actions=document.createElement('div');actions.className='lesson-actions';const speak=document.createElement('button');speak.textContent='🔊 Nghe';const rate=document.createElement('select');for(const [value,label] of [['0.75','Chậm 0.75×'],['1','Bình thường 1×']]){const opt=document.createElement('option');opt.value=value;opt.textContent=label;if(value==='1')opt.selected=true;rate.append(opt)}
 speak.onclick=()=>{if(!('speechSynthesis'in window)){alert('Trình duyệt không hỗ trợ giọng đọc');return}speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(Array.isArray(s)?s[0]:s.han);utter.lang='zh-CN';utter.rate=Number(rate.value);const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('zh'));if(voice)utter.voice=voice;speechSynthesis.speak(utter)};actions.append(speak,rate);card.append(actions);if(!card.isConnected)body.append(card);
 const nav=document.createElement('div');nav.className='row';const prev=document.createElement('button');prev.textContent='← Trước';prev.disabled=activeStep===0;prev.onclick=()=>{activeStep--;renderLesson()};const next=document.createElement('button');next.textContent='Thêm từ →';next.disabled=activeStep===(l.steps?.length||l.items?.length||0)-1;next.onclick=()=>{activeStep++;renderLesson()};const hide=document.createElement('button');hide.className='secondary';hide.textContent=showMeaning?'Ẩn nghĩa':'Hiện nghĩa';hide.onclick=()=>{showMeaning=!showMeaning;renderLesson()};nav.append(prev,next,hide);body.append(nav);if(l.dialogue?.length){const wrap=document.createElement('div');wrap.className='v210-dialogue';const h=document.createElement('h3');h.textContent='💬 Hội thoại ứng dụng';wrap.append(h);for(const line of l.dialogue){const box=document.createElement('div');box.className='v210-dialogue-line';const label=document.createElement('b');label.textContent=line.speaker+': ';box.append(label);for(const t of line.tokens||[]){const btn=document.createElement('button');btn.className='v210-dialogue-word';btn.textContent=t.han;btn.title=t.pinyin+' — '+t.vi;btn.onclick=()=>{info.textContent=t.han+' · '+t.pinyin+' · '+t.vi;speakChinese(t.han,1)};box.append(btn)}const py=document.createElement('div');py.className='study-py';py.textContent=line.pinyin;const vi=document.createElement('div');vi.textContent=line.vi;const audio=document.createElement('button');audio.textContent='🔊 Cả câu';audio.onclick=()=>speakChinese(line.han,1);box.append(py,vi,audio);wrap.append(box)}const info=document.createElement('p');info.className='v210-word';info.textContent='Nhấn từng từ trong hội thoại để nghe và xem nghĩa';wrap.append(info);body.append(wrap)}addWritingPractice(body,l,activeStep,s);saveStep();}
get('backLibrary').onclick=()=>{speechSynthesis.cancel();get('newLesson').classList.add('hide');renderCatalog();get('library').scrollIntoView({behavior:'smooth'})};
renderCatalog();
})();
