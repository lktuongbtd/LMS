/* LMS LKT – app.js: khung giao diện, đăng nhập, điều hướng */
'use strict';
const NAV = {
  teacher:[['Tổng quan',[['dashboard','🏠','Bảng điều khiển']]],
    ['Dạy học',[['classes','🏫','Lớp & Học sinh'],['lessons','📚','Học liệu'],['announcements','📣','Thông báo']]],
    ['Đề & Ngân hàng',[['bank','❓','Ngân hàng câu hỏi'],['import','📄','Nhập Word/PDF/Ảnh'],['theory','📘','Ôn lý thuyết'],['matrices','🧮','Ma trận & Đặc tả'],['exams','📝','Đề thi & Trộn đề']]],
    ['Đánh giá',[['assignments','📤','Giao bài & Kết quả'],['gradebook','📒','Bảng điểm'],['progress','📈','Tiến độ học tập']]],
    ['Hệ thống',[['settings','⚙️','Cài đặt']]]],
  student:[['Học tập',[['home','🏠','Trang chủ'],['tasks','📝','Bài tập & Kiểm tra'],['my-lessons','📚','Học liệu'],['theory','📘','Ôn lý thuyết'],['practice','🎯','Tự luyện'],['my-results','🏆','Kết quả của tôi'],['account','👤','Tài khoản']]]]
};
const TITLES={dashboard:'Bảng điều khiển',classes:'Lớp & Học sinh',teachers:'Giáo viên',lessons:'Học liệu',announcements:'Thông báo',bank:'Ngân hàng câu hỏi',matrices:'Ma trận & Đặc tả',exams:'Đề thi',assignments:'Giao bài & Kết quả',gradebook:'Bảng điểm',progress:'Tiến độ học tập',settings:'Cài đặt',home:'Trang chủ',tasks:'Bài tập & Kiểm tra','my-lessons':'Học liệu',lesson:'Học liệu','my-results':'Kết quả của tôi',account:'Tài khoản',take:'Làm bài',import:'Nhập đề Word / PDF / Ảnh',theory:'Ôn lý thuyết',practice:'Tự luyện',try:'Làm thử',result:'Kết quả'};
const App = {
  render(){
    Take.stop(); $('#modal-root').innerHTML='';
    const app=$('#app');
    if(!Auth.user){ app.innerHTML=this.loginHtml(); this.bindLogin(); return; }
    const role=Auth.user.role==='student'?'student':'teacher';
    let [page,...params]=(location.hash.replace(/^#\/?/,'')||'').split('/'); if(!page||!Router.pages[page]) page=role==='student'?'home':'dashboard';
    const teacherOnly=['import','dashboard','classes','teachers','lessons','announcements','bank','matrices','exams','assignments','gradebook','progress','settings','try'];
    if(role==='student'&&teacherOnly.includes(page)) page='home';
    if(role==='teacher'&&['home','tasks','my-lessons','my-results','account','take'].includes(page)) page='dashboard';
    const nav=JSON.parse(JSON.stringify(NAV[role])); if(Auth.is('admin')) nav[4][1].unshift(['teachers','👨‍🏫','Giáo viên & Quản trị']);
    const exam=page==='take'||page==='try';
    app.innerHTML=`<div class="shell">${exam?'':`<aside class="side" id="side"><div class="brand"><div class="logo">LKT</div><div><b>${esc(CFG.appName)}</b><small>${esc(DB.data.settings.schoolName||CFG.schoolName||'Hệ thống học tập')}</small></div></div>
      <nav class="nav">${nav.map(([g,items])=>`<div class="grp">${g}</div>`+items.map(([k,i,t])=>`<a href="#/${k}" class="${k===page||(page==='lesson'&&k===(role==='student'?'my-lessons':'lessons'))||(page==='result'&&k===(role==='student'?'tasks':'assignments'))?'on':''}"><span class="ic">${i}</span>${t}</a>`).join('')).join('')}</nav>
      <div class="side-foot">© ${new Date().getFullYear()} ${esc(CFG.author)}<br>${esc(CFG.contact)}</div></aside>`}
      <main class="main" style="${exam?'margin-left:0':''}"><header class="top">${exam?`<div class="logo" style="width:34px;height:34px;font-size:11px">LKT</div>`:`<button class="btn ghost menu-btn" id="menuBtn">☰</button>`}<div class="title">${TITLES[page]||''}</div>
        <span class="sync-dot" id="syncDot"></span><div class="user-chip" id="userChip"><div class="avatar">${esc(Auth.user.name.split(' ').pop().charAt(0))}</div><div><b style="font-size:13px">${esc(Auth.user.name)}</b><small class="muted">${Auth.user.role==='admin'?'Quản trị':Auth.user.role==='teacher'?'Giáo viên':'Học sinh – '+esc(className(Auth.user.classId))}</small></div></div></header>
        <div class="content" id="content"></div><div class="foot">${esc(CFG.appName)} · Thiết kế bởi ${esc(CFG.author)} – ${esc(CFG.contact)}</div></main></div>`;
    setSyncDot(Sync.on?true:false);
    const mb=$('#menuBtn'); if(mb) mb.onclick=()=>$('#side').classList.toggle('open');
    const side=$('#side'); if(side) side.addEventListener('click',e=>{ if(e.target.closest('a')) side.classList.remove('open'); });
    $('#userChip').onclick=()=>modal({title:'Tài khoản',body:`<p><b>${esc(Auth.user.name)}</b> (<code>${esc(Auth.user.username)}</code>)</p>`,foot:`${Auth.user.role==='student'?'<a class="btn" href="#/account" data-x>Đổi mật khẩu</a>':'<a class="btn" href="#/settings" data-x>Cài đặt</a>'}<button class="btn bad" id="logoutBtn">Đăng xuất</button>`,onOpen:(m)=>{ $('#logoutBtn',m).onclick=()=>Auth.logout(); }});
    try{ Router.pages[page]($('#content'),params); }catch(e){ console.error(e); $('#content').innerHTML=`<div class="note">Lỗi hiển thị trang: ${esc(e.message)}</div>`; }
    renderMath($('#content'));
  },
  loginHtml(){ return `<div class="login"><section class="hero"><div class="row"><div class="logo">LKT</div><b style="font-size:18px">${esc(CFG.appName)}</b></div>
    <div><h1>Hệ thống quản lý học tập<br><span>hiện đại cho trường THPT</span></h1><p>Ngân hàng câu hỏi 11 môn theo cấu trúc đề 2025, ma trận – đặc tả chuẩn, trộn đề, thi online tự chấm, theo dõi tiến độ từng học sinh.</p>
    <div class="feat"><div><b>❓ Ngân hàng & số tương tự</b>Câu hỏi tham số sinh vô hạn đề khác số</div><div><b>🧮 Ma trận → Đề</b>Đặc tả tự động, sinh đề 1 chạm</div><div><b>🔀 Trộn đề & xuất Word</b>Nhiều mã, bảng đáp án chuẩn</div><div><b>📈 Điểm & tiến độ</b>Xuất Excel theo lớp</div></div></div>
    <small style="color:#a5b4fc">© ${new Date().getFullYear()} ${esc(CFG.author)} · ${esc(CFG.contact)}</small></section>
    <section class="login-box"><div class="login-card"><h1>Đăng nhập</h1><p class="muted">${esc(DB.data.settings.schoolName||CFG.schoolName)}</p>
      <form id="loginForm"><div class="field"><label>Tài khoản</label><input type="text" id="lgU" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" required></div><div class="field"><label>Mật khẩu</label><div style="position:relative"><input type="password" id="lgP" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false" required style="padding-right:44px"><button type="button" id="lgEye" class="btn ghost sm" style="position:absolute;right:4px;top:4px" title="Hiện/ẩn mật khẩu">👁</button></div></div><div id="lgMsg"></div>
      <label style="display:flex;gap:6px;align-items:center;font-weight:500"><input type="checkbox" id="lgR" class="chk"> Ghi nhớ đăng nhập trên máy này</label>
      <button class="btn pri" style="width:100%;justify-content:center;padding:11px;margin-top:14px">Đăng nhập</button></form>
      ${Sync.on?'<p class="muted" style="font-size:12.5px;margin-top:10px">☁️ Đã kết nối máy chủ – dữ liệu lớp học được tải tự động.</p>':''}
      <div class="demo"><b>Tài khoản dùng thử</b><br><button class="btn sm" data-demo="admin|admin123">Quản trị</button><button class="btn sm" data-demo="gv.toan|123456">Giáo viên</button><button class="btn sm" data-demo="hs01|123456">Học sinh</button><br><small class="muted">Đổi/xoá các tài khoản mẫu sau khi triển khai thật.</small></div></div></section></div>`; },
  bindLogin(){
    $$('[data-demo]').forEach(b=>b.onclick=()=>{ const [u,p]=b.dataset.demo.split('|'); $('#lgU').value=u; $('#lgP').value=p; });
    $('#lgEye').onclick=()=>{ const i=$('#lgP'); i.type=i.type==='password'?'text':'password'; };
    const msg=(h,info)=>{ $('#lgMsg').innerHTML=h?`<div class="note ${info?'info':''}" style="margin:8px 0">${h}</div>`:''; };
    $('#loginForm').onsubmit=async e=>{ e.preventDefault(); msg('');
      const un=$('#lgU').value.trim(), pw=$('#lgP').value; let srv=null, srvErr=false;
      if(Sync.on){ try{ srv=await Sync.call('login',{username:un,pw:hashPw(pw.trim())});
          if(srv&&!srv.ok&&pw!==pw.trim()) srv=await Sync.call('login',{username:un,pw:hashPw(pw)});
          if(srv&&srv.ok&&srv.user){ const i=DB.data.users.findIndex(x=>x.id===srv.user.id); if(i>=0) DB.data.users[i]={...DB.data.users[i],...srv.user}; else DB.data.users.push(srv.user); DB.save(); }
          else if(srv&&srv.error==='locked'){ return msg('Tài khoản đang bị khoá – liên hệ giáo viên.'); }
        }catch(err){ srvErr=true; } }
      const local=Auth.find(un);
      if(Sync.on&&srv&&!srv.ok&&srv.error!=='Máy chủ chưa có dữ liệu'){
        // máy chủ từ chối: chỉ cho giáo viên dùng dữ liệu trên máy (trường hợp chưa đẩy dữ liệu lên)
        if(!(local&&local.role!=='student'&&Auth.check(local,pw))){
          return msg(srv.error==='nouser'||(!local&&srv.error==='wrong')?`Máy chủ không có tài khoản <b>${esc(un)}</b>. Có thể giáo viên vừa tạo tài khoản nhưng <b>chưa đẩy dữ liệu lên máy chủ</b> (Cài đặt → nhập Khoá ghi → Đẩy lên máy chủ), hoặc gõ sai tên đăng nhập.`
            :'Sai mật khẩu. Kiểm tra bàn phím (Caps Lock, gõ tiếng Việt Telex/VNI đang bật) hoặc nhờ giáo viên bấm 🔑 <b>cấp lại mật khẩu</b> rồi đẩy lên máy chủ.'); }
        toast('Máy chủ chưa có dữ liệu mới của máy này – vào Cài đặt bấm “Đẩy lên máy chủ”','bad');
      }
      const r=Auth.login(un,pw,$('#lgR').checked);
      if(r===true){ toast('Đăng nhập thành công','ok'); location.hash='#/'; this.render(); if(Sync.on){ Sync.pull(Auth.is('admin','teacher')&&!!DB.data.settings.writeKey).then(()=>{ Auth.init(); App.render(); }).catch(()=>{}); Sync.flushOutbox(); } }
      else if(r==='locked') msg('Tài khoản đang bị khoá – liên hệ giáo viên.');
      else if(r==='nouser') msg(srvErr?'Không kết nối được máy chủ đồng bộ và máy này chưa có tài khoản <b>'+esc(un)+'</b>. Kiểm tra mạng, hoặc Web App Apps Script phải triển khai với quyền truy cập <b>“Bất kỳ ai”</b>.'
        :!Sync.on?`Trình duyệt này chưa có tài khoản <b>${esc(un)}</b>. Hệ thống đang chạy <b>chế độ cục bộ</b>: tài khoản do giáo viên tạo chỉ nằm trên máy của giáo viên. Để học sinh đăng nhập trên máy/điện thoại khác cần bật đồng bộ (dán URL Apps Script vào <code>config.js</code> – xem README mục 3b).`
        :`Không tìm thấy tài khoản <b>${esc(un)}</b>. Kiểm tra lại tên đăng nhập (ví dụ <code>12a1_01</code>).`);
      else msg('Sai mật khẩu. Kiểm tra Caps Lock, tắt bộ gõ tiếng Việt khi nhập mật khẩu, hoặc nhờ giáo viên bấm 🔑 <b>cấp lại mật khẩu</b>.'); };
  }
};
window.addEventListener('hashchange',()=>App.render());
(async function boot(){
  DB.load(); SEED.finish(DB.data); if(typeof SEED2!=='undefined') SEED2.upgrade(DB.data); DB.save(); Auth.init(); App.render();
  if(Sync.on&&Auth.user){ try{ await Sync.pull(Auth.is('admin','teacher')); await Sync.flushOutbox(); Auth.init(); if(!/take|try/.test(location.hash)) App.render(); }catch(e){ setSyncDot(false); } }
})();
