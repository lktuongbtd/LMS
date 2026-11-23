/* LMS LKT – pages-student.js: Trang học sinh, làm bài thi, xem kết quả */
'use strict';
function myAsgs(){ const u=me(); return DB.all('assignments').filter(a=>a.classIds.includes(u.classId)).sort((a,b)=>b.start-a.start); }
function myLessons(){ const u=me(); return DB.all('lessons').filter(l=>l.classIds.includes(u.classId)).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)); }
function mySubs(asId){ return DB.all('submissions').filter(s=>s.studentId===me().id&&(!asId||s.assignmentId===asId)).sort((a,b)=>b.submittedAt-a.submittedAt); }
function lessonDone(lid){ return DB.all('progress').some(p=>p.studentId===me().id&&p.lessonId===lid&&p.done); }
function asgState(a){ const now=Date.now(), n=mySubs(a.id).length; if(now<a.start) return {k:'wait',t:'Chưa mở',c:'gray'}; if(n>=a.attempts) return {k:'done',t:'Đã nộp',c:'ok'}; if(now>a.end) return {k:'late',t:n?'Đã nộp':'Quá hạn',c:n?'ok':'bad'}; return {k:'open',t:n?`Còn ${a.attempts-n} lượt`:'Chưa làm',c:'warn'}; }

