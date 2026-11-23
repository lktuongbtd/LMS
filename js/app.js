/* LMS LKT – app.js: khung giao diện, đăng nhập, điều hướng */
'use strict';
const NAV = {
  teacher:[['Tổng quan',[['dashboard','🏠','Bảng điều khiển']]],
    ['Dạy học',[['classes','🏫','Lớp & Học sinh'],['lessons','📚','Học liệu'],['announcements','📣','Thông báo']]],
    ['Đề & Ngân hàng',[['bank','❓','Ngân hàng câu hỏi'],['theory','📘','Ôn lý thuyết'],['matrices','🧮','Ma trận & Đặc tả'],['exams','📝','Đề thi & Trộn đề']]],
    ['Đánh giá',[['assignments','📤','Giao bài & Kết quả'],['gradebook','📒','Bảng điểm'],['progress','📈','Tiến độ học tập']]],
    ['Hệ thống',[['settings','⚙️','Cài đặt']]]],
  student:[['Học tập',[['home','🏠','Trang chủ'],['tasks','📝','Bài tập & Kiểm tra'],['my-lessons','📚','Học liệu'],['theory','📘','Ôn lý thuyết'],['practice','🎯','Tự luyện'],['my-results','🏆','Kết quả của tôi'],['account','👤','Tài khoản']]]]
};
const TITLES={dashboard:'Bảng điều khiển',classes:'Lớp & Học sinh',teachers:'Giáo viên',lessons:'Học liệu',announcements:'Thông báo',bank:'Ngân hàng câu hỏi',matrices:'Ma trận & Đặc tả',exams:'Đề thi',assignments:'Giao bài & Kết quả',gradebook:'Bảng điểm',progress:'Tiến độ học tập',settings:'Cài đặt',home:'Trang chủ',tasks:'Bài tập & Kiểm tra','my-lessons':'Học liệu',lesson:'Học liệu','my-results':'Kết quả của tôi',account:'Tài khoản',take:'Làm bài',theory:'Ôn lý thuyết',practice:'Tự luyện',try:'Làm thử',result:'Kết quả'};
const App = {
  render(){
    Take.stop(); $('#modal-root').innerHTML='';
    const app=$('#app');
    if(!Auth.user){ app.innerHTML=this.loginHtml(); this.bindLogin(); return; }
    const role=Auth.user.role==='student'?'student':'teacher';
    let [page,...params]=(location.hash.replace(/^#\/?/,'')||'').split('/'); if(!page||!Router.pages[page]) page=role==='student'?'home':'dashboard';
    const teacherOnly=['dashboard','classes','teachers','lessons','announcements','bank','matrices','exams','assignments','gradebook','progress','settings','try'];
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
      <form id="loginForm"><div class="field"><label>Tài khoản</label><input type="text" id="lgU" autocomplete="username" required></div><div class="field"><label>Mật khẩu</label><input type="password" id="lgP" autocomplete="current-password" required></div>
      <label style="display:flex;gap:6px;align-items:center;font-weight:500"><input type="checkbox" id="lgR" class="chk"> Ghi nhớ đăng nhập trên máy này</label>
      <button class="btn pri" style="width:100%;justify-content:center;padding:11px;margin-top:14px">Đăng nhập</button></form>
      ${Sync.on?'<p class="muted" style="font-size:12.5px;margin-top:10px">☁️ Đã kết nối máy chủ – dữ liệu lớp học được tải tự động.</p>':''}
      <div class="demo"><b>Tài khoản dùng thử</b><br><button class="btn sm" data-demo="admin|admin123">Quản trị</button><button class="btn sm" data-demo="gv.toan|123456">Giáo viên</button><button class="btn sm" data-demo="hs01|123456">Học sinh</button><br><small class="muted">Đổi/xoá các tài khoản mẫu sau khi triển khai thật.</small></div></div></section></div>`; },
  bindLogin(){
    $$('[data-demo]').forEach(b=>b.onclick=()=>{ const [u,p]=b.dataset.demo.split('|'); $('#lgU').value=u; $('#lgP').value=p; });
    $('#loginForm').onsubmit=async e=>{ e.preventDefault();
      if(Sync.on){ try{ const un=$('#lgU').value.trim(), h=hashPw($('#lgP').value);
          const lr=await Sync.call('login',{username:un,pw:h});
          if(lr&&lr.ok&&lr.user){ const i=DB.data.users.findIndex(x=>x.id===lr.user.id); if(i>=0) DB.data.users[i]={...DB.data.users[i],...lr.user}; else DB.data.users.push(lr.user); DB.save(); }
          else if(lr&&lr.error==='locked'){ return toast('Tài khoản đang bị khoá – liên hệ giáo viên','bad'); }
          else if(lr&&lr.error==='wrong'){ return toast('Sai tài khoản hoặc mật khẩu','bad'); }
        }catch(err){ /* mất mạng: dùng dữ liệu đã lưu trên máy */ } }
      const r=Auth.login($('#lgU').value,$('#lgP').value,$('#lgR').checked);
      if(r===true){ toast('Đăng nhập thành công','ok'); location.hash='#/'; this.render(); if(Sync.on){ Sync.pull(Auth.is('admin','teacher')&&!!DB.data.settings.writeKey).then(()=>{ Auth.init(); App.render(); }).catch(()=>{}); Sync.flushOutbox(); } }
      else toast(r==='locked'?'Tài khoản đang bị khoá – liên hệ giáo viên':'Sai tài khoản hoặc mật khẩu','bad'); };
  }
};
window.addEventListener('hashchange',()=>App.render());
(async function boot(){
  DB.load(); SEED.finish(DB.data); if(typeof SEED2!=='undefined') SEED2.upgrade(DB.data); DB.save(); Auth.init(); App.render();
  if(Sync.on&&Auth.user){ try{ await Sync.pull(Auth.is('admin','teacher')); await Sync.flushOutbox(); Auth.init(); if(!/take|try/.test(location.hash)) App.render(); }catch(e){ setSyncDot(false); } }
})();
