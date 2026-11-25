/* LMS LKT – pages-teacher2.js: Ma trận – đặc tả, Đề thi, Học liệu, Giao bài – kết quả, Bảng điểm, Tiến độ, Thông báo, Cài đặt */
'use strict';
/* ===================== MA TRẬN & ĐẶC TẢ ===================== */
function newMatrixModal(){
  modal({title:'Tạo ma trận đề chuẩn',body:`<div class="grid g2"><div class="field"><label>Môn</label><select id="nmS">${opts(subjList(),(me().subjects||[])[0]||'toan')}</select></div><div class="field"><label>Lớp</label><select id="nmG">${opts(GRADES,12)}</select></div></div>
    <div class="field"><label>Tên ma trận</label><input type="text" id="nmN" placeholder="Ma trận đề kiểm tra cuối kì I"></div>
    <div class="field"><label>Khung</label><select id="nmK"><option value="std">Cấu trúc đề tốt nghiệp THPT từ 2025 (tự phân bổ theo chủ đề & ngân hàng)</option><option value="blank">Ma trận trống (tự nhập)</option></select></div><div id="nmInfo" class="note info"></div>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="nmGo">Tạo</button>`,onOpen:(m,close)=>{
      const info=()=>{ const s=$('#nmS',m).value; $('#nmInfo',m).innerHTML=`<b>${subjName(s)}</b>: `+Exam.struct(s).map((p,i)=>`Phần ${ROMAN[i]} – ${QT_NAME[p.type]} ${p.n} câu${p.pt?` × ${fmtNum(p.pt)}đ`:''}`).join(' · ')+` · ${SUBJECTS[s].duration} phút`; };
      $('#nmS',m).onchange=info; info();
      $('#nmGo',m).onclick=()=>{ const s=$('#nmS',m).value,g=+$('#nmG',m).value; const mx=Exam.defaultMatrix(s,g,$('#nmN',m).value.trim()||undefined);
        if($('#nmK',m).value==='blank') mx.rows.forEach(r=>Object.values(r.c).forEach(c=>{c.NB=c.TH=c.VD=0;}));
        mx.createdBy=me().id; DB.upsert('matrices',mx); close(); location.hash='#/matrices/'+mx.id; }; }});
}
function buildExamFromMatrixModal(mx){
  modal({title:'Tạo đề từ ma trận',body:`<div class="field"><label>Tên đề</label><input type="text" id="beT" value="${esc('Đề kiểm tra '+subjName(mx.subject)+' '+mx.grade)}"></div>
    <div class="grid g3"><div class="field"><label>Thời gian (phút)</label><input type="number" id="beD" value="${mx.duration||45}"></div><div class="field"><label>Số mã đề trộn</label><input type="number" id="beN" value="4" min="0" max="24"></div><div class="field"><label>Mã đề bắt đầu</label><input type="number" id="beC" value="101"></div></div>
    <div class="field"><label>Lấy câu hỏi từ</label><select id="beBank">${bankOptions('',true)}</select></div>
    <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" class="chk" id="beA" checked> Tự sinh câu “số tương tự” khi ngân hàng thiếu câu</label>
    <label style="display:flex;gap:6px;align-items:center;margin-top:6px"><input type="checkbox" class="chk" id="beDN" checked> Mỗi mã đề thay số khác nhau (câu tham số)</label>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="beGo">Tạo đề</button>`,onOpen:(m,close)=>{ $('#beGo',m).onclick=()=>{
      const r=Exam.buildFromMatrix(mx,{autoClone:$('#beA',m).checked,bank:$('#beBank',m).value}); if(!r.questionIds.length) return toast('Ngân hàng chưa có câu phù hợp ma trận','bad');
      r.newQuestions.forEach(q=>{ q.ownerId=me().id; DB.data.questions.push(q); });
      const ex={id:uid('ex'),title:$('#beT',m).value.trim(),subject:mx.subject,grade:mx.grade,duration:+$('#beD',m).value||45,questionIds:r.questionIds,matrixId:mx.id,createdBy:me().id,createdAt:Date.now(),variants:[]};
      const n=+$('#beN',m).value; if(n>0) Exam.mix(ex,n,{startCode:+$('#beC',m).value||101,diffNumbers:$('#beDN',m).checked});
      DB.upsert('exams',ex); DB.save(); close();
      const totalNeed=sum(r.shortages.filter(s=>!s.got).map(s=>s.need));
      modal({title:'✅ Đã tạo đề',body:`<p>Đề <b>${esc(ex.title)}</b> gồm <b>${ex.questionIds.length}</b> câu${n>0?`, đã trộn <b>${n}</b> mã đề`:''}.${r.newQuestions.length?` Hệ thống đã tự sinh <b>${r.newQuestions.length}</b> câu số tương tự.`:''}</p>`+
        (r.shortages.length?`<div class="note"><b>Lưu ý ngân hàng:</b><br>${r.shortages.map(s=>`• ${esc(s.topic)} – ${QT_NAME[s.type]} – ${LV_NAME[s.level]}: ${s.got?`thiếu, đã thay ${s.got} câu khác mức độ`:`còn thiếu ${s.need} câu`}`).join('<br>')}</div>${totalNeed?'<p class="muted">Hãy bổ sung câu hỏi vào ngân hàng rồi tạo lại để đề đủ chuẩn.</p>':''}`:'<div class="note info">Đề khớp hoàn toàn với ma trận.</div>'),
        foot:`<button class="btn" data-x>Đóng</button><a class="btn pri" href="#/exams/${ex.id}" data-x>Mở đề</a>`}); }; }});
}
Router.add('matrices',(el,[mid])=>{
  const list=DB.all('matrices').filter(x=>isAdmin()||x.createdBy===me().id||!x.createdBy).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  if(!mid){
    el.innerHTML=head('Ma trận & Bản đặc tả','Tạo ma trận theo cấu trúc chuẩn từng môn → bản đặc tả → sinh đề tự động từ ngân hàng',`<button class="btn pri" data-act="new">➕ Tạo ma trận</button>`)+
    (list.length?`<div class="grid g3">${list.map(x=>{ const types=Exam.mxTypes(x); const n=sum(types.flatMap(t=>MX_LEVELS.map(l=>Exam.mxCount(x,t,l)))); return `<div class="card"><div class="row"><span style="font-size:26px">${(SUBJECTS[x.subject]||{}).icon||'📄'}</span><div class="grow"><b>${esc(x.name)}</b><br><small class="muted">${subjName(x.subject)} ${x.grade} · ${n} câu · ${x.rows.length} chủ đề</small></div></div>
      <div class="row" style="margin-top:12px"><a class="btn sm" href="#/matrices/${x.id}">✏️ Mở</a><button class="btn sm" data-act="build" data-id="${x.id}">⚡ Tạo đề</button><button class="btn sm" data-act="word" data-id="${x.id}">⬇ Word</button><button class="btn sm bad" data-act="del" data-id="${x.id}">✕</button></div></div>`; }).join('')}</div>`:emptyBox('Chưa có ma trận nào','🧮'));
    on(el,'click','[data-act]',b=>{ const x=b.dataset.id&&DB.get('matrices',b.dataset.id); const a=b.dataset.act;
      if(a==='new') newMatrixModal(); if(a==='build') buildExamFromMatrixModal(x);
      if(a==='word') exportWord(slug(x.name)+'.doc',x.name,`<h1>${esc(x.name).toUpperCase()}</h1><p class="c">Môn: ${subjName(x.subject)} – Lớp ${x.grade} – Thời gian: ${x.duration} phút</p><h2>I. MA TRẬN</h2>${Exam.matrixHtml(x)}<br style="page-break-before:always"><h2>II. BẢN ĐẶC TẢ</h2>${Exam.specHtml(x)}`);
      if(a==='del') confirmBox('Xoá ma trận?',()=>{ DB.remove('matrices',x.id); App.render(); }); });
    return; }
  const mx=JSON.parse(JSON.stringify(DB.get('matrices',mid)||{})); if(!mx.id){ el.innerHTML=emptyBox('Không tìm thấy ma trận'); return; }
  let tab='mx';
  const draw=()=>{
    el.innerHTML=head(`<input type="text" id="mxName" value="${esc(mx.name)}" style="font-size:20px;font-weight:700;border:0;background:transparent;padding:0;width:min(640px,80vw)">`,`${subjName(mx.subject)} – lớp ${mx.grade} · Thời gian <input type="number" id="mxDur" value="${mx.duration}" style="width:70px;padding:3px 6px"> phút`,
      `<a class="btn" href="#/matrices">← Danh sách</a><button class="btn" data-act="word">⬇ Xuất Word</button><button class="btn" data-act="save">💾 Lưu</button><button class="btn pri" data-act="build">⚡ Tạo đề từ ma trận</button>`)+
    `<div class="tabs"><button data-tab="mx" class="${tab==='mx'?'on':''}">🧮 Ma trận</button><button data-tab="spec" class="${tab==='spec'?'on':''}">📋 Bản đặc tả</button><button data-tab="bank" class="${tab==='bank'?'on':''}">📦 Đối chiếu ngân hàng</button></div>
    <div class="card">${tab==='mx'?`<div class="tbl-wrap">${Exam.matrixHtml(mx,{editable:true})}</div><div class="row" style="margin-top:10px"><input type="text" id="mxNewTopic" list="mxTL" placeholder="Thêm chủ đề..." style="max-width:360px"><datalist id="mxTL">${topicsOf(mx.subject,mx.grade).map(t=>`<option value="${esc(t)}">`).join('')}</datalist><button class="btn" data-act="addrow">➕ Thêm dòng</button><span class="grow"></span><small class="muted">Chuẩn ${subjName(mx.subject)}: ${Exam.struct(mx.subject).map(p=>`${QT_NAME[p.type]} ${p.n}`).join(' · ')}</small></div>`
      :tab==='spec'?`<div class="note info" style="margin-bottom:10px">Yêu cầu cần đạt được gợi ý tự động – thầy cô chỉnh sửa trực tiếp, bấm Lưu.</div><div class="tbl-wrap">${Exam.specHtml(mx,{editable:true})}</div>`
      :bankCheck(mx)}</div>`;
  };
  const bankCheck=(mx)=>{ const all=DB.all('questions').filter(q=>q.subject===mx.subject&&+q.grade===+mx.grade); const types=Exam.mxTypes(mx);
    return `<div class="tbl-wrap"><table class="tbl center mx"><tr><th>Chủ đề</th>${types.map(t=>MX_LEVELS.map(l=>`<th>${QT_NAME[t]}<br>${l}</th>`).join('')).join('')}</tr>${mx.rows.map(r=>`<tr><td>${esc(r.topic)}</td>${types.map(t=>MX_LEVELS.map(l=>{ const need=((r.c[t]||{})[l])||0; const have=all.filter(q=>q.topic===r.topic&&q.type===t&&(q.level===l||(l==='VD'&&q.level==='VDC'))); const par=have.some(Param.has);
      return `<td style="background:${!need?'':have.length>=need||par?'#ecfdf5':'#fef2f2'}">${need?`${have.length}/${need}${par?' 🎲':''}`:'<small class="muted">'+have.length+'</small>'}</td>`; }).join('')).join('')}</tr>`).join('')}</table></div><p class="muted">Ô xanh: đủ câu (🎲 có câu tham số, sinh thêm được). Ô đỏ: cần bổ sung câu hỏi vào ngân hàng.</p>`; };
  const collect=()=>{ const n=$('#mxName',el); if(n) mx.name=n.value; const d=$('#mxDur',el); if(d) mx.duration=+d.value||mx.duration;
    $$('input[data-t]',el).forEach(i=>{ const r=mx.rows[+i.dataset.r]; r.c[i.dataset.t]=r.c[i.dataset.t]||{NB:0,TH:0,VD:0}; r.c[i.dataset.t][i.dataset.l]=Math.max(0,+i.value||0); });
    $$('input[data-topic]',el).forEach(i=>{ mx.rows[+i.dataset.topic].topic=i.value; });
    $$('textarea[data-spec]',el).forEach(t=>{ const r=mx.rows[+t.dataset.spec]; r.spec=r.spec||{}; r.spec[t.dataset.l]=t.value; }); };
  el.addEventListener('change',e=>{ if(e.target.matches('input[data-t],input[data-topic]')){ collect(); draw(); } });
  on(el,'click','[data-tab]',b=>{ collect(); tab=b.dataset.tab; draw(); });
  on(el,'click','[data-act],[data-delrow]',b=>{ collect(); const a=b.dataset.act;
    if(b.dataset.delrow!=null){ mx.rows.splice(+b.dataset.delrow,1); draw(); return; }
    if(a==='addrow'){ const t=$('#mxNewTopic',el).value.trim()||'Chủ đề mới'; mx.rows.push({topic:t,c:Exam.emptyCells(Exam.typesOf(mx.subject)),spec:{}}); draw(); }
    if(a==='save'){ mx.updatedAt=Date.now(); DB.upsert('matrices',mx); toast('Đã lưu ma trận','ok'); }
    if(a==='build'){ DB.upsert('matrices',mx); buildExamFromMatrixModal(mx); }
    if(a==='word') exportWord(slug(mx.name)+'.doc',mx.name,`<h1>${esc(mx.name).toUpperCase()}</h1><p class="c">Môn: ${subjName(mx.subject)} – Lớp ${mx.grade} – Thời gian: ${mx.duration} phút</p><h2>I. MA TRẬN ĐỀ</h2>${Exam.matrixHtml(mx)}<br style="page-break-before:always"><h2>II. BẢN ĐẶC TẢ</h2>${Exam.specHtml(mx)}`);
  });
  draw();
});