Router.add('home',el=>{
  const u=me(), asg=myAsgs(), les=myLessons(), subs=mySubs();
  const open=asg.filter(a=>asgState(a).k==='open'); const doneL=les.filter(l=>lessonDone(l.id)).length; const doneA=asg.filter(a=>mySubs(a.id).length).length;
  const pct=Math.round(((les.length?doneL/les.length:0)+(asg.length?doneA/asg.length:0))/((les.length?1:0)+(asg.length?1:0)||1)*100);
  const sc=subs.map(s=>s.score).filter(x=>x!=null);
  const ann=DB.all('announcements').filter(a=>a.classIds.includes(u.classId)).sort((a,b)=>b.createdAt-a.createdAt).slice(0,4);
  el.innerHTML=head(`Chào ${esc(u.name.split(' ').pop())}! 🎒`,`Lớp ${esc(className(u.classId)||'—')} · ${new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'numeric'})}`)+
  `<div class="grid g3"><div class="card row" style="gap:18px"><div class="ring" style="--p:${pct}"><div>${pct}%</div></div><div><b>Tiến độ học tập</b><br><small class="muted">Học liệu ${doneL}/${les.length}<br>Bài kiểm tra ${doneA}/${asg.length}</small></div></div>
   <div class="card stat"><div class="ic c3">⏳</div><div><b>${open.length}</b><small class="muted">Bài cần làm</small></div></div>
   <div class="card stat"><div class="ic c2">🏆</div><div><b>${sc.length?fmtNum(sum(sc)/sc.length):'—'}</b><small class="muted">Điểm trung bình</small></div></div></div>
  <div class="grid g2" style="margin-top:16px"><div class="card"><h3>📝 Bài cần làm</h3>${open.length?open.map(a=>`<div class="row" style="padding:10px 0;border-bottom:1px solid #f1f4f9"><div class="grow"><b>${esc(a.title)}</b><br><small class="muted">${a.duration} phút · hạn ${fmtDate(a.end)}</small></div><a class="btn sm pri" href="#/take/${a.id}">Làm bài</a></div>`).join(''):emptyBox('Không có bài nào đang chờ 🎉','✅')}</div>
   <div class="card"><h3>📣 Thông báo</h3>${ann.length?ann.map(a=>`<div style="padding:8px 0;border-bottom:1px solid #f1f4f9"><b>${esc(a.title)}</b> <small class="muted">${fmtDay(a.createdAt)}</small><p style="margin:4px 0;white-space:pre-wrap">${esc(a.body)}</p></div>`).join(''):emptyBox('Chưa có thông báo','📣')}</div></div>
  <div class="card" style="margin-top:16px"><div class="row"><h3 class="grow">📚 Học liệu mới</h3><a href="#/my-lessons">Xem tất cả →</a></div><div class="grid g4">${les.slice(0,4).map(l=>`<a class="card lesson-card" href="#/lesson/${l.id}" style="color:inherit">${lessonThumb(l)}<b>${esc(l.title)}</b>${lessonDone(l.id)?'<span class="badge ok">✓ Đã học</span>':'<span class="badge gray">Chưa học</span>'}</a>`).join('')||emptyBox('Chưa có học liệu')}</div></div>`;
});
Router.add('tasks',el=>{
  const asg=myAsgs();
  el.innerHTML=head('Bài tập & Kiểm tra','Các bài giáo viên đã giao cho lớp')+(asg.length?`<div class="tbl-wrap"><table class="tbl"><tr><th>Bài</th><th>Môn</th><th>Thời gian</th><th>Trạng thái</th><th>Điểm</th><th></th></tr>${asg.map(a=>{ const ex=DB.get('exams',a.examId)||{}; const s=asgState(a); const subs=mySubs(a.id); const best=subs.reduce((m,x)=>!m||(x.score||0)>(m.score||0)?x:m,null);
    return `<tr><td><b>${esc(a.title)}</b><br><small class="muted">${a.duration} phút · ${a.attempts} lượt</small></td><td>${subjName(ex.subject)}</td><td><small>${fmtDate(a.start)}<br>→ ${fmtDate(a.end)}</small></td><td><span class="badge ${s.c}">${s.t}</span></td><td>${best?(a.showResult?scoreBadge(best.score):'<small class="muted">GV chưa công bố</small>'):''}</td>
    <td style="text-align:right;white-space:nowrap">${s.k==='open'?`<a class="btn sm pri" href="#/take/${a.id}">${subs.length?'Làm lại':'Làm bài'}</a>`:''}${best?` <a class="btn sm" href="#/result/${best.id}">Xem bài</a>`:''}</td></tr>`; }).join('')}</table></div>`:emptyBox('Chưa có bài được giao','📝'));
});
Router.add('my-lessons',el=>{
  const les=myLessons(); const bySub=groupBy(les,l=>l.subject);
  el.innerHTML=head('Học liệu của lớp',`${les.filter(l=>lessonDone(l.id)).length}/${les.length} học liệu đã hoàn thành`)+(les.length?Object.entries(bySub).map(([s,arr])=>`<h2 style="margin-top:10px">${(SUBJECTS[s]||{}).icon||''} ${subjName(s)}</h2><div class="grid g4">${arr.map(l=>`<a class="card lesson-card" href="#/lesson/${l.id}" style="color:inherit">${lessonThumb(l)}<div><span class="badge gray">${(LTYPE[l.type]||{}).t}</span></div><b>${esc(l.title)}</b><small class="muted">${esc(l.topic||'')}</small>${lessonDone(l.id)?'<span class="badge ok">✓ Đã học</span>':'<span class="badge warn">Chưa học</span>'}</a>`).join('')}</div>`).join(''):emptyBox('Giáo viên chưa giao học liệu','📚'));
});
Router.add('lesson',(el,[lid])=>{
  const l=DB.get('lessons',lid); if(!l){ el.innerHTML=emptyBox('Không tìm thấy học liệu'); return; }
  const done=Auth.is('student')&&lessonDone(l.id);
  el.innerHTML=head(esc(l.title),`${subjName(l.subject)} ${l.grade} · ${esc(l.topic||'')}`,`<a class="btn" href="#/${Auth.is('student')?'my-lessons':'lessons'}">← Quay lại</a>${Auth.is('student')?(done?'<span class="badge ok" style="padding:8px 14px">✓ Đã hoàn thành</span>':'<button class="btn pri" id="lnDone">✅ Đánh dấu đã học</button>'):''}`)+`<div class="card">${lessonBody(l)}</div>`;
  renderMath(el);
  const b=$('#lnDone',el); if(b) b.onclick=()=>{ const p={studentId:me().id,lessonId:l.id,done:true,at:Date.now(),updatedAt:Date.now()}; DB.removeWhere('progress',x=>x.studentId===p.studentId&&x.lessonId===p.lessonId); DB.data.progress.push(p); DB.save(); Sync.progress(p); toast('Tuyệt! Đã ghi nhận tiến độ 🎉','ok'); App.render(); };
});
Router.add('my-results',el=>{
  const subs=mySubs(); const sc=[...subs].reverse().filter(s=>s.score!=null);
  el.innerHTML=head('Kết quả của tôi','Lịch sử làm bài và biểu đồ điểm')+(subs.length?`<div class="card" style="margin-bottom:14px"><h3>📈 Điểm các lần làm bài</h3>${barChart(sc.map((s,i)=>'L'+(i+1)),sc.map(s=>s.score),{fmt:v=>fmtNum(v,1)})}</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Bài</th><th>Mã đề</th><th>Điểm</th><th>Nộp lúc</th><th></th></tr>${subs.map(s=>{ const a=DB.get('assignments',s.assignmentId)||{}; return `<tr><td>${esc(a.title||'(bài đã xoá)')}</td><td>${s.variant||'gốc'}</td><td>${a.showResult?scoreBadge(s.score):'<small class="muted">chưa công bố</small>'}${s.status==='pending'?' <span class="badge warn">chờ chấm tự luận</span>':''}</td><td><small>${fmtDate(s.submittedAt)}</small></td><td><a class="btn sm" href="#/result/${s.id}">Xem</a></td></tr>`; }).join('')}</table></div>`:emptyBox('Chưa làm bài nào','🏁'));
});
Router.add('account',el=>{ const u=me(); el.innerHTML=head('Tài khoản')+`<div class="grid g2"><div class="card"><h3>👤 Thông tin</h3><p>Họ tên: <b>${esc(u.name)}</b></p><p>Tài khoản: <code>${esc(u.username)}</code></p><p>Lớp: <b>${esc(className(u.classId)||'—')}</b></p></div><div class="card"><h3>🔑 Đổi mật khẩu</h3>${pwForm()}</div></div>`; bindPwForm(el); });

