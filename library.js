(()=>{
'use strict';
const get=id=>document.getElementById(id);
const levels=['Cập nhật bài mới','HSK 1','HSK 2','HSK 3','Mở rộng từ','Số đếm','Thời gian','Phó từ'];
let activeLevel='Cập nhật bài mới',activeLesson=null,activeStep=0,showMeaning=true;
function speakChinese(han,rate){if(!('speechSynthesis'in window))return; speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(han);u.lang='zh-CN';u.rate=rate;const v=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('zh'));if(v)u.voice=v;speechSynthesis.speak(u)}
const saved=()=>{try{return JSON.parse(localStorage.getItem('cc_v22_progress')||'{}')}catch{return {}}};
function saveStep(){const p=saved();p[activeLesson.id]=Math.max(p[activeLesson.id]||0,activeStep+1);localStorage.setItem('cc_v22_progress',JSON.stringify(p))}
// Bài luyện tập riêng do giáo viên biên soạn; không thay đổi dữ liệu gốc hay license.
const practiceDrafts=new Map();
const practicePositions=new Map();
function addWritingPractice(body,lesson,step,source){
 const fixed=Array.isArray(lesson.practiceQuestions)&&lesson.practiceQuestions.length>0;
 const questions=fixed?lesson.practiceQuestions:[{vi:Array.isArray(source)?source[2]:source.vi,han:Array.isArray(source)?source[0]:source.han,pinyin:Array.isArray(source)?source[1]:source.pinyin}];
 if(!questions.length)return;
 const panel=document.createElement('section');panel.className='cc-writing-exercise cc-practice-v3';
 const head=document.createElement('div');head.className='cc-practice-head';
 const heading=document.createElement('h3');heading.textContent='✍️ Luyện dịch Việt → Hán';head.append(heading);
 const counter=document.createElement('strong');counter.className='cc-practice-counter';head.append(counter);panel.append(head);
 const prompt=document.createElement('div');prompt.className='cc-writing-question cc-practice-question';panel.append(prompt);
 const field=document.createElement('textarea');field.rows=2;field.placeholder='Nhập chữ Hán hoặc dùng bộ gõ Pinyin bên dưới…';field.setAttribute('aria-label','Câu trả lời chữ Hán');field.className='cc-practice-input';panel.append(field);
 const imeHost=document.createElement('div');imeHost.className='cc-practice-ime';panel.append(imeHost);
 if(window.CCPinyinIME)window.CCPinyinIME.attach(imeHost,field);else{const notice=document.createElement('p');notice.textContent='Bộ gõ Pinyin chưa tải. Hãy kiểm tra tệp pinyin-ime.js và tải lại trang.';imeHost.append(notice);}
 const answer=document.createElement('div');answer.className='cc-writing-answer hide cc-practice-answer';panel.append(answer);
 const progress=document.createElement('div');progress.className='cc-practice-progress';panel.append(progress);
 const summary=document.createElement('div');summary.className='cc-practice-summary hide';panel.append(summary);
 const actions=document.createElement('div');actions.className='cc-practice-actions';
 const prev=document.createElement('button');prev.type='button';prev.className='secondary';prev.textContent='← Câu trước';
 const next=document.createElement('button');next.type='button';next.textContent='Câu tiếp →';
 const reveal=document.createElement('button');reveal.type='button';reveal.className='secondary';reveal.textContent='Xem đáp án';
 const check=document.createElement('button');check.type='button';check.textContent='✓ Kiểm tra đáp án';
 const finish=document.createElement('button');finish.type='button';finish.textContent='🏁 Hoàn thành bài luyện tập';finish.className='cc-practice-finish';
 const feedback=document.createElement('div');feedback.className='cc-practice-feedback hide';feedback.setAttribute('role','status');panel.append(feedback);
 const clear=document.createElement('button');clear.type='button';clear.className='secondary';clear.textContent='Xóa câu trả lời';
 const handwriting=document.createElement('button');handwriting.type='button';handwriting.className='secondary';handwriting.textContent='✍️ Mở bảng viết tay';
 actions.append(check,prev,next,reveal,clear,handwriting,finish);panel.append(actions);
 const writingArea=document.createElement('div');writingArea.className='cc-practice-handwriting hide';
 const canvas=document.createElement('canvas');canvas.className='cc-writing-canvas';canvas.width=900;canvas.height=200;canvas.setAttribute('aria-label','Bảng viết tay chữ Hán');writingArea.append(canvas);
 const erase=document.createElement('button');erase.type='button';erase.className='secondary';erase.textContent='Xóa nét viết';writingArea.append(erase);panel.append(writingArea);
 const ctx=canvas.getContext('2d');if(ctx){ctx.strokeStyle='#172b4d';ctx.lineWidth=5;ctx.lineCap='round';ctx.lineJoin='round'}
 let drawing=false,shown=false;
 function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}}
 if(ctx){canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;const a=point(e);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x+.01,a.y+.01);ctx.stroke()});canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const a=point(e);ctx.lineTo(a.x,a.y);ctx.stroke()});for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drawing=false)}
 const positionKey=lesson.id;
 const resultKey='cc_practice_results_v1::'+lesson.id;
 const answers=Array.from({length:questions.length},()=>null); // latest checked answer for this session
 let reviewIndices=null,reviewAt=0;
 let index=fixed?Math.min(practicePositions.get(positionKey)||0,questions.length-1):0;
 const draftKey=()=>lesson.id+'::'+(fixed?'fixed-'+index:'step-'+step);
 const normalizeHan=t=>String(t||'').normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu,'');
 function recordResult(){
  const completed=answers.filter(Boolean).length;
  const correct=answers.filter(a=>a&&a.correct).length;
  progress.textContent=`Đã kiểm tra ${completed}/${questions.length} câu · Đúng ${correct} câu`;
  finish.disabled=completed!==questions.length;
  finish.title=finish.disabled?'Hãy kiểm tra đáp án của tất cả các câu trước khi hoàn thành':'';
 }
 function renderQuestion(){
  const q=questions[index];counter.textContent='Câu '+(index+1)+'/'+questions.length;
  prompt.textContent='Tiếng Việt: '+(q.vi||'');field.value=practiceDrafts.get(draftKey())||'';
  answer.textContent='Đáp án: '+(q.han||'')+(q.pinyin?' · '+q.pinyin:'');
  answer.classList.add('hide');feedback.classList.add('hide');feedback.textContent='';shown=false;reveal.textContent='Xem đáp án';
  prev.disabled=reviewIndices?reviewAt===0:index===0;
  next.disabled=reviewIndices?reviewAt===reviewIndices.length-1:index===questions.length-1;
  if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height);
  if(answers[index]&&answers[index].value===field.value){
   feedback.classList.remove('hide');feedback.dataset.result=answers[index].correct?'correct':'incorrect';
   feedback.textContent=answers[index].correct?'✓ Đã kiểm tra: chính xác.':'✗ Đã kiểm tra: chưa chính xác.';
  }
  recordResult();
 }
 function hideSummary(){summary.classList.add('hide');summary.replaceChildren()}
 field.addEventListener('input',()=>{
  practiceDrafts.set(draftKey(),field.value);
  if(answers[index]&&answers[index].value!==field.value)answers[index]=null;
  feedback.classList.add('hide');hideSummary();recordResult();
 });
 check.onclick=()=>{
  const typed=normalizeHan(field.value),expected=normalizeHan(questions[index].han);
  feedback.classList.remove('hide');hideSummary();
  if(!typed){feedback.textContent='Hãy nhập câu trả lời bằng chữ Hán trước khi kiểm tra.';feedback.dataset.result='empty';answers[index]=null}
  else{
   const correct=typed===expected;
   answers[index]={value:field.value,correct};
   feedback.textContent=correct?'✓ Chính xác! Bạn có thể chuyển sang câu tiếp theo.':'✗ Chưa chính xác. Hãy kiểm tra lại chữ Hán hoặc nhấn Xem đáp án.';
   feedback.dataset.result=correct?'correct':'incorrect';
  }
  recordResult();
 };
 function move(delta){
  if(reviewIndices){const to=reviewAt+delta;if(to<0||to>=reviewIndices.length)return;reviewAt=to;index=reviewIndices[reviewAt]}
  else{const to=index+delta;if(to<0||to>=questions.length)return;index=to}
  practicePositions.set(positionKey,index);renderQuestion();
 }
 prev.onclick=()=>move(-1);next.onclick=()=>move(1);
 reveal.onclick=()=>{shown=!shown;answer.classList.toggle('hide',!shown);reveal.textContent=shown?'Ẩn đáp án':'Xem đáp án'};
 clear.onclick=()=>{field.value='';practiceDrafts.delete(draftKey());answers[index]=null;feedback.classList.add('hide');hideSummary();recordResult();field.focus()};
 function showSummary(data,isSaved=false){
  hideSummary();summary.classList.remove('hide');
  const h=document.createElement('h3');h.textContent=isSaved?'📊 Kết quả lần gần nhất':'🎉 Kết quả bài luyện tập';summary.append(h);
  const score=document.createElement('p');score.className='cc-practice-score';score.textContent=`${data.correct}/${data.total} câu đúng · ${data.score}/100 điểm`;summary.append(score);
  if(data.time){const stamp=document.createElement('small');stamp.textContent='Lưu lúc: '+new Date(data.time).toLocaleString('vi-VN');summary.append(stamp)}
  const list=document.createElement('ol');list.className='cc-practice-review-list';
  data.items.forEach((item,i)=>{
   const li=document.createElement('li');
   const status=document.createElement('strong');status.textContent=item.correct?'✓ Đúng — ':'✗ Sai — ';
   const desc=document.createElement('span');desc.textContent=(questions[i]?.vi||'')+' · Trả lời: '+(item.value||'(trống)')+' · Đáp án: '+(questions[i]?.han||'');
   li.append(status,desc);list.append(li);
  });summary.append(list);
  const controls=document.createElement('div');controls.className='cc-practice-summary-actions';
  const retry=document.createElement('button');retry.type='button';retry.textContent='Làm lại 10 câu';
  retry.onclick=()=>{answers.fill(null);reviewIndices=null;reviewAt=0;index=0;for(let i=0;i<questions.length;i++)practiceDrafts.delete(lesson.id+'::'+(fixed?'fixed-'+i:'step-'+step));hideSummary();renderQuestion()};
  const wrong=data.items.map((item,i)=>item.correct?null:i).filter(i=>i!==null);
  controls.append(retry);
  if(wrong.length){const review=document.createElement('button');review.type='button';review.className='secondary';review.textContent='Luyện lại '+wrong.length+' câu sai';review.onclick=()=>{reviewIndices=wrong;reviewAt=0;index=wrong[0];for(const i of wrong){answers[i]=null;practiceDrafts.delete(lesson.id+'::'+(fixed?'fixed-'+i:'step-'+step))}hideSummary();renderQuestion()};controls.append(review)}
  const back=document.createElement('button');back.type='button';back.className='secondary';back.textContent='Đóng kết quả';back.onclick=hideSummary;controls.append(back);
  summary.append(controls);
 }
 finish.onclick=()=>{
  if(answers.some(a=>!a))return;
  const correct=answers.filter(a=>a.correct).length;
  const data={total:questions.length,correct,score:Math.round(correct/questions.length*100),time:new Date().toISOString(),items:answers.map(a=>({...a}))};
  try{localStorage.setItem(resultKey,JSON.stringify(data))}catch(e){/* local storage unavailable: still show score */}
  showSummary(data);summary.scrollIntoView({behavior:'smooth',block:'nearest'});
 };
 try{
  const last=JSON.parse(localStorage.getItem(resultKey)||'null');
  if(last&&last.total===questions.length&&Array.isArray(last.items)&&last.items.length===questions.length){
   const history=document.createElement('button');history.type='button';history.className='secondary cc-practice-history';history.textContent='📊 Xem kết quả lần trước';
   history.onclick=()=>showSummary(last,true);actions.append(history);
  }
 }catch(e){/* no saved result */}
 handwriting.onclick=()=>{const closed=writingArea.classList.toggle('hide');handwriting.textContent=closed?'✍️ Mở bảng viết tay':'Thu gọn bảng viết tay'};
 erase.onclick=()=>{if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height)};
 renderQuestion();body.append(panel);
}
const ccPracticeStyle=document.createElement('style');ccPracticeStyle.textContent=`
.cc-practice-v3{margin-top:18px;padding:16px;border:1px solid #d5e3f7;border-radius:14px;background:#f8fbff}
.cc-practice-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.cc-practice-head h3{margin:0}.cc-practice-counter{color:#155eaf;white-space:nowrap}
.cc-practice-question{margin-bottom:10px}.cc-practice-input{box-sizing:border-box;width:100%;min-height:74px;padding:12px;border:1px solid #bcd0ea;border-radius:9px;font:inherit;resize:vertical;background:white}
.cc-practice-ime{margin-top:10px}.cc-practice-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.cc-practice-actions button{max-width:100%}.cc-practice-answer{margin-top:12px;padding:12px;background:#eaf4ff;border-radius:9px;overflow-wrap:anywhere}
.cc-practice-progress{margin:10px 0;color:#315478;font-size:.94em}
.cc-practice-finish{background:#1769c2}.cc-practice-finish:disabled{opacity:.55;cursor:not-allowed}
.cc-practice-summary{margin:14px 0;padding:14px;border:1px solid #c4d8f2;border-radius:10px;background:#fff}
.cc-practice-summary h3{margin:0 0 8px}.cc-practice-score{font-size:1.2em;font-weight:700;margin:6px 0}
.cc-practice-review-list{padding-left:24px;max-height:330px;overflow:auto}.cc-practice-review-list li{margin:8px 0;overflow-wrap:anywhere}
.cc-practice-summary-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.cc-practice-handwriting{margin-top:12px}.cc-practice-handwriting canvas{display:block;box-sizing:border-box;width:100%;height:190px;background:white;touch-action:none;border:1px solid #bcd0ea;border-radius:9px;margin-bottom:8px}
@media(max-width:480px){.cc-practice-v3{padding:12px}.cc-practice-actions button{flex:1 1 42%}.cc-practice-handwriting canvas{height:155px}}
`;document.head.append(ccPracticeStyle);
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