/* ===================== ĐỀ THI ===================== */
function manualExamModal(exam){
  const isNew=!exam; exam=exam?JSON.parse(JSON.stringify(exam)):{id:uid('ex'),title:'',subject:(me().subjects||[])[0]||'toan',grade:12,duration:45,questionIds:[],createdBy:me().id,variants:[]};
  const sel=new Set(exam.questionIds); const F={topic:'',type:'',level:''};
  modal({title:isNew?'Tạo đề thủ công từ ngân hàng':'Sửa câu hỏi của đề',size:'xl',body:`
    <div class="grid g4"><div class="field"><label>Tên đề</label><input type="text" id="meT" value="${esc(exam.title)}"></div><div class="field"><label>Môn</label><select id="meS">${opts(subjList(),exam.subject)}</select></div><div class="field"><label>Lớp</label><select id="meG">${opts(GRADES,exam.grade)}</select></div><div class="field"><label>Thời gian (phút)</label><input type="number" id="meD" value="${exam.duration}"></div></div>
    <div class="row" style="margin-bottom:8px"><select id="meTopic" style="max-width:300px"></select><select id="meTy" style="max-width:200px">${opts(QTYPES,'','— Loại —')}</select><select id="meL" style="max-width:160px">${opts(LEVELS,'','— Mức —')}</select><span class="grow"></span><span id="meCount" class="pill-list"></span></div>
    <div id="meList" style="max-height:52vh;overflow:auto"></div>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="meSave">Lưu đề</button>`,onOpen:(m,close)=>{
      const draw=()=>{ const s=$('#meS',m).value,g=+$('#meG',m).value; const qs=visibleQuestions().filter(q=>q.subject===s&&+q.grade===g&&(!F.topic||q.topic===F.topic)&&(!F.type||q.type===F.type)&&(!F.level||q.level===F.level));
        $('#meList',m).innerHTML=qs.length?qs.map(q=>`<label style="display:flex;gap:10px;align-items:flex-start;font-weight:400"><input type="checkbox" class="chk" data-q="${q.id}" ${sel.has(q.id)?'checked':''} style="margin-top:16px"><div class="grow">${qCard(Param.instantiate(q,'m'),{showAnswer:false})}</div></label>`).join(''):emptyBox('Không có câu hỏi');
        renderMath($('#meList',m)); count(); };
      const count=()=>{ const s=$('#meS',m).value; const chosen=[...sel].map(id=>DB.get('questions',id)).filter(Boolean); const g=groupBy(chosen,q=>q.type);
        $('#meCount',m).innerHTML=Exam.struct(s).map(p=>{ const n=(g[p.type]||[]).length; return `<span class="badge ${n===p.n?'ok':n>p.n?'bad':'warn'}">${QT_NAME[p.type]}: ${n}/${p.n}</span>`; }).join('')+` <span class="badge">Tổng ${chosen.length}</span>`; };
      const topics=()=>{ $('#meTopic',m).innerHTML=opts(topicsOf($('#meS',m).value,$('#meG',m).value),'','— Chủ đề —'); };
      $('#meS',m).onchange=()=>{ topics(); draw(); }; $('#meG',m).onchange=()=>{ topics(); draw(); };
      $('#meTopic',m).onchange=e=>{F.topic=e.target.value;draw();}; $('#meTy',m).onchange=e=>{F.type=e.target.value;draw();}; $('#meL',m).onchange=e=>{F.level=e.target.value;draw();};
      m.addEventListener('change',e=>{ if(e.target.dataset.q){ e.target.checked?sel.add(e.target.dataset.q):sel.delete(e.target.dataset.q); count(); } });
      $('#meSave',m).onclick=()=>{ if(!sel.size) return toast('Chọn ít nhất 1 câu','bad'); Object.assign(exam,{title:$('#meT',m).value.trim()||'Đề không tên',subject:$('#meS',m).value,grade:+$('#meG',m).value,duration:+$('#meD',m).value||45,questionIds:[...sel],createdAt:exam.createdAt||Date.now(),updatedAt:Date.now()});
        if(exam.variants&&exam.variants.length) Exam.mix(exam,exam.variants.length,{startCode:+exam.variants[0].code}); DB.upsert('exams',exam); close(); toast('Đã lưu đề','ok'); App.render(); };
      topics(); draw(); }});
}
function mixModal(ex){
  modal({title:'🔀 Trộn đề: '+esc(ex.title),body:`<div class="grid g2"><div class="field"><label>Số mã đề</label><input type="number" id="mxN" value="${(ex.variants||[]).length||4}" min="1" max="24"></div><div class="field"><label>Mã đề bắt đầu</label><input type="number" id="mxC" value="${ex.variants&&ex.variants[0]?ex.variants[0].code:101}"></div></div>
    ${[['mxQ','Đảo thứ tự câu trong từng phần',1],['mxO','Đảo phương án A, B, C, D (phần I)',1],['mxT','Đảo thứ tự các ý a, b, c, d (phần II)',0],['mxD','Thay số khác nhau cho từng mã đề (câu số tương tự)',1]].map(([id,t,c])=>`<label style="display:flex;gap:6px;align-items:center;margin:6px 0;font-weight:500"><input type="checkbox" class="chk" id="${id}" ${c?'checked':''}> ${t}</label>`).join('')}
    <div class="note info">Đúng quy tắc trộn đề THPT: câu chỉ đảo trong cùng một phần, giữ nguyên số câu và thang điểm mỗi phần.</div>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="mxGo">Trộn đề</button>`,onOpen:(m,close)=>{ $('#mxGo',m).onclick=()=>{
      Exam.mix(ex,Math.max(1,+$('#mxN',m).value),{startCode:+$('#mxC',m).value||101,shuffleQ:$('#mxQ',m).checked,shuffleOpt:$('#mxO',m).checked,shuffleTf:$('#mxT',m).checked,diffNumbers:$('#mxD',m).checked});
      DB.upsert('exams',ex); close(); toast(`Đã tạo ${ex.variants.length} mã đề`,'ok'); App.render(); }; }});
}
const HDR_FIELDS=[['so','Sở / Phòng GD&ĐT'],['truong','Tên trường'],['kythi','Tên kì thi / bài kiểm tra'],['namhoc','Năm học'],['loai','Ô góc trái (ĐỀ CHÍNH THỨC / ĐỀ THAM KHẢO…)'],['ghichu','Dòng ghi chú (để trống = “Đề có N câu”)'],['chantrang','Dòng cuối đề']];
function headerFieldsHtml(H,pre='hd'){ return `<div class="grid g2">${HDR_FIELDS.map(([k,t])=>`<div class="field"><label>${t}</label><input type="text" id="${pre}_${k}" value="${esc(H[k]||'')}"></div>`).join('')}</div>
  <div class="row"><label style="display:flex;gap:6px;align-items:center;font-weight:500;margin:0"><input type="checkbox" class="chk" id="${pre}_sbd" ${H.sbd?'checked':''}> Dòng “Số báo danh”</label><label style="display:flex;gap:6px;align-items:center;font-weight:500;margin:0"><input type="checkbox" class="chk" id="${pre}_diem" ${H.diem?'checked':''}> Khung Điểm – Lời phê</label><label style="display:flex;gap:6px;align-items:center;font-weight:500;margin:0"><input type="checkbox" class="chk" id="${pre}_phieu" ${H.phieu?'checked':''}> Kèm phiếu trả lời</label><label style="margin:0">Cỡ chữ</label><select id="${pre}_size" style="width:80px">${opts([11,12,13],H.size||12)}</select></div>`; }
