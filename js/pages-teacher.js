/* LMS LKT – pages-teacher.js: Tổng quan, Lớp & học sinh, Giáo viên, Ngân hàng câu hỏi */
'use strict';
const me = () => Auth.user;
const isAdmin = () => Auth.is('admin');
function myClasses(){ return DB.all('classes').filter(c=>isAdmin()||c.teacherId===me().id||(c.coTeachers||[]).includes(me().id)).sort((a,b)=>a.name.localeCompare(b.name,'vi',{numeric:true})); }
function studentsOf(classId){ return DB.all('users').filter(u=>u.role==='student'&&u.classId===classId).sort((a,b)=>{ const la=a.name.split(' ').pop(), lb=b.name.split(' ').pop(); return la.localeCompare(lb,'vi')||a.name.localeCompare(b.name,'vi'); }); }
function className(id){ const c=DB.get('classes',id); return c?c.name:''; }
/* ---- Bộ ngân hàng: riêng tư / dùng chung toàn trường ---- */
function bankOf(q){ return q&&q.bankId?DB.get('banks',q.bankId):null; }
function isSharedQ(q){ const b=bankOf(q); return b?b.share==='school':q.shared!==false; }
function myBanks(){ return DB.all('banks').filter(b=>b.ownerId===me().id); }
function usableBanks(){ return DB.all('banks').filter(b=>b.ownerId===me().id||b.share==='school'||isAdmin()); }
function bankOptions(sel,withAll){ return (withAll?`<option value="">— Tất cả ngân hàng —</option><option value="_sample" ${sel==='_sample'?'selected':''}>📚 Ngân hàng mẫu (dùng chung)</option>`:`<option value="">📚 Ngân hàng chung của trường</option>`)+
  (withAll?usableBanks():myBanks()).map(b=>`<option value="${b.id}" ${b.id===sel?'selected':''}>${b.ownerId===me().id?(b.share==='school'?'🌐':'🔒'):'👥'} ${esc(b.name)}${b.ownerId!==me().id?' – '+esc((DB.get('users',b.ownerId)||{}).name||''):''}</option>`).join(''); }
function visibleQuestions(){ return DB.all('questions').filter(q=>isAdmin()||q.ownerId===me().id||isSharedQ(q)); }
function banksModal(onDone){
  const draw=m=>{ const list=usableBanks(); $('#bmList',m).innerHTML=list.length?`<div class="tbl-wrap"><table class="tbl"><tr><th>Tên bộ ngân hàng</th><th>Chủ sở hữu</th><th>Chế độ</th><th>Số câu</th><th></th></tr>${list.map(b=>{ const mine=b.ownerId===me().id||isAdmin(); const n=DB.all('questions').filter(q=>q.bankId===b.id).length;
      return `<tr><td><b>${esc(b.name)}</b><br><small class="muted">${esc(b.note||'')}</small></td><td>${esc((DB.get('users',b.ownerId)||{}).name||'')}</td><td>${b.share==='school'?'<span class="badge ok">🌐 Dùng chung toàn trường</span>':'<span class="badge gray">🔒 Riêng tư</span>'}</td><td>${n}</td>
      <td style="white-space:nowrap">${mine?`<button class="btn sm" data-bm="share" data-id="${b.id}">${b.share==='school'?'🔒 Đặt riêng tư':'🌐 Chia sẻ'}</button><button class="btn sm" data-bm="ren" data-id="${b.id}">✏️</button><button class="btn sm bad" data-bm="del" data-id="${b.id}">✕</button>`:`<button class="btn sm" data-bm="copy" data-id="${b.id}">⧉ Sao chép về bộ của tôi</button>`}</td></tr>`; }).join('')}</table></div>`:emptyBox('Chưa có bộ ngân hàng riêng','📁'); };
  modal({title:'📁 Bộ ngân hàng câu hỏi',size:'lg',body:`<div class="note info">Mỗi giáo viên tạo được nhiều <b>bộ ngân hàng</b>: <b>🔒 Riêng tư</b> (chỉ mình thấy, dùng ra đề) hoặc <b>🌐 Dùng chung</b> (cả trường thấy và dùng). Câu không thuộc bộ nào nằm trong ngân hàng chung của trường.</div>
    <div class="row" style="margin:10px 0"><input type="text" id="bmName" placeholder="Tên bộ mới, ví dụ: Ngân hàng Toán 12 – thầy Tường" style="max-width:420px"><select id="bmShare" style="max-width:200px"><option value="private">🔒 Riêng tư</option><option value="school">🌐 Dùng chung</option></select><button class="btn pri" id="bmAdd">➕ Tạo bộ</button></div><div id="bmList"></div>`,
    onOpen:(m)=>{ draw(m);
      $('#bmAdd',m).onclick=()=>{ const n=$('#bmName',m).value.trim(); if(!n) return toast('Nhập tên bộ ngân hàng','bad'); DB.upsert('banks',{id:uid('bk'),name:n,share:$('#bmShare',m).value,ownerId:me().id,createdAt:Date.now()}); $('#bmName',m).value=''; draw(m); onDone&&onDone(); };
      on(m,'click','[data-bm]',b=>{ const k=DB.get('banks',b.dataset.id); const a=b.dataset.bm;
        if(a==='share'){ k.share=k.share==='school'?'private':'school'; DB.upsert('banks',k); draw(m); onDone&&onDone(); }
        if(a==='ren'){ const n=prompt('Tên mới:',k.name); if(n){ k.name=n.trim(); DB.upsert('banks',k); draw(m); onDone&&onDone(); } }
        if(a==='del') confirmBox(`Xoá bộ “${esc(k.name)}”? Các câu hỏi trong bộ sẽ chuyển vào <b>ngân hàng riêng tư của bạn</b> (không bị mất).`,()=>{ DB.all('questions').filter(q=>q.bankId===k.id).forEach(q=>{ delete q.bankId; q.shared=false; }); DB.remove('banks',k.id); draw(m); onDone&&onDone(); });
        if(a==='copy'){ const nb={id:uid('bk'),name:k.name+' (bản sao)',share:'private',ownerId:me().id,createdAt:Date.now()}; DB.data.banks.push(nb); const qs=DB.all('questions').filter(q=>q.bankId===k.id); qs.forEach(q=>DB.data.questions.push({...JSON.parse(JSON.stringify(q)),id:uid('q'),bankId:nb.id,ownerId:me().id,createdAt:Date.now()})); DB.save(); Sync.markDirty('questions'); toast(`Đã sao chép ${qs.length} câu`,'ok'); draw(m); onDone&&onDone(); }
      }); }});
}
function myAssignments(){ return DB.all('assignments').filter(a=>isAdmin()||a.createdBy===me().id).sort((a,b)=>b.createdAt-a.createdAt); }
function on(el,ev,sel,fn){ el.addEventListener(ev,e=>{ const t=e.target.closest(sel); if(t&&el.contains(t)) fn(t,e); }); }
function head(title,sub,actions=''){ return `<div class="page-head"><div class="grow"><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div><div class="row">${actions}</div></div>`; }
function scoreBadge(s){ if(s==null) return '<span class="badge gray">—</span>'; const c=s>=8?'ok':s>=5?'':s>=3.5?'warn':'bad'; return `<span class="badge ${c}">${fmtNum(s)}</span>`; }
function distrib(scores){ const b=Array(10).fill(0); scores.forEach(s=>b[Math.min(9,Math.floor(s))]++); return b; }

