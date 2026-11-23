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
  /* ---------- Ma trận ---------- */
  typesOf(subject){ return this.struct(subject).map(p=>p.type); },
  emptyCells(types){ const c={}; types.forEach(t=>{ c[t]={NB:0,TH:0,VD:0}; }); return c; },
  defaultMatrix(subject,grade,name){
    const st=this.struct(subject), types=st.map(p=>p.type);
    let topics=topicsOf(subject,grade); if(!topics.length) topics=['Chủ đề 1','Chủ đề 2','Chủ đề 3'];
    const rows=topics.map(t=>({topic:t,c:this.emptyCells(types),spec:{}}));
    const share={mcq:[.55,.35,.10],tf:[.25,.5,.25],short:[0,.35,.65],essay:[.34,.33,.33]};
    const bank=DB.all('questions').filter(q=>q.subject===subject&&+q.grade===+grade);
    st.forEach(p=>{
      const sh=share[p.type]; const raw=sh.map(x=>x*p.n); const cnt=raw.map(Math.floor); let rest=p.n-sum(cnt);
      raw.map((x,i)=>[x-Math.floor(x),i]).sort((a,b)=>b[0]-a[0]).forEach(([_,i])=>{ if(rest>0){cnt[i]++;rest--;} });
      if(p.type==='essay'&&subject==='van'){ cnt.splice(0,3,1,0,2); }
      MX_LEVELS.forEach((lv,li)=>{
        let pool=rows.filter(r=>bank.some(q=>q.topic===r.topic&&q.type===p.type&&(q.level===lv||(lv==='VD'&&q.level==='VDC'))));
        if(!pool.length) pool=rows.filter(r=>bank.some(q=>q.topic===r.topic&&q.type===p.type));
        if(!pool.length) pool=rows;
        for(let k=0;k<cnt[li];k++){ pool[(k+li)%pool.length].c[p.type][lv]++; }
      });
    });
    return {id:uid('mx'),name:name||('Ma trận '+subjName(subject)+' '+grade),subject,grade:+grade,duration:(SUBJECTS[subject]||{}).duration||45,rows:rows.filter(r=>sum(types.flatMap(t=>MX_LEVELS.map(l=>r.c[t][l])))>0||topics.length<=8),createdAt:Date.now()};
  },
  mxCount(mx,type,lv){ return sum(mx.rows.map(r=>((r.c[type]||{})[lv])||0)); },
  mxTypes(mx){ const t=new Set(this.typesOf(mx.subject)); mx.rows.forEach(r=>Object.keys(r.c).forEach(k=>t.add(k))); return PART_ORDER.filter(x=>t.has(x)); },
  buildFromMatrix(mx,{autoClone=true}={}){
    const used=new Set(), ids={mcq:[],tf:[],short:[],essay:[]}, newQ=[], shortages=[];
    const all=DB.all('questions').filter(q=>q.subject===mx.subject&&+q.grade===+mx.grade);
    const lvOk=(q,lv)=>q.level===lv||(lv==='VD'&&q.level==='VDC');
    mx.rows.forEach(r=>{ this.mxTypes(mx).forEach(t=>MX_LEVELS.forEach(lv=>{
      const need=((r.c[t]||{})[lv])||0; if(!need) return;
      let cand=shuffle(all.filter(q=>q.topic===r.topic&&q.type===t&&lvOk(q,lv)&&!used.has(q.id)));
      const take=cand.slice(0,need); take.forEach(q=>used.add(q.id));
      let miss=need-take.length;
      if(miss>0&&autoClone){ const par=all.filter(q=>q.topic===r.topic&&q.type===t&&lvOk(q,lv)&&Param.has(q));
        for(let i=0;i<par.length&&miss>0;i++){ const cl=Param.clones(par[i%par.length],1)[0]; if(cl){ newQ.push(cl); take.push(cl); used.add(cl.id); miss--; } }
        let guard=0; while(miss>0&&par.length&&guard++<40){ const cl=Param.clones(par[guard%par.length],1)[0]; newQ.push(cl); take.push(cl); used.add(cl.id); miss--; } }
      if(miss>0){ const alt=shuffle(all.filter(q=>q.topic===r.topic&&q.type===t&&!used.has(q.id))).slice(0,miss); alt.forEach(q=>{take.push(q);used.add(q.id);}); if(alt.length) shortages.push({topic:r.topic,type:t,level:lv,need:miss,got:alt.length,note:'thay bằng câu khác mức độ'}); miss-=alt.length; }
      if(miss>0) shortages.push({topic:r.topic,type:t,level:lv,need:miss,got:0,note:'thiếu câu hỏi'});
      ids[t].push(...take.map(q=>q.id));
    })); });
    return {questionIds:PART_ORDER.flatMap(t=>ids[t]),newQuestions:newQ,shortages};
  },
  matrixFromExam(exam){
    const qs=exam.questionIds.map(id=>DB.get('questions',id)).filter(Boolean); const types=PART_ORDER.filter(t=>qs.some(q=>q.type===t));
    const topics=[...new Set(qs.map(q=>q.topic||'(Chưa phân chủ đề)'))];
    const numbers={}; const items=this.items(exam,null); items.forEach(it=>{ numbers[it.q.id]=(it.type==='mcq'?'I':it.type==='tf'?'II':it.type==='short'?'III':'TL')+'.'+it.no; });
    const rows=topics.map(t=>{ const r={topic:t,c:this.emptyCells(types),spec:{},nums:{}}; qs.filter(q=>(q.topic||'(Chưa phân chủ đề)')===t).forEach(q=>{ const lv=q.level==='VDC'?'VD':q.level; r.c[q.type][lv]++; const k=q.type+'_'+lv; (r.nums[k]=r.nums[k]||[]).push(numbers[q.id]); }); return r; });
    const essayPts={}; qs.filter(q=>q.type==='essay').forEach(q=>{ essayPts[q.topic||'(Chưa phân chủ đề)']=(essayPts[q.topic]||0)+(q.points||1); });
    return {id:uid('mx'),name:'Ma trận của đề: '+exam.title,subject:exam.subject,grade:exam.grade,duration:exam.duration,rows,fromExam:exam.id,essayPts};
  },
  autoSpec(subject,topic,lv,type){
    const v={NB:'Nhận biết',TH:'Thông hiểu',VD:'Vận dụng'}[lv];
    const verbs={NB:['Nhận biết, nêu được','khái niệm, tính chất, công thức cơ bản'],TH:['Hiểu, giải thích và thực hiện được','các bài toán/tình huống cơ bản, trực tiếp'],VD:['Vận dụng được kiến thức để giải quyết','bài toán tổng hợp, gắn với thực tiễn']}[lv];
    if(subject==='anh') return `${v}: ${verbs[0]} kiến thức ${topic} trong ngữ cảnh ${lv==='VD'?'mới, phức hợp':'quen thuộc'}.`;
    if(subject==='van') return `${v}: ${lv==='NB'?'Xác định được thông tin, phương thức, biện pháp':lv==='TH'?'Hiểu, lí giải được nội dung, ý nghĩa':'Viết được văn bản đáp ứng yêu cầu, có lập luận thuyết phục'} (${topic}).`;
    return `${v}: ${verbs[0]} ${verbs[1]} về ${topic.charAt(0).toLowerCase()+topic.slice(1)}.`;
  },
  /* ---------- HTML ma trận / đặc tả ---------- */
  matrixHtml(mx,{editable=false}={}){
    const types=this.mxTypes(mx); const L=MX_LEVELS;
    const h1=types.map(t=>`<th colspan="3">${QT_NAME[t]}</th>`).join('');
    const h2=types.map(()=>L.map(l=>`<th>${l==='NB'?'Biết':l==='TH'?'Hiểu':'VD'}</th>`).join('')).join('');
    const ptCell=(t,n,topic)=> t==='essay' ? null : n*this.ptOf(mx.subject,t);
    let body=mx.rows.map((r,ri)=>{ let tot=0, pts=0;
      const cells=types.map(t=>L.map(l=>{ const n=((r.c[t]||{})[l])||0; tot+=n; pts+=t==='essay'?0:n*this.ptOf(mx.subject,t);
        return editable?`<td><input type="number" min="0" max="40" value="${n}" data-r="${ri}" data-t="${t}" data-l="${l}"></td>`:`<td>${n||''}</td>`; }).join('')).join('');
      return `<tr><td>${ri+1}</td><td style="text-align:left">${editable?`<input type="text" value="${esc(r.topic)}" data-topic="${ri}" style="width:100%;text-align:left">`:esc(r.topic)}</td>${cells}<td class="tot">${tot}</td>${editable?`<td><button class="btn sm bad" data-delrow="${ri}">✕</button></td>`:''}</tr>`; }).join('');
    const totCells=types.map(t=>L.map(l=>`<td class="tot">${this.mxCount(mx,t,l)}</td>`).join('')).join('');
    const totalQ=sum(types.flatMap(t=>L.map(l=>this.mxCount(mx,t,l))));
    const ptByType=types.map(t=>{ const n=sum(L.map(l=>this.mxCount(mx,t,l))); const p=t==='essay'?(mx.essayPts?sum(Object.values(mx.essayPts)):n*1):n*this.ptOf(mx.subject,t); return {t,n,p}; });
    const totalP=sum(ptByType.map(x=>x.p))||1;
    const lvPts=L.map(l=>sum(types.map(t=>this.mxCount(mx,t,l)*(t==='essay'?((mx.essayPts&&sum(Object.values(mx.essayPts))/Math.max(1,sum(L.map(x=>this.mxCount(mx,t,x)))))||1):this.ptOf(mx.subject,t)))));
    const ptRow=ptByType.map(x=>`<td colspan="3" class="tot">${fmtNum(x.p)} điểm</td>`).join('');
    const pctRow=ptByType.map(x=>`<td colspan="3" class="tot">${fmtNum(x.p/totalP*100,1)}%</td>`).join('');
    return `<table class="tbl mx center" border="1"><thead><tr><th rowspan="2">TT</th><th rowspan="2">Chủ đề / Nội dung</th>${h1}<th rowspan="2">Tổng<br>số câu</th>${editable?'<th rowspan="2"></th>':''}</tr><tr>${h2}</tr></thead>
      <tbody>${body}<tr><td></td><td style="text-align:left"><b>Tổng số câu</b></td>${totCells}<td class="tot">${totalQ}</td>${editable?'<td></td>':''}</tr>
      <tr><td></td><td style="text-align:left"><b>Tổng điểm</b></td>${ptRow}<td class="tot">${fmtNum(totalP)}</td>${editable?'<td></td>':''}</tr>
      <tr><td></td><td style="text-align:left"><b>Tỉ lệ %</b></td>${pctRow}<td class="tot">100%</td>${editable?'<td></td>':''}</tr></tbody></table>
      <p class="muted" style="margin-top:6px">Tỉ lệ theo mức độ (quy điểm): Biết ${fmtNum(lvPts[0]/totalP*100,1)}% · Hiểu ${fmtNum(lvPts[1]/totalP*100,1)}% · Vận dụng ${fmtNum(lvPts[2]/totalP*100,1)}%</p>`;
  },
  specHtml(mx,{editable=false}={}){
    const types=this.mxTypes(mx); let n=0;
    const rows=mx.rows.map((r,ri)=>{ const lvRows=MX_LEVELS.filter(l=>types.some(t=>((r.c[t]||{})[l])||0)); if(!lvRows.length) return '';
      n++; return lvRows.map((l,k)=>{ const spec=(r.spec&&r.spec[l])||this.autoSpec(mx.subject,r.topic,l);
        const counts=types.map(t=>{ const c=((r.c[t]||{})[l])||0; const nums=r.nums&&r.nums[t+'_'+l]; return `<td>${c?(c+(nums?`<br><small>(${nums.join(', ')})</small>`:'')):''}</td>`; }).join('');
        return `<tr>${k===0?`<td rowspan="${lvRows.length}">${n}</td><td rowspan="${lvRows.length}" style="text-align:left">${esc(r.topic)}</td>`:''}<td>${LV_NAME[l]}</td><td style="text-align:left">${editable?`<textarea data-spec="${ri}" data-l="${l}" style="min-height:52px">${esc(spec)}</textarea>`:esc(spec)}</td>${counts}</tr>`; }).join(''); }).join('');
    return `<table class="tbl mx center" border="1"><thead><tr><th>TT</th><th>Chủ đề</th><th>Mức độ</th><th style="min-width:280px">Yêu cầu cần đạt</th>${types.map(t=>`<th>Số câu<br>${QT_NAME[t]}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
  },
  /* ---------- HTML đề thi ---------- */
  visLen(s){ return String(s).replace(/<[^>]+>/g,'').replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g,'$1/$2').replace(/\\[a-zA-Z]+/g,'x').replace(/[{}$^_]/g,'').replace(/&\w+;/g,'x').length; },
  optCols(opts){ const m=Math.max(...opts.map(o=>this.visLen(o))); return m<=13?4:m<=32?2:1; },
  qText(it,{withAnswer=false,fig=true}={}){
    const q=it.q; let h=`<p class="qp"><b>Câu ${it.no}.</b> ${q.content.replace(/\n/g,'<br>')}${q.type==='essay'&&q.points?` <i>(${fmtNum(q.points)} điểm)</i>`:''}</p>`;
    if(fig&&q.figure) h+=`<p class="c qfigp">${Fig.render(q.figure)}</p>`;
    if(q.type==='mcq'){ const o=it.perm.map((oi,k)=>`<td>${withAnswer&&oi===q.answer?'<b><u>':''}<b>${LETTER[k]}.</b> ${q.options[oi]}${withAnswer&&oi===q.answer?'</u></b>':''}</td>`);
      const n=this.optCols(q.options); const rows=[]; for(let i=0;i<4;i+=n) rows.push(`<tr>${o.slice(i,i+n).join('')}</tr>`);
      h+=`<table class="nb opt${n}">${rows.join('')}</table>`; }
    else if(q.type==='tf'){ h+=it.perm.map((si,k)=>`<p style="margin-left:14pt">${'abcd'[k]}) ${q.statements[si]}${withAnswer?` <b>[${q.answer[si]?'Đ':'S'}]</b>`:''}</p>`).join(''); }
    else if(withAnswer){ h+=`<p><i>Đáp án:</i> <b>${q.answer}</b></p>`; }
    if(withAnswer&&q.explain) h+=`<p><i>Lời giải:</i> ${q.explain}</p>`;
    return h;
  },
  defaultHeader(){ return {so:'SỞ GIÁO DỤC VÀ ĐÀO TẠO AN GIANG',truong:String(DB.data.settings.schoolName||CFG.schoolName||'').toUpperCase(),kythi:'ĐỀ KIỂM TRA',namhoc:(typeof schoolYear==='function'?schoolYear():''),loai:'ĐỀ CHÍNH THỨC',ghichu:'',chantrang:'Thí sinh không được sử dụng tài liệu. Cán bộ coi thi không giải thích gì thêm.',diem:false,sbd:true,phieu:false,size:12}; },
  header(exam,over){ return Object.assign({},this.defaultHeader(),DB.data.settings.header||{},exam.header||{},over||{}); },
  headerHtml(exam,variant,H,nq){
    const box=t=>`<span style="border:1.2pt solid #000;padding:2pt 8pt;font-weight:bold">${esc(t)}</span>`;
    return `<table class="nb hdr" style="width:100%"><tr><td class="c" style="width:44%;vertical-align:top">${esc(H.so)}<br><b>${esc(H.truong)}</b><br><span style="letter-spacing:-1pt">────────</span><br>${H.loai?box(H.loai)+'<br>':''}<i>${esc(H.ghichu||`(Đề có ${nq} câu)`)}</i></td>
      <td class="c" style="vertical-align:top"><b>${esc(H.kythi).toUpperCase()}</b><br>${H.namhoc?`<b>NĂM HỌC ${esc(H.namhoc)}</b><br>`:''}<b>Môn: ${esc(subjName(exam.subject)).toUpperCase()} – Lớp ${exam.grade}</b><br><i>Thời gian làm bài: ${exam.duration} phút, không kể thời gian phát đề</i></td></tr></table>
      ${H.diem?`<table border="1" style="width:100%;margin:6pt 0"><tr><td style="width:22%;height:46pt;vertical-align:top"><b>Điểm</b></td><td style="vertical-align:top"><b>Lời phê của giáo viên</b></td></tr></table>`:''}
      <table class="nb" style="width:100%;margin:4pt 0 8pt"><tr><td>Họ, tên thí sinh: ...................................................................<br>${H.sbd?'Số báo danh: ................................':'Lớp: ................................'}</td><td style="text-align:right;vertical-align:middle">${box('Mã đề thi: '+(variant?variant.code:'000'))}</td></tr></table>`; },
  examHtml(exam,variant,{withAnswer=false,header}={}){
    const items=this.items(exam,variant); const g=groupBy(items,it=>it.type); const H=this.header(exam,header);
    let h=this.headerHtml(exam,variant,H,items.length);
    const parts=PART_ORDER.filter(t=>g[t]); const multi=parts.length>1||parts[0]!=='essay';
    parts.forEach((t,pi)=>{ h+=`<p class="part"><b>${multi?PART_TITLE[t](g[t].length).replace(/^PHẦN [IV]+/,'PHẦN '+ROMAN[pi]):PART_TITLE[t](g[t].length)}</b></p>`+g[t].map(it=>this.qText(it,{withAnswer})).join(''); });
    h+=`<p class="c" style="margin-top:10pt"><b>------ HẾT ------</b></p>${H.chantrang?`<p class="c"><i>${esc(H.chantrang)}</i></p>`:''}`;
    if(H.phieu&&!withAnswer) h+='<br style="page-break-before:always">'+this.answerSheetHtml(exam,variant,H);
    return h;
  },
  answerSheetHtml(exam,variant,H){
    const items=this.items(exam,variant); const g=groupBy(items,it=>it.type); H=H||this.header(exam);
    const bub=t=>`<span style="display:inline-block;width:13pt;height:13pt;border:1pt solid #000;border-radius:50%;text-align:center;font-size:8pt;line-height:13pt;margin:0 1pt">${t}</span>`;
    let h=`<h2 class="c" style="text-align:center">PHIẾU TRẢ LỜI – ${esc(H.kythi).toUpperCase()}</h2><p>Họ tên: ........................................................ Lớp: ........ &nbsp; Mã đề: <b>${variant?variant.code:'000'}</b></p>`;
    if(g.mcq){ const cols=Math.ceil(g.mcq.length/10); h+=`<p><b>PHẦN I.</b> Tô kín một ô tròn tương ứng với phương án đúng.</p><table border="1" style="width:100%"><tr>`; for(let c=0;c<cols;c++){ h+=`<td style="vertical-align:top">`+g.mcq.slice(c*10,c*10+10).map(it=>`<div style="margin:2pt 0"><b style="display:inline-block;width:18pt">${it.no}</b>${LETTER.split('').map(bub).join('')}</div>`).join('')+'</td>'; } h+='</tr></table>'; }
    if(g.tf) h+=`<p><b>PHẦN II.</b> Đánh dấu Đúng (Đ) hoặc Sai (S) cho từng ý.</p><table border="1" style="width:100%"><tr><th></th>${g.tf.map(it=>`<th colspan="2">Câu ${it.no}</th>`).join('')}</tr><tr><td></td>${g.tf.map(()=>'<td class="c">Đ</td><td class="c">S</td>').join('')}</tr>${'abcd'.split('').map(x=>`<tr><td class="c">${x})</td>${g.tf.map(()=>`<td class="c">${bub('')}</td><td class="c">${bub('')}</td>`).join('')}</tr>`).join('')}</table>`;
    if(g.short) h+=`<p><b>PHẦN III.</b> Ghi đáp số vào ô (mỗi ô một kí tự: chữ số, dấu "−", dấu ",").</p><table border="1" style="width:100%"><tr>${g.short.map(it=>`<th>Câu ${it.no}</th>`).join('')}</tr><tr>${g.short.map(()=>`<td class="c" style="height:28pt">☐☐☐☐</td>`).join('')}</tr></table>`;
    if(g.essay) h+=`<p><b>PHẦN TỰ LUẬN</b></p>`+Array.from({length:14},()=>'<p>......................................................................................................................................................</p>').join('');
    return h; },
  answerKeyHtml(exam,variants){
    const vs=variants&&variants.length?variants:[null];
    return vs.map(v=>{ const items=this.items(exam,v); const g=groupBy(items,it=>it.type); let h=`<h3>Mã đề ${v?v.code:'000'}</h3>`;
      if(g.mcq) h+=`<p><b>Phần I</b> (mỗi câu ${fmtNum(this.ptOf(exam.subject,'mcq'))} điểm)</p><table border="1"><tr>${g.mcq.map(it=>`<th>${it.no}</th>`).join('')}</tr><tr>${g.mcq.map(it=>`<td class="c">${LETTER[it.perm.indexOf(it.q.answer)]}</td>`).join('')}</tr></table>`;
      if(g.tf) h+=`<p><b>Phần II</b> (đúng 1 ý: 0,1đ; 2 ý: 0,25đ; 3 ý: 0,5đ; 4 ý: 1đ)</p><table border="1"><tr>${g.tf.map(it=>`<th>Câu ${it.no}</th>`).join('')}</tr><tr>${g.tf.map(it=>`<td class="c">${it.perm.map((si,k)=>'abcd'[k]+') '+(it.q.answer[si]?'Đ':'S')).join('<br>')}</td>`).join('')}</tr></table>`;
      if(g.short) h+=`<p><b>Phần III</b> (mỗi câu ${fmtNum(this.ptOf(exam.subject,'short'))} điểm)</p><table border="1"><tr>${g.short.map(it=>`<th>${it.no}</th>`).join('')}</tr><tr>${g.short.map(it=>`<td class="c">${esc(it.q.answer)}</td>`).join('')}</tr></table>`;
      if(g.essay) h+=`<p><b>Tự luận</b></p>`+g.essay.map(it=>`<p>Câu ${it.no} (${fmtNum(it.q.points||1)}đ): ${it.q.answer||''}</p>`).join('');
      return h; }).join('<br>');
  },
  /* ---------- Đề tương tự ---------- */
  similar(ex,{replace=true,title}={}){
    const used=new Set(ex.questionIds); let nNum=0,nRep=0,nKeep=0; const ids=[];
    ex.questionIds.forEach(id=>{ const q=DB.get('questions',id); if(!q) return;
      if(Param.has(q)){ ids.push(id); nNum++; return; }
      if(replace){ const cand=shuffle(DB.all('questions').filter(x=>x.subject===q.subject&&+x.grade===+q.grade&&x.topic===q.topic&&x.type===q.type&&x.level===q.level&&!used.has(x.id)));
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
  return `<div class="q"><div class="q-head"><span class="badge gray">${subjName(q.subject)} ${q.grade}</span><span class="badge">${QT_NAME[q.type]}</span>${lv}${Param.has(q)?'<span class="badge warn">🎲 Số tương tự</span>':''}${q.parentId?'<span class="badge gray">bản sinh</span>':''}<small class="muted" style="flex:1">${esc(q.topic)}</small>${actions}</div>${b}</div>`;
}