function readHeader(m,pre='hd'){ const H={}; HDR_FIELDS.forEach(([k])=>H[k]=$('#'+pre+'_'+k,m).value.trim()); H.sbd=$('#'+pre+'_sbd',m).checked; H.diem=$('#'+pre+'_diem',m).checked; H.phieu=$('#'+pre+'_phieu',m).checked; H.size=+$('#'+pre+'_size',m).value; return H; }
function exportExamModal(ex){
  const vs=ex.variants||[]; const H0=Exam.header(ex);
  modal({title:'⬇ Xuất đề thi: '+esc(ex.title),size:'xl',body:`<div class="grid" style="grid-template-columns:1.1fr 1fr;align-items:start;gap:18px"><div>
    <h3>1. Tiêu đề đề thi</h3>${headerFieldsHtml(H0)}<label style="display:flex;gap:6px;align-items:center;font-weight:500;margin-top:8px"><input type="checkbox" class="chk" id="exSaveH" checked> Lưu tiêu đề này cho đề</label>
    <h3 style="margin-top:14px">2. Nội dung xuất</h3><div class="field"><label>Mã đề</label><div class="pill-list">${vs.length?vs.map(v=>`<label style="font-weight:500;display:flex;gap:4px;align-items:center"><input type="checkbox" class="chk" data-v="${v.code}" checked> ${v.code}</label>`).join(''):'<span class="muted">Đề chưa trộn – xuất đề gốc (mã 000)</span>'}</div></div>
    ${[['eqE','Đề thi (từng mã)',1],['eqK','Bảng đáp án các mã',1],['eqS','Đề có lời giải chi tiết',0],['eqM','Ma trận của đề',0],['eqP','Bản đặc tả của đề',0]].map(([id,t,c])=>`<label style="display:flex;gap:6px;align-items:center;margin:5px 0;font-weight:500"><input type="checkbox" class="chk" id="${id}" ${c?'checked':''}> ${t}</label>`).join('')}
    <div class="note info" style="margin-top:8px">• <b>Word (.docx)</b>: công thức được <b>biên dịch sẵn thành Equation của Word</b> (bấm vào sửa được; chuyển sang MathType bằng MathType → Convert Equations), hình vẽ nhúng sẵn, có số trang.<br>• <b>In/PDF</b>: công thức được biên dịch trước khi in – chọn máy in “Lưu dưới dạng PDF”.<br>• <b>LaTeX ex_test</b>: file .tex theo gói ex_test kèm thư mục hình (zip).</div></div>
    <div><div class="row"><h3 class="grow" style="margin:0">Xem trước</h3><select id="exPv" style="width:150px">${opts([{v:'',t:'Mã gốc'},...vs.map(v=>({v:v.code,t:'Mã '+v.code}))],vs[0]?vs[0].code:'')}</select></div><div id="exPrev" class="paper"></div></div></div>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn" id="exT">📐 LaTeX ex_test (.zip)</button><button class="btn" id="exP">🖨 In / PDF</button><button class="btn pri" id="exW">⬇ Word (.docx)</button>`,onOpen:(m,close)=>{
      const H=()=>readHeader(m);
      const pv=()=>{ const v=vs.find(x=>x.code===$('#exPv',m).value)||null; $('#exPrev',m).innerHTML=Exam.examHtml(ex,v,{header:H()}); $$('#exPrev table[border]',m).forEach(t=>t.classList.add('tbl')); renderMath($('#exPrev',m)); };
      let tm; m.addEventListener('input',e=>{ if(e.target.id&&e.target.id.startsWith('hd_')){ clearTimeout(tm); tm=setTimeout(pv,400);} }); m.addEventListener('change',e=>{ if(e.target.id==='exPv'||(e.target.id||'').startsWith('hd_')) pv(); });
      const chosen=()=>{ const codes=$$('[data-v]',m).filter(c=>c.checked).map(c=>c.dataset.v); return vs.length?vs.filter(v=>codes.includes(v.code)):[null]; };
      const saveH=()=>{ if($('#exSaveH',m).checked){ ex.header=H(); DB.upsert('exams',ex); } };
      const build=()=>{ const ch=chosen(), h=H(); const br='<br style="page-break-before:always">'; let parts=[];
        if($('#eqE',m).checked) ch.forEach(v=>parts.push(Exam.examHtml(ex,v,{header:h})));
        if($('#eqK',m).checked) parts.push(`<h1>ĐÁP ÁN – ${esc(h.kythi).toUpperCase()}</h1><p class="c">Môn ${subjName(ex.subject)} ${ex.grade} – ${esc(ex.title)}</p>`+Exam.answerKeyHtml(ex,ch[0]?ch:null));
        if($('#eqS',m).checked) parts.push(`<h1>HƯỚNG DẪN GIẢI CHI TIẾT</h1>`+Exam.examHtml(ex,ch[0],{withAnswer:true,header:{...h,phieu:false}}));
        const mx=Exam.matrixFromExam(ex); if($('#eqM',m).checked) parts.push(`<h1>MA TRẬN ĐỀ – ${esc(ex.title).toUpperCase()}</h1>`+Exam.matrixHtml(mx));
        if($('#eqP',m).checked) parts.push(`<h1>BẢN ĐẶC TẢ ĐỀ – ${esc(ex.title).toUpperCase()}</h1>`+Exam.specHtml(mx));
        return parts.join(br); };
      $('#exW',m).onclick=()=>{ saveH(); exportWord(slug(ex.title),ex.title,build(),{size:H().size,footer:subjName(ex.subject)+' '+ex.grade}); };
      $('#exP',m).onclick=()=>{ saveH(); printHtml(ex.title,build()); };
      $('#exT',m).onclick=async()=>{ saveH(); const files=[]; const h=H(); for(const v of chosen()){ const r=Exam.exTest(ex,v,{withSolution:$('#eqS',m).checked,header:h}); files.push({name:`de_${v?v.code:'000'}.tex`,data:r.tex});
          for(const im of r.imgs){ const p=await svgToPng(im.svg,3); if(p) files.push({name:im.name,data:b64ToBytes(p.data)}); } }
        download(slug(ex.title)+'_ex_test.zip',makeZip(files)); toast('Đã xuất LaTeX ex_test','ok'); };
      pv(); }});
}
function similarModal(ex){
  modal({title:'🎲 Tạo đề tương tự: '+esc(ex.title),body:`<div class="note info">• Câu <b>tham số</b> (🎲) được <b>thay số mới</b> giữ nguyên dạng.<br>• Câu thường được <b>thay bằng câu khác cùng chủ đề – cùng dạng – cùng mức độ</b> trong ngân hàng (nếu có), nếu không thì giữ nguyên.<br>• Cấu trúc, số câu, thang điểm giữ đúng như đề gốc.</div>
    <div class="grid g2" style="margin-top:10px"><div class="field"><label>Số đề tương tự cần tạo</label><input type="number" id="smN" value="1" min="1" max="10"></div><div class="field"><label>Cách làm</label><select id="smM"><option value="1">Thay số + thay câu cùng dạng</option><option value="0">Chỉ thay số (giữ nguyên câu thường)</option></select></div></div>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="smGo">Tạo đề</button>`,onOpen:(m,close)=>{ $('#smGo',m).onclick=()=>{ const n=Math.min(10,Math.max(1,+$('#smN',m).value||1)); const rep=$('#smM',m).value==='1'; let tot={a:0,b:0,c:0};
      for(let i=0;i<n;i++){ const r=Exam.similar(ex,{replace:rep,title:`${ex.title} – đề tương tự ${i+1}`}); DB.upsert('exams',r.exam); tot.a+=r.nNum; tot.b+=r.nRep; tot.c+=r.nKeep; }
      close(); toast(`Đã tạo ${n} đề tương tự: ${tot.a} lượt thay số, ${tot.b} lượt thay câu, ${tot.c} câu giữ nguyên`,'ok'); App.render(); }; }});
}
function assignModal(examId,asg){
  const isNew=!asg; const ex0=examId?DB.get('exams',examId):null; const toLocal=t=>{ const d=new Date(t); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,16); };
  asg=asg?{...asg}:{id:uid('as'),examId:examId||'',classIds:[],start:Date.now(),end:Date.now()+7*86400000,duration:ex0?ex0.duration:45,attempts:1,showResult:true,showAnswer:false,createdBy:me().id};
  const exams=DB.all('exams').filter(e=>isAdmin()||e.createdBy===me().id||!e.createdBy);
  modal({title:isNew?'📤 Giao bài kiểm tra / luyện tập':'Sửa bài giao',body:`<div class="field"><label>Đề</label><select id="agE">${opts(exams.map(e=>({v:e.id,t:`${e.title} (${subjName(e.subject)} ${e.grade} – ${e.questionIds.length} câu)`})),asg.examId)}</select></div>
    <div class="field"><label>Tiêu đề hiển thị cho học sinh</label><input type="text" id="agT" value="${esc(asg.title||(ex0?ex0.title:''))}"></div>
    <div class="field"><label>Giao cho lớp</label><div class="pill-list">${myClasses().map(c=>`<label style="font-weight:500;display:flex;gap:4px;align-items:center;border:1px solid var(--line);padding:5px 10px;border-radius:99px"><input type="checkbox" class="chk" data-c="${c.id}" ${asg.classIds.includes(c.id)?'checked':''}> ${esc(c.name)}</label>`).join('')}</div></div>
    <div class="grid g2"><div class="field"><label>Mở lúc</label><input type="datetime-local" id="agS" value="${toLocal(asg.start)}"></div><div class="field"><label>Đóng lúc</label><input type="datetime-local" id="agX" value="${toLocal(asg.end)}"></div>
    <div class="field"><label>Thời gian làm bài (phút)</label><input type="number" id="agD" value="${asg.duration}"></div><div class="field"><label>Số lần làm tối đa</label><input type="number" id="agA" value="${asg.attempts}" min="1" max="20"></div></div>
    <label style="display:flex;gap:6px;align-items:center;font-weight:500"><input type="checkbox" class="chk" id="agR" ${asg.showResult?'checked':''}> Cho học sinh xem điểm ngay sau khi nộp</label>
    <label style="display:flex;gap:6px;align-items:center;font-weight:500;margin-top:6px"><input type="checkbox" class="chk" id="agK" ${asg.showAnswer?'checked':''}> Cho xem đáp án & lời giải sau khi nộp</label>
    <label style="display:flex;gap:6px;align-items:center;font-weight:500;margin-top:6px"><input type="checkbox" class="chk" id="agF" ${asg.antiCheat!==false?'checked':''}> Ghi nhận số lần rời khỏi trang khi làm bài</label>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="agGo">${isNew?'Giao bài':'Lưu'}</button>`,onOpen:(m,close)=>{
      $('#agE',m).onchange=e=>{ const x=DB.get('exams',e.target.value); if(x){ $('#agT',m).value=x.title; $('#agD',m).value=x.duration; } };
      $('#agGo',m).onclick=()=>{ const cids=$$('[data-c]',m).filter(c=>c.checked).map(c=>c.dataset.c); if(!$('#agE',m).value) return toast('Chọn đề','bad'); if(!cids.length) return toast('Chọn ít nhất 1 lớp','bad');
        Object.assign(asg,{examId:$('#agE',m).value,title:$('#agT',m).value.trim()||DB.get('exams',$('#agE',m).value).title,classIds:cids,start:new Date($('#agS',m).value).getTime(),end:new Date($('#agX',m).value).getTime(),duration:+$('#agD',m).value||45,attempts:+$('#agA',m).value||1,showResult:$('#agR',m).checked,showAnswer:$('#agK',m).checked,antiCheat:$('#agF',m).checked,createdAt:asg.createdAt||Date.now(),updatedAt:Date.now()});
        if(asg.end<=asg.start) return toast('Thời gian đóng phải sau thời gian mở','bad');
        DB.upsert('assignments',asg); close(); toast('Đã giao bài cho '+cids.map(className).join(', '),'ok'); location.hash='#/assignments'; App.render(); }; }});
}
function examViewModal(ex){
  let v=(ex.variants||[])[0]||null, tab='exam';
  modal({title:'📝 '+esc(ex.title),size:'xl',body:`<div class="row" style="margin-bottom:10px"><label style="margin:0">Mã đề</label><select id="evV" style="width:160px">${opts([{v:'',t:'Đề gốc'},...(ex.variants||[]).map(x=>({v:x.code,t:'Mã '+x.code}))],v?v.code:'')}</select><span class="grow"></span><span class="badge">${subjName(ex.subject)} ${ex.grade}</span><span class="badge gray">${ex.questionIds.length} câu · ${ex.duration} phút</span></div>
    <div class="tabs"><button data-t="exam" class="on">Đề thi</button><button data-t="key">Đáp án</button><button data-t="sol">Lời giải</button><button data-t="mx">Ma trận từ đề</button><button data-t="spec">Đặc tả từ đề</button></div><div id="evB" style="background:#fff"></div>`,
    foot:`<button class="btn" data-x>Đóng</button><a class="btn" href="#/try/${ex.id}" data-x>▶ Làm thử</a><button class="btn" id="evSim">🎲 Đề tương tự</button><button class="btn" id="evMix">🔀 Trộn đề</button><button class="btn" id="evEdit">✏️ Sửa câu</button><button class="btn pri" id="evExp">⬇ Xuất Word/PDF</button>`,onOpen:(m,close)=>{
      const draw=()=>{ const mx=Exam.matrixFromExam(ex); $('#evB',m).innerHTML= tab==='exam'?Exam.examHtml(ex,v):tab==='key'?Exam.answerKeyHtml(ex,v?[v]:null):tab==='sol'?Exam.examHtml(ex,v,{withAnswer:true}):tab==='mx'?`<div class="tbl-wrap">${Exam.matrixHtml(mx)}</div><div class="row" style="margin-top:10px"><button class="btn sm" id="evSaveMx">💾 Lưu thành ma trận mẫu (dùng tạo đề tương tự)</button></div>`:`<div class="tbl-wrap">${Exam.specHtml(mx)}</div>`;
        $$('#evB table[border]',m).forEach(t=>t.classList.add('tbl')); renderMath($('#evB',m));
        const sb=$('#evSaveMx',m); if(sb) sb.onclick=()=>{ const c={...mx,id:uid('mx'),name:'Ma trận theo đề: '+ex.title,createdBy:me().id,createdAt:Date.now()}; delete c.fromExam; c.rows.forEach(r=>delete r.nums); DB.upsert('matrices',c); toast('Đã lưu ma trận – vào mục Ma trận để tạo đề tương tự','ok'); }; };
      $('#evV',m).onchange=e=>{ v=(ex.variants||[]).find(x=>x.code===e.target.value)||null; draw(); };
      on(m,'click','[data-t]',b=>{ $$('[data-t]',m).forEach(x=>x.classList.toggle('on',x===b)); tab=b.dataset.t; draw(); });
      $('#evMix',m).onclick=()=>{ close(); mixModal(ex); }; $('#evSim',m).onclick=()=>{ close(); similarModal(ex); }; $('#evEdit',m).onclick=()=>{ close(); manualExamModal(ex); }; $('#evExp',m).onclick=()=>exportExamModal(ex);
      draw(); }});
}
Router.add('exams',(el,[eid])=>{
  const list=DB.all('exams').filter(e=>isAdmin()||e.createdBy===me().id||!e.createdBy).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  el.innerHTML=head('Đề thi','Tạo đề thủ công / từ ma trận / nhập từ văn bản · trộn đề · xuất Word · ma trận & đặc tả từ đề',`<button class="btn" data-act="imp">📝 Nhập đề từ văn bản</button><a class="btn" href="#/matrices">🧮 Tạo từ ma trận</a><button class="btn pri" data-act="new">➕ Tạo đề thủ công</button>`)+
  (list.length?`<div class="tbl-wrap"><table class="tbl"><tr><th>Đề thi</th><th>Môn – lớp</th><th>Cấu trúc</th><th>Mã đề</th><th>Ngày tạo</th><th style="text-align:right">Thao tác</th></tr>${list.map(e=>{ const g=groupBy(e.questionIds.map(id=>DB.get('questions',id)).filter(Boolean),q=>q.type);
    return `<tr><td><b>${esc(e.title)}</b><br><small class="muted">${e.duration} phút${e.matrixId?' · theo ma trận':''}</small></td><td>${(SUBJECTS[e.subject]||{}).icon||''} ${subjName(e.subject)} ${e.grade}</td><td><small>${PART_ORDER.filter(t=>g[t]).map(t=>`${QT_NAME[t]}: ${g[t].length}`).join('<br>')}</small></td><td>${(e.variants||[]).length?(e.variants.map(v=>`<span class="badge gray">${v.code}</span>`).join(' ')):'<small class="muted">chưa trộn</small>'}</td><td><small>${fmtDay(e.createdAt)}</small></td>
    <td style="text-align:right;white-space:nowrap"><button class="btn sm" data-act="view" data-id="${e.id}">👁 Xem</button><button class="btn sm" data-act="mix" data-id="${e.id}">🔀</button><button class="btn sm" data-act="exp" data-id="${e.id}">⬇</button><button class="btn sm pri" data-act="assign" data-id="${e.id}">📤 Giao</button><button class="btn sm" data-act="sim" data-id="${e.id}" title="Tạo đề tương tự (thay số)">🎲 Tương tự</button><button class="btn sm" data-act="copy" data-id="${e.id}" title="Nhân bản">⧉</button><button class="btn sm bad" data-act="del" data-id="${e.id}">✕</button></td></tr>`; }).join('')}</table></div>`:emptyBox('Chưa có đề thi','📝'));
  on(el,'click','[data-act]',b=>{ const a=b.dataset.act, ex=b.dataset.id&&DB.get('exams',b.dataset.id);
    if(a==='new') manualExamModal(); if(a==='imp') importTextModal(()=>App.render(),{asExam:true});
    if(a==='view') examViewModal(ex); if(a==='mix') mixModal(ex); if(a==='exp') exportExamModal(ex); if(a==='assign') assignModal(ex.id);
    if(a==='sim') similarModal(ex);
    if(a==='copy'){ const c={...JSON.parse(JSON.stringify(ex)),id:uid('ex'),title:ex.title+' (bản sao)',createdAt:Date.now(),createdBy:me().id}; DB.upsert('exams',c); App.render(); }
    if(a==='del') confirmBox('Xoá đề “'+esc(ex.title)+'”? Bài giao dùng đề này cũng bị xoá.',()=>{ DB.removeWhere('assignments',x=>x.examId===ex.id); DB.remove('exams',ex.id); App.render(); }); });
  if(eid){ const ex=DB.get('exams',eid); if(ex) setTimeout(()=>examViewModal(ex),50); }
});