/* ===================== TỔNG QUAN ===================== */
Router.add('dashboard',el=>{
  const cls=myClasses(), stu=cls.flatMap(c=>studentsOf(c.id)), asg=myAssignments(), asIds=new Set(asg.map(a=>a.id));
  const subs=DB.all('submissions').filter(s=>asIds.has(s.assignmentId)), qs=visibleQuestions();
  const scores=subs.filter(s=>s.score!=null).map(s=>s.score); const avg=scores.length?sum(scores)/scores.length:null;
  const bySub=groupBy(qs,q=>q.subject); const subjKeys=Object.keys(SUBJECTS).filter(k=>bySub[k]);
  const pending=subs.filter(s=>s.status==='pending').length;
  const weak=isAdmin()?DB.all('users').filter(u=>u.role!=='student'&&(u.pw===hashPw('admin123')||u.pw===hashPw('123456'))):[];
  el.innerHTML=(weak.length?`<div class="note" style="margin-bottom:14px">⚠ Có ${weak.length} tài khoản giáo viên/quản trị đang dùng mật khẩu mặc định (${weak.map(u=>esc(u.username)).join(', ')}). Hãy đổi mật khẩu và xoá tài khoản mẫu trước khi đưa hệ thống vào sử dụng thật.</div>`:'')+head(`Xin chào, ${esc(me().name)} 👋`,`${DB.data.settings.schoolName||CFG.schoolName} · ${new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}`,
    `<a class="btn" href="#/bank">➕ Câu hỏi</a><a class="btn" href="#/matrices">🧮 Ma trận</a><a class="btn pri" href="#/assignments">📤 Giao bài</a>`)+
  `<div class="grid g4">
    ${[['🏫','c1',cls.length,'Lớp học'],['👩‍🎓','c2',stu.length,'Học sinh'],['❓','c3',qs.length,'Câu hỏi trong ngân hàng'],['📝','c4',DB.all('exams').length,'Đề thi']].map(([i,c,v,t])=>`<div class="card stat"><div class="ic ${c}">${i}</div><div><b>${v}</b><small class="muted">${t}</small></div></div>`).join('')}
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card" style="grid-column:span 2"><h3>📊 Phổ điểm các bài đã giao</h3>${scores.length?barChart(['0-1','1-2','2-3','3-4','4-5','5-6','6-7','7-8','8-9','9-10'],distrib(scores)):emptyBox('Chưa có bài nộp')}
      <div class="row" style="margin-top:8px"><span class="badge">Lượt nộp: ${subs.length}</span><span class="badge ok">Điểm TB: ${avg!=null?fmtNum(avg):'—'}</span>${pending?`<span class="badge warn">${pending} bài chờ chấm tự luận</span>`:''}</div></div>
    <div class="card"><h3>📚 Ngân hàng theo môn</h3>${subjKeys.map(k=>`<div style="margin:8px 0"><div class="row"><span>${SUBJECTS[k].icon} ${SUBJECTS[k].name}</span><span class="grow"></span><b>${bySub[k].length}</b></div><div class="bar"><i style="width:${Math.min(100,bySub[k].length/Math.max(...subjKeys.map(x=>bySub[x].length))*100)}%"></i></div></div>`).join('')||emptyBox('Trống')}</div>
  </div>
  <div class="grid g2" style="margin-top:16px">
    <div class="card"><h3>🕒 Bài nộp gần đây</h3>${subs.length?`<div class="tbl-wrap"><table class="tbl"><tr><th>Học sinh</th><th>Lớp</th><th>Bài</th><th>Điểm</th><th>Lúc</th></tr>${subs.sort((a,b)=>b.submittedAt-a.submittedAt).slice(0,8).map(s=>{const a=DB.get('assignments',s.assignmentId);return `<tr><td>${esc(s.studentName)}</td><td>${esc(s.className)}</td><td>${esc(a?a.title:'')}</td><td>${s.status==='pending'?'<span class="badge warn">chờ chấm</span>':scoreBadge(s.score)}</td><td><small>${fmtDate(s.submittedAt)}</small></td></tr>`;}).join('')}</table></div>`:emptyBox('Chưa có bài nộp')}</div>
    <div class="card"><h3>📤 Bài đang giao</h3>${asg.length?asg.slice(0,6).map(a=>{ const total=sum(a.classIds.map(c=>studentsOf(c).length)); const done=new Set(subs.filter(s=>s.assignmentId===a.id).map(s=>s.studentId)).size; const open=Date.now()<a.end;
      return `<div style="padding:10px 0;border-bottom:1px solid #f1f4f9"><div class="row"><b class="grow">${esc(a.title)}</b><span class="badge ${open?'ok':'gray'}">${open?'Đang mở':'Đã đóng'}</span></div><small class="muted">${a.classIds.map(className).join(', ')} · hạn ${fmtDate(a.end)}</small><div class="row" style="margin-top:6px"><div class="bar grow"><i style="width:${total?done/total*100:0}%"></i></div><small>${done}/${total}</small></div></div>`; }).join(''):emptyBox('Chưa giao bài nào')}</div>
  </div>`;
});

/* ===================== LỚP & HỌC SINH ===================== */
function genUsername(name,cls,idx,scheme){ const parts=noAccent(name).toLowerCase().trim().split(/\s+/);
  if(scheme==='name') return parts.pop()+parts.map(p=>p[0]).join('')+(cls?slug(cls.name):'');
  return (cls?slug(cls.name):'hs')+'_'+String(idx).padStart(2,'0'); }
