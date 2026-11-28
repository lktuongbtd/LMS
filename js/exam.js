/* LMS LKT – exam.js: ma trận, đặc tả, tạo đề, trộn đề, chấm điểm, xuất Word */
'use strict';
const LETTER='ABCD';
const Exam = {
  struct(subject){ return (SUBJECTS[subject]||{struct:[{type:'mcq',n:20,pt:.5}]}).struct; },
  ptOf(subject,type){ const p=this.struct(subject).find(x=>x.type===type); if(p&&p.pt) return p.pt; return {mcq:.25,tf:1,short:.5,essay:1}[type]; },
  /* ---------- Thành phần đề ---------- */
  parts(exam){ const qs=exam.questionIds.map(id=>DB.get('questions',id)).filter(Boolean); const g=groupBy(qs,q=>q.type);
    return PART_ORDER.filter(t=>g[t]).map(t=>({type:t,ids:g[t].map(q=>q.id)})); },
  items(exam,variant){
    const out=[]; const seed=variant?variant.seed:exam.id;
    const parts=this.parts(exam);
    parts.forEach((p,pi)=>{
      const ids = variant&&variant.order&&variant.order[p.type] ? variant.order[p.type].filter(id=>p.ids.includes(id)) : p.ids;
      ids.forEach((id,i)=>{ const raw=DB.get('questions',id); if(!raw) return;
        const q=Param.instantiate(raw,seed);
        const perm = variant&&variant.opt&&variant.opt[id] ? variant.opt[id] : [0,1,2,3];
        out.push({q,type:p.type,part:pi,no:i+1,perm}); });
    });
    return out;
  },
  /* ---------- Trộn đề ---------- */
  mix(exam,n,{shuffleQ=true,shuffleOpt=true,shuffleTf=false,diffNumbers=true,startCode=101}={}){
    const parts=this.parts(exam); exam.variants=[];
    for(let k=0;k<n;k++){
      const code=String(startCode+k); const rnd=seededRandom(exam.id+code+Date.now()); const v={code,seed:diffNumbers?(exam.id+'-'+code):exam.id,order:{},opt:{}};
      parts.forEach(p=>{ v.order[p.type]= shuffleQ?shuffle(p.ids,rnd):[...p.ids];
        p.ids.forEach(id=>{ const q=DB.get('questions',id); if(q.type==='mcq'&&shuffleOpt) v.opt[id]=shuffle([0,1,2,3],rnd); if(q.type==='tf'&&shuffleTf) v.opt[id]=shuffle([0,1,2,3],rnd); }); });
      exam.variants.push(v);
    }
    exam.mixedAt=Date.now(); return exam.variants;
  },
  pickVariant(exam,studentId){ if(!exam.variants||!exam.variants.length) return null; const r=seededRandom(studentId+exam.id)(); return exam.variants[Math.floor(r*exam.variants.length)]; },
  /* ---------- Chấm ---------- */
  normShort(s){ return String(s??'').trim().replace(/\s+/g,'').replace(/,/g,'.').replace(/^\+/,'').toLowerCase(); },
  shortOk(got,ans){ const a=this.normShort(got), b=this.normShort(ans); if(!a) return false; const na=parseFloat(a), nb=parseFloat(b);
    if(/^-?\d*\.?\d+$/.test(a)&&/^-?\d*\.?\d+$/.test(b)) return Math.abs(na-nb)<1e-9; return a===b; },
  TF_LADDER:[0,.1,.25,.5,1],
  grade(exam,variant,answers,manual={}){
    const items=this.items(exam,variant); let earned=0,max=0,pending=false; const detail=[];
    items.forEach(it=>{ const q=it.q, a=answers[q.id]; let pts=0, mx=q.type==='essay'?(q.points||this.ptOf(exam.subject,'essay')):this.ptOf(exam.subject,q.type), ok=false, nOk=null;
      if(q.type==='mcq'){ ok = a!=null && +a===+q.answer; pts=ok?mx:0; }
      else if(q.type==='tf'){ nOk=[0,1,2,3].filter(i=>Array.isArray(a)&&a[i]!=null&&!!a[i]===!!q.answer[i]).length; pts=mx*this.TF_LADDER[nOk]; ok=nOk===4; }
      else if(q.type==='short'){ ok=this.shortOk(a,q.answer); pts=ok?mx:0; }
      else { if(manual[q.id]!=null){ pts=Math.min(mx,+manual[q.id]||0); } else pending=true; ok=null; }
      earned+=pts; max+=mx; detail.push({qid:q.id,type:q.type,ok,nOk,pts:Math.round(pts*1000)/1000,max:mx}); });
    const score = max? Math.round(earned/max*10*100)/100 : 0;
    return {score,earned:Math.round(earned*100)/100,max,detail,pending};
  },
  /* ---------- Ma trận (v3: theo chương – bài, 4 phần, chọn câu cụ thể, mẫu CV 7991) ---------- */
  typesOf(subject){ return this.struct(subject).map(p=>p.type); },
  emptyCells(){ const c={}; PART_ORDER.forEach(t=>{ c[t]={NB:0,TH:0,VD:0}; }); return c; },
  ptMx(mx,t){ return (mx.pt&&mx.pt[t]!=null&&mx.pt[t]!=='')?+mx.pt[t]:(t==='essay'?1:this.ptOf(mx.subject,t)); },
  target(mx,t){ const p=this.struct(mx.subject).find(x=>x.type===t); return p?p.n:0; },
  rowLabel(r){ return r.lesson||'(Cả chương)'; },
  defaultMatrix(subject,grade,name,{byLesson=false}={}){
    const st=this.struct(subject);
    let chs=topicsOf(subject,grade); if(!chs.length) chs=['Chủ đề 1','Chủ đề 2','Chủ đề 3'];
    const bank=DB.all('questions').filter(q=>q.subject===subject&&+q.grade===+grade);
    let rows=[]; chs.forEach(c=>{ const ls=lessonsOf(subject,grade,c); if(byLesson&&ls.length) ls.forEach(l=>rows.push({topic:c,lesson:l,c:this.emptyCells(),spec:{},pick:{}})); else rows.push({topic:c,lesson:'',c:this.emptyCells(),spec:{},pick:{}}); });
    const mx={subject,grade:+grade,rows}; this.autoFill(mx);
    if(byLesson) rows=rows.filter(r=>sum(PART_ORDER.flatMap(t=>MX_LEVELS.map(l=>r.c[t][l])))>0);
    return {id:uid('mx'),name:name||('Ma trận '+subjName(subject)+' '+grade),subject,grade:+grade,duration:(SUBJECTS[subject]||{}).duration||45,rows,pt:{},createdAt:Date.now()};
  },
  autoFill(mx){ const st=this.struct(mx.subject), rows=mx.rows; if(!rows.length) return mx; rows.forEach(r=>{ r.c=this.emptyCells(); });
    const bank=DB.all('questions').filter(q=>q.subject===mx.subject&&+q.grade===+mx.grade);
    const share={mcq:[.55,.35,.10],tf:[.25,.5,.25],short:[0,.35,.65],essay:[.34,.33,.33]};
    st.forEach(p=>{ const sh=share[p.type]; const raw=sh.map(x=>x*p.n); const cnt=raw.map(Math.floor); let rest=p.n-sum(cnt);
      raw.map((x,i)=>[x-Math.floor(x),i]).sort((a,b)=>b[0]-a[0]).forEach(([_,i])=>{ if(rest>0){cnt[i]++;rest--;} });
      if(p.type==='essay'&&mx.subject==='van'){ cnt.splice(0,3,1,0,2); }
      const has=(r,lv)=>bank.some(q=>q.topic===r.topic&&(!r.lesson||q.lesson===r.lesson)&&q.type===p.type&&(!lv||q.level===lv||(lv==='VD'&&q.level==='VDC')));
      MX_LEVELS.forEach((lv,li)=>{ let pool=rows.filter(r=>has(r,lv)); if(!pool.length) pool=rows.filter(r=>has(r)); if(!pool.length) pool=rows;
        for(let k=0;k<cnt[li];k++){ pool[(k*3+li)%pool.length].c[p.type][lv]++; } }); });
    return mx; },
  mxCount(mx,type,lv){ return sum(mx.rows.map(r=>((r.c[type]||{})[lv])||0)); },
  mxTypes(mx){ const t=new Set(this.typesOf(mx.subject)); mx.rows.forEach(r=>Object.keys(r.c).forEach(k=>{ if(MX_LEVELS.some(l=>(r.c[k]||{})[l])) t.add(k); })); return PART_ORDER.filter(x=>t.has(x)); },
  pool(){ return (typeof visibleQuestions==='function'&&Auth.user)?visibleQuestions():DB.all('questions'); },
  lvOk(q,lv){ return q.level===lv||(lv==='VD'&&q.level==='VDC'); },
  candidates(mx,r,t,lv,{bank=''}={}){ return this.pool().filter(q=>q.subject===mx.subject&&+q.grade===+mx.grade&&(!bank||(bank==='_sample'?!q.bankId:q.bankId===bank))&&q.topic===r.topic&&(!r.lesson||q.lesson===r.lesson)&&q.type===t&&(!lv||this.lvOk(q,lv))); },
  buildFromMatrix(mx,{autoClone=true,bank=''}={}){
    const used=new Set(), ids={mcq:[],tf:[],short:[],essay:[]}, newQ=[], shortages=[];
    const all=this.pool().filter(q=>q.subject===mx.subject&&+q.grade===+mx.grade&&(!bank||(bank==='_sample'?!q.bankId:q.bankId===bank)));
    const inRow=(q,r)=>q.topic===r.topic&&(!r.lesson||q.lesson===r.lesson);
    mx.rows.forEach(r=>{ PART_ORDER.forEach(t=>MX_LEVELS.forEach(lv=>{
      const need=((r.c[t]||{})[lv])||0; if(!need) return;
      const take=[]; ((r.pick||{})[t+'_'+lv]||[]).forEach(id=>{ const q=DB.get('questions',id); if(q&&!used.has(id)&&take.length<need){ take.push(q); used.add(id); } });
      let cand=shuffle(all.filter(q=>inRow(q,r)&&q.type===t&&this.lvOk(q,lv)&&!used.has(q.id)));
      cand.slice(0,need-take.length).forEach(q=>{ take.push(q); used.add(q.id); });
      let miss=need-take.length;
      if(miss>0&&autoClone){ const par=all.filter(q=>inRow(q,r)&&q.type===t&&this.lvOk(q,lv)&&Param.has(q));
        let guard=0; while(miss>0&&par.length&&guard++<60){ const cl=Param.clones(par[guard%par.length],1)[0]; if(!cl) break; newQ.push(cl); take.push(cl); used.add(cl.id); miss--; } }
      if(miss>0&&r.lesson){ const alt=shuffle(all.filter(q=>q.topic===r.topic&&q.type===t&&this.lvOk(q,lv)&&!used.has(q.id))).slice(0,miss); alt.forEach(q=>{take.push(q);used.add(q.id);}); if(alt.length) shortages.push({topic:r.topic+' › '+r.lesson,type:t,level:lv,need:miss,got:alt.length,note:'lấy câu bài khác cùng chương'}); miss-=alt.length; }
      if(miss>0){ const alt=shuffle(all.filter(q=>q.topic===r.topic&&q.type===t&&!used.has(q.id))).slice(0,miss); alt.forEach(q=>{take.push(q);used.add(q.id);}); if(alt.length) shortages.push({topic:r.topic,type:t,level:lv,need:miss,got:alt.length,note:'thay bằng câu khác mức độ'}); miss-=alt.length; }
      if(miss>0) shortages.push({topic:r.topic+(r.lesson?' › '+r.lesson:''),type:t,level:lv,need:miss,got:0,note:'thiếu câu hỏi'});
      ids[t].push(...take.map(q=>q.id));
    })); });
    return {questionIds:PART_ORDER.flatMap(t=>ids[t]),newQuestions:newQ,shortages};
  },
  matrixFromExam(exam){
    const qs=exam.questionIds.map(id=>DB.get('questions',id)).filter(Boolean);
    const numbers={}; const items=this.items(exam,null); items.forEach(it=>{ numbers[it.q.id]=(it.type==='mcq'?'I':it.type==='tf'?'II':it.type==='short'?'III':'IV')+'.'+it.no; });
    const key=q=>(q.topic||'(Chưa phân chủ đề)')+'¦'+(q.lesson||''); const keys=[...new Set(qs.map(key))];
    const rows=keys.map(k=>{ const [topic,lesson]=k.split('¦'); const r={topic,lesson,c:this.emptyCells(),spec:{},nums:{}}; qs.filter(q=>key(q)===k).forEach(q=>{ const lv=q.level==='VDC'?'VD':q.level; r.c[q.type][lv]++; const kk=q.type+'_'+lv; (r.nums[kk]=r.nums[kk]||[]).push(numbers[q.id]); }); return r; });
    rows.sort((a,b)=>{ const ch=topicsOf(exam.subject,exam.grade); return (ch.indexOf(a.topic)-ch.indexOf(b.topic))||String(a.lesson).localeCompare(String(b.lesson),'vi',{numeric:true}); });
    const essay=qs.filter(q=>q.type==='essay'); const pt={}; if(essay.length) pt.essay=sum(essay.map(q=>q.points||1))/essay.length;
    return {id:uid('mx'),name:'Ma trận của đề: '+exam.title,subject:exam.subject,grade:exam.grade,duration:exam.duration,rows,pt,fromExam:exam.id};
  },
  autoSpec(subject,topic,lv,lesson){
    const what=String(lesson||topic||'').replace(/^(Bài|Unit|Chương|Phần)\s*[\dIVX]+\.\s*/,''); const w=what.charAt(0).toLowerCase()+what.slice(1);
    if(subject==='anh') return {NB:`Nhận biết được từ vựng, cấu trúc, âm liên quan đến ${what} trong ngữ cảnh quen thuộc.`,TH:`Hiểu và sử dụng đúng kiến thức ${what} trong câu, đoạn hội thoại/đoạn văn.`,VD:`Vận dụng kiến thức ${what} để xử lí tình huống giao tiếp, đọc hiểu, viết trong ngữ cảnh mới.`}[lv];
    if(subject==='van') return {NB:`Xác định được thông tin, phương thức biểu đạt, biện pháp tu từ, đặc điểm thể loại (${what}).`,TH:`Hiểu, lí giải được nội dung, ý nghĩa, tác dụng của chi tiết, hình ảnh (${what}).`,VD:`Viết được đoạn/bài văn nghị luận đáp ứng yêu cầu, lập luận chặt chẽ, thuyết phục (${what}).`}[lv];
    return {NB:`Nhận biết được khái niệm, định nghĩa, tính chất, công thức cơ bản về ${w}.`,TH:`Hiểu và thực hiện được các bước giải bài toán/tình huống cơ bản, trực tiếp về ${w}.`,VD:`Vận dụng được kiến thức về ${w} để giải quyết vấn đề tổng hợp, gắn với thực tiễn.`}[lv];
  },
  specText(mx,r,lv){ return (r.spec&&r.spec[lv])||this.autoSpec(mx.subject,r.topic,lv,r.lesson); },
  /* ----- Tổng hợp số liệu ----- */
  mxStats(mx){ const T=PART_ORDER; const n={}, p={}; T.forEach(t=>{ n[t]={}; MX_LEVELS.forEach(l=>n[t][l]=this.mxCount(mx,t,l)); n[t].all=sum(MX_LEVELS.map(l=>n[t][l])); p[t]=n[t].all*this.ptMx(mx,t); });
    const lvN={}, lvP={}; MX_LEVELS.forEach(l=>{ lvN[l]=sum(T.map(t=>n[t][l])); lvP[l]=sum(T.map(t=>n[t][l]*this.ptMx(mx,t))); });
    const totalN=sum(T.map(t=>n[t].all)), totalP=sum(T.map(t=>p[t])); return {n,p,lvN,lvP,totalN,totalP}; },
  /* ----- Ma trận theo mẫu Công văn 7991/BGDĐT-GDTrH ----- */
  matrixHtml(mx){ return this.matrix7991Html(mx); },
  specHtml(mx){ return this.spec7991Html(mx); },
  groupRows(mx){ const out=[]; mx.rows.forEach((r,i)=>{ let g=out.find(x=>x.topic===r.topic); if(!g){ g={topic:r.topic,rows:[]}; out.push(g); } g.rows.push({...r,_i:i}); }); return out; },
  hdr7991(first,extra){ const L=['Biết','Hiểu','VD'];
    return `<tr><th rowspan="4" style="width:3%">TT</th><th rowspan="4" style="width:${first?9:12}%">Chủ đề/Chương</th><th rowspan="4" style="width:${first?12:15}%">Nội dung/đơn vị kiến thức</th>${first||''}<th colspan="12">${extra?'Số câu hỏi ở các mức độ đánh giá':'Mức độ đánh giá'}</th>${extra?'':`<th colspan="3" rowspan="3">Tổng</th><th rowspan="4" style="width:6%">Tỉ lệ %<br>điểm</th>`}</tr>
      <tr><th colspan="9">TNKQ</th><th colspan="3" rowspan="2">Tự luận</th></tr>
      <tr><th colspan="3">Nhiều lựa chọn</th><th colspan="3">“Đúng – Sai”</th><th colspan="3">Trả lời ngắn</th></tr>
      <tr>${Array.from({length:extra?4:5},()=>L.map(l=>`<th>${l}</th>`).join('')).join('')}</tr>`; },
  matrix7991Html(mx){ const S=this.mxStats(mx), tot=S.totalP||1; let tt=0;
    const body=this.groupRows(mx).map(g=>{ tt++; return g.rows.map((r,k)=>{ let rp=0; const lvc={NB:0,TH:0,VD:0};
      const cells=PART_ORDER.map(t=>MX_LEVELS.map(l=>{ const v=((r.c[t]||{})[l])||0; lvc[l]+=v; rp+=v*this.ptMx(mx,t); return `<td>${v||''}</td>`; }).join('')).join('');
      return `<tr>${k===0?`<td rowspan="${g.rows.length}">${tt}</td><td rowspan="${g.rows.length}" style="text-align:left">${esc(chapShort(g.topic)||g.topic)}</td>`:''}<td style="text-align:left">${esc(r.lesson?r.lesson:'Toàn chương')}</td>${cells}${MX_LEVELS.map(l=>`<td><b>${lvc[l]||''}</b></td>`).join('')}<td>${rp?fmtNum(rp/tot*100,1)+'%':''}</td></tr>`; }).join(''); }).join('');
    const nRow=PART_ORDER.map(t=>MX_LEVELS.map(l=>`<td><b>${S.n[t][l]||''}</b></td>`).join('')).join('')+MX_LEVELS.map(l=>`<td><b>${S.lvN[l]}</b></td>`).join('');
    const pRow=PART_ORDER.map(t=>`<td colspan="3"><b>${S.p[t]?fmtNum(S.p[t]):''}</b></td>`).join('')+MX_LEVELS.map(l=>`<td><b>${fmtNum(S.lvP[l])}</b></td>`).join('');
    const cRow=PART_ORDER.map(t=>`<td colspan="3"><b>${S.p[t]?fmtNum(S.p[t]/tot*100,1)+'%':''}</b></td>`).join('')+MX_LEVELS.map(l=>`<td><b>${fmtNum(S.lvP[l]/tot*100,1)}%</b></td>`).join('');
    return `<table class="tbl mx center m7991" border="1"><thead>${this.hdr7991()}</thead><tbody>${body}
      <tr><td colspan="3" style="text-align:left"><b>Tổng số câu</b></td>${nRow}<td><b>${S.totalN}</b></td></tr>
      <tr><td colspan="3" style="text-align:left"><b>Tổng số điểm</b></td>${pRow}<td><b>${fmtNum(S.totalP)}</b></td></tr>
      <tr><td colspan="3" style="text-align:left"><b>Tỉ lệ %</b></td>${cRow}<td><b>100%</b></td></tr></tbody></table>
      <p style="font-size:10.5pt"><i>Ghi chú:</i> Phần I: mỗi câu ${fmtNum(this.ptMx(mx,'mcq'))} điểm; Phần II: mỗi câu tối đa ${fmtNum(this.ptMx(mx,'tf'))} điểm (đúng 1 ý 0,1đ; 2 ý 0,25đ; 3 ý 0,5đ; 4 ý 1đ – theo tỉ lệ điểm câu); Phần III: mỗi câu ${fmtNum(this.ptMx(mx,'short'))} điểm${S.n.essay.all?`; Tự luận: trung bình ${fmtNum(this.ptMx(mx,'essay'))} điểm/câu`:''}. Tỉ lệ mức độ: Biết ${fmtNum(S.lvP.NB/tot*100,1)}% – Hiểu ${fmtNum(S.lvP.TH/tot*100,1)}% – Vận dụng ${fmtNum(S.lvP.VD/tot*100,1)}%.</p>`; },
  spec7991Html(mx){ const S=this.mxStats(mx); let tt=0;
    const body=this.groupRows(mx).map(g=>{ tt++; return g.rows.map((r,k)=>{ const lvs=MX_LEVELS.filter(l=>PART_ORDER.some(t=>((r.c[t]||{})[l])||0)); const yc=(lvs.length?lvs:MX_LEVELS).map(l=>`<p><b>${LV_NAME[l].replace('Nhận biết','Biết').replace('Thông hiểu','Hiểu')}:</b> ${esc(this.specText(mx,r,l))}</p>`).join('');
      const cells=PART_ORDER.map(t=>MX_LEVELS.map(l=>{ const v=((r.c[t]||{})[l])||0; const nums=r.nums&&r.nums[t+'_'+l]; return `<td>${v?(nums?`<small>${nums.map(x=>'C'+x.split('.')[1]).join(', ')}</small>`:v):''}</td>`; }).join('')).join('');
      return `<tr>${k===0?`<td rowspan="${g.rows.length}">${tt}</td><td rowspan="${g.rows.length}" style="text-align:left">${esc(chapShort(g.topic)||g.topic)}</td>`:''}<td style="text-align:left">${esc(r.lesson||'Toàn chương')}</td><td style="text-align:left">${yc}</td>${cells}</tr>`; }).join(''); }).join('');
    const nRow=PART_ORDER.map(t=>MX_LEVELS.map(l=>`<td><b>${S.n[t][l]||''}</b></td>`).join('')).join('');
    const pRow=PART_ORDER.map(t=>`<td colspan="3"><b>${S.p[t]?fmtNum(S.p[t]):''}</b></td>`).join('');
    return `<table class="tbl mx center m7991" border="1"><thead>${this.hdr7991('<th rowspan="4" style="width:28%">Yêu cầu cần đạt</th>',1)}</thead><tbody>${body}
      <tr><td colspan="4" style="text-align:left"><b>Tổng số câu</b></td>${nRow}</tr><tr><td colspan="4" style="text-align:left"><b>Tổng số điểm</b></td>${pRow}</tr>
      <tr><td colspan="4" style="text-align:left"><b>Tỉ lệ %</b></td>${PART_ORDER.map(t=>`<td colspan="3"><b>${S.p[t]?fmtNum(S.p[t]/(S.totalP||1)*100,1)+'%':''}</b></td>`).join('')}</tr></tbody></table>
      ${mx.rows.some(r=>r.nums)?'<p style="font-size:10.5pt"><i>Ghi chú:</i> Cột số câu ghi số thứ tự câu trong đề (C1, C2…) theo từng phần.</p>':''}`; },
  docHeader7991(mx,kind){ const H=Object.assign({},this.defaultHeader(),DB.data.settings.header||{});
    return `<table class="nb" style="width:100%"><tr><td class="c" style="width:40%">${esc(H.so)}<br><b>${esc(H.truong)}</b><br>────────</td><td class="c"><b>${kind}</b><br><b>${esc(H.kythi).toUpperCase()}${H.namhoc?' – NĂM HỌC '+esc(H.namhoc):''}</b><br><b>MÔN: ${esc(subjName(mx.subject)).toUpperCase()} – LỚP ${mx.grade}</b><br><i>Thời gian làm bài: ${mx.duration} phút</i></td></tr></table>`; },
  mxDocHtml(mx,{matrix=true,spec=true}={}){ let h='';
    if(matrix) h+=`<section data-orient="landscape">${this.docHeader7991(mx,'KHUNG MA TRẬN ĐỀ KIỂM TRA')}<p></p>${this.matrix7991Html(mx)}</section>`;
    if(spec) h+=`<section data-orient="landscape">${matrix?'<br style="page-break-before:always">':''}${this.docHeader7991(mx,'BẢN ĐẶC TẢ ĐỀ KIỂM TRA')}<p></p>${this.spec7991Html(mx)}</section>`;
    return h; },
  /* ---------- HTML đề thi ---------- */
  visLen(s){ return String(s).replace(/<[^>]+>/g,'').replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g,'$1/$2').replace(/\\[a-zA-Z]+/g,'x').replace(/[{}$^_]/g,'').replace(/&\w+;/g,'x').length; },
  optCols(opts){ const m=Math.max(...opts.map(o=>this.visLen(o))); return m<=13?4:m<=32?2:1; },
  /* ---------- Kiểu trình bày đề (v3) ---------- */
  STYLE_DEF:{form:'bgd',font:'tnr',size:12,cQ:'#000000',cO:'#000000',cA:'#1F3A93',ansU:true},
  style(over){ return Object.assign({},this.STYLE_DEF,DB.data.settings.examStyle||{},over||{}); },
  solBox(it,ST){ const q=it.q, acc=ST.cA.replace('#','');
    let k=''; if(q.type==='mcq') k=`<b>Chọn ${LETTER[it.perm.indexOf(q.answer)]}.</b> `; else if(q.type==='tf') k='<b>'+it.perm.map((si,j)=>'abcd'[j]+') '+(q.answer[si]?'Đúng':'Sai')).join('; ')+'.</b> '; else if(q.type==='short') k=`<b>Đáp số: ${q.answer}.</b> `;
    const body=(q.explain||(q.type==='essay'?q.answer:''))||'';
    return `<p class="solbox" data-c="${acc}" data-bg="F5F3FF" style="border-left:4px solid ${ST.cA};background:#f5f3ff;padding:4px 10px"><b style="color:${ST.cA}">Lời giải.</b> ${k}${String(body).replace(/\n/g,'<br>')}</p>`; },
  qText(it,{withAnswer=false,fig=true,style,solution=false}={}){
    const q=it.q, ST=style||this.style(); const cq=ST.cQ, co=ST.cO;
    const lab=`<b style="color:${cq}">Câu ${it.no}.</b>`;
    let h=`<p class="qp">${lab} ${q.content.replace(/\n/g,'<br>')}${q.type==='essay'&&q.points?` <i>(${fmtNum(q.points)} điểm)</i>`:''}</p>`;
    if(fig&&q.figure) h+=`<p class="c qfigp">${Fig.render(q.figure)}</p>`;
    if(q.type==='mcq'){ const o=it.perm.map((oi,k)=>{ const right=withAnswer&&oi===q.answer; return `<td><b style="color:${right?'#C00000':co}">${LETTER[k]}.</b> ${right&&ST.ansU?'<u>':''}${q.options[oi]}${right&&ST.ansU?'</u>':''}</td>`; });
      const n=this.optCols(q.options); const rows=[]; for(let i=0;i<4;i+=n) rows.push(`<tr>${o.slice(i,i+n).join('')}</tr>`);
      h+=`<table class="nb opt${n}">${rows.join('')}</table>`; }
    else if(q.type==='tf'){ h+=it.perm.map((si,k)=>`<p style="margin-left:14pt"><b style="color:${co}">${'abcd'[k]})</b> ${q.statements[si]}${withAnswer&&!solution?` <b style="color:#C00000">[${q.answer[si]?'Đ':'S'}]</b>`:''}</p>`).join(''); }
    else if(withAnswer&&!solution){ h+=`<p><i>Đáp án:</i> <b>${q.answer}</b></p>`; }
    if(solution) h+=this.solBox(it,ST);
    else if(withAnswer&&q.explain) h+=`<p><i>Lời giải:</i> ${q.explain}</p>`;
    return h;
  },
  defaultHeader(){ return {so:'SỞ GIÁO DỤC VÀ ĐÀO TẠO AN GIANG',truong:String(DB.data.settings.schoolName||CFG.schoolName||'').toUpperCase(),kythi:'ĐỀ KIỂM TRA',namhoc:(typeof schoolYear==='function'?schoolYear():''),loai:'ĐỀ CHÍNH THỨC',ghichu:'',chantrang:'Thí sinh không được sử dụng tài liệu. Cán bộ coi thi không giải thích gì thêm.',diem:false,sbd:true,phieu:false,size:12}; },
  header(exam,over){ return Object.assign({},this.defaultHeader(),DB.data.settings.header||{},exam.header||{},over||{}); },
  headerHtml(exam,variant,H,nq,ST){ ST=ST||this.style(); const acc=ST.cA;
    const box=t=>`<span style="border:1.2pt solid #000;padding:2pt 8pt;font-weight:bold">${esc(t)}</span>`;
    const code=variant?variant.code:'000';
    const info=`${H.diem?`<table border="1" style="width:100%;margin:6pt 0"><tr><td style="width:22%;height:46pt;vertical-align:top"><b>Điểm</b></td><td style="vertical-align:top"><b>Lời phê của giáo viên</b></td></tr></table>`:''}
      <table class="nb" style="width:100%;margin:4pt 0 8pt"><tr><td>Họ, tên thí sinh: ..............................................<br>${H.sbd?'Số báo danh: ................................':'Lớp: ................................'}</td><td style="text-align:right;vertical-align:middle">${box('Mã đề thi: '+code)}</td></tr></table>`;
    if(ST.form==='modern') return `<table border="1" style="width:100%"><tr><td class="c" style="width:42%;vertical-align:middle;background:${acc};color:#ffffff"><span style="color:#FFFFFF">${esc(H.so)}</span><br><b style="color:#FFFFFF">${esc(H.truong)}</b><br><i style="color:#FFFFFF">${esc(H.ghichu||`(Đề có ${nq} câu)`)}</i></td>
      <td class="c" style="vertical-align:middle"><b style="color:${acc}">${esc(H.kythi).toUpperCase()}</b><br>${H.namhoc?`<b>NĂM HỌC ${esc(H.namhoc)}</b><br>`:''}<b>Môn: ${esc(subjName(exam.subject)).toUpperCase()} – Lớp ${exam.grade}</b><br><i>Thời gian làm bài: ${exam.duration} phút</i>${H.loai?`<br><b style="color:${acc}">${esc(H.loai)}</b>`:''}</td></tr></table>`+info;
    if(ST.form==='latex') return `<table class="nb hdr" style="width:100%"><tr><td class="c" style="width:44%;vertical-align:top">${esc(H.so)}<br><b>${esc(H.truong)}</b><br>${H.loai?box(H.loai)+'<br>':''}<i>${esc(H.ghichu||`(Đề có ${nq} câu)`)}</i></td>
      <td class="c" style="vertical-align:top"><b>${esc(H.kythi).toUpperCase()}</b><br>${H.namhoc?`<b>NĂM HỌC ${esc(H.namhoc)}</b><br>`:''}<b>Môn: ${esc(subjName(exam.subject)).toUpperCase()} – Lớp ${exam.grade}</b><br><i>Thời gian làm bài: ${exam.duration} phút, không kể thời gian phát đề</i></td></tr></table><p class="c" style="color:${acc}">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>`+info;
    return `<table class="nb hdr" style="width:100%"><tr><td class="c" style="width:44%;vertical-align:top">${esc(H.so)}<br><b>${esc(H.truong)}</b><br><span style="letter-spacing:-1pt">────────</span><br>${H.loai?box(H.loai)+'<br>':''}<i>${esc(H.ghichu||`(Đề có ${nq} câu)`)}</i></td>
      <td class="c" style="vertical-align:top"><b>${esc(H.kythi).toUpperCase()}</b><br>${H.namhoc?`<b>NĂM HỌC ${esc(H.namhoc)}</b><br>`:''}<b>Môn: ${esc(subjName(exam.subject)).toUpperCase()} – Lớp ${exam.grade}</b><br><i>Thời gian làm bài: ${exam.duration} phút, không kể thời gian phát đề</i></td></tr></table>`+info; },
  partTitle(t,n,pi,multi,ST){ const txt=multi?PART_TITLE[t](n).replace(/^PHẦN [IV]+/,'PHẦN '+ROMAN[pi]):PART_TITLE[t](n); const m=txt.match(/^(PHẦN [IV]+\.?)(.*)$/);
    if(ST.form==='modern') return `<p class="part solbox" data-c="${ST.cA.replace('#','')}" data-bg="EEF2FF" style="border-left:4px solid ${ST.cA};background:#eef2ff;padding:3px 8px"><b style="color:${ST.cA}">${m?m[1]:''}</b><b>${m?m[2]:txt}</b></p>`;
    if(ST.form==='latex') return `<p class="part"><b style="color:${ST.cA}">${m?m[1]:''}</b><b>${m?m[2]:txt}</b></p>`;
    return `<p class="part"><b>${txt}</b></p>`; },
  examHtml(exam,variant,{withAnswer=false,header,style,solution=false}={}){
    const ST=this.style(style); const items=this.items(exam,variant); const g=groupBy(items,it=>it.type); const H=this.header(exam,header);
    let h=this.headerHtml(exam,variant,H,items.length,ST);
    const parts=PART_ORDER.filter(t=>g[t]); const multi=parts.length>1||parts[0]!=='essay';
    parts.forEach((t,pi)=>{ h+=this.partTitle(t,g[t].length,pi,multi,ST)+g[t].map(it=>this.qText(it,{withAnswer,style:ST,solution})).join(''); });
    h+=`<p class="c" style="margin-top:10pt"><b>------ HẾT ------</b></p>${H.chantrang&&!solution?`<p class="c"><i>${esc(H.chantrang)}</i></p>`:''}`;
    if(H.phieu&&!withAnswer&&!solution) h+='<br style="page-break-before:always">'+this.answerSheetHtml(exam,variant,H);
    return h;
  },
  solutionHtml(exam,variant,{header,style}={}){ const ST=this.style(style); const H=this.header(exam,header); const items=this.items(exam,variant); const g=groupBy(items,it=>it.type);
    const parts=PART_ORDER.filter(t=>g[t]); const multi=parts.length>1||parts[0]!=='essay';
    let h=`<h1 style="color:${ST.cA}">HƯỚNG DẪN GIẢI CHI TIẾT</h1><p class="c"><b>${esc(H.kythi).toUpperCase()} – MÔN ${esc(subjName(exam.subject)).toUpperCase()} ${exam.grade}</b> – Mã đề ${variant?variant.code:'000'}</p>`;
    h+=this.answerKeyHtml(exam,[variant],{style:ST,compact:true});
    parts.forEach((t,pi)=>{ h+=this.partTitle(t,g[t].length,pi,multi,ST)+g[t].map(it=>this.qText(it,{withAnswer:true,style:ST,solution:true})).join(''); });
    return h; },
  answerSheetHtml(exam,variant,H){
    const items=this.items(exam,variant); const g=groupBy(items,it=>it.type); H=H||this.header(exam);
    const CIR={A:'Ⓐ',B:'Ⓑ',C:'Ⓒ',D:'Ⓓ','':'○'}; const bub=t=>`<span style="font-size:14pt;letter-spacing:3pt">${CIR[t]||t}</span>`;
    let h=`<h2 class="c" style="text-align:center">PHIẾU TRẢ LỜI – ${esc(H.kythi).toUpperCase()}</h2><p>Họ tên: ........................................................ Lớp: ........ &nbsp; Mã đề: <b>${variant?variant.code:'000'}</b></p>`;
    if(g.mcq){ const cols=Math.ceil(g.mcq.length/10); h+=`<p><b>PHẦN I.</b> Tô kín một ô tròn tương ứng với phương án đúng.</p><table border="1" style="width:100%"><tr>`; for(let c=0;c<cols;c++){ h+=`<td style="vertical-align:top">`+g.mcq.slice(c*10,c*10+10).map(it=>`<div style="margin:2pt 0"><b style="display:inline-block;width:18pt">${it.no}</b>${LETTER.split('').map(bub).join('')}</div>`).join('')+'</td>'; } h+='</tr></table>'; }
    if(g.tf) h+=`<p><b>PHẦN II.</b> Đánh dấu Đúng (Đ) hoặc Sai (S) cho từng ý.</p><table border="1" style="width:100%"><tr><th></th>${g.tf.map(it=>`<th colspan="2">Câu ${it.no}</th>`).join('')}</tr><tr><td></td>${g.tf.map(()=>'<td class="c">Đ</td><td class="c">S</td>').join('')}</tr>${'abcd'.split('').map(x=>`<tr><td class="c">${x})</td>${g.tf.map(()=>`<td class="c">${bub('')}</td><td class="c">${bub('')}</td>`).join('')}</tr>`).join('')}</table>`;
    if(g.short) h+=`<p><b>PHẦN III.</b> Ghi đáp số vào ô (mỗi ô một kí tự: chữ số, dấu "−", dấu ",").</p><table border="1" style="width:100%"><tr>${g.short.map(it=>`<th>Câu ${it.no}</th>`).join('')}</tr><tr>${g.short.map(()=>`<td class="c" style="height:28pt">☐☐☐☐</td>`).join('')}</tr></table>`;
    if(g.essay) h+=`<p><b>PHẦN TỰ LUẬN</b></p>`+Array.from({length:14},()=>'<p>......................................................................................................................................................</p>').join('');
    return h; },
  answerKeyHtml(exam,variants,{style,compact=false}={}){ const ST=this.style(style);
    const vs=variants&&variants.length&&variants[0]!==undefined?variants:[null]; const hb=`style="background:${ST.form==='bgd'?'#E8ECF7':ST.cA};color:${ST.form==='bgd'?'#000':'#fff'}"`;
    const chunk=(arr,n)=>{ const o=[]; for(let i=0;i<arr.length;i+=n) o.push(arr.slice(i,i+n)); return o; };
    return vs.map(v=>{ const items=this.items(exam,v); const g=groupBy(items,it=>it.type); let h=compact?'':`<h3 style="color:${ST.cA}">Mã đề ${v?v.code:'000'}</h3>`;
      if(g.mcq){ h+=`<p><b>Phần I</b> (mỗi câu ${fmtNum(this.ptOf(exam.subject,'mcq'))} điểm)</p>`; chunk(g.mcq,12).forEach(c=>{ h+=`<table border="1" class="center" style="width:100%"><tr><th ${hb}>Câu</th>${c.map(it=>`<th ${hb}>${it.no}</th>`).join('')}</tr><tr><th>Đáp án</th>${c.map(it=>`<td class="c"><b>${LETTER[it.perm.indexOf(it.q.answer)]}</b></td>`).join('')}</tr></table>`; }); }
      if(g.tf) h+=`<p><b>Phần II</b> (đúng 1 ý: 0,1đ; 2 ý: 0,25đ; 3 ý: 0,5đ; 4 ý: 1đ)</p><table border="1" class="center" style="width:100%"><tr><th ${hb}>Câu</th>${g.tf.map(it=>`<th ${hb}>Câu ${it.no}</th>`).join('')}</tr>${[0,1,2,3].map(k=>`<tr><th>Ý ${'abcd'[k]})</th>${g.tf.map(it=>`<td class="c"><b>${it.q.answer[it.perm[k]]?'Đ':'S'}</b></td>`).join('')}</tr>`).join('')}</table>`;
      if(g.short) h+=`<p><b>Phần III</b> (mỗi câu ${fmtNum(this.ptOf(exam.subject,'short'))} điểm)</p><table border="1" class="center" style="width:100%"><tr><th ${hb}>Câu</th>${g.short.map(it=>`<th ${hb}>${it.no}</th>`).join('')}</tr><tr><th>Đáp án</th>${g.short.map(it=>`<td class="c"><b>${esc(it.q.answer)}</b></td>`).join('')}</tr></table>`;
      if(g.essay&&!compact) h+=`<p><b>Tự luận</b></p><table border="1" style="width:100%"><tr><th ${hb} style="width:12%">Câu</th><th ${hb}>Nội dung hướng dẫn chấm</th><th ${hb} style="width:12%">Điểm</th></tr>`+g.essay.map(it=>`<tr><td class="c">${it.no}</td><td>${it.q.answer||''}</td><td class="c">${fmtNum(it.q.points||1)}</td></tr>`).join('')+`</table>`;
      return h; }).join('<p></p>');
  },
  /* Bảng đáp án tổng hợp nhiều mã đề (hàng = câu, cột = mã đề) */
  answerGridHtml(exam,variants,{style}={}){ const ST=this.style(style); const vs=variants&&variants.length&&variants[0]?variants:[null]; const hb=`style="background:${ST.form==='bgd'?'#E8ECF7':ST.cA};color:${ST.form==='bgd'?'#000':'#fff'}"`;
    const all=vs.map(v=>({v,g:groupBy(this.items(exam,v),it=>it.type)})); const g0=all[0].g; let h='';
    if(g0.mcq) h+=`<p><b>Phần I – Trắc nghiệm nhiều lựa chọn</b></p><table border="1" class="center" style="width:100%"><tr><th ${hb}>Câu</th>${all.map(x=>`<th ${hb}>${x.v?x.v.code:'000'}</th>`).join('')}</tr>${g0.mcq.map((_,i)=>`<tr><th>${i+1}</th>${all.map(x=>{ const it=x.g.mcq[i]; return `<td class="c">${it?LETTER[it.perm.indexOf(it.q.answer)]:''}</td>`; }).join('')}</tr>`).join('')}</table>`;
    if(g0.tf) h+=`<p><b>Phần II – Đúng/Sai</b></p><table border="1" class="center" style="width:100%"><tr><th ${hb}>Câu</th>${all.map(x=>`<th ${hb}>${x.v?x.v.code:'000'}</th>`).join('')}</tr>${g0.tf.map((_,i)=>`<tr><th>${i+1}</th>${all.map(x=>{ const it=x.g.tf[i]; return `<td class="c">${it?it.perm.map(si=>it.q.answer[si]?'Đ':'S').join(''):''}</td>`; }).join('')}</tr>`).join('')}</table>`;
    if(g0.short) h+=`<p><b>Phần III – Trả lời ngắn</b></p><table border="1" class="center" style="width:100%"><tr><th ${hb}>Câu</th>${all.map(x=>`<th ${hb}>${x.v?x.v.code:'000'}</th>`).join('')}</tr>${g0.short.map((_,i)=>`<tr><th>${i+1}</th>${all.map(x=>{ const it=x.g.short[i]; return `<td class="c">${it?esc(it.q.answer):''}</td>`; }).join('')}</tr>`).join('')}</table>`;
    return h; },
  /* ---------- Đề tương tự ---------- */
  similar(ex,{replace=true,title}={}){
    const used=new Set(ex.questionIds); let nNum=0,nRep=0,nKeep=0; const ids=[];
    ex.questionIds.forEach(id=>{ const q=DB.get('questions',id); if(!q) return;
      if(Param.has(q)){ ids.push(id); nNum++; return; }
      if(replace){ const cand=shuffle(this.pool().filter(x=>x.subject===q.subject&&+x.grade===+q.grade&&x.topic===q.topic&&x.type===q.type&&x.level===q.level&&!used.has(x.id)));
        if(cand[0]){ used.add(cand[0].id); ids.push(cand[0].id); nRep++; return; } }
      ids.push(id); nKeep++; });
    const ne={...JSON.parse(JSON.stringify(ex)),id:uid('ex'),title:title||ex.title+' – đề tương tự',questionIds:ids,createdAt:Date.now(),createdBy:(Auth.user||{}).id,variants:[],similarOf:ex.id};
    if(ex.variants&&ex.variants.length) this.mix(ne,ex.variants.length,{startCode:+ex.variants[0].code});
    return {exam:ne,nNum,nRep,nKeep}; },
  /* ---------- Xuất LaTeX gói ex_test ---------- */
  texText(s){ const parts=String(s??'').split(/(\$\$?[^$]*\$\$?)/g); return parts.map(seg=>{ if(/^\$/.test(seg)) return seg;
      return seg.replace(/<br\s*\/?>/gi,'\\\\ ').replace(/<u>([\s\S]*?)<\/u>/gi,'\\underline{$1}').replace(/<b>([\s\S]*?)<\/b>/gi,'\\textbf{$1}').replace(/<i>([\s\S]*?)<\/i>/gi,'\\textit{$1}').replace(/<code>([\s\S]*?)<\/code>/gi,'\\texttt{$1}').replace(/<[^>]+>/g,'')
        .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'\\&').replace(/&nbsp;/g,'~').replace(/%/g,'\\%').replace(/#/g,'\\#').replace(/_/g,'\\_').replace(/–/g,'--'); }).join(''); },
  exTest(exam,variant,{withSolution=true,header}={}){
    const items=this.items(exam,variant); const g=groupBy(items,it=>it.type); const H=this.header(exam,header); const imgs=[]; const T=s=>this.texText(s);
    const fig=q=>{ if(!q.figure) return ''; const n=`hinh/${exam.id.slice(-5)}_${variant?variant.code:'000'}_${imgs.length+1}.png`; imgs.push({name:n,svg:Fig.render(q.figure)}); return `\n\\begin{center}\\includegraphics[width=0.42\\linewidth]{${n}}\\end{center}`; };
    let t=`%% Xuất từ LMS LKT – ${esc(H.truong)} – Tác giả: ${CFG.author} (${CFG.contact})\n%% Biên dịch bằng XeLaTeX hoặc pdfLaTeX; cần gói ex_test (phiên bản hỗ trợ \\choiceTF, \\shortans).\n\\documentclass[12pt,a4paper]{article}\n\\usepackage[utf8]{vietnam}\n\\usepackage{amsmath,amssymb,graphicx,tikz}\n\\usepackage[top=1.5cm,bottom=1.5cm,left=2cm,right=1.5cm]{geometry}\n\\usepackage[${withSolution?'loigiai':'dethi'}]{ex_test}\n\\begin{document}\n`;
    t+=`\\noindent\\begin{minipage}[t]{0.45\\textwidth}\\centering ${T(H.so)}\\\\ \\textbf{${T(H.truong)}}\\\\ \\rule{3cm}{0.4pt}\\\\ \\fbox{\\textbf{${T(H.loai)}}}\\\\ \\textit{${T(H.ghichu||'(Đề có '+items.length+' câu)')}}\\end{minipage}\\hfill\\begin{minipage}[t]{0.53\\textwidth}\\centering \\textbf{${T(H.kythi).toUpperCase()}}\\\\ \\textbf{NĂM HỌC ${T(H.namhoc)}}\\\\ \\textbf{Môn: ${T(subjName(exam.subject))} -- Lớp ${exam.grade}}\\\\ \\textit{Thời gian làm bài: ${exam.duration} phút}\\end{minipage}\n\n\\vspace{6pt}\\noindent Họ, tên thí sinh: \\dotfill\\ \\fbox{Mã đề: ${variant?variant.code:'000'}}\n\n`;
    PART_ORDER.filter(x=>g[x]).forEach((x,pi)=>{ t+=`\\noindent\\textbf{${T(PART_TITLE[x](g[x].length)).replace(/^PHẦN [IV]+/,'PHẦN '+ROMAN[pi])}}\n\n`;
      g[x].forEach(it=>{ const q=it.q; t+=`\\begin{ex}%[${subjName(q.subject)} ${q.grade}][${q.level}][${T(q.topic)}]\n${T(q.content)}${fig(q)}\n`;
        if(x==='mcq') t+=`\\choice\n`+it.perm.map(oi=>`{${oi===q.answer?'\\True ':''}${T(q.options[oi])}}`).join('\n')+'\n';
        else if(x==='tf') t+=`\\choiceTF\n`+it.perm.map(si=>`{${q.answer[si]?'\\True ':''}${T(q.statements[si])}}`).join('\n')+'\n';
        else if(x==='short') t+=`\\shortans{${T(q.answer)}}\n`;
        if(withSolution) t+=`\\loigiai{${T(q.explain||(x==='essay'?q.answer:''))}}\n`;
        t+=`\\end{ex}\n\n`; }); });
    t+=`\\begin{center}\\textbf{------ HẾT ------}\\end{center}\n\\end{document}\n`;
    return {tex:t,imgs}; }
};
/* Hiển thị câu hỏi trong ứng dụng */
function qCard(q,{showAnswer=true,actions='',num=''}={}){
  const lv=`<span class="badge lv-${q.level}">${LV_NAME[q.level]||q.level}</span>`;
  let b=`<div class="q-body">${num?`<b>${num}</b> `:''}${String(q.content).replace(/\n/g,'<br>')}</div>${figHtml(q)}`;
  if(q.type==='mcq'){ const long=(q.options||[]).some(x=>String(x).replace(/\$[^$]*\$/g,'xxxx').length>40);
    b+=`<div class="opts ${long?'c1x':''}">${(q.options||[]).map((o,i)=>`<div class="opt ${showAnswer&&i===q.answer?'right':''}">${LETTER[i]}. ${o}</div>`).join('')}</div>`; }
  else if(q.type==='tf') b+=`<div style="margin-top:6px">${(q.statements||[]).map((s,i)=>`<div class="tf-row"><b>${'abcd'[i]})</b><div style="flex:1">${s}</div>${showAnswer?`<span class="badge ${q.answer[i]?'ok':'bad'}">${q.answer[i]?'Đúng':'Sai'}</span>`:''}</div>`).join('')}</div>`;
  else if(showAnswer) b+=`<div style="margin-top:6px"><span class="badge ok">Đáp án</span> ${q.type==='essay'?String(q.answer||'').replace(/\n/g,'<br>'):esc(q.answer)}</div>`;
  if(showAnswer&&q.explain) b+=`<div class="muted" style="margin-top:6px"><i>Lời giải:</i> ${q.explain}</div>`;
  return `<div class="q"><div class="q-head"><span class="badge gray">${subjName(q.subject)} ${q.grade}</span><span class="badge">${QT_NAME[q.type]}</span>${lv}${Param.has(q)?'<span class="badge warn">🎲 Số tương tự</span>':''}${q.parentId?'<span class="badge gray">bản sinh</span>':''}<small class="muted" style="flex:1">${esc(q.lesson||q.topic)}</small>${actions}</div>${b}</div>`;
}