/* ===================== LÀM BÀI ===================== */
const Take = {
  timer:null,
  stop(){ clearInterval(this.timer); this.timer=null; window.onbeforeunload=null; document.onvisibilitychange=null; },
  open(el,{exam,asg,preview}){
    this.stop();
    const u=me(); const key=`lmslkt_take_${preview?'try_'+exam.id:asg.id}_${u.id}`;
    let st; try{ st=JSON.parse(localStorage.getItem(key)||'null'); }catch(e){ st=null; }
    if(!st){ const v=preview?(exam.variants||[])[0]||null:Exam.pickVariant(exam,u.id+'#'+mySubs(asg.id).length); st={variant:v?v.code:null,answers:{},startedAt:Date.now(),leaves:0}; }
    const variant=(exam.variants||[]).find(x=>x.code===st.variant)||null;
    const items=Exam.items(exam,variant); const dur=(asg?asg.duration:exam.duration)*60000;
    const deadline=Math.min(st.startedAt+dur, asg?asg.end:Infinity);
    const save=()=>localStorage.setItem(key,JSON.stringify(st));
    save();
    const g=groupBy(items,it=>it.type); let gi=0;
    el.innerHTML=`<div class="take"><div>
      <div class="card" style="margin-bottom:14px"><div class="row"><div class="grow"><h2 style="margin:0">${esc(asg?asg.title:exam.title)}</h2><small class="muted">${subjName(exam.subject)} ${exam.grade} · ${items.length} câu · Mã đề ${variant?variant.code:'gốc'}${preview?' · <b>CHẾ ĐỘ LÀM THỬ (không lưu)</b>':''}</small></div></div></div>
      ${PART_ORDER.filter(t=>g[t]).map((t,pi)=>`<div class="part-title">${PART_TITLE[t](g[t].length)}</div>`+g[t].map(it=>{ const q=it.q, idx=gi++; let h=`<div class="card q" id="tq${idx}" style="margin-bottom:12px"><div class="q-body"><b>Câu ${it.no}.</b> ${q.content.replace(/\n/g,'<br>')}${q.type==='essay'?` <i class="muted">(${fmtNum(q.points||1)} điểm)</i>`:''}</div>${figHtml(q)}`;
        if(t==='mcq') h+=it.perm.map((oi,k)=>`<div class="choice ${+st.answers[q.id]===oi&&st.answers[q.id]!=null?'sel':''}" data-q="${q.id}" data-o="${oi}" data-i="${idx}"><span class="k">${LETTER[k]}</span><div>${q.options[oi]}</div></div>`).join('');
        if(t==='tf') h+=it.perm.map((si,k)=>{ const a=(st.answers[q.id]||[])[si]; return `<div class="tf-row" style="align-items:center"><b>${'abcd'[k]})</b><div class="grow">${q.statements[si]}</div><div class="tfbtn"><button data-q="${q.id}" data-s="${si}" data-v="1" data-i="${idx}" class="${a===true?'sel-t':''}">Đúng</button><button data-q="${q.id}" data-s="${si}" data-v="0" data-i="${idx}" class="${a===false?'sel-f':''}">Sai</button></div></div>`; }).join('');
        if(t==='short') h+=`<div class="row" style="margin-top:8px"><label style="margin:0">Đáp số:</label><input type="text" data-q="${q.id}" data-i="${idx}" class="tShort" value="${esc(st.answers[q.id]||'')}" style="max-width:220px" placeholder="VD: -1,5" inputmode="decimal"></div>`;
        if(t==='essay') h+=`<textarea data-q="${q.id}" data-i="${idx}" class="tEssay" style="min-height:160px;margin-top:8px" placeholder="Trình bày bài làm...">${esc(st.answers[q.id]||'')}</textarea>`;
        return h+'</div>'; }).join('')).join('')}
      <div class="card" style="text-align:center"><button class="btn pri" id="tSubmit2" style="padding:12px 30px;font-size:15px">📨 Nộp bài</button></div></div>
      <div class="panel"><div class="card"><small class="muted">Thời gian còn lại</small><div class="timer" id="tTimer">--:--</div><div class="qnav" id="tNav">${items.map((it,i)=>`<button data-go="${i}" title="${QT_NAME[it.type]} câu ${it.no}">${i+1}</button>`).join('')}</div>
        <div class="row" style="justify-content:space-between"><small class="muted" id="tCount"></small><small class="muted" id="tSaved">💾 Tự lưu</small></div><button class="btn pri" id="tSubmit" style="width:100%;justify-content:center;margin-top:10px">📨 Nộp bài</button>${preview?'<a class="btn" style="width:100%;justify-content:center;margin-top:6px" href="#/exams" id="tQuit">Thoát làm thử</a>':''}</div></div></div>`;
    renderMath(el);
    const answered=it=>{ const a=st.answers[it.q.id]; if(it.type==='tf') return Array.isArray(a)&&a.filter(x=>x!=null).length===4; return a!=null&&String(a).trim()!==''; };
    const refresh=()=>{ $$('#tNav button',el).forEach((b,i)=>b.classList.toggle('done',answered(items[i]))); $('#tCount',el).textContent=`${items.filter(answered).length}/${items.length} câu đã làm`; };
    refresh();
    el.onclick=e=>{ const c=e.target.closest('.choice'); if(c){ st.answers[c.dataset.q]=+c.dataset.o; $$(`.choice[data-q="${c.dataset.q}"]`,el).forEach(x=>x.classList.toggle('sel',x===c)); save(); refresh(); return; }
      const t=e.target.closest('.tfbtn button'); if(t){ const arr=st.answers[t.dataset.q]||[null,null,null,null]; arr[+t.dataset.s]=t.dataset.v==='1'; st.answers[t.dataset.q]=arr; const sib=t.parentElement.children; sib[0].className=arr[+t.dataset.s]?'sel-t':''; sib[1].className=arr[+t.dataset.s]===false?'sel-f':''; save(); refresh(); return; }
      const go=e.target.closest('[data-go]'); if(go){ $('#tq'+go.dataset.go,el).scrollIntoView({behavior:'smooth',block:'center'}); } };
    el.oninput=e=>{ if(e.target.matches('.tShort,.tEssay')){ st.answers[e.target.dataset.q]=e.target.value; save(); refresh(); } };
    const submit=(auto)=>{ this.stop(); const res=Exam.grade(exam,variant,st.answers);
      if(preview){ localStorage.removeItem(key); modal({title:'Kết quả làm thử',body:`<p style="font-size:30px;font-weight:800;text-align:center;color:var(--pri)">${fmtNum(res.score)} điểm</p><p class="c muted" style="text-align:center">${res.pending?'(chưa tính phần tự luận)':''}</p>`,foot:`<a class="btn pri" href="#/exams" data-x>Về danh sách đề</a>`}); return; }
      const cls=DB.get('classes',u.classId); const now=Date.now();
      const sub={id:uid('s'),assignmentId:asg.id,examId:exam.id,studentId:u.id,studentName:u.name,className:cls?cls.name:'',variant:st.variant,answers:st.answers,score:res.score,detail:res.detail,status:res.pending?'pending':'graded',startedAt:st.startedAt,submittedAt:now,leaves:st.leaves||0,auto:!!auto,updatedAt:now};
      DB.data.submissions.push(sub); DB.save(); localStorage.removeItem(key); Sync.submit(sub);
      toast(auto?'Hết giờ – bài đã được nộp tự động':'Đã nộp bài thành công','ok'); location.hash='#/result/'+sub.id; };
    const ask=()=>{ const left=items.filter(it=>!answered(it)).length; confirmBox(left?`Bạn còn <b>${left}</b> câu chưa làm. Vẫn nộp bài?`:'Nộp bài và kết thúc?',()=>submit(false),'Nộp bài'); };
    $('#tSubmit',el).onclick=ask; $('#tSubmit2',el).onclick=ask;
    const tick=()=>{ const ms=deadline-Date.now(); const tEl=$('#tTimer'); if(!tEl){ this.stop(); return; } if(ms<=0){ tEl.textContent='00:00'; submit(true); return; }
      const m=Math.floor(ms/60000), s=Math.floor(ms%60000/1000); tEl.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; tEl.classList.toggle('low',ms<5*60000); };
    tick(); this.timer=setInterval(tick,1000);
    window.onbeforeunload=()=>'Bài làm đang được tự lưu. Bạn chắc chắn muốn rời trang?';
    if(asg&&asg.antiCheat!==false) document.onvisibilitychange=()=>{ if(document.hidden){ st.leaves=(st.leaves||0)+1; save(); toast(`⚠ Bạn đã rời khỏi trang làm bài (${st.leaves} lần) – hệ thống có ghi nhận`,'bad'); } };
  }
};
Router.add('take',(el,[asId])=>{
  const asg=DB.get('assignments',asId); if(!asg){ el.innerHTML=emptyBox('Không tìm thấy bài'); return; }
  const ex=DB.get('exams',asg.examId); if(!ex){ el.innerHTML=emptyBox('Đề đã bị xoá'); return; }
  const s=asgState(asg); const resuming=localStorage.getItem(`lmslkt_take_${asg.id}_${me().id}`);
  if(s.k!=='open'&&!resuming){ el.innerHTML=emptyBox(`Bài “${esc(asg.title)}”: ${s.t}`,'⛔')+`<p style="text-align:center"><a class="btn" href="#/tasks">← Quay lại</a></p>`; return; }
  if(resuming) return Take.open(el,{exam:ex,asg});
  const g=groupBy(Exam.items(ex,null),it=>it.type);
  el.innerHTML=`<div class="card" style="max-width:640px;margin:30px auto;text-align:center"><div style="font-size:48px">📝</div><h2>${esc(asg.title)}</h2><p class="muted">${subjName(ex.subject)} ${ex.grade}</p>
    <div class="grid g3" style="margin:18px 0"><div><b style="font-size:22px">${ex.questionIds.length}</b><br><small class="muted">câu hỏi</small></div><div><b style="font-size:22px">${asg.duration}</b><br><small class="muted">phút</small></div><div><b style="font-size:22px">${asg.attempts-mySubs(asg.id).length}</b><br><small class="muted">lượt còn lại</small></div></div>
    <p style="text-align:left" class="note info">${PART_ORDER.filter(t=>g[t]).map((t,i)=>`Phần ${ROMAN[i]}: ${QT_NAME[t]} – ${g[t].length} câu`).join('<br>')}<br>• Bài làm tự lưu – mất mạng hay tải lại trang vẫn giữ nguyên.<br>• Hết giờ hệ thống tự nộp bài.${asg.antiCheat!==false?'<br>• Việc rời khỏi trang khi làm bài sẽ được ghi nhận.':''}</p>
    <button class="btn pri" id="tStart" style="padding:12px 34px;font-size:15px">▶ Bắt đầu làm bài</button></div>`;
  $('#tStart',el).onclick=()=>Take.open(el,{exam:ex,asg});
});
Router.add('try',(el,[eid])=>{ const ex=DB.get('exams',eid); if(!ex){ el.innerHTML=emptyBox('Không tìm thấy đề'); return; } Take.open(el,{exam:ex,preview:true}); });
Router.add('result',(el,[sid])=>{
  const s=DB.get('submissions',sid); if(!s){ el.innerHTML=emptyBox('Không tìm thấy bài làm'); return; }
  const a=DB.get('assignments',s.assignmentId)||{}; const ex=DB.get('exams',s.examId); const isT=!Auth.is('student');
  if(!isT&&s.studentId!==me().id){ el.innerHTML=emptyBox('Không có quyền'); return; }
  const showScore=isT||a.showResult, showAns=isT||a.showAnswer;
  const by=groupBy(s.detail||[],d=>d.type);
  el.innerHTML=head('Kết quả bài làm',esc(a.title||''),`<a class="btn" href="#/${isT?'assignments':'tasks'}">← Quay lại</a>`)+
  `<div class="grid g3"><div class="card" style="text-align:center"><small class="muted">Điểm</small><div style="font-size:46px;font-weight:800;color:var(--pri)">${showScore?fmtNum(s.score):'🔒'}</div>${s.status==='pending'?'<span class="badge warn">Phần tự luận đang chờ giáo viên chấm</span>':''}</div>
    <div class="card" style="grid-column:span 2"><h3>Chi tiết theo phần</h3>${showScore?PART_ORDER.filter(t=>by[t]).map(t=>{ const e=sum(by[t].map(d=>d.pts)), m=sum(by[t].map(d=>d.max)); return `<div style="margin:8px 0"><div class="row"><span class="grow">${QT_NAME[t]} (${by[t].length} câu)</span><b>${fmtNum(e)} / ${fmtNum(m)}</b></div><div class="bar"><i style="width:${m?e/m*100:0}%"></i></div></div>`; }).join(''):'<p class="muted">Giáo viên chưa công bố điểm.</p>'}
    <small class="muted">Mã đề ${s.variant||'gốc'} · Nộp lúc ${fmtDate(s.submittedAt)} · Thời gian làm ${Math.round((s.submittedAt-s.startedAt)/60000)} phút</small></div></div>
    ${showAns&&ex?`<div style="margin-top:14px"><button class="btn pri" id="rsView">📖 Xem đáp án & lời giải chi tiết</button></div>`:''}`;
  const b=$('#rsView',el); if(b) b.onclick=()=>submissionView(s,{teacher:isT});
});
