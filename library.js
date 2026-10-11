(()=>{
'use strict';
const get=id=>document.getElementById(id);
const levels=['Cập nhật bài mới','Giao tiếp hằng ngày','Mua sắm & dịch vụ','Công việc & văn phòng','Nhà máy & công nhân','Kỹ thuật & sản xuất','Kho vận & giao hàng','Từ vựng & ngữ pháp','Giao tiếp xã hội','HSK 1','HSK 2','HSK 3','HSK 4','HSK 5','Chuyên ngành','Mở rộng từ','Số đếm','Thời gian','Phó từ'];
let activeLevel='Cập nhật bài mới',activeLesson=null,activeStep=0,showMeaning=true;
function speakChinese(han,rate){if(!('speechSynthesis'in window))return; speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(han);u.lang='zh-CN';u.rate=rate;const v=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('zh'));if(v)u.voice=v;speechSynthesis.speak(u)}
const saved=()=>{try{return JSON.parse(localStorage.getItem('cc_v22_progress')||'{}')}catch{return {}}};
function saveStep(){const p=saved();p[activeLesson.id]=Math.max(p[activeLesson.id]||0,activeStep+1);localStorage.setItem('cc_v22_progress',JSON.stringify(p))}
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
 const entries=newestFirst([{id:'cc-original',level:'HSK 2',title:'Bài 01 – 不 (bù)',description:'8 nhánh ghép câu, luyện nghe và kiểm tra',original:true},...(window.CC_LESSONS||[]).filter(l=>l.publishStatus!=='draft')]);
 const filtered=entries.filter(l=>(activeLevel==='Cập nhật bài mới'||l.category===activeLevel||l.level===activeLevel||lessonCategory(l)===activeLevel)&&(!q||[l.title,l.level,l.description||'',...(l.steps||[]).slice(0,2).map(s=>Array.isArray(s)?s[0]:s.han||'')].join(' ').toLocaleLowerCase().includes(q)));
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
function focusWords(l){return Array.isArray(l.focusWords)?l.focusWords.filter(w=>w&&w.han&&w.pinyin&&w.vi):[]}
function appendMarked(parent,text,term,cls){
 const str=String(text||''),needle=String(term||'');
 if(!needle){parent.textContent=str;return}
 const pos=str.toLocaleLowerCase().indexOf(needle.toLocaleLowerCase());
 if(pos<0){parent.textContent=str;return}
 parent.append(document.createTextNode(str.slice(0,pos)));
 const span=document.createElement('span');span.className=cls;span.textContent=str.slice(pos,pos+needle.length);parent.append(span,document.createTextNode(str.slice(pos+needle.length)));
}
function focusForToken(l,t){return focusWords(l).find(w=>w.han===t.han)}
function focusForSentence(l,han){return focusWords(l).filter(w=>String(han||'').includes(w.han))}
function focusInfo(body,l,han){
 const matches=focusForSentence(l,han);if(!matches.length)return;
 const box=document.createElement('div');box.className='v210-newbox cc-focus-info';
 box.textContent='TỪ TRỌNG TÂM: '+matches.map(w=>w.han+' · '+w.pinyin+' · '+w.vi).join(' | ');
 body.append(box);
}
function openLesson(l){activeLesson=l;activeStep=0;showMeaning=true;get('originalLesson').classList.add('hide');get('originalQuiz').classList.add('hide');get('newLesson').classList.remove('hide');renderLesson();get('newLesson').scrollIntoView({behavior:'smooth'})}
function renderLesson(){if(!activeLesson)return;const l=activeLesson;const s=(l.steps?.length?l.steps:l.items)[activeStep];const body=get('newLessonBody');body.replaceChildren();
 const title=document.createElement('h2');title.textContent=l.level+' · '+l.title;body.append(title);
 if(l.focusWords?.length||l.vocabulary?.length){const section=document.createElement('details');section.className='cc-vocab-section';section.open=activeStep===0;const summary=document.createElement('summary');summary.textContent='📖 Từ vựng bài học ('+((l.focusWords?.length||0)+(l.vocabulary?.length||0))+' từ)';section.append(summary);for(const [heading,words] of [['Từ trọng tâm',l.focusWords||[]],['Từ bổ trợ',l.vocabulary||[]]]){if(!words.length)continue;const h=document.createElement('h4');h.textContent=heading;section.append(h);for(const w of words){const r=document.createElement('div');r.className='cc-vocab-row';const label=document.createElement('span');label.textContent=w.han+' · '+w.pinyin+' · '+w.vi;if(heading==='Từ trọng tâm')label.className='cc-focus-han';const audio=document.createElement('button');audio.textContent='🔊 Nghe';audio.onclick=()=>speakChinese(w.han,1);r.append(label,audio);section.append(r)}}body.append(section)}
 const meter=document.createElement('div');meter.className='meter';const fill=document.createElement('div');fill.style.width=((activeStep+1)/(l.steps?.length||l.items?.length||0)*100)+'%';meter.append(fill);body.append(meter);
 const count=document.createElement('p');count.textContent='Bước '+(activeStep+1)+'/'+(l.steps?.length||l.items?.length||0);body.append(count);
 const card=document.createElement('div');card.className='study-card';
 if(s&& !Array.isArray(s)){
  const tokens=document.createElement('div');tokens.className='v210-tokens';
  (s.tokens||[{han:s.han,pinyin:s.pinyin,vi:s.vi}]).forEach(t=>{const b=document.createElement('button');b.type='button';b.className='v210-token'+(focusForToken(l,t)?' v210-new':'');b.textContent=t.han;b.title='Xem nghĩa từ '+t.han;b.onclick=()=>{const box=body.querySelector('.v210-word');box.replaceChildren();const strong=document.createElement('strong');strong.textContent=t.han+' · '+t.pinyin+' · '+t.vi;const btn=document.createElement('button');btn.textContent='🔊 Nghe từ';btn.onclick=()=>speakChinese(t.han,1);box.append(strong,btn)};tokens.append(b)});
  card.append(tokens);const py=document.createElement('div');py.className='study-py';(s.tokens||[]).length?(s.tokens||[]).forEach((t,i)=>{const span=document.createElement('span');span.className='v210-pinyin-token'+(focusForToken(l,t)?' new':'');if(focusForToken(l,t))span.setAttribute('aria-label','Pinyin từ trọng tâm: '+t.pinyin);span.textContent=t.pinyin+(i<(s.tokens||[]).length-1?' ':'');py.append(span)}):py.textContent=s.pinyin;card.append(py);
  const vi=document.createElement('div');vi.className='v210-meaning';if(showMeaning)(s.viParts||[{text:s.vi}]).forEach(p=>{const span=document.createElement('span');span.textContent=p.text+' ';if(focusWords(l).some(w=>p.text.trim().toLocaleLowerCase()===w.vi.toLocaleLowerCase() && String(s.han).includes(w.han)))span.className='v210-new-meaning';vi.append(span)});card.append(vi);
  const word=document.createElement('div');word.className='v210-word';word.textContent='Chạm vào từng từ để xem Pinyin và nghĩa tiếng Việt';body.append(card,word);
  focusInfo(body,l,s.han);
 }else{for(const [cls,txt] of [['study-han',s[0]],['study-py',s[1]],['study-vi',showMeaning?s[2]:'']]){const el=document.createElement('div');el.className=cls;if(cls==='study-han'){const w=focusForSentence(l,s[0]);if(w.length)appendMarked(el,txt,w[0].han,'cc-focus-han');else el.textContent=txt}
 else if(cls==='study-py'){const w=focusForSentence(l,s[0]);if(w.length)appendMarked(el,txt,w[0].pinyin,'cc-focus-py');else el.textContent=txt}
 else if(cls==='study-vi'){const w=focusForSentence(l,s[0]);if(w.length)appendMarked(el,txt,w[0].vi,'cc-focus-vi');else el.textContent=txt}
 else el.textContent=txt;card.append(el)}body.append(card);focusInfo(body,l,s[0])}
 const actions=document.createElement('div');actions.className='lesson-actions';const speak=document.createElement('button');speak.textContent='🔊 Nghe';const rate=document.createElement('select');for(const [value,label] of [['0.75','Chậm 0.75×'],['1','Bình thường 1×']]){const opt=document.createElement('option');opt.value=value;opt.textContent=label;if(value==='1')opt.selected=true;rate.append(opt)}
 speak.onclick=()=>{if(!('speechSynthesis'in window)){alert('Trình duyệt không hỗ trợ giọng đọc');return}speechSynthesis.cancel();const utter=new SpeechSynthesisUtterance(Array.isArray(s)?s[0]:s.han);utter.lang='zh-CN';utter.rate=Number(rate.value);const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('zh'));if(voice)utter.voice=voice;speechSynthesis.speak(utter)};actions.append(speak,rate);card.append(actions);if(!card.isConnected)body.append(card);
 const nav=document.createElement('div');nav.className='row';const prev=document.createElement('button');prev.textContent='← Trước';prev.disabled=activeStep===0;prev.onclick=()=>{activeStep--;renderLesson()};const next=document.createElement('button');next.textContent='Thêm từ →';next.disabled=activeStep===(l.steps?.length||l.items?.length||0)-1;next.onclick=()=>{activeStep++;renderLesson()};const hide=document.createElement('button');hide.className='secondary';hide.textContent=showMeaning?'Ẩn nghĩa':'Hiện nghĩa';hide.onclick=()=>{showMeaning=!showMeaning;renderLesson()};nav.append(prev,next,hide);body.append(nav);if(l.dialogue?.length){const wrap=document.createElement('div');wrap.className='v210-dialogue';const h=document.createElement('h3');h.textContent='💬 Hội thoại ứng dụng';wrap.append(h);for(const line of l.dialogue){const box=document.createElement('div');box.className='v210-dialogue-line';const label=document.createElement('b');label.textContent=line.speaker+': ';box.append(label);for(const t of line.tokens||[]){const btn=document.createElement('button');btn.className='v210-dialogue-word';btn.textContent=t.han;btn.title=t.pinyin+' — '+t.vi;if(focusForToken(l,t))btn.classList.add('cc-dialogue-focus');btn.onclick=()=>{info.textContent=t.han+' · '+t.pinyin+' · '+t.vi;speakChinese(t.han,1)};box.append(btn)}const py=document.createElement('div');py.className='study-py';for(const w of focusWords(l)){if(String(line.han).includes(w.han)&&String(line.pinyin).toLocaleLowerCase().includes(w.pinyin.toLocaleLowerCase())){appendMarked(py,line.pinyin,w.pinyin,'cc-focus-py');break}}if(!py.childNodes.length)py.textContent=line.pinyin;const vi=document.createElement('div');for(const w of focusWords(l)){if(String(line.han).includes(w.han)&&String(line.vi).toLocaleLowerCase().includes(w.vi.toLocaleLowerCase())){appendMarked(vi,line.vi,w.vi,'cc-focus-vi');break}}if(!vi.childNodes.length)vi.textContent=line.vi;const audio=document.createElement('button');audio.textContent='🔊 Cả câu';audio.onclick=()=>speakChinese(line.han,1);box.append(py,vi,audio);wrap.append(box)}const info=document.createElement('p');info.className='v210-word';info.textContent='Nhấn từng từ trong hội thoại để nghe và xem nghĩa';wrap.append(info);body.append(wrap)}if(l.exercises?.length){const ex=document.createElement('details');ex.className='cc-exercises';const sum=document.createElement('summary');sum.textContent='✍️ Luyện tập ('+l.exercises.length+' câu)';ex.append(sum);for(const [i,item] of l.exercises.entries()){const line=document.createElement('div');line.className='cc-vocab-row';const q=document.createElement('div');q.textContent=(i+1)+'. '+item.question;const ans=document.createElement('details');const as=document.createElement('summary');as.textContent='Xem đáp án';const text=document.createElement('p');text.textContent=item.answer;ans.append(as,text);line.append(q,ans);ex.append(line)}body.append(ex)}saveStep();}
get('backLibrary').onclick=()=>{speechSynthesis.cancel();get('newLesson').classList.add('hide');renderCatalog();get('library').scrollIntoView({behavior:'smooth'})};
renderCatalog();
})();