/* ===================== HỌC LIỆU ===================== */
const ytId=u=>{ const m=String(u||'').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m?m[1]:null; };
const LTYPE={video:{t:'Video',i:'🎬',c:'#ef4444'},html:{t:'Bài giảng',i:'📘',c:'#4f46e5'},link:{t:'Tài liệu/Link',i:'🔗',c:'#0891b2'},file:{t:'Tệp đính kèm',i:'📎',c:'#ca8a04'}};
function lessonEditor(l){
  const isNew=!l; l=l?{...l}:{id:uid('l'),title:'',subject:(me().subjects||[])[0]||'toan',grade:12,topic:'',type:'video',url:'',content:'',classIds:[],createdBy:me().id};
  modal({title:isNew?'Thêm học liệu':'Sửa học liệu',size:'lg',body:`<div class="field"><label>Tiêu đề</label><input type="text" id="lT" value="${esc(l.title)}"></div>
    <div class="grid g4"><div class="field"><label>Loại</label><select id="lTy">${opts(Object.entries(LTYPE).map(([v,o])=>({v,t:o.i+' '+o.t})),l.type)}</select></div><div class="field"><label>Môn</label><select id="lS">${opts(subjList(),l.subject)}</select></div><div class="field"><label>Lớp</label><select id="lG">${opts(GRADES,l.grade)}</select></div><div class="field"><label>Chủ đề</label><input type="text" id="lTo" list="lTL" value="${esc(l.topic)}"><datalist id="lTL"></datalist></div></div>
    <div class="field" id="lUrlF"><label id="lUrlL">Link</label><input type="url" id="lU" value="${esc(l.url||'')}" placeholder="https://..."></div>
    <div class="field" id="lFileF"><label>Tệp (PDF, ảnh, docx… tối đa 1 MB – tệp lớn nên dùng link Google Drive)</label><div class="row"><button class="btn" id="lPick">📂 Chọn tệp</button><span id="lFN" class="muted">${esc(l.fileName||'')}</span></div></div>
    <div class="field"><label>Nội dung / mô tả <small class="muted">(hỗ trợ công thức $...$)</small></label>
      <div class="toolbar">${[['bold','B'],['italic','I'],['underline','U'],['insertUnorderedList','• List'],['insertOrderedList','1. List'],['formatBlock:h3','Tiêu đề'],['formatBlock:p','Đoạn']].map(([c,t])=>`<button class="btn sm" data-cmd="${c}">${t}</button>`).join('')}<button class="btn sm" data-cmd="math">∑ Công thức</button><button class="btn sm" data-cmd="img">🖼 Ảnh (link)</button></div>
      <div class="editor" id="lC" contenteditable="true">${l.content||''}</div></div>
    <div class="field"><label>Giao cho lớp</label><div class="pill-list">${myClasses().map(c=>`<label style="font-weight:500;display:flex;gap:4px;align-items:center;border:1px solid var(--line);padding:5px 10px;border-radius:99px"><input type="checkbox" class="chk" data-c="${c.id}" ${l.classIds.includes(c.id)?'checked':''}> ${esc(c.name)}</label>`).join('')}</div></div>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="lSave">Lưu học liệu</button>`,onOpen:(m,close)=>{
      const ty=()=>{ const t=$('#lTy',m).value; $('#lUrlF',m).classList.toggle('hide',t==='html'||t==='file'); $('#lFileF',m).classList.toggle('hide',t!=='file'); $('#lUrlL',m).textContent=t==='video'?'Link video YouTube':'Link tài liệu (Google Drive, PDF, website…)';
        $('#lTL',m).innerHTML=topicsOf($('#lS',m).value,$('#lG',m).value).map(x=>`<option value="${esc(x)}">`).join(''); };
      $('#lTy',m).onchange=ty; $('#lS',m).onchange=ty; $('#lG',m).onchange=ty; ty();
      on(m,'click','[data-cmd]',(b,e)=>{ e.preventDefault(); const c=b.dataset.cmd; $('#lC',m).focus();
        if(c==='math'){ const f=prompt('Nhập công thức LaTeX (không cần dấu $):','\\int_0^1 x^2\\,dx=\\dfrac13'); if(f) document.execCommand('insertText',false,'$'+f+'$'); }
        else if(c==='img'){ const u=prompt('Link ảnh:'); if(u) document.execCommand('insertImage',false,u); }
        else if(c.startsWith('formatBlock')) document.execCommand('formatBlock',false,c.split(':')[1]); else document.execCommand(c); });
      $('#lPick',m).onclick=()=>pickFile('*/*',f=>{ if(f.size>1048576) return toast('Tệp lớn hơn 1 MB – hãy dùng link Google Drive','bad'); const fr=new FileReader(); fr.onload=e=>{ l.fileData=e.target.result; l.fileName=f.name; $('#lFN',m).textContent=f.name; }; fr.readAsDataURL(f); });
      $('#lSave',m).onclick=()=>{ const t=$('#lT',m).value.trim(); if(!t) return toast('Nhập tiêu đề','bad'); const type=$('#lTy',m).value;
        Object.assign(l,{title:t,type,subject:$('#lS',m).value,grade:+$('#lG',m).value,topic:$('#lTo',m).value.trim(),url:$('#lU',m).value.trim(),content:$('#lC',m).innerHTML,classIds:$$('[data-c]',m).filter(c=>c.checked).map(c=>c.dataset.c),createdAt:l.createdAt||Date.now(),updatedAt:Date.now()});
        if(type==='video'&&!ytId(l.url)) return toast('Link YouTube chưa hợp lệ','bad'); if(type==='file'&&!l.fileData) return toast('Chọn tệp','bad');
        DB.upsert('lessons',l); close(); toast('Đã lưu học liệu','ok'); App.render(); }; }});
}
function lessonThumb(l){ const o=LTYPE[l.type]||LTYPE.link; const y=l.type==='video'&&ytId(l.url); return `<div class="thumb" style="background:${y?`url(https://img.youtube.com/vi/${y}/mqdefault.jpg) center/cover`:`linear-gradient(135deg,${o.c},#7c3aed)`}">${y?'<span style="background:rgba(0,0,0,.55);border-radius:50%;width:54px;height:54px;display:grid;place-items:center;font-size:24px">▶</span>':o.i}</div>`; }
function lessonBody(l){ let h=''; if(l.type==='video'&&ytId(l.url)) h+=`<div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${ytId(l.url)}" allowfullscreen allow="accelerometer; autoplay; encrypted-media; picture-in-picture"></iframe></div>`;
  if(l.type==='link'&&l.url) h+=`<p><a class="btn pri" href="${esc(l.url)}" target="_blank" rel="noopener">🔗 Mở tài liệu</a></p>${/drive\.google\.com\/file\/d\//.test(l.url)?`<div class="video-wrap" style="padding-top:75%"><iframe src="${esc(l.url.replace(/\/view.*$/,'/preview'))}"></iframe></div>`:''}`;
  if(l.type==='file'&&l.fileData) h+=`<p><a class="btn pri" href="${l.fileData}" download="${esc(l.fileName)}">📎 Tải ${esc(l.fileName)}</a></p>${/^data:application\/pdf/.test(l.fileData)?`<iframe src="${l.fileData}" style="width:100%;height:70vh;border:1px solid var(--line);border-radius:10px"></iframe>`:/^data:image/.test(l.fileData)?`<img src="${l.fileData}" style="max-width:100%;border-radius:10px">`:''}`;
  return h+`<div style="margin-top:14px">${l.content||''}</div>`; }
Router.add('lessons',el=>{
  const list=DB.all('lessons').filter(l=>isAdmin()||l.createdBy===me().id||!l.createdBy).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  el.innerHTML=head('Học liệu','Bài giảng soạn thảo, video YouTube, tài liệu Drive/PDF – giao theo lớp, theo dõi học sinh đã học',`<button class="btn pri" data-act="new">➕ Thêm học liệu</button>`)+
  (list.length?`<div class="grid g4">${list.map(l=>{ const stu=l.classIds.flatMap(studentsOf); const done=DB.all('progress').filter(p=>p.lessonId===l.id&&p.done&&stu.some(s=>s.id===p.studentId)).length;
    return `<div class="card lesson-card" data-act="view" data-id="${l.id}">${lessonThumb(l)}<div><span class="badge gray">${(LTYPE[l.type]||{}).t}</span> <span class="badge">${subjName(l.subject)} ${l.grade}</span></div><b>${esc(l.title)}</b><small class="muted">${l.classIds.map(className).join(', ')||'Chưa giao lớp'}</small><div class="row"><div class="bar grow"><i style="width:${stu.length?done/stu.length*100:0}%"></i></div><small>${done}/${stu.length} đã học</small></div></div>`; }).join('')}</div>`:emptyBox('Chưa có học liệu','📚'));
  on(el,'click','[data-act]',b=>{ const l=b.dataset.id&&DB.get('lessons',b.dataset.id);
    if(b.dataset.act==='new') lessonEditor();
    if(b.dataset.act==='view'){ const stu=l.classIds.flatMap(studentsOf); const pr=DB.all('progress').filter(p=>p.lessonId===l.id);
      modal({title:esc(l.title),size:'xl',body:`<div class="grid" style="grid-template-columns:2fr 1fr;align-items:start"><div>${lessonBody(l)}</div><div class="card"><h3>✅ Tình trạng học (${pr.filter(p=>p.done).length}/${stu.length})</h3>${stu.map(s=>{ const p=pr.find(x=>x.studentId===s.id); return `<div class="row" style="padding:5px 0;border-bottom:1px dashed #eef1f7"><span class="grow">${esc(s.name)} <small class="muted">${className(s.classId)}</small></span>${p&&p.done?`<span class="badge ok">✓ ${fmtDay(p.at)}</span>`:'<span class="badge gray">chưa</span>'}</div>`; }).join('')||'<small class="muted">Chưa giao lớp</small>'}</div></div>`,
        foot:`<button class="btn" data-x>Đóng</button><button class="btn bad" id="lDel">Xoá</button><button class="btn pri" id="lEd">✏️ Sửa</button>`,onOpen:(m,close)=>{ $('#lEd',m).onclick=()=>{close();lessonEditor(l);}; $('#lDel',m).onclick=()=>confirmBox('Xoá học liệu?',()=>{ DB.remove('lessons',l.id); DB.removeWhere('progress',p=>p.lessonId===l.id); close(); App.render(); }); }}); } });
});

/* ===================== GIAO BÀI & KẾT QUẢ ===================== */
function subsOf(asId){ // lấy bài nộp tốt nhất (điểm cao nhất) mỗi học sinh
  const all=DB.all('submissions').filter(s=>s.assignmentId===asId); const best={}; all.forEach(s=>{ const b=best[s.studentId]; if(!b||(s.score||0)>(b.score||0)) best[s.studentId]=s; }); return {all,best}; }
function submissionView(sub,{teacher=true}={}){
  const ex=DB.get('exams',sub.examId); if(!ex) return toast('Đề đã bị xoá','bad'); const v=(ex.variants||[]).find(x=>x.code===sub.variant)||null; const items=Exam.items(ex,v); const manual=sub.manual||{};
  const body=items.map(it=>{ const q=it.q, a=sub.answers[q.id]; const d=(sub.detail||[]).find(x=>x.qid===q.id)||{};
    let cls=d.ok===true?'review-ok':d.ok===false?(q.type==='tf'&&d.nOk>0?'review-part':'review-bad'):'';
    let h=`<div class="q ${cls}"><div class="q-head"><b>${QT_NAME[q.type]} – Câu ${it.no}</b><span class="grow"></span><span class="badge ${d.ok?'ok':d.ok===false?'bad':'warn'}">${d.pts!=null?fmtNum(d.pts):'?'} / ${fmtNum(d.max)} đ</span></div><div class="q-body">${q.content.replace(/\n/g,'<br>')}</div>${figHtml(q)}`;
    if(q.type==='mcq') h+=`<div class="opts">${it.perm.map((oi,k)=>`<div class="opt ${oi===q.answer?'right':''}" style="${+a===oi&&oi!==q.answer?'color:var(--bad);text-decoration:line-through':''}">${LETTER[k]}. ${q.options[oi]} ${+a===oi?'⬅ HS chọn':''}</div>`).join('')}</div>`;
    if(q.type==='tf') h+=it.perm.map((si,k)=>`<div class="tf-row"><b>${'abcd'[k]})</b><div class="grow">${q.statements[si]}</div><span class="badge gray">HS: ${Array.isArray(a)&&a[si]!=null?(a[si]?'Đ':'S'):'—'}</span><span class="badge ${q.answer[si]?'ok':'bad'}">ĐA: ${q.answer[si]?'Đ':'S'}</span></div>`).join('');
    if(q.type==='short') h+=`<p>HS trả lời: <b>${esc(a||'—')}</b> · Đáp án: <b>${esc(q.answer)}</b></p>`;
    if(q.type==='essay') h+=`<div class="note info" style="white-space:pre-wrap">${esc(a||'(bỏ trống)')}</div><p class="muted">Hướng dẫn chấm: ${q.answer||''}</p>${teacher?`<div class="row"><label style="margin:0">Điểm chấm:</label><input type="number" step="0.25" min="0" max="${d.max}" data-man="${q.id}" value="${manual[q.id]??''}" style="width:100px"> / ${fmtNum(d.max)}</div>`:''}`;
    if(q.explain) h+=`<p class="muted"><i>Lời giải:</i> ${q.explain}</p>`;
    return h+'</div>'; }).join('');
  modal({title:`Bài làm: ${esc(sub.studentName)} – ${esc(sub.className)} – Mã ${sub.variant||'gốc'}`,size:'lg',body:`<div class="row" style="margin-bottom:10px"><span class="badge ok" style="font-size:15px">Điểm: ${fmtNum(sub.score)}</span><span class="badge gray">Nộp: ${fmtDate(sub.submittedAt)}</span><span class="badge gray">Làm trong ${Math.round((sub.submittedAt-sub.startedAt)/60000)} phút</span>${sub.leaves?`<span class="badge warn">Rời trang ${sub.leaves} lần</span>`:''}</div>${body}`,
    foot:teacher&&items.some(i=>i.q.type==='essay')?`<button class="btn" data-x>Đóng</button><button class="btn pri" id="svSave">Lưu điểm tự luận</button>`:undefined,
    onOpen:(m,close)=>{ const b=$('#svSave',m); if(b) b.onclick=()=>{ const man={}; $$('[data-man]',m).forEach(i=>{ if(i.value!=='') man[i.dataset.man]=parseFloat(i.value); }); sub.manual=man; const g=Exam.grade(ex,v,sub.answers,man); Object.assign(sub,{score:g.score,detail:g.detail,status:g.pending?'pending':'graded',updatedAt:Date.now()});
      DB.upsert('submissions',sub); Sync.submit(sub); close(); toast('Đã lưu điểm','ok'); App.render(); }; }});
}
function resultsModal(asg){
  const ex=DB.get('exams',asg.examId); const stu=asg.classIds.flatMap(studentsOf); const {all,best}=subsOf(asg.id); const subs=Object.values(best); const sc=subs.filter(s=>s.score!=null).map(s=>s.score);
  // tỉ lệ đúng theo câu (theo đề gốc)
  const base=ex?Exam.items(ex,null):[]; const rate=base.map(it=>{ const ds=subs.map(s=>(s.detail||[]).find(d=>d.qid===it.q.id)).filter(Boolean); const r=ds.length?sum(ds.map(d=>d.max?d.pts/d.max:0))/ds.length*100:0; return {lbl:(it.type==='mcq'?'I.':it.type==='tf'?'II.':it.type==='short'?'III.':'TL.')+it.no,r:Math.round(r)}; });
  modal({title:'📊 Kết quả: '+esc(asg.title),size:'xl',body:`<div class="grid g4">${[['Đã nộp',`${subs.length}/${stu.length}`],['Điểm TB',sc.length?fmtNum(sum(sc)/sc.length):'—'],['Cao nhất',sc.length?fmtNum(Math.max(...sc)):'—'],['Trên TB (≥5)',sc.length?Math.round(sc.filter(x=>x>=5).length/sc.length*100)+'%':'—']].map(([t,v])=>`<div class="card"><small class="muted">${t}</small><b style="font-size:22px;display:block">${v}</b></div>`).join('')}</div>
    <div class="grid g2" style="margin:14px 0"><div class="card"><h3>Phổ điểm</h3>${barChart(['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9','9-10'],distrib(sc))}</div><div class="card"><h3>Tỉ lệ làm đúng từng câu (%)</h3>${rate.length?barChart(rate.map(x=>x.lbl),rate.map(x=>x.r),{color:'#059669'}):''}</div></div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>#</th><th>Họ và tên</th><th>Lớp</th><th>Mã đề</th><th>Điểm</th><th>Lượt</th><th>Nộp lúc</th><th>Rời trang</th><th></th></tr>${stu.map((s,i)=>{ const b=best[s.id]; const n=all.filter(x=>x.studentId===s.id).length;
      return `<tr><td>${i+1}</td><td>${esc(s.name)}</td><td>${className(s.classId)}</td><td>${b?b.variant||'gốc':''}</td><td>${b?(b.status==='pending'?'<span class="badge warn">chờ chấm TL</span> ':'')+scoreBadge(b.score):'<span class="badge gray">chưa nộp</span>'}</td><td>${n||''}</td><td><small>${b?fmtDate(b.submittedAt):''}</small></td><td>${b&&b.leaves?`<span class="badge warn">${b.leaves}</span>`:''}</td><td>${b?`<button class="btn sm" data-sub="${b.id}">Xem / chấm</button>`:''}</td></tr>`; }).join('')}</table></div>`,
    foot:`<button class="btn" data-x>Đóng</button><button class="btn" id="rsSync">🔄 Tải bài nộp mới</button><button class="btn pri" id="rsX">⬇ Xuất Excel</button>`,onOpen:(m,close)=>{
      on(m,'click','[data-sub]',b=>submissionView(DB.get('submissions',b.dataset.sub)));
      $('#rsSync',m).onclick=async()=>{ if(!Sync.on) return toast('Chưa cấu hình máy chủ đồng bộ (Cài đặt)','bad'); try{ await Sync.pull(true); close(); resultsModal(asg); toast('Đã cập nhật','ok'); }catch(e){ toast(e.message,'bad'); } };
      $('#rsX',m).onclick=()=>{ const rows=[['STT','Họ và tên','Lớp','Tài khoản','Mã đề','Điểm','Số lượt','Nộp lúc','Thời gian làm (phút)','Rời trang']]; stu.forEach((s,i)=>{ const b=best[s.id]; rows.push([i+1,s.name,className(s.classId),s.username,b?b.variant:'',b?b.score:'',all.filter(x=>x.studentId===s.id).length,b?fmtDate(b.submittedAt):'Chưa nộp',b?Math.round((b.submittedAt-b.startedAt)/60000):'',b?b.leaves||0:'']); });
        exportXlsx(`Diem_${slug(asg.title)}.xlsx`,{BangDiem:rows,TiLeDung:[['Câu','Tỉ lệ đúng (%)'],...rate.map(r=>[r.lbl,r.r])]}); }; }});
}
Router.add('assignments',el=>{
  const list=myAssignments();
  el.innerHTML=head('Giao bài & Kết quả','Giao đề cho lớp theo thời gian – học sinh làm online, tự chấm, thống kê và xuất điểm',`<button class="btn" data-act="sync">🔄 Tải bài nộp</button><button class="btn pri" data-act="new">📤 Giao bài mới</button>`)+
  (list.length?`<div class="tbl-wrap"><table class="tbl"><tr><th>Bài</th><th>Lớp</th><th>Thời gian</th><th>Tiến độ nộp</th><th>Điểm TB</th><th></th></tr>${list.map(a=>{ const stu=a.classIds.flatMap(studentsOf); const {best}=subsOf(a.id); const sc=Object.values(best).map(s=>s.score).filter(x=>x!=null); const now=Date.now(); const st=now<a.start?['Chưa mở','gray']:now>a.end?['Đã đóng','bad']:['Đang mở','ok'];
    return `<tr><td><b>${esc(a.title)}</b><br><small class="muted">${a.duration} phút · ${a.attempts} lượt</small></td><td>${a.classIds.map(className).join(', ')}</td><td><span class="badge ${st[1]}">${st[0]}</span><br><small>${fmtDate(a.start)} → ${fmtDate(a.end)}</small></td><td style="min-width:150px"><div class="bar"><i style="width:${stu.length?Object.keys(best).length/stu.length*100:0}%"></i></div><small>${Object.keys(best).length}/${stu.length}</small></td><td>${sc.length?scoreBadge(sum(sc)/sc.length):'—'}</td>
    <td style="white-space:nowrap;text-align:right"><button class="btn sm pri" data-act="res" data-id="${a.id}">📊 Kết quả</button><button class="btn sm" data-act="edit" data-id="${a.id}">✏️</button><button class="btn sm bad" data-act="del" data-id="${a.id}">✕</button></td></tr>`; }).join('')}</table></div>`:emptyBox('Chưa giao bài nào. Tạo đề rồi bấm “Giao bài mới”.','📤'));
  on(el,'click','[data-act]',async b=>{ const a=b.dataset.act, asg=b.dataset.id&&DB.get('assignments',b.dataset.id);
    if(a==='new') assignModal(); if(a==='edit') assignModal(asg.examId,asg); if(a==='res') resultsModal(asg);
    if(a==='del') confirmBox('Xoá bài giao và toàn bộ bài nộp?',()=>{ DB.removeWhere('submissions',s=>s.assignmentId===asg.id); DB.remove('assignments',asg.id); App.render(); });
    if(a==='sync'){ if(!Sync.on) return toast('Chưa cấu hình máy chủ đồng bộ (vào Cài đặt)','bad'); try{ await Sync.pull(true); toast('Đã tải bài nộp mới','ok'); App.render(); }catch(e){ toast(e.message,'bad'); } } });
});

/* ===================== BẢNG ĐIỂM ===================== */
let GB_CLASS='';
Router.add('gradebook',el=>{
  const cls=myClasses(); if(!GB_CLASS||!cls.some(c=>c.id===GB_CLASS)) GB_CLASS=(cls[0]||{}).id; const stu=GB_CLASS?studentsOf(GB_CLASS):[];
  const asg=DB.all('assignments').filter(a=>a.classIds.includes(GB_CLASS)).sort((a,b)=>a.start-b.start);
  const bests=asg.map(a=>subsOf(a.id).best);
  const rows=stu.map(s=>{ const arr=bests.map(b=>b[s.id]?b[s.id].score:null); const v=arr.filter(x=>x!=null); return {s,arr,avg:v.length?sum(v)/v.length:null}; });
  el.innerHTML=head('Bảng điểm','Tổng hợp điểm các bài đã giao theo lớp',`<select id="gbC" style="width:180px">${opts(cls.map(c=>({v:c.id,t:'Lớp '+c.name})),GB_CLASS)}</select><button class="btn pri" data-act="x">⬇ Xuất Excel</button>`)+
  (stu.length?`<div class="tbl-wrap"><table class="tbl"><tr><th>#</th><th>Họ và tên</th>${asg.map((a,i)=>`<th title="${esc(a.title)}">B${i+1}<br><small class="muted">${esc(a.title.slice(0,18))}</small></th>`).join('')}<th>TB</th><th>Xếp loại</th></tr>${rows.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.s.name)}</td>${r.arr.map(x=>`<td>${x!=null?scoreBadge(x):'<small class="muted">—</small>'}</td>`).join('')}<td><b>${r.avg!=null?fmtNum(r.avg):'—'}</b></td><td>${r.avg==null?'':r.avg>=8?'<span class="badge ok">Tốt</span>':r.avg>=6.5?'<span class="badge">Khá</span>':r.avg>=5?'<span class="badge warn">Đạt</span>':'<span class="badge bad">Chưa đạt</span>'}</td></tr>`).join('')}</table></div>`:emptyBox('Lớp chưa có học sinh'));
  $('#gbC',el).onchange=e=>{ GB_CLASS=e.target.value; App.render(); };
  on(el,'click','[data-act=x]',()=>exportXlsx(`BangDiem_${className(GB_CLASS)}.xlsx`,{BangDiem:[['STT','Họ và tên','Tài khoản',...asg.map(a=>a.title),'Trung bình'],...rows.map((r,i)=>[i+1,r.s.name,r.s.username,...r.arr.map(x=>x??''),r.avg!=null?Math.round(r.avg*100)/100:''])]}));
});

/* ===================== TIẾN ĐỘ HỌC TẬP ===================== */
Router.add('progress',el=>{
  const cls=myClasses(); if(!GB_CLASS||!cls.some(c=>c.id===GB_CLASS)) GB_CLASS=(cls[0]||{}).id; const stu=GB_CLASS?studentsOf(GB_CLASS):[];
  const les=DB.all('lessons').filter(l=>l.classIds.includes(GB_CLASS)); const asg=DB.all('assignments').filter(a=>a.classIds.includes(GB_CLASS));
  const rows=stu.map(s=>{ const ld=les.filter(l=>DB.all('progress').some(p=>p.studentId===s.id&&p.lessonId===l.id&&p.done)).length; const subs=DB.all('submissions').filter(x=>x.studentId===s.id&&asg.some(a=>a.id===x.assignmentId)); const ad=new Set(subs.map(x=>x.assignmentId)).size; const sc=subs.map(x=>x.score).filter(x=>x!=null);
    const pct=Math.round(((les.length?ld/les.length:0)+(asg.length?ad/asg.length:0))/((les.length?1:0)+(asg.length?1:0)||1)*100); return {s,ld,ad,avg:sc.length?sum(sc)/sc.length:null,pct}; });
  el.innerHTML=head('Tiến độ học tập','Theo dõi học liệu đã học, bài đã làm, điểm trung bình từng học sinh',`<select id="pgC" style="width:180px">${opts(cls.map(c=>({v:c.id,t:'Lớp '+c.name})),GB_CLASS)}</select><button class="btn pri" data-act="x">⬇ Xuất Excel</button>`)+
  `<div class="grid g3" style="margin-bottom:14px"><div class="card stat"><div class="ic c1">📚</div><div><b>${les.length}</b><small class="muted">Học liệu đã giao</small></div></div><div class="card stat"><div class="ic c2">📝</div><div><b>${asg.length}</b><small class="muted">Bài kiểm tra đã giao</small></div></div><div class="card stat"><div class="ic c3">📈</div><div><b>${rows.length?Math.round(sum(rows.map(r=>r.pct))/rows.length):0}%</b><small class="muted">Tiến độ trung bình lớp</small></div></div></div>`+
  (stu.length?`<div class="tbl-wrap"><table class="tbl"><tr><th>#</th><th>Học sinh</th><th>Học liệu</th><th>Bài đã làm</th><th>Điểm TB</th><th style="min-width:200px">Tiến độ</th><th>Đăng nhập gần nhất</th></tr>${rows.sort((a,b)=>b.pct-a.pct).map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.s.name)}</td><td>${r.ld}/${les.length}</td><td>${r.ad}/${asg.length}</td><td>${scoreBadge(r.avg)}</td><td><div class="row"><div class="bar grow"><i style="width:${r.pct}%"></i></div><b>${r.pct}%</b></div></td><td><small>${r.s.lastLogin?fmtDate(r.s.lastLogin):'chưa'}</small></td></tr>`).join('')}</table></div>`:emptyBox('Lớp chưa có học sinh'));
  $('#pgC',el).onchange=e=>{ GB_CLASS=e.target.value; App.render(); };
  on(el,'click','[data-act=x]',()=>exportXlsx(`TienDo_${className(GB_CLASS)}.xlsx`,{TienDo:[['Học sinh','Học liệu đã học','Tổng học liệu','Bài đã làm','Tổng bài','Điểm TB','Tiến độ %'],...rows.map(r=>[r.s.name,r.ld,les.length,r.ad,asg.length,r.avg!=null?Math.round(r.avg*100)/100:'',r.pct])]}));
});

/* ===================== THÔNG BÁO ===================== */
Router.add('announcements',el=>{
  const list=DB.all('announcements').filter(a=>isAdmin()||a.createdBy===me().id).sort((a,b)=>b.createdAt-a.createdAt);
  el.innerHTML=head('Thông báo','Gửi thông báo tới học sinh các lớp',`<button class="btn pri" data-act="new">📣 Thông báo mới</button>`)+(list.length?list.map(a=>`<div class="card" style="margin-bottom:10px"><div class="row"><h3 class="grow" style="margin:0">${esc(a.title)}</h3><small class="muted">${fmtDate(a.createdAt)}</small><button class="btn sm bad" data-act="del" data-id="${a.id}">✕</button></div><p style="white-space:pre-wrap">${esc(a.body)}</p><small class="muted">Gửi: ${a.classIds.map(className).join(', ')}</small></div>`).join(''):emptyBox('Chưa có thông báo','📣'));
  on(el,'click','[data-act]',b=>{ if(b.dataset.act==='del') return confirmBox('Xoá thông báo?',()=>{ DB.remove('announcements',b.dataset.id); App.render(); });
    modal({title:'Thông báo mới',body:`<div class="field"><label>Tiêu đề</label><input type="text" id="anT"></div><div class="field"><label>Nội dung</label><textarea id="anB"></textarea></div><div class="pill-list">${myClasses().map(c=>`<label style="font-weight:500;display:flex;gap:4px;align-items:center"><input type="checkbox" class="chk" data-c="${c.id}" checked> ${esc(c.name)}</label>`).join('')}</div>`,
      foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="anGo">Gửi</button>`,onOpen:(m,close)=>{ $('#anGo',m).onclick=()=>{ const t=$('#anT',m).value.trim(); if(!t) return toast('Nhập tiêu đề','bad'); DB.upsert('announcements',{id:uid('a'),title:t,body:$('#anB',m).value,classIds:$$('[data-c]',m).filter(c=>c.checked).map(c=>c.dataset.c),createdBy:me().id,createdAt:Date.now()}); close(); App.render(); }; }}); });
});

/* ===================== CÀI ĐẶT ===================== */
Router.add('settings',el=>{
  const st=DB.data.settings; const size=Math.round((localStorage.getItem(KEY)||'').length/1024);
  el.innerHTML=head('Cài đặt hệ thống','Thông tin trường, đồng bộ đám mây, sao lưu dữ liệu')+
  `<div class="grid g2">
   <div class="card"><h3>🏫 Thông tin chung</h3><div class="field"><label>Tên trường (in trên đề)</label><input type="text" id="stSchool" value="${esc(st.schoolName||CFG.schoolName)}"></div><button class="btn pri" data-act="saveInfo">Lưu</button>
     <hr style="border:0;border-top:1px solid var(--line);margin:18px 0"><h3>🔑 Đổi mật khẩu của tôi</h3>${pwForm()}</div>
   <div class="card"><h3>☁️ Đồng bộ đám mây (Google Apps Script)</h3><p class="muted">Để học sinh làm bài trên điện thoại/máy ở nhà và giáo viên nhận bài, cần một máy chủ miễn phí bằng Google Apps Script (file <code>gas/Code.gs</code>, hướng dẫn trong README).</p>
     <div class="field"><label>URL Web App ${CFG.apiUrl?'<span class="badge ok">đã cấu hình trong config.js</span>':''}</label><input type="url" id="stUrl" value="${esc(st.apiUrl||CFG.apiUrl||'')}" placeholder="https://script.google.com/macros/s/.../exec"></div>
     <div class="field"><label>Khoá ghi (WRITE_KEY trong Code.gs – chỉ giáo viên biết)</label><input type="password" id="stKey" value="${esc(st.writeKey||'')}"></div>
     <div class="row"><button class="btn" data-act="saveSync">Lưu</button><button class="btn" data-act="test">Kiểm tra kết nối</button><button class="btn" data-act="diag">🩺 Chẩn đoán & sửa</button><button class="btn" data-act="pull">⬇ Tải từ máy chủ</button><button class="btn pri" data-act="push">⬆ Đẩy lên máy chủ</button></div>
     <div id="stMsg" style="margin-top:10px"></div></div>
   <div class="card" style="grid-column:1/-1"><h3>📝 Mẫu tiêu đề đề thi (mặc định cho mọi đề)</h3>${headerFieldsHtml(Exam.header({}),'sh')}<div class="row" style="margin-top:8px"><button class="btn pri" data-act="saveHdr">Lưu mẫu tiêu đề</button><button class="btn" data-act="pvHdr">Xem trước</button></div><div id="shPrev" class="paper" style="margin-top:10px;display:none"></div></div>
   <div class="card"><h3>💾 Sao lưu & khôi phục</h3><p class="muted">Dữ liệu đang lưu trong trình duyệt này (${size} KB). Nên sao lưu định kỳ.</p>
     <div class="row"><button class="btn pri" data-act="backup">⬇ Sao lưu (.json)</button><button class="btn" data-act="restore">⬆ Khôi phục</button>${isAdmin()?'<button class="btn bad" data-act="reset">Xoá & nạp lại dữ liệu mẫu</button>':''}</div></div>
   <div class="card"><h3>ℹ️ Giới thiệu</h3><p><b>${CFG.appName}</b> – Hệ thống quản lý học tập cho trường THPT: ngân hàng câu hỏi 11 môn theo cấu trúc 2025, ma trận – đặc tả, trộn đề, thi online, bảng điểm, tiến độ.</p><p>Tác giả: <b>${CFG.author}</b> · ${CFG.contact}</p><p class="muted">Phiên bản 2.2 · ${new Date().getFullYear()}</p></div>
  </div>`;
  bindPwForm(el);
  const msg=(t,ok)=>{ $('#stMsg',el).innerHTML=`<div class="note ${ok?'info':''}">${t}</div>`; };
  on(el,'click','[data-act]',async b=>{ const a=b.dataset.act;
    if(a==='saveHdr'){ DB.data.settings.header=readHeader(el,'sh'); DB.save(); Sync.markDirty('settings'); toast('Đã lưu mẫu tiêu đề','ok'); }
    if(a==='pvHdr'){ const p=$('#shPrev',el); p.style.display='block'; p.innerHTML=Exam.headerHtml({subject:'toan',grade:12,duration:90},null,{...Exam.defaultHeader(),...readHeader(el,'sh')},22); }
    if(a==='saveInfo'){ st.schoolName=$('#stSchool',el).value.trim(); DB.save(); Sync.markDirty('settings'); toast('Đã lưu','ok'); }
    if(a==='diag'){ st.apiUrl=$('#stUrl',el).value.trim(); st.writeKey=$('#stKey',el).value.trim(); $('#stKey',el).value=st.writeKey; DB.save(); return syncDiag($('#stMsg',el)); }
    if(a==='saveSync'||a==='test'||a==='pull'||a==='push'){ st.apiUrl=$('#stUrl',el).value.trim(); st.writeKey=$('#stKey',el).value; DB.save(); setSyncDot(false); }
    try{
      if(a==='test'){ const r=await Sync.call('ping',{},'GET'); msg(r.ok?`✅ Kết nối thành công. Máy chủ: ${esc(r.app||'')} – ${esc(r.time||'')}`:'❌ '+esc(r.error),r.ok); }
      if(a==='pull'){ await Sync.pull(true); msg('✅ Đã tải dữ liệu từ máy chủ',true); }
      if(a==='push') confirmBox('Ghi đè dữ liệu chung trên máy chủ bằng dữ liệu của máy này?',async()=>{ try{ await Sync.push(); msg('✅ Đã đẩy dữ liệu lên máy chủ',true); }catch(e){ msg('❌ '+esc(e.message)); } });
    }catch(e){ msg('❌ Không kết nối được: '+esc(e.message)+'. Kiểm tra URL và quyền truy cập Web App (Bất kỳ ai).'); }
    if(a==='backup') download(`SaoLuu_LMS_LKT_${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(DB.data),'application/json');
    if(a==='restore') pickFile('.json',async f=>{ try{ const d=JSON.parse(await readText(f)); if(!d.users||!d.questions) throw new Error('File không đúng định dạng'); confirmBox('Khôi phục sẽ thay toàn bộ dữ liệu hiện tại. Tiếp tục?',()=>{ DB.data=d; DB.load(); DB.save(); toast('Đã khôi phục','ok'); App.render(); }); }catch(e){ toast(e.message,'bad'); } });
    if(a==='reset') confirmBox('Xoá toàn bộ dữ liệu trên trình duyệt này và nạp lại dữ liệu mẫu?',()=>{ DB.reset(); SEED.finish(DB.data); DB.save(); Auth.logout(); });
  });
});
function pwForm(){ return `<div class="field"><label>Mật khẩu hiện tại</label><input type="password" id="pw0"></div><div class="field"><label>Mật khẩu mới (≥ 6 ký tự)</label><input type="password" id="pw1"></div><div class="field"><label>Nhập lại</label><input type="password" id="pw2"></div><button class="btn pri" id="pwGo">Đổi mật khẩu</button>`; }
function bindPwForm(el){ const b=$('#pwGo',el); if(!b) return; b.onclick=()=>{ const u=me(); if(u.pw!==hashPw($('#pw0',el).value)) return toast('Mật khẩu hiện tại không đúng','bad'); const p=$('#pw1',el).value; if(p.length<6) return toast('Mật khẩu mới tối thiểu 6 ký tự','bad'); if(p!==$('#pw2',el).value) return toast('Nhập lại không khớp','bad');
  const oldH=u.pw; u.pw=hashPw(p); u.pwAt=Date.now(); delete u.initPw; DB.upsert('users',u); if(u.role==='student'&&Sync.on) Sync.call('changePw',{uid:u.id,old:oldH,pw:u.pw}).then(r=>{ if(!r.ok) toast('Máy chủ chưa nhận mật khẩu mới: '+(r.error||''),'bad'); }).catch(()=>toast('Chưa đồng bộ được mật khẩu mới lên máy chủ','bad')); toast('Đã đổi mật khẩu','ok'); ['pw0','pw1','pw2'].forEach(i=>$('#'+i,el).value=''); }; }

/* ===================== CHẨN ĐOÁN ĐỒNG BỘ ===================== */
async function syncDiag(box){
  const rows=[]; const show=()=>{ box.innerHTML=`<div class="card" style="padding:12px;background:#f8fafc">${rows.map(r=>`<div style="padding:6px 0;border-bottom:1px dashed #e2e8f0">${r.ok===true?'✅':r.ok===false?'❌':'⏳'} <b>${r.t}</b>${r.m?`<br><small>${r.m}</small>`:''}</div>`).join('')}</div>`; };
  const step=(t)=>{ const r={t,ok:null,m:''}; rows.push(r); show(); return r; };
  const url=(DB.data.settings.apiUrl||CFG.apiUrl||'').trim(), key=(DB.data.settings.writeKey||'').trim();
  let r=step('1. Đường link Web App');
  if(!url){ r.ok=false; r.m='Chưa có. Trong Apps Script chạy hàm <b>kiemTra</b> → dòng “🔗 URL Web App” → chép dán vào ô URL ở trên.'; return show(); }
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)){ r.ok=false; r.m=/\/dev$/.test(url)?'Đây là link thử nghiệm (/dev). Cần link kết thúc bằng <b>/exec</b> (chạy hàm kiemTra để lấy).':'Link chưa đúng dạng <code>https://script.google.com/macros/s/…/exec</code>. Chạy hàm <b>kiemTra</b> trong Apps Script để lấy đúng link.'; return show(); }
  r.ok=true; show();
  r=step('2. Máy chủ trả lời');
  let ping; try{ const res=await fetch(url+'?action=ping'); const txt=await res.text(); try{ ping=JSON.parse(txt); }catch(e){ r.ok=false; r.m='Máy chủ trả về trang đăng nhập Google thay vì dữ liệu → Triển khai → Quản lý bản triển khai → ✏️ → <b>Người có quyền truy cập: Bất kỳ ai</b> → Phiên bản mới → Triển khai.'; return show(); } }
  catch(e){ r.ok=false; r.m='Không gọi được máy chủ ('+esc(e.message)+'). Kiểm tra mạng; đường link có thể của bản triển khai đã xoá – chạy hàm <b>kiemTra</b> lấy link mới.'; return show(); }
  r.ok=true; show();
  r=step('3. Máy chủ đang chạy code mới');
  if(!ping.version){ r.ok=false; r.m='Link đang chạy <b>code cũ</b>. Trong Apps Script: Triển khai → Quản lý bản triển khai → ✏️ → Phiên bản: <b>Phiên bản mới</b> → Triển khai. Rồi bấm lại nút Chẩn đoán.'; return show(); }
  r.ok=true; r.m='Phiên bản máy chủ '+esc(ping.version)+(ping.hasDb?` · đang có ${ping.size} ký tự dữ liệu`:' · chưa có dữ liệu'); show();
  r=step('4. Khoá ghi');
  if(!key){ r.ok=false; r.m='Chưa nhập. Chạy hàm <b>kiemTra</b> → dòng “🔑 Khoá ghi” → gõ y hệt vào ô Khoá ghi ở trên.'; return show(); }
  try{ const k=await Sync.call('checkKey',{key}); if(!k.ok){ r.ok=false; r.m='Khoá ghi không khớp với dòng <code>WRITE_KEY</code> trong Code.gs (phân biệt hoa thường, không có dấu cách). Chạy hàm <b>kiemTra</b> để xem khoá đúng.'; return show(); } }
  catch(e){ r.ok=false; r.m='Không kiểm tra được: '+esc(e.message); return show(); }
  r.ok=true; show();
  r=step('5. Đẩy dữ liệu của máy này lên máy chủ');
  try{ await Sync.push(); const p2=await Sync.call('ping',{},'GET'); if(!p2.hasDb) throw new Error('máy chủ chưa ghi được'); r.ok=true; r.m=`Đã lưu ${p2.size} ký tự: ${DB.all('users').length} tài khoản, ${DB.all('questions').length} câu hỏi, ${DB.all('exams').length} đề. Học sinh có thể đăng nhập (bấm Ctrl + F5 trước).`; }
  catch(e){ r.ok=false; r.m='Lỗi khi ghi: '+esc(e.message)+'. Chạy lại hàm kiemTra trong Apps Script để cấp quyền, triển khai phiên bản mới rồi thử lại.'; }
  show(); setSyncDot(r.ok);
}
