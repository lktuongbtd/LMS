/* LMS LKT – core.js: tiện ích, lưu trữ, xác thực, đồng bộ, UI dùng chung
 * Tác giả: Lương Khánh Tường – ĐT/Zalo: 0916780807 */
'use strict';
const CFG = Object.assign({appName:'LMS LKT',schoolName:'',apiUrl:'',author:'Lương Khánh Tường',contact:'ĐT/Zalo: 0916780807'}, window.LMS_CONFIG||{});
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const uid = (p='') => p + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const esc = s => String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = t => t ? new Date(t).toLocaleString('vi-VN',{hour12:false}) : '';
const fmtDay = t => t ? new Date(t).toLocaleDateString('vi-VN') : '';
const fmtNum = (n,d=2) => (n==null||isNaN(n)) ? '' : (Math.round(n*10**d)/10**d).toString().replace('.',',');
const noAccent = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');
const slug = s => noAccent(s).toLowerCase().replace(/[^a-z0-9]+/g,'');
const shuffle = (a, rnd=Math.random) => { a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const sum = a => a.reduce((x,y)=>x+(+y||0),0);
const groupBy = (a,f) => a.reduce((m,x)=>{const k=f(x);(m[k]=m[k]||[]).push(x);return m;},{});
function hashPw(p){ // băm nhẹ (không thay thế bảo mật máy chủ)
  let h1=0x811c9dc5, h2=0x1505;
  const s='lkt$'+p;
  for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1^=c;h1=Math.imul(h1,16777619);h2=((h2<<5)+h2+c)|0;}
  return (h1>>>0).toString(16)+(h2>>>0).toString(16);
}
function seededRandom(seed){ let s = (typeof seed==='number'?seed:[...String(seed)].reduce((a,c)=>Math.imul(a^c.charCodeAt(0),2654435761)>>>0,1779033703))||1;
  return ()=>{ s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const randPw = () => String(Math.floor(100000+Math.random()*900000));

/* ---------------- Lưu trữ ---------------- */
const KEY='lmslkt_db_v1';
const COLS=['users','classes','questions','exams','matrices','lessons','assignments','submissions','progress','announcements','topics','theory'];
const DB = {
  data:null,
  load(){
    try{ this.data = JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){ this.data=null; }
    if(!this.data){ this.data = {version:1, settings:{schoolName:CFG.schoolName, writeKey:''}}; COLS.forEach(c=>this.data[c]=[]); (typeof SEED!=='undefined') && SEED.install(this.data); this.save(); }
    COLS.forEach(c=>{ if(!Array.isArray(this.data[c])) this.data[c]=[]; });
    this.data.settings = this.data.settings||{};
    return this.data;
  },
  save(){ try{ localStorage.setItem(KEY, JSON.stringify(this.data)); }catch(e){ toast('Bộ nhớ trình duyệt đầy – hãy sao lưu và xoá bớt dữ liệu','bad'); } },
  get(col,id){ return this.data[col].find(x=>x.id===id); },
  all(col){ return this.data[col]; },
  upsert(col,obj){ const i=this.data[col].findIndex(x=>x.id===obj.id); if(i>=0) this.data[col][i]=obj; else this.data[col].push(obj); this.save(); Sync.markDirty(col); return obj; },
  remove(col,id){ this.data[col]=this.data[col].filter(x=>x.id!==id); this.save(); Sync.markDirty(col); },
  removeWhere(col,f){ this.data[col]=this.data[col].filter(x=>!f(x)); this.save(); Sync.markDirty(col); },
  reset(){ localStorage.removeItem(KEY); this.data=null; this.load(); }
};

/* ---------------- Phiên đăng nhập ---------------- */
const Auth = {
  user:null,
  init(){ const id=sessionStorage.getItem('lmslkt_uid')||localStorage.getItem('lmslkt_uid'); this.user = id ? DB.get('users',id)||null : null; },
  login(username,pw,remember){
    const u = DB.all('users').find(x=>x.username.toLowerCase()===String(username).trim().toLowerCase());
    if(!u || u.pw!==hashPw(pw)) return false;
    if(u.locked) return 'locked';
    this.user=u; sessionStorage.setItem('lmslkt_uid',u.id); if(remember) localStorage.setItem('lmslkt_uid',u.id);
    u.lastLogin=Date.now(); DB.save(); return true;
  },
  logout(){ this.user=null; sessionStorage.removeItem('lmslkt_uid'); localStorage.removeItem('lmslkt_uid'); location.hash='#/'; App.render(); },
  is(...roles){ return this.user && roles.includes(this.user.role); }
};

/* ---------------- Đồng bộ Google Apps Script ---------------- */
const Sync = {
  get url(){ return (DB.data.settings.apiUrl||CFG.apiUrl||'').trim(); },
  get on(){ return !!this.url; },
  dirty:false, timer:null, busy:false,
  markDirty(col){ if(!this.on) return; if(col==='submissions'||col==='progress') return; this.dirty=true; clearTimeout(this.timer);
    if(Auth.is('admin','teacher') && DB.data.settings.writeKey) this.timer=setTimeout(()=>this.push().catch(()=>{}),2500); },
  async call(action, payload={}, method='POST'){
    if(!this.on) throw new Error('Chưa cấu hình máy chủ');
    if(method==='GET'){ const q=new URLSearchParams({action,...payload}); const r=await fetch(this.url+'?'+q); return r.json(); }
    const r = await fetch(this.url,{method:'POST',body:JSON.stringify({action,...payload})}); return r.json();
  },
  coreData(){ const d={}; ['users','classes','questions','exams','matrices','lessons','assignments','announcements','topics','theory'].forEach(c=>d[c]=DB.data[c]);
    d.settings={schoolName:DB.data.settings.schoolName,header:DB.data.settings.header}; return d; },
  async push(){ if(this.busy) return; this.busy=true; setSyncDot('…');
    try{ const r=await this.call('saveDb',{key:DB.data.settings.writeKey, db:JSON.stringify(this.coreData())}); if(!r.ok) throw new Error(r.error||'Lỗi lưu'); this.dirty=false; setSyncDot(true); return r; }
    finally{ this.busy=false; } },
  async pull(withSubs){
    const r = await this.call('getDb',{key:withSubs?(DB.data.settings.writeKey||''):'',sid:Auth.user?Auth.user.id:''},'GET');
    if(!r.ok) throw new Error(r.error||'Lỗi tải');
    if(r.db){ const d=JSON.parse(r.db);
      if(Array.isArray(d.users)) d.users.forEach(u=>{ const o=DB.get('users',u.id); if(!u.pw&&o&&o.pw) u.pw=o.pw; if(!u.initPw&&o&&o.initPw&&o.pw===u.pw) u.initPw=o.initPw; if(o&&o.lastLogin&&!u.lastLogin) u.lastLogin=o.lastLogin; }); ['users','classes','questions','exams','matrices','lessons','assignments','announcements','topics','theory'].forEach(c=>{ if(Array.isArray(d[c])) DB.data[c]=d[c]; });
      if(d.settings&&d.settings.schoolName) DB.data.settings.schoolName=d.settings.schoolName; if(d.settings&&d.settings.header) DB.data.settings.header=d.settings.header; }
    const merge=(col,arr,key)=>{ if(!Array.isArray(arr)) return; const m=new Map(DB.data[col].map(x=>[key(x),x])); arr.forEach(x=>{ const o=m.get(key(x)); if(!o || (x.updatedAt||0)>=(o.updatedAt||0)) m.set(key(x),x); }); DB.data[col]=[...m.values()]; };
    merge('submissions', r.subs, x=>x.id); merge('progress', r.progress, x=>x.studentId+'|'+x.lessonId);
    DB.save(); setSyncDot(true); return r;
  },
  async submit(sub){ if(!this.on) return; try{ await this.call('submit',{item:JSON.stringify(sub)}); }catch(e){ (DB.data.outbox=DB.data.outbox||[]).push({t:'sub',item:sub}); DB.save(); } },
  async progress(p){ if(!this.on) return; try{ await this.call('progress',{item:JSON.stringify(p)}); }catch(e){ (DB.data.outbox=DB.data.outbox||[]).push({t:'prog',item:p}); DB.save(); } },
  async flushOutbox(){ const ob=DB.data.outbox||[]; if(!ob.length||!this.on) return; const rest=[];
    for(const o of ob){ try{ await this.call(o.t==='sub'?'submit':'progress',{item:JSON.stringify(o.item)}); }catch(e){ rest.push(o); } } DB.data.outbox=rest; DB.save(); }
};
function setSyncDot(st){ const d=$('#syncDot'); if(!d) return; d.className='sync-dot'+(st===true?' on':''); d.title = Sync.on ? (st===true?'Đã đồng bộ':'Đang đồng bộ…') : 'Chế độ cục bộ'; }

/* ---------------- UI ---------------- */
function toast(msg,type=''){ const t=document.createElement('div'); t.className='toast '+type; t.textContent=msg; $('#toast-root').appendChild(t); setTimeout(()=>t.remove(),3200); }
function modal({title,body,foot,size='',onOpen}){
  const back=document.createElement('div'); back.className='modal-back';
  back.innerHTML=`<div class="modal ${size}"><div class="modal-h"><h3>${title}</h3><button class="btn ghost sm" data-x>✕</button></div><div class="modal-b">${body}</div>${foot!==false?`<div class="modal-f">${foot||'<button class="btn" data-x>Đóng</button>'}</div>`:''}</div>`;
  $('#modal-root').appendChild(back);
  const close=()=>back.remove();
  back.addEventListener('click',e=>{ if(e.target===back||e.target.closest('[data-x]')) close(); });
  renderMath(back); onOpen&&onOpen(back,close); return {el:back,close};
}
function confirmBox(msg,onYes,yesText='Đồng ý'){ modal({title:'Xác nhận',body:`<p>${msg}</p>`,foot:`<button class="btn" data-x>Huỷ</button><button class="btn pri" id="cfYes">${yesText}</button>`,
  onOpen:(el,close)=>{ $('#cfYes',el).onclick=()=>{close();onYes();}; }}); }
function renderMath(el){ if(!window.renderMathInElement||!el) return; try{ renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\(',right:'\\)',display:false}],throwOnError:false}); }catch(e){} }
function opts(list,sel,withEmpty){ return (withEmpty?`<option value="">${withEmpty===true?'— Tất cả —':withEmpty}</option>`:'')+list.map(o=>{const v=typeof o==='object'?o.v:o, t=typeof o==='object'?o.t:o; return `<option value="${esc(v)}" ${String(v)===String(sel)?'selected':''}>${esc(t)}</option>`;}).join(''); }
function emptyBox(text,icon='📭'){ return `<div class="empty"><div class="big">${icon}</div>${text}</div>`; }
function download(name,content,mime='text/plain'){ const b=content instanceof Blob?content:new Blob([content],{type:mime}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500); }
function exportXlsx(name,sheets){ // sheets: {Tên: [[...],[...]]}
  if(!window.XLSX){ // dự phòng CSV
    const first=Object.values(sheets)[0]; download(name.replace(/\.xlsx$/,'.csv'),'﻿'+first.map(r=>r.map(c=>`"${String(c??'').replace(/"/g,'""')}"`).join(',')).join('\n'),'text/csv'); return; }
  const wb=XLSX.utils.book_new();
  Object.entries(sheets).forEach(([n,aoa])=>{ const ws=XLSX.utils.aoa_to_sheet(aoa); ws['!cols']=(aoa[0]||[]).map((_,i)=>({wch:Math.min(45,Math.max(8,...aoa.slice(0,200).map(r=>String(r[i]??'').length+2)))})); XLSX.utils.book_append_sheet(wb,ws,n.slice(0,31)); });
  XLSX.writeFile(wb,name);
}
function readXlsx(file){ return new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=e=>{ try{ const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'}); const ws=wb.Sheets[wb.SheetNames[0]]; res(XLSX.utils.sheet_to_json(ws,{header:1,defval:''})); }catch(err){rej(err);} }; fr.onerror=rej; fr.readAsArrayBuffer(file); }); }
function readText(file){ return new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=e=>res(e.target.result); fr.onerror=rej; fr.readAsText(file,'utf-8'); }); }
function pickFile(accept,cb){ const i=document.createElement('input'); i.type='file'; i.accept=accept; i.onchange=()=>i.files[0]&&cb(i.files[0]); i.click(); }
/* Xuất Word (.doc HTML) – giữ LaTeX dạng $...$ để chuyển MathType bằng add-in */
/* Xuất Word: MHTML (.doc) có nhúng hình PNG – Word mở trực tiếp; công thức giữ dạng LaTeX $...$ */
function svgToPng(svg,k=2){ return new Promise(res=>{ const m=svg.match(/width="([\d.]+)"\s+height="([\d.]+)"/); const w=m?+m[1]:300,h=m?+m[2]:200; const img=new Image();
  img.onload=()=>{ try{ const c=document.createElement('canvas'); c.width=w*k; c.height=h*k; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(img,0,0,c.width,c.height); res({data:c.toDataURL('image/png').split(',')[1],w,h}); }catch(e){ res(null); } };
  img.onerror=()=>res(null); let s=svg; if(!/xmlns=/.test(s)) s=s.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"'); img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s); }); }
const b64utf8=s=>{ const u=new TextEncoder().encode(s); let bin=''; for(let i=0;i<u.length;i+=32768) bin+=String.fromCharCode.apply(null,u.subarray(i,i+32768)); return btoa(bin); };
const wrap76=s=>s.replace(/(.{76})/g,'$1\r\n');
async function exportWord(name,title,html,{size=12,font='Times New Roman'}={}){
  const svgs=[]; html=html.replace(/<svg[\s\S]*?<\/svg>/g,m=>{ svgs.push(m); return `@@IMG${svgs.length-1}@@`; });
  if(svgs.length) toast('Đang chuyển '+svgs.length+' hình sang ảnh…');
  const imgs=await Promise.all(svgs.map(x=>svgToPng(x)));
  html=html.replace(/@@IMG(\d+)@@/g,(_,i)=>{ const im=imgs[i]; if(!im) return ''; const W=Math.round(Math.min(im.w,320)*.9), H=Math.round(W*im.h/im.w); return `<img src="img${i}.png" width="${W}" height="${H}">`; });
  const doc=`<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>${esc(title)}</title>
  <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
  <style>@page Section1{size:21cm 29.7cm;margin:1.5cm 1.5cm 1.5cm 2cm}div.Section1{page:Section1}body{font-family:"${font}";font-size:${size}pt;line-height:1.25}
  table{border-collapse:collapse}td,th{border:1px solid #000;padding:2pt 5pt;font-size:${size-1}pt;vertical-align:top}th{background:#e8ecf7}
  h1{font-size:${size+3}pt;text-align:center;margin:4pt 0}h2{font-size:${size+1}pt;margin:10pt 0 4pt}h3{font-size:${size}pt;margin:8pt 0 3pt}p{margin:2pt 0}.c{text-align:center}
  table.nb td{border:none;font-size:${size}pt;padding:1pt 4pt 1pt 0}table.opt4 td{width:25%}table.opt2 td{width:50%}p.part{margin-top:8pt}p.qp{margin-top:5pt}</style></head><body><div class="Section1">${html}</div></body></html>`;
  if(!imgs.some(Boolean)){ download(name,'\ufeff'+doc,'application/msword'); return; }
  const B='----=_NextPart_LMSLKT_'+Date.now();
  let m=`MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="${B}"; type="text/html"\r\n\r\n--${B}\r\nContent-Type: text/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\nContent-Location: file:///C:/LMSLKT/de.htm\r\n\r\n${wrap76(b64utf8(doc))}\r\n`;
  imgs.forEach((im,i)=>{ if(im) m+=`--${B}\r\nContent-Type: image/png\r\nContent-Transfer-Encoding: base64\r\nContent-Location: file:///C:/LMSLKT/img${i}.png\r\n\r\n${wrap76(im.data)}\r\n`; });
  m+=`--${B}--\r\n`; download(name,m,'application/msword');
}
/* Tạo file .zip (không nén) */
const CRC_T=(()=>{ const t=[]; for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; t[n]=c>>>0; } return t; })();
function crc32(u){ let c=0xFFFFFFFF; for(let i=0;i<u.length;i++) c=CRC_T[(c^u[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
function makeZip(files){ const enc=new TextEncoder(), parts=[], cen=[]; let off=0; const dt=((2026-1980)<<9)|(1<<5)|1;
  files.forEach(f=>{ const nm=enc.encode(f.name), d=typeof f.data==='string'?enc.encode(f.data):f.data, crc=crc32(d);
    const h=new DataView(new ArrayBuffer(30)); h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(6,0x0800,true); h.setUint16(12,dt,true); h.setUint32(14,crc,true); h.setUint32(18,d.length,true); h.setUint32(22,d.length,true); h.setUint16(26,nm.length,true);
    parts.push(new Uint8Array(h.buffer),nm,d);
    const c=new DataView(new ArrayBuffer(46)); c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(8,0x0800,true); c.setUint16(14,dt,true); c.setUint32(16,crc,true); c.setUint32(20,d.length,true); c.setUint32(24,d.length,true); c.setUint16(28,nm.length,true); c.setUint32(42,off,true);
    cen.push(new Uint8Array(c.buffer),nm); off+=30+nm.length+d.length; });
  const cs=cen.reduce((s,a)=>s+a.length,0); const e=new DataView(new ArrayBuffer(22)); e.setUint32(0,0x06054b50,true); e.setUint16(8,files.length,true); e.setUint16(10,files.length,true); e.setUint32(12,cs,true); e.setUint32(16,off,true);
  return new Blob([...parts,...cen,new Uint8Array(e.buffer)],{type:'application/zip'}); }
const b64ToBytes=b=>{ const s=atob(b); const u=new Uint8Array(s.length); for(let i=0;i<s.length;i++) u[i]=s.charCodeAt(i); return u; };
function printHtml(title,html){ const w=window.open('','_blank'); if(!w){toast('Trình duyệt chặn cửa sổ mới','bad');return;}
  w.document.write(`<html><head><meta charset="utf-8"><title>${esc(title)}</title><link rel="stylesheet" href="${new URL('assets/vendor/katex/katex.min.css',location.href)}"><style>body{font-family:"Times New Roman";font-size:13pt;padding:20px 40px;line-height:1.4}table{border-collapse:collapse;width:100%}td,th{border:1px solid #000;padding:4px 6px}h1{text-align:center;font-size:17pt}.c{text-align:center}.nb td{border:0}table.opt4 td{width:25%}table.opt2 td{width:50%}.qfig-svg{max-width:300px;height:auto}p{margin:3px 0}@media print{button{display:none}}</style></head><body><button onclick="print()" style="float:right;padding:8px 16px">🖨 In / Lưu PDF</button>${html}
  <script src="${new URL('assets/vendor/katex/katex.min.js',location.href)}"><\/script><script src="${new URL('assets/vendor/katex/auto-render.min.js',location.href)}"><\/script><script>window.onload=()=>renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false})<\/script></body></html>`); w.document.close(); }
/* Biểu đồ cột SVG */
function barChart(labels,values,{h=200,color='#6366f1',fmt=v=>v}={}){
  const max=Math.ceil(Math.max(1,...values)/4)*4, n=labels.length, W=Math.max(320,n*48), bw=Math.min(36,(W-40)/n*0.6);
  let s=`<svg class="chart" viewBox="0 0 ${W} ${h+40}" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs>`;
  for(let i=0;i<=4;i++){ const y=10+h*(i/4); s+=`<line x1="30" x2="${W-5}" y1="${y}" y2="${y}" stroke="#eef1f7"/><text x="26" y="${y+4}" font-size="10" text-anchor="end" fill="#94a3b8">${Math.round(max*(1-i/4))}</text>`; }
  labels.forEach((l,i)=>{ const x=30+(W-35)/n*(i+.5), v=values[i], bh=h*(v/max); s+=`<rect x="${x-bw/2}" y="${10+h-bh}" width="${bw}" height="${bh}" rx="5" fill="url(#gb)"><title>${esc(l)}: ${v}</title></rect>`+(v?`<text x="${x}" y="${6+h-bh}" font-size="10.5" text-anchor="middle" fill="#334155" font-weight="700">${fmt(v)}</text>`:'')+`<text x="${x}" y="${h+26}" font-size="10.5" text-anchor="middle" fill="#64748b">${esc(l)}</text>`; });
  return s+'</svg>';
}
const Router = { pages:{}, add(name,fn){ this.pages[name]=fn; } };