function uniqueUsername(u){ let base=u, k=1; const has=n=>DB.all('users').some(x=>x.username.toLowerCase()===n.toLowerCase()); while(has(u)) u=base+(++k); return u; }
function bulkUsersModal({role,classId,title}){
  const cls=classId?DB.get('classes',classId):null;
  modal({title,size:'lg',body:`
    <div class="note info">Mỗi dòng một người. Có thể dán từ Excel: <b>Họ tên</b> [Tab] <b>Lớp</b> (tuỳ chọn) [Tab] <b>Tài khoản</b> (tuỳ chọn) [Tab] <b>Mật khẩu</b> (tuỳ chọn). Hoặc nhập file Excel cùng cấu trúc.</div>
    <div class="row" style="margin:10px 0"><button class="btn" id="bxFile">📥 Nhập từ Excel</button><button class="btn" id="bxTpl">⬇ Tải mẫu Excel</button></div>
    <div class="field"><textarea id="bxText" style="min-height:200px" placeholder="Nguyễn Văn A&#10;Trần Thị B&#10;..."></textarea></div>
    <div class="grid g3">
      ${role==='student'?`<div class="field"><label>Lớp mặc định</label><select id="bxClass">${opts(myClasses().map(c=>({v:c.id,t:c.name})),classId)}</select></div>`:`<div class="field"><label>Môn dạy</label><select id="bxSubj">${opts(subjList(),'toan')}</select></div>`}
      <div class="field"><label>Kiểu tài khoản</label><select id="bxScheme"><option value="class">${role==='student'?'lớp_số thứ tự (12a1_01)':'gv_số thứ tự'}</option><option value="name">tên + chữ cái đầu (anvn12a1)</option></select></div>
      <div class="field"><label>Mật khẩu</label><select id="bxPw"><option value="rand">Ngẫu nhiên 6 số</option><option value="fixed">Cố định 123456</option></select></div>
    </div><div id="bxPrev"></div>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn" id="bxCheck">Xem trước</button><button class="btn pri" id="bxGo">Tạo tài khoản</button>`,
    onOpen:(m,close)=>{
      const parse=()=>{ const txt=$('#bxText',m).value; const defCls=role==='student'?DB.get('classes',$('#bxClass',m).value):null; const scheme=$('#bxScheme',m).value;
        const rows=txt.split('\n').map(l=>l.split('\t').map(x=>x.trim())).filter(r=>r[0]&&!/^h[ọo] (v[àa] )?t[êe]n$/i.test(r[0]));
        let idx=role==='student'&&defCls?studentsOf(defCls.id).length:DB.all('users').filter(u=>u.role==='teacher').length;
        const taken=new Set();
        return rows.map(r=>{ let c=defCls; if(role==='student'&&r[1]){ const f=DB.all('classes').find(x=>slug(x.name)===slug(r[1])); if(f) c=f; else c={id:null,name:r[1],_new:true}; }
          idx++; let un=r[2]||genUsername(r[0],role==='student'?c:{name:'gv'},idx,scheme); un=uniqueUsername(un); while(taken.has(un)) un=un+'x'; taken.add(un);
          return {name:r[0],cls:c,username:un,pw:r[3]||($('#bxPw',m).value==='fixed'?'123456':randPw())}; }); };
      const prev=()=>{ const list=parse(); $('#bxPrev',m).innerHTML=list.length?`<p><b>${list.length}</b> tài khoản sẽ được tạo${list.some(x=>x.cls&&x.cls._new)?' · <span class="badge warn">có lớp mới sẽ được tạo tự động</span>':''}</p><div class="tbl-wrap" style="max-height:240px"><table class="tbl"><tr><th>#</th><th>Họ tên</th>${role==='student'?'<th>Lớp</th>':''}<th>Tài khoản</th><th>Mật khẩu</th></tr>${list.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.name)}</td>${role==='student'?`<td>${esc(x.cls?x.cls.name:'')}</td>`:''}<td>${esc(x.username)}</td><td>${esc(x.pw)}</td></tr>`).join('')}</table></div>`:''; return list; };
      $('#bxCheck',m).onclick=prev;
      $('#bxTpl',m).onclick=()=>exportXlsx(role==='student'?'Mau_DanhSach_HocSinh.xlsx':'Mau_DanhSach_GiaoVien.xlsx',{DanhSach:[['Họ tên','Lớp','Tài khoản (tuỳ chọn)','Mật khẩu (tuỳ chọn)'],['Nguyễn Văn An','12A1','',''],['Trần Thị Bình','12A1','','']]});
      $('#bxFile',m).onclick=()=>pickFile('.xlsx,.xls,.csv',async f=>{ try{ const rows=await readXlsx(f); $('#bxText',m).value=rows.filter(r=>r[0]).map(r=>r.slice(0,4).join('\t')).join('\n'); prev(); }catch(e){ toast('Không đọc được file: '+e.message,'bad'); } });
      $('#bxGo',m).onclick=()=>{ const list=prev(); if(!list.length) return toast('Danh sách trống','bad'); const now=Date.now(); const out=[];
        list.forEach(x=>{ let cid=null; if(role==='student'){ if(x.cls&&x.cls._new){ let f=DB.all('classes').find(c=>slug(c.name)===slug(x.cls.name)); if(!f){ f={id:uid('c'),name:x.cls.name,grade:parseInt(x.cls.name)||12,year:schoolYear(),teacherId:me().id,code:x.cls.name+'-'+Math.random().toString(36).slice(2,5).toUpperCase()}; DB.data.classes.push(f);} cid=f.id; } else cid=x.cls?x.cls.id:null; }
          const u={id:uid('u'),username:x.username,pw:hashPw(x.pw),initPw:x.pw,name:x.name,role,classId:cid,createdAt:now}; if(role==='teacher') u.subjects=[$('#bxSubj',m).value]; DB.data.users.push(u); out.push([x.name,role==='student'?className(cid):'',x.username,x.pw]); });
        DB.save(); Sync.markDirty('users'); close(); toast(`Đã tạo ${out.length} tài khoản`,'ok');
        exportXlsx(`TaiKhoan_${role==='student'?'HocSinh':'GiaoVien'}_${fmtDay(now).replace(/\//g,'-')}.xlsx`,{TaiKhoan:[['Họ tên','Lớp','Tài khoản','Mật khẩu'],...out]}); App.render(); };
    }});
}
const schoolYear=()=>{ const d=new Date(), y=d.getFullYear(); return d.getMonth()>=7?`${y}-${y+1}`:`${y-1}-${y}`; };
function classModal(c){ const isNew=!c; c=c||{id:uid('c'),name:'',grade:12,year:schoolYear(),teacherId:me().id};
  const teachers=DB.all('users').filter(u=>u.role!=='student');
  modal({title:isNew?'Tạo lớp mới':'Sửa lớp '+esc(c.name),body:`<div class="grid g2"><div class="field"><label>Tên lớp</label><input type="text" id="cName" value="${esc(c.name)}" placeholder="12A1"></div>
    <div class="field"><label>Khối</label><select id="cGrade">${opts([6,7,8,9,10,11,12],c.grade)}</select></div>
    <div class="field"><label>Năm học</label><input type="text" id="cYear" value="${esc(c.year)}"></div>
    <div class="field"><label>Giáo viên phụ trách</label><select id="cT" ${isAdmin()?'':'disabled'}>${opts(teachers.map(t=>({v:t.id,t:t.name})),c.teacherId)}</select></div></div>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="cSave">Lưu</button>`,
    onOpen:(m,close)=>{ $('#cSave',m).onclick=()=>{ const n=$('#cName',m).value.trim(); if(!n) return toast('Nhập tên lớp','bad');
      Object.assign(c,{name:n,grade:+$('#cGrade',m).value,year:$('#cYear',m).value,teacherId:$('#cT',m).value,code:c.code||(n+'-'+Math.random().toString(36).slice(2,5).toUpperCase())}); DB.upsert('classes',c); close(); location.hash='#/classes/'+c.id; App.render(); }; }}); }
Router.add('classes',(el,[cid])=>{
  const cls=myClasses(); if(!cid&&cls[0]) cid=cls[0].id; const cur=cid?DB.get('classes',cid):null; const st=cur?studentsOf(cur.id):[];
  el.innerHTML=head('Lớp học & Học sinh','Quản lý lớp, tạo tài khoản hàng loạt, xuất danh sách tài khoản',`<button class="btn" data-act="newcls">➕ Lớp mới</button><button class="btn pri" data-act="bulk">👥 Thêm học sinh hàng loạt</button>`)+
  `<div class="grid" style="grid-template-columns:260px 1fr">
    <div class="card" style="padding:10px">${cls.map(c=>`<a href="#/classes/${c.id}" class="row" style="padding:10px;border-radius:10px;${c.id===cid?'background:var(--pri-soft)':''}"><span class="avatar" style="width:34px;height:34px;font-size:12px;border-radius:10px">${esc(c.name.slice(0,4))}</span><div class="grow"><b style="color:var(--ink)">${esc(c.name)}</b><br><small class="muted">${studentsOf(c.id).length} HS · ${esc(c.year||'')}</small></div></a>`).join('')||emptyBox('Chưa có lớp','🏫')}</div>
    <div class="card">${cur?`<div class="row" style="margin-bottom:12px"><h2 class="grow" style="margin:0">Lớp ${esc(cur.name)} <small class="muted">(${st.length} học sinh · GVCN/phụ trách: ${esc((DB.get('users',cur.teacherId)||{}).name||'')})</small></h2>
        <button class="btn sm" data-act="editcls">✏️ Sửa lớp</button><button class="btn sm" data-act="export">⬇ Xuất DS tài khoản</button><button class="btn sm" data-act="resetall">🔑 Cấp lại MK cả lớp</button><button class="btn sm bad" data-act="delcls">Xoá lớp</button></div>
      <input type="search" id="stuSearch" placeholder="🔍 Tìm học sinh..." style="margin-bottom:10px">
      ${st.length?`<div class="tbl-wrap"><table class="tbl" id="stuTbl"><tr><th>#</th><th>Họ và tên</th><th>Tài khoản</th><th>Mật khẩu cấp</th><th>Đăng nhập gần nhất</th><th></th></tr>${st.map((u,i)=>`<tr data-name="${esc(slug(u.name+u.username))}"><td>${i+1}</td><td><b>${esc(u.name)}</b>${u.locked?' <span class="badge bad">khoá</span>':''}</td><td><code>${esc(u.username)}</code></td><td>${u.initPw?`<code>${esc(u.initPw)}</code>`:'<small class="muted">HS đã đổi</small>'}</td><td><small>${u.lastLogin?fmtDate(u.lastLogin):'—'}</small></td>
        <td style="white-space:nowrap"><button class="btn sm" data-act="edit" data-id="${u.id}">✏️</button><button class="btn sm" data-act="reset" data-id="${u.id}" title="Cấp lại mật khẩu">🔑</button><button class="btn sm" data-act="lock" data-id="${u.id}" title="Khoá/Mở">${u.locked?'🔓':'🔒'}</button><button class="btn sm bad" data-act="del" data-id="${u.id}">✕</button></td></tr>`).join('')}</table></div>`:emptyBox('Lớp chưa có học sinh. Bấm “Thêm học sinh hàng loạt”.','👩‍🎓')}`:emptyBox('Hãy tạo lớp đầu tiên','🏫')}</div></div>`;
  const s=$('#stuSearch',el); if(s) s.oninput=()=>{ const k=slug(s.value); $$('#stuTbl tr[data-name]',el).forEach(r=>r.classList.toggle('hide',!!k&&!r.dataset.name.includes(k))); };
  on(el,'click','[data-act]',(b)=>{ const a=b.dataset.act, u=b.dataset.id?DB.get('users',b.dataset.id):null;
    if(a==='newcls') classModal(); if(a==='editcls') classModal(cur);
    if(a==='bulk') bulkUsersModal({role:'student',classId:cid,title:'Thêm học sinh hàng loạt'});
    if(a==='export') exportXlsx(`TaiKhoan_${cur.name}.xlsx`,{[cur.name]:[['STT','Họ và tên','Lớp','Tài khoản','Mật khẩu'],...st.map((x,i)=>[i+1,x.name,cur.name,x.username,x.initPw||'(HS đã đổi)'])]});
    if(a==='resetall') setPwModal(st,'cả lớp '+cur.name);
    if(a==='delcls') confirmBox(`Xoá lớp ${esc(cur.name)}? Học sinh sẽ không còn thuộc lớp nào (không xoá tài khoản).`,()=>{ st.forEach(x=>x.classId=null); DB.remove('classes',cur.id); location.hash='#/classes'; App.render(); });
    if(a==='reset') setPwModal([u],u.name+' ('+u.username+')');
    if(a==='lock'){ u.locked=!u.locked; DB.upsert('users',u); App.render(); }
    if(a==='del') confirmBox(`Xoá tài khoản ${esc(u.name)}?`,()=>{ DB.remove('users',u.id); App.render(); });
    if(a==='edit') modal({title:'Sửa học sinh',body:`<div class="field"><label>Họ tên</label><input type="text" id="eN" value="${esc(u.name)}"></div><div class="field"><label>Tài khoản</label><input type="text" id="eU" value="${esc(u.username)}"></div><div class="field"><label>Chuyển lớp</label><select id="eC">${opts(myClasses().map(c=>({v:c.id,t:c.name})),u.classId)}</select></div>`,
      foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="eS">Lưu</button>`,onOpen:(m,close)=>{ $('#eS',m).onclick=()=>{ const un=$('#eU',m).value.trim(); if(DB.all('users').some(x=>x.id!==u.id&&x.username.toLowerCase()===un.toLowerCase())) return toast('Tài khoản đã tồn tại','bad'); u.name=$('#eN',m).value.trim(); u.username=un; u.classId=$('#eC',m).value; DB.upsert('users',u); close(); App.render(); }; }});
  });
});

/* ===================== GIÁO VIÊN (admin) ===================== */
Router.add('teachers',el=>{
  if(!isAdmin()){ el.innerHTML=emptyBox('Chỉ quản trị viên','🔒'); return; }
  const ts=DB.all('users').filter(u=>u.role!=='student');
  el.innerHTML=head('Giáo viên & Quản trị','Tạo tài khoản giáo viên hàng loạt, phân quyền',`<button class="btn" data-act="export">⬇ Xuất danh sách</button><button class="btn pri" data-act="bulk">👥 Thêm giáo viên hàng loạt</button>`)+
  `<div class="tbl-wrap"><table class="tbl"><tr><th>#</th><th>Họ tên</th><th>Tài khoản</th><th>Vai trò</th><th>Môn</th><th>Lớp phụ trách</th><th>Mật khẩu cấp</th><th></th></tr>${ts.map((u,i)=>`<tr><td>${i+1}</td><td><b>${esc(u.name)}</b></td><td><code>${esc(u.username)}</code></td><td>${u.role==='admin'?'<span class="badge bad">Quản trị</span>':'<span class="badge">Giáo viên</span>'}</td><td>${(u.subjects||[]).map(subjName).join(', ')}</td><td>${DB.all('classes').filter(c=>c.teacherId===u.id).map(c=>c.name).join(', ')}</td><td>${u.initPw?`<code>${esc(u.initPw)}</code>`:'—'}</td>
    <td style="white-space:nowrap"><button class="btn sm" data-act="role" data-id="${u.id}">⇄ Vai trò</button><button class="btn sm" data-act="reset" data-id="${u.id}">🔑</button>${u.id!==me().id?`<button class="btn sm bad" data-act="del" data-id="${u.id}">✕</button>`:''}</td></tr>`).join('')}</table></div>`;
  on(el,'click','[data-act]',b=>{ const a=b.dataset.act,u=b.dataset.id&&DB.get('users',b.dataset.id);
    if(a==='bulk') bulkUsersModal({role:'teacher',title:'Thêm giáo viên hàng loạt'});
    if(a==='export') exportXlsx('DanhSach_GiaoVien.xlsx',{GiaoVien:[['Họ tên','Tài khoản','Vai trò','Mật khẩu cấp'],...ts.map(u=>[u.name,u.username,u.role,u.initPw||''])]});
    if(a==='role'){ if(u.id===me().id) return toast('Không đổi vai trò của chính mình','bad'); u.role=u.role==='admin'?'teacher':'admin'; DB.upsert('users',u); App.render(); }
    if(a==='reset') setPwModal([u],u.name+' ('+u.username+')');
    if(a==='del') confirmBox('Xoá tài khoản '+esc(u.name)+'?',()=>{ DB.remove('users',u.id); App.render(); }); });
});

/* ===================== NGÂN HÀNG CÂU HỎI ===================== */
const BankState={subject:'',grade:'',topic:'',type:'',level:'',q:'',page:1,mine:false,bank:''};
function questionEditor(q,onSaved){
  const isNew=!q; q=q?JSON.parse(JSON.stringify(q)):{id:uid('q'),subject:BankState.subject||((me().subjects||[])[0])||'toan',grade:+BankState.grade||12,topic:BankState.topic||'',level:'NB',type:'mcq',content:'',options:['','','',''],answer:0,statements:['','','',''],explain:'',params:'',cond:'',shared:true};
  if(!q.options) q.options=['','','','']; if(!q.statements) q.statements=['','','',''];
  const tfAns=Array.isArray(q.answer)?q.answer:[true,true,true,true];
  modal({title:isNew?'Thêm câu hỏi':'Sửa câu hỏi',size:'xl',body:`
  <div class="grid" style="grid-template-columns:1fr 1fr;align-items:start">
   <div>
    <div class="grid g4"><div class="field"><label>Môn</label><select id="qS">${opts(subjList(),q.subject)}</select></div><div class="field"><label>Lớp</label><select id="qG">${opts(GRADES,q.grade)}</select></div>
      <div class="field"><label>Loại</label><select id="qT">${opts(QTYPES,q.type)}</select></div><div class="field"><label>Mức độ</label><select id="qL">${opts(LEVELS,q.level)}</select></div></div>
    <div class="field"><label>Chủ đề / bài</label><input type="text" id="qTopic" list="qTopicList" value="${esc(q.topic)}"><datalist id="qTopicList"></datalist></div>
    <div class="field"><label>Nội dung câu hỏi <small class="muted">(công thức trong $...$, HTML cơ bản được phép)</small></label><textarea id="qC" style="min-height:110px">${esc(q.content)}</textarea></div>
    <div id="qMcq">${[0,1,2,3].map(i=>`<div class="row" style="margin-bottom:6px"><label style="margin:0;display:flex;gap:4px;align-items:center"><input type="radio" name="qAns" value="${i}" ${q.type==='mcq'&&+q.answer===i?'checked':''} class="chk"> ${LETTER[i]}</label><input type="text" class="grow qO" data-i="${i}" value="${esc(q.options[i])}"></div>`).join('')}<small class="muted">Chọn nút tròn ở phương án đúng.</small></div>
    <div id="qTf">${[0,1,2,3].map(i=>`<div class="row" style="margin-bottom:6px"><b>${'abcd'[i]})</b><input type="text" class="grow qSt" data-i="${i}" value="${esc(q.statements[i])}"><select class="qSa" data-i="${i}" style="width:90px"><option value="1" ${tfAns[i]?'selected':''}>Đúng</option><option value="0" ${!tfAns[i]?'selected':''}>Sai</option></select></div>`).join('')}</div>
    <div id="qShort" class="field"><label id="qAnsLbl">Đáp án</label><textarea id="qA" style="min-height:50px">${q.type==='short'||q.type==='essay'?esc(q.answer):''}</textarea></div>
    <div id="qPts" class="field"><label>Điểm tối đa (tự luận)</label><input type="number" step="0.25" id="qP" value="${q.points||1}"></div>
    <div class="field"><label>Hình vẽ / minh hoạ <small class="muted">(chọn mẫu rồi sửa thông số; dùng được {a}, {=...} của câu tham số; hoặc dán mã &lt;svg&gt;)</small></label>
      <div class="row" style="margin-bottom:6px"><select id="qFigPre" style="max-width:320px"><option value="">— Chèn hình mẫu —</option>${Fig.PRESETS.map((p,i)=>`<option value="${i}">${esc(p[0])}</option>`).join('')}</select><button class="btn sm" id="qFigClr" type="button">Xoá hình</button></div>
      <textarea id="qFig" style="min-height:46px;font-family:Consolas,monospace;font-size:12.5px" placeholder="@chop base=4; vuong=1">${esc(q.figure||'')}</textarea></div>
    <div class="field"><label>Lời giải / hướng dẫn</label><textarea id="qE" style="min-height:60px">${esc(q.explain)}</textarea></div>
    <details ${Param.has(q)?'open':''}><summary style="cursor:pointer;font-weight:700">🎲 Số tương tự (câu hỏi tham số)</summary>
      <div class="note info" style="margin:8px 0">Khai báo: <code>a=1..9; b=-5..5!0; k=[2,3,5]; c==a+b</code>. Trong nội dung/phương án/đáp án dùng <code>{a}</code> hoặc biểu thức <code>{=2*a+b}</code>. Hàm: sqrt, abs, round(x,n), pow, min, max. Mỗi mã đề / mỗi lượt sinh sẽ ra bộ số khác nhau.</div>
      <div class="field"><label>Tham số</label><input type="text" id="qPar" value="${esc(q.params||'')}" placeholder="a=1..9; b=2..5"></div>
      <div class="field"><label>Điều kiện (tuỳ chọn)</label><input type="text" id="qCond" value="${esc(q.cond||'')}" placeholder="a!=b && a+b>3"></div></details>
    <div class="grid g2" style="margin-top:10px;align-items:center"><div class="field" style="margin:0"><label>Lưu vào bộ ngân hàng</label><select id="qBank">${bankOptions(q.bankId||BankState.bank&&BankState.bank!=='_sample'&&BankState.bank||'')}</select></div>
    <label style="display:flex;gap:6px;align-items:center;margin:18px 0 0"><input type="checkbox" id="qShared" class="chk" ${q.shared!==false?'checked':''}> Chia sẻ (khi lưu vào ngân hàng chung)</label></div>
   </div>
   <div><div class="row"><h3 class="grow" style="margin:0">Xem trước</h3><button class="btn sm" id="qReroll">🎲 Thử bộ số khác</button></div><div id="qPrev" style="margin-top:10px"></div></div>
  </div>`,
  foot:`<button class="btn" data-x>Huỷ</button>${isNew?'<button class="btn" id="qSaveNew">Lưu & thêm câu khác</button>':''}<button class="btn pri" id="qSave">Lưu câu hỏi</button>`,
  onOpen:(m,close)=>{
    let seed='p0';
    const read=()=>{ const t=$('#qT',m).value; const o={...q,subject:$('#qS',m).value,grade:+$('#qG',m).value,type:t,level:$('#qL',m).value,topic:$('#qTopic',m).value.trim(),content:$('#qC',m).value,explain:$('#qE',m).value,figure:$('#qFig',m).value.trim(),params:$('#qPar',m).value.trim(),cond:$('#qCond',m).value.trim(),shared:$('#qShared',m).checked,bankId:$('#qBank',m).value||undefined,updatedAt:Date.now()};
      if(t==='mcq'){ o.options=$$('.qO',m).map(i=>i.value); const r=$('input[name=qAns]:checked',m); o.answer=r?+r.value:-1; delete o.statements; }
      else if(t==='tf'){ o.statements=$$('.qSt',m).map(i=>i.value); o.answer=$$('.qSa',m).map(s=>s.value==='1'); delete o.options; }
      else { o.answer=$('#qA',m).value.trim(); delete o.options; delete o.statements; if(t==='essay') o.points=parseFloat($('#qP',m).value)||1; }
      return o; };
    const show=()=>{ const t=$('#qT',m).value; $('#qMcq',m).classList.toggle('hide',t!=='mcq'); $('#qTf',m).classList.toggle('hide',t!=='tf'); $('#qShort',m).classList.toggle('hide',!(t==='short'||t==='essay')); $('#qPts',m).classList.toggle('hide',t!=='essay');
      $('#qAnsLbl',m).textContent=t==='essay'?'Hướng dẫn chấm / đáp án':'Đáp án (số hoặc chuỗi ngắn; dùng dấu phẩy thập phân được)';
      $('#qTopicList',m).innerHTML=topicsOf($('#qS',m).value,$('#qG',m).value).map(x=>`<option value="${esc(x)}">`).join('');
      try{ const o=read(); $('#qPrev',m).innerHTML=qCard(Param.instantiate(o,seed),{}); renderMath($('#qPrev',m)); }catch(e){ $('#qPrev',m).innerHTML='<div class="note">'+esc(e.message)+'</div>'; } };
    let tm; m.addEventListener('input',()=>{ clearTimeout(tm); tm=setTimeout(show,300); }); m.addEventListener('change',show);
    $('#qReroll',m).onclick=()=>{ seed='p'+Math.random(); show(); };
    $('#qFigPre',m).onchange=e=>{ if(e.target.value==='') return; $('#qFig',m).value=Fig.PRESETS[+e.target.value][1]; e.target.value=''; show(); };
    $('#qFigClr',m).onclick=()=>{ $('#qFig',m).value=''; show(); };
    const save=(again)=>{ const o=read(); if(!o.content.trim()) return toast('Nhập nội dung câu hỏi','bad'); if(o.type==='mcq'&&(o.answer<0||o.options.some(x=>!x.trim()))) return toast('Nhập đủ 4 phương án và chọn đáp án đúng','bad');
      if(o.type==='tf'&&o.statements.some(x=>!x.trim())) return toast('Nhập đủ 4 ý a, b, c, d','bad'); if(o.type==='short'&&!o.answer) return toast('Nhập đáp án','bad');
      if(o.params){ if(!Param.parse(o.params).length) return toast('Khai báo tham số chưa đúng cú pháp','bad'); }
      if(!o.ownerId) o.ownerId=me().id; if(!o.createdAt) o.createdAt=Date.now(); DB.upsert('questions',o); toast('Đã lưu câu hỏi','ok'); close(); onSaved&&onSaved(o);
      if(again){ BankState.subject=o.subject; BankState.grade=o.grade; BankState.topic=o.topic; questionEditor(null,onSaved);} };
    $('#qSave',m).onclick=()=>save(false); const sn=$('#qSaveNew',m); if(sn) sn.onclick=()=>save(true);
    show();
  }});
}
function importTextModal(onDone,{asExam=false}={}){
  modal({title:asExam?'Nhập đề thi từ văn bản':'Nhập câu hỏi từ văn bản',size:'xl',body:`
    <div class="grid" style="grid-template-columns:1fr 1fr;align-items:start"><div>
      <div class="note info">Dán nội dung theo mẫu (xuất từ Word sang văn bản, công thức dạng LaTeX $...$). Đáp án đúng TN: thêm <b>*</b> trước chữ cái (<code>*B.</code>) hoặc dòng <code>Đáp án: B</code>. Đúng/Sai: ghi <code>(Đ)</code>/<code>(S)</code> cuối mỗi ý. Thẻ <code>[Môn: toan] [Lớp: 12] [Chủ đề: ...] [Mức: NB]</code> áp dụng cho các câu phía sau; thẻ ngay sau "Câu n" chỉ áp dụng cho câu đó.</div>
      <div class="row" style="margin:8px 0"><button class="btn sm" id="itTpl">📄 Chèn mẫu</button><button class="btn sm" id="itDl">⬇ Tải mẫu .txt</button><button class="btn sm" id="itFile">📂 Mở file .txt</button></div>
      <div class="grid g3"><div class="field"><label>Môn mặc định</label><select id="itS">${opts(subjList(),BankState.subject||'toan')}</select></div><div class="field"><label>Lớp</label><select id="itG">${opts(GRADES,BankState.grade||12)}</select></div><div class="field"><label>Mức mặc định</label><select id="itL">${opts(LEVELS,'NB')}</select></div></div>
      ${asExam?`<div class="grid g2"><div class="field"><label>Tên đề</label><input type="text" id="itTitle" placeholder="Đề kiểm tra giữa kì I"></div><div class="field"><label>Thời gian (phút)</label><input type="number" id="itDur" value="90"></div></div>`:''}
      <textarea id="itText" style="min-height:330px;font-family:Consolas,monospace;font-size:13px"></textarea></div>
      <div><div class="row"><h3 class="grow" style="margin:0">Kết quả nhận dạng</h3><button class="btn sm" id="itParse">🔎 Nhận dạng</button></div><div id="itRes" style="margin-top:10px;max-height:62vh;overflow:auto"></div></div></div>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="itGo">${asExam?'Tạo đề + lưu vào ngân hàng':'Lưu vào ngân hàng'}</button>`,
    onOpen:(m,close)=>{ let parsed=null;
      const run=()=>{ parsed=QImport.parse($('#itText',m).value,{subject:$('#itS',m).value,grade:$('#itG',m).value,level:$('#itL',m).value});
        $('#itRes',m).innerHTML=`<p><b>${parsed.questions.length}</b> câu · ${Object.entries(groupBy(parsed.questions,q=>q.type)).map(([t,a])=>`${QT_NAME[t]}: ${a.length}`).join(' · ')}</p>`+(parsed.errors.length?`<div class="note">${parsed.errors.map(esc).join('<br>')}</div>`:'')+parsed.questions.map((q,i)=>qCard(Param.instantiate(q,'prev'),{num:'Câu '+(i+1)+'.'})).join(''); renderMath($('#itRes',m)); };
      $('#itParse',m).onclick=run; $('#itTpl',m).onclick=()=>{ $('#itText',m).value=TEXT_TEMPLATE; run(); };
      $('#itDl',m).onclick=()=>download('Mau_NhapCauHoi_LMS_LKT.txt','﻿'+TEXT_TEMPLATE);
      $('#itFile',m).onclick=()=>pickFile('.txt,.tex,.md',async f=>{ $('#itText',m).value=await readText(f); run(); });
      $('#itGo',m).onclick=()=>{ run(); if(!parsed.questions.length) return toast('Chưa nhận dạng được câu nào','bad');
        parsed.questions.forEach(q=>{ q.ownerId=me().id; q.shared=true; DB.data.questions.push(q); }); DB.save(); Sync.markDirty('questions');
        if(asExam){ const ex={id:uid('ex'),title:$('#itTitle',m).value.trim()||'Đề nhập ngày '+fmtDay(Date.now()),subject:parsed.questions[0].subject,grade:parsed.questions[0].grade,duration:+$('#itDur',m).value||45,questionIds:parsed.questions.map(q=>q.id),createdBy:me().id,createdAt:Date.now(),variants:[]}; DB.upsert('exams',ex); }
        close(); toast(`Đã lưu ${parsed.questions.length} câu hỏi`,'ok'); onDone&&onDone(); }; }});
}
Router.add('bank',el=>{
  const S=BankState; let all=visibleQuestions();
  const filt=()=>all.filter(q=>(!S.subject||q.subject===S.subject)&&(!S.grade||+q.grade===+S.grade)&&(!S.topic||q.topic===S.topic)&&(!S.type||q.type===S.type)&&(!S.level||q.level===S.level)&&(!S.mine||q.ownerId===me().id)&&(!S.bank||(S.bank==='_sample'?!q.bankId:q.bankId===S.bank))&&(!S.q||slug(q.content+' '+q.topic).includes(slug(S.q)))).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  const draw=()=>{ all=visibleQuestions(); const list=filt(), per=15, pages=Math.max(1,Math.ceil(list.length/per)); S.page=Math.min(S.page,pages); const slice=list.slice((S.page-1)*per,S.page*per);
    const byT=groupBy(list,q=>q.type), byL=groupBy(list,q=>q.level);
    $('#bkStat',el).innerHTML=`<span class="badge">${list.length} câu</span> ${QTYPES.map(t=>`<span class="badge gray">${t.t}: ${(byT[t.v]||[]).length}</span>`).join(' ')} ${LEVELS.map(l=>`<span class="badge lv-${l.v}">${l.v}: ${(byL[l.v]||[]).length}</span>`).join(' ')} <span class="badge warn">🎲 ${list.filter(Param.has).length} câu tham số</span>`;
    $('#bkList',el).innerHTML=slice.length?slice.map(q=>qCard(Param.instantiate(q,'view'),{actions:`<button class="btn sm" data-act="edit" data-id="${q.id}">✏️ Sửa</button><button class="btn sm" data-act="dup" data-id="${q.id}">⧉</button>${Param.has(q)?`<button class="btn sm" data-act="gen" data-id="${q.id}">🎲 Sinh số tương tự</button>`:''}${(isAdmin()||q.ownerId===me().id)?`<button class="btn sm bad" data-act="del" data-id="${q.id}">✕</button>`:''}`})).join(''):emptyBox('Không có câu hỏi phù hợp bộ lọc','🔍');
    $('#bkPage',el).innerHTML=pages>1?Array.from({length:pages},(_,i)=>`<button class="btn sm ${i+1===S.page?'pri':''}" data-page="${i+1}">${i+1}</button>`).join(''):'';
    renderMath($('#bkList',el)); };
  const topicOpts=()=>S.subject&&S.grade?topicsOf(S.subject,S.grade):[...new Set(all.filter(q=>(!S.subject||q.subject===S.subject)).map(q=>q.topic))].filter(Boolean);
  el.innerHTML=head('Ngân hàng câu hỏi','Ngân hàng riêng từng môn theo cấu trúc 2025 · hỗ trợ câu hỏi tham số sinh “số tương tự”',
    `<button class="btn" data-act="banks">📁 Bộ ngân hàng</button><button class="btn" data-act="genx">🏭 Xưởng sinh câu</button><a class="btn" href="#/import">📄 Nhập Word / PDF / Ảnh</a><button class="btn" data-act="tplx">⬇ Mẫu Excel</button><button class="btn" data-act="impx">📥 Nhập Excel</button><button class="btn" data-act="impt">📝 Nhập văn bản</button><button class="btn" data-act="expx">⬆ Xuất Excel</button><button class="btn" data-act="norm" title="Chuẩn hoá các câu đang lọc">🧹 Chuẩn hoá</button><button class="btn pri" data-act="new">➕ Thêm câu hỏi</button>`)+
  `<div class="card" style="margin-bottom:14px"><div class="grid" style="grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:10px"><select id="fB" style="grid-column:span 2">${bankOptions(S.bank,true)}</select><button class="btn" data-act="copyto" title="Sao chép các câu đang lọc sang một bộ ngân hàng của bạn">⧉ Sao chép các câu đang lọc vào bộ…</button><button class="btn" data-act="moveto" title="Chuyển câu của bạn (đang lọc) sang bộ khác">➜ Chuyển câu của tôi sang bộ…</button></div><div class="grid" style="grid-template-columns:repeat(6,1fr) 2fr;gap:10px">
    <select id="fS">${opts(subjList(),S.subject,'— Môn —')}</select><select id="fG">${opts(GRADES.map(g=>({v:g,t:'Lớp '+g})),S.grade,'— Lớp —')}</select>
    <select id="fTopic">${opts(topicOpts(),S.topic,'— Chủ đề —')}</select><select id="fT">${opts(QTYPES,S.type,'— Loại —')}</select><select id="fL">${opts(LEVELS,S.level,'— Mức độ —')}</select>
    <label style="display:flex;gap:6px;align-items:center;margin:0"><input type="checkbox" id="fMine" class="chk" ${S.mine?'checked':''}> Của tôi</label>
    <input type="search" id="fQ" value="${esc(S.q)}" placeholder="🔍 Tìm theo nội dung..."></div><div id="bkStat" style="margin-top:10px" class="pill-list"></div></div>
  <div id="bkList"></div><div id="bkPage" class="row" style="justify-content:center;margin-top:10px"></div>`;
  const bindF=(id,k,re)=>{ $(id,el).addEventListener(id==='#fQ'?'input':'change',e=>{ S[k]=e.target.type==='checkbox'?e.target.checked:e.target.value; S.page=1; if(re){ S.topic=''; $('#fTopic',el).innerHTML=opts(topicOpts(),'','— Chủ đề —'); } draw(); }); };
  bindF('#fS','subject',1); bindF('#fG','grade',1); bindF('#fTopic','topic'); bindF('#fT','type'); bindF('#fL','level'); bindF('#fQ','q'); bindF('#fMine','mine'); bindF('#fB','bank');
  on(el,'click','[data-page]',b=>{ S.page=+b.dataset.page; draw(); window.scrollTo(0,0); });
  on(el,'click','[data-act]',b=>{ const a=b.dataset.act, q=b.dataset.id&&DB.get('questions',b.dataset.id);
    if(a==='new') questionEditor(null,draw); if(a==='edit') questionEditor(q,draw);
    if(a==='banks') banksModal(()=>{ $('#fB',el).innerHTML=bankOptions(S.bank,true); draw(); });
    if(a==='genx') generatorModal(draw);
    if(a==='copyto'||a==='moveto'){ const list=filt().filter(q=>a==='copyto'||q.ownerId===me().id||isAdmin()); if(!list.length) return toast('Không có câu phù hợp','bad'); if(!myBanks().length) return toast('Hãy tạo một bộ ngân hàng trước (nút 📁 Bộ ngân hàng)','bad');
      modal({title:(a==='copyto'?'⧉ Sao chép ':'➜ Chuyển ')+list.length+' câu',body:`<div class="field"><label>Đến bộ ngân hàng</label><select id="ctB">${myBanks().map(b=>`<option value="${b.id}">${b.share==='school'?'🌐':'🔒'} ${esc(b.name)}</option>`).join('')}</select></div>`,foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="ctGo">Thực hiện</button>`,
        onOpen:(m,close)=>{ $('#ctGo',m).onclick=()=>{ const bid=$('#ctB',m).value; list.forEach(q=>{ if(a==='copyto') DB.data.questions.push({...JSON.parse(JSON.stringify(q)),id:uid('q'),bankId:bid,ownerId:me().id,createdAt:Date.now()}); else q.bankId=bid; }); DB.save(); Sync.markDirty('questions'); close(); toast('Đã xong','ok'); draw(); }; }}); }
    if(a==='dup'){ const c={...JSON.parse(JSON.stringify(q)),id:uid('q'),ownerId:me().id,createdAt:Date.now()}; DB.upsert('questions',c); toast('Đã nhân bản','ok'); draw(); }
    if(a==='del') confirmBox('Xoá câu hỏi này khỏi ngân hàng? (Các đề đã dùng câu này sẽ mất câu.)',()=>{ DB.remove('questions',q.id); draw(); });
    if(a==='gen') modal({title:'🎲 Sinh câu hỏi số tương tự',size:'lg',body:`<div class="row"><label style="margin:0">Số câu cần sinh</label><input type="number" id="gN" value="5" min="1" max="50" style="width:90px"><button class="btn" id="gPrev">Xem trước</button></div><div id="gOut" style="margin-top:12px"></div>`,
      foot:`<button class="btn" data-x>Đóng</button><button class="btn pri" id="gSave">Lưu các câu vào ngân hàng</button>`,onOpen:(m,close)=>{ let cl=[]; const prev=()=>{ cl=Param.clones(q,+$('#gN',m).value||5); $('#gOut',m).innerHTML=cl.map((c,i)=>qCard(c,{num:'#'+(i+1)})).join(''); renderMath($('#gOut',m)); }; $('#gPrev',m).onclick=prev; prev();
        $('#gSave',m).onclick=()=>{ cl.forEach(c=>{ c.ownerId=me().id; DB.data.questions.push(c); }); DB.save(); Sync.markDirty('questions'); close(); toast(`Đã thêm ${cl.length} câu`,'ok'); draw(); }; }});
    if(a==='impt') importTextModal(()=>App.render());
    if(a==='tplx') exportXlsx('Mau_NganHangCauHoi_LMS_LKT.xlsx',{CauHoi:QImport.excelTemplate(),HuongDan:[['Cột','Ý nghĩa'],['Loại','TN = trắc nghiệm 4 phương án; DS = đúng/sai (4 ý ở cột A–D, đáp án dạng ĐSĐĐ); TLN = trả lời ngắn; TL = tự luận'],['Mức độ','NB, TH, VD, VDC'],['Tham số','Câu số tương tự: a=1..9; b=2..5; dùng {a}, {=2*a+1} trong nội dung'],['Công thức','Viết LaTeX trong $...$'],['Môn','Toán, Vật lí, Hoá học, Sinh học, Ngữ văn, Tiếng Anh, Lịch sử, Địa lí, Tin học, GD Kinh tế & Pháp luật, Công nghệ']]});
    if(a==='impx') pickFile('.xlsx,.xls',async f=>{ try{ const rows=await readXlsx(f); const r=QImport.fromRows(rows); if(!r.questions.length) return toast('Không có dòng hợp lệ','bad');
      modal({title:`Nhập ${r.questions.length} câu từ Excel`,size:'lg',body:(r.errors.length?`<div class="note">${r.errors.map(esc).join('<br>')}</div>`:'')+r.questions.slice(0,30).map(q=>qCard(Param.instantiate(q,'x'))).join('')+(r.questions.length>30?`<p class="muted">… và ${r.questions.length-30} câu khác</p>`:''),
        foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="ixGo">Lưu vào ngân hàng</button>`,onOpen:(m,close)=>{ $('#ixGo',m).onclick=()=>{ r.questions.forEach(q=>{q.ownerId=me().id;q.shared=true;DB.data.questions.push(q);}); DB.save(); Sync.markDirty('questions'); close(); toast('Đã nhập','ok'); App.render(); }; }}); }catch(e){ toast('Lỗi đọc file: '+e.message,'bad'); } });
    if(a==='expx'){ const list=filt(); exportXlsx('NganHang_'+(S.subject||'TatCa')+'.xlsx',{CauHoi:[QImport.excelTemplate()[0],...list.map(q=>[subjName(q.subject),q.grade,q.topic,q.level,{mcq:'TN',tf:'DS',short:'TLN',essay:'TL'}[q.type],q.content,...(q.type==='mcq'?q.options:q.type==='tf'?q.statements:['','','','']),q.type==='mcq'?LETTER[q.answer]:q.type==='tf'?q.answer.map(x=>x?'Đ':'S').join(''):q.answer,q.explain||'',q.params||'',q.points||'',q.figure||''])]}); }
    if(a==='norm') normalizeModal(filt());
  });
  draw();
});

/* ===================== CHUẨN HOÁ CÂU HỎI ===================== */
function normQ(q){ const o=JSON.parse(JSON.stringify(q)); const ch=[];
  const clean=(t,isOpt)=>{ let x=String(t??''); const x0=x; const keep=[]; x=x.replace(/\{=[^{}]*\}/g,m=>{ keep.push(m); return '\u0001'+(keep.length-1)+'\u0002'; });
    x=x.replace(/\r/g,'').replace(/[ \t]+/g,' ').replace(/ *\n */g,'\n').trim();
    if(!isOpt) x=x.replace(/^(Câu|Bài)\s*\d+\s*[:.)]\s*/i,'');
    if(isOpt==='st') x=x.replace(/^[a-d]\)\s+/,''); else if(isOpt) x=x.replace(/^\(?[A-D][.)]\s+/,'').replace(/[.;]\s*$/,'');
    x=x.replace(/\$\s+/g,m=>m).replace(/\s+([,.;:?!])(?=\s|$)/g,'$1').replace(/\$([^$]*)\$/g,(m,f)=>'$'+f.trim().replace(/(\d)\.(\d)/g,'$1{,}$2')+'$');
    if(q.subject!=='anh'&&q.subject!=='tin') x=x.split(/(\$[^$]*\$)/g).map(seg=>seg.startsWith('$')?seg:seg.replace(/(\d)\.(\d{1,3})(?!\d|\.)/g,'$1,$2')).join('');
    x=x.replace(/\u0001(\d+)\u0002/g,(_,i)=>keep[+i]); if(x!==x0) ch.push(1); return x; };
  o.content=clean(o.content); if(o.explain) o.explain=clean(o.explain);
  if(o.options) o.options=o.options.map(v=>clean(v,true)); if(o.statements) o.statements=o.statements.map(v=>clean(v,'st'));
  if(o.type==='short') { const a=String(o.answer||'').trim().replace(/\s+/g,''); if(a!==o.answer){ o.answer=a; ch.push(1);} }
  if(!['NB','TH','VD','VDC'].includes(o.level)){ o.level='NB'; ch.push(1); }
  if(o.topic){ const t=o.topic.trim().replace(/\s+/g,' '); if(t!==o.topic){ o.topic=t; ch.push(1);} }
  return ch.length?o:null; }
function normalizeModal(list){
  const changed=list.map(q=>({q,n:normQ(q)})).filter(x=>x.n);
  modal({title:'🧹 Chuẩn hoá câu hỏi',size:'lg',body:`<div class="note info">Chuẩn hoá: bỏ khoảng trắng thừa, bỏ tiền tố “Câu n:”, bỏ nhãn “A.”, “B.” lặp trong phương án, bỏ dấu chấm cuối phương án, đổi dấu thập phân sang dấu phẩy theo chuẩn Việt Nam (trong công thức dùng {,}), chuẩn hoá đáp án trả lời ngắn, mức độ, chủ đề.</div>
    <p>Trong <b>${list.length}</b> câu đang lọc có <b>${changed.length}</b> câu cần chuẩn hoá.</p>${changed.slice(0,8).map(x=>`<div class="grid g2" style="gap:8px;margin-bottom:8px"><div>${qCard(x.q,{showAnswer:false})}</div><div>${qCard(x.n,{showAnswer:false})}</div></div>`).join('')}${changed.length>8?`<p class="muted">… và ${changed.length-8} câu khác</p>`:''}`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="nmGo" ${changed.length?'':'disabled'}>Áp dụng cho ${changed.length} câu</button>`,onOpen:(m,close)=>{ $('#nmGo',m).onclick=()=>{ changed.forEach(x=>{ const i=DB.data.questions.findIndex(q=>q.id===x.q.id); if(i>=0) DB.data.questions[i]={...x.n,updatedAt:Date.now()}; }); DB.save(); Sync.markDirty('questions'); close(); toast(`Đã chuẩn hoá ${changed.length} câu`,'ok'); App.render(); }; }});
}

/* ===================== ĐẶT LẠI MẬT KHẨU (đẩy lên máy chủ ngay) ===================== */
function setPwModal(users,label){
  modal({title:'🔑 Đặt lại mật khẩu – '+esc(label),body:`<div class="field"><label>Mật khẩu mới</label><input type="text" id="spPw" value="123456" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
    ${users.length>1?'<label style="display:flex;gap:6px;align-items:center;font-weight:500"><input type="checkbox" class="chk" id="spRand"> Mỗi học sinh một mật khẩu ngẫu nhiên (bỏ qua ô trên)</label>':''}
    <div id="spMsg" class="note info" style="margin-top:10px">${Sync.on?(DB.data.settings.writeKey?'Mật khẩu mới sẽ được đẩy lên máy chủ ngay sau khi lưu.':'⚠ Chưa nhập <b>Khoá ghi</b> (Cài đặt) nên mật khẩu mới <b>chưa lên được máy chủ</b> – học sinh sẽ vẫn bị báo sai. Nhập Khoá ghi trước.'):'Chế độ cục bộ: mật khẩu chỉ có hiệu lực trên máy này.'}</div>`,
    foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="spGo">Lưu mật khẩu</button>`,onOpen:(m,close)=>{ $('#spGo',m).onclick=async()=>{
      const rnd=$('#spRand',m)&&$('#spRand',m).checked; const pw=$('#spPw',m).value.trim(); if(!rnd&&pw.length<4) return toast('Mật khẩu tối thiểu 4 ký tự','bad');
      const now=Date.now(); users.forEach(u=>{ u.initPw=rnd?randPw():pw; u.pw=hashPw(u.initPw); u.pwAt=now; delete u.locked; }); DB.save();
      if(Sync.on&&DB.data.settings.writeKey){ $('#spGo',m).disabled=true; $('#spMsg',m).textContent='Đang đẩy lên máy chủ…';
        try{ await Sync.push(); close(); toast(users.length>1?`Đã đặt lại mật khẩu ${users.length} học sinh và lưu lên máy chủ`:`Mật khẩu mới của ${users[0].name}: ${users[0].initPw} – đã lưu lên máy chủ`,'ok'); }
        catch(e){ $('#spGo',m).disabled=false; $('#spMsg',m).className='note'; $('#spMsg',m).textContent='❌ Chưa lưu được lên máy chủ: '+e.message+'. Kiểm tra mạng và Khoá ghi rồi bấm lại.'; return; } }
      else { Sync.markDirty('users'); close(); toast(users.length>1?'Đã đặt lại mật khẩu':`Mật khẩu mới của ${users[0].name}: ${users[0].initPw}`,'ok'); }
      App.render(); }; }});
}
