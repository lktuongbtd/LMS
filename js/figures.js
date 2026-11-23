/* LMS LKT – figures.js: thư viện hình vẽ SVG cho câu hỏi (hình học, đồ thị, xác suất, thống kê, thực tiễn)
 * Cú pháp: "@loại khoá=giá trị; khoá=giá trị"  (có thể chứa {a}, {=biểu thức} của câu tham số)
 * Hoặc dán thẳng mã <svg ...>...</svg>. Tác giả: Lương Khánh Tường – ĐT/Zalo 0916780807 */
'use strict';
const Fig = (()=>{
  const INK='#1e293b', BLUE='#2563eb', RED='#dc2626', FILL='rgba(79,70,229,.07)';
  const num=v=>parseFloat(String(v).replace(',','.'));
  const fmt=v=>{ if(typeof v!=='number'||!isFinite(v)) return String(v); const s=Number.isInteger(v)?String(v):String(Math.round(v*1000)/1000); return s.replace('.',','); };
  const esc2=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const svg=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="'Times New Roman',Times,serif" font-size="15" class="qfig-svg"><rect width="${w}" height="${h}" fill="#fff"/>${body}</svg>`;
  const L=(p,q,o={})=>`<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${o.c||INK}" stroke-width="${o.w||1.6}" ${o.d?'stroke-dasharray="5 4"':''} stroke-linecap="round"/>`;
  const T=(x,y,t,o={})=>`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${o.a||'middle'}" ${o.i===false?'':'font-style="italic"'} font-size="${o.s||15}" fill="${o.c||INK}" ${o.b?'font-weight="bold"':''}>${esc2(t)}</text>`;
  const dot=(p,c=INK)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6" fill="${c}"/>`;
  const poly=(pts,o={})=>`<polygon points="${pts.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="${o.f||'none'}" stroke="${o.c||'none'}" stroke-width="${o.w||1.4}"/>`;
  const arrow=(p,q,o={})=>{ const a=Math.atan2(q[1]-p[1],q[0]-p[0]), s=8; return L(p,q,o)+`<polygon points="${q[0]},${q[1]} ${(q[0]-s*Math.cos(a-.4)).toFixed(1)},${(q[1]-s*Math.sin(a-.4)).toFixed(1)} ${(q[0]-s*Math.cos(a+.4)).toFixed(1)},${(q[1]-s*Math.sin(a+.4)).toFixed(1)}" fill="${o.c||INK}"/>`; };
  const mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];
  const lbl=(P,t,C,d=15)=>{ let dx=P[0]-C[0], dy=P[1]-C[1]; const n=Math.hypot(dx,dy)||1; return T(P[0]+dx/n*d, P[1]+dy/n*d+5, t); };
  const right=(V,P,Q,s=9)=>{ const u=[P[0]-V[0],P[1]-V[1]], v=[Q[0]-V[0],Q[1]-V[1]]; const nu=Math.hypot(...u), nv=Math.hypot(...v); const a=[V[0]+u[0]/nu*s,V[1]+u[1]/nu*s], b=[V[0]+v[0]/nv*s,V[1]+v[1]/nv*s], c=[a[0]+v[0]/nv*s,a[1]+v[1]/nv*s]; return `<polyline points="${a.join(',')} ${c.join(',')} ${b.join(',')}" fill="none" stroke="${INK}" stroke-width="1.1"/>`; };
  const centroid=pts=>[pts.reduce((s,p)=>s+p[0],0)/pts.length,pts.reduce((s,p)=>s+p[1],0)/pts.length];
  const labels=(s,def)=>{ const a=String(s||def).split(/[,\s]+/).filter(Boolean); return a; };
  // vẽ thêm đoạn: net="AC:d,SO" (d = nét đứt)
  const extra=(P,net)=>String(net||'').split(',').map(x=>x.trim()).filter(Boolean).map(s=>{ const [seg,st]=s.split(':'); const names=Object.keys(P).sort((a,b)=>b.length-a.length); let p1=null,p2=null; for(const n of names){ if(seg.startsWith(n)){ p1=n; const rest=seg.slice(n.length); p2=names.find(m=>m===rest); break; } } return p1&&p2?L(P[p1],P[p2],{d:st==='d'}):''; }).join('');
  const compile=expr=>{ const e=String(expr).replace(/\^/g,'**').replace(/\bln\(/g,'log(').replace(/(\d),(\d)/g,'$1.$2');
    return new Function('x','"use strict";const {sin,cos,tan,sqrt,abs,exp,log,log10,log2,PI,E,pow,floor,ceil,min,max,atan,asin,acos}=Math;const pi=PI;return ('+e+');'); };

  /* ---------- HÌNH KHÔNG GIAN ---------- */
  function chop(o){ const n=+o.base||4; const lb=labels(o.labels,n===4?'S,A,B,C,D,O':'S,A,B,C,H'); const P={}; let body='';
    if(n===4){ P[lb[1]]=[50,185]; P[lb[2]]=[185,185]; P[lb[3]]=[250,125]; P[lb[4]]=[115,125]; }
    else { P[lb[1]]=[45,175]; P[lb[2]]=[150,205]; P[lb[3]]=[245,145]; }
    const base=lb.slice(1,n+1).map(k=>P[k]); const O = n===4?mid(P[lb[1]],P[lb[3]]):centroid(base);
    const vuong=String(o.vuong||'')==='1'; P[lb[0]] = vuong?[P[lb[1]][0],28]:[O[0],25];
    const S=P[lb[0]], A=P[lb[1]], B=P[lb[2]], C=P[lb[3]], D=n===4?P[lb[4]]:null;
    body+=poly(base,{f:FILL});
    if(n===4){ body+=L(A,B)+L(B,C)+L(C,D,{d:1})+L(D,A,{d:1})+L(S,A)+L(S,B)+L(S,C)+L(S,D,{d:1}); }
    else { body+=L(A,B)+L(B,C)+L(A,C,{d:1})+L(S,A)+L(S,B)+L(S,C); }
    if(vuong) body+=right(A,S,B);
    const showO=String(o.cao||'')==='1'||String(o.cheo||'')==='1';
    if(n===4&&String(o.cheo||'')==='1') body+=L(A,C,{d:1})+L(B,D,{d:1});
    if(showO&&!vuong){ P[lb[n+1]||'O']=O; if(String(o.cao||'')==='1') body+=L(S,O,{d:1})+right(O,S,B,7); body+=dot(O)+T(O[0]+4,O[1]+17,lb[n+1]||'O'); }
    body+=extra(P,o.net);
    const C0=centroid([S,...base]); Object.entries(P).forEach(([k,p])=>{ if(k!==(lb[n+1]||'O')||vuong) body+=lbl(p,k,C0); });
    return svg(290,225,body); }
  function hop(o){ const lb=labels(o.labels,"A,B,C,D,A',B',C',D'"); const P={}; const b=[[40,195],[175,195],[240,150],[105,150]]; b.forEach((p,i)=>{ P[lb[i]]=p; P[lb[i+4]]=[p[0],p[1]-(+o.cao||115)]; });
    const [A,B,C,D,A1,B1,C1,D1]=lb.map(k=>P[k]);
    let body=poly([A,B,B1,A1],{f:FILL})+L(A,B)+L(B,C)+L(C,D,{d:1})+L(D,A,{d:1})+L(A1,B1)+L(B1,C1)+L(C1,D1)+L(D1,A1)+L(A,A1)+L(B,B1)+L(C,C1)+L(D,D1,{d:1})+extra(P,o.net);
    const C0=centroid(lb.map(k=>P[k])); lb.forEach(k=>body+=lbl(P[k],k,C0)); return svg(285,225,body); }
  function langtru(o){ const lb=labels(o.labels,"A,B,C,A',B',C'"); const P={}; const b=[[40,180],[135,205],[240,165]]; b.forEach((p,i)=>{ P[lb[i]]=p; P[lb[i+3]]=[p[0],p[1]-(+o.cao||125)]; });
    const [A,B,C,A1,B1,C1]=lb.map(k=>P[k]);
    let body=poly([A,B,C],{f:FILL})+L(A,B)+L(B,C)+L(A,C,{d:1})+L(A1,B1)+L(B1,C1)+L(A1,C1)+L(A,A1)+L(B,B1)+L(C,C1)+extra(P,o.net);
    const C0=centroid(lb.map(k=>P[k])); lb.forEach(k=>body+=lbl(P[k],k,C0)); return svg(285,225,body); }
  /* ---------- HÌNH PHẲNG ---------- */
  function tamgiac(o){ const lb=labels(o.labels,'A,B,C'); const v=String(o.vuong||'').toUpperCase(); let A=[140,30],B=[35,185],C=[255,185];
    if(v===lb[1]||v==='B'){ A=[45,35]; B=[45,185]; C=[250,185]; } if(v===lb[0]||v==='A'){ A=[110,50]; B=[30,185]; C=[262,185]; const t=((A[0]-B[0])*(C[0]-B[0])+(A[1]-B[1])*(C[1]-B[1])); A=[100,62]; }
    if(v===lb[2]||v==='C'){ A=[245,35]; B=[35,185]; C=[245,185]; }
    const P={[lb[0]]:A,[lb[1]]:B,[lb[2]]:C}; const C0=centroid([A,B,C]);
    let body=poly([A,B,C],{f:FILL,c:INK,w:1.6});
    if(v===lb[1]||v==='B') body+=right(B,A,C); if(v===lb[2]||v==='C') body+=right(C,A,B);
    const side=(p,q,t)=>{ if(!t) return ''; const m=mid(p,q); return lbl(m,t,C0,13).replace('font-style="italic"','font-style="normal"'); };
    body+=side(A,B,o.ab)+side(B,C,o.bc)+side(C,A,o.ca);
    const ang=(V,P1,P2,t)=>{ if(!t) return ''; const a1=Math.atan2(P1[1]-V[1],P1[0]-V[0]), a2=Math.atan2(P2[1]-V[1],P2[0]-V[0]); const r=24; const p1=[V[0]+r*Math.cos(a1),V[1]+r*Math.sin(a1)], p2=[V[0]+r*Math.cos(a2),V[1]+r*Math.sin(a2)]; let d=a2-a1; while(d<-Math.PI) d+=2*Math.PI; while(d>Math.PI) d-=2*Math.PI;
      const am=a1+d/2; return `<path d="M${p1[0].toFixed(1)},${p1[1].toFixed(1)} A${r},${r} 0 0 ${d>0?1:0} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" fill="none" stroke="${BLUE}" stroke-width="1.3"/>`+T(V[0]+40*Math.cos(am),V[1]+40*Math.sin(am)+5,t,{i:false,s:13,c:BLUE}); };
    body+=ang(A,B,C,o.gocA)+ang(B,A,C,o.gocB)+ang(C,A,B,o.gocC);
    if(o.cao){ const V=P[o.cao]||A, others=[A,B,C].filter(p=>p!==V); const [p,q]=others; const t=((V[0]-p[0])*(q[0]-p[0])+(V[1]-p[1])*(q[1]-p[1]))/((q[0]-p[0])**2+(q[1]-p[1])**2); const H=[p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]; body+=L(V,H,{d:1})+right(H,V,q,7)+T(H[0],H[1]+18,'H'); }
    Object.entries(P).forEach(([k,p])=>body+=lbl(p,k,C0)); body+=extra(P,o.net); return svg(290,215,body); }
  function hbh(o){ const lb=labels(o.labels,'A,B,C,D,O'); const A=[30,165],B=[200,165],C=[260,55],D=[90,55]; const P={[lb[0]]:A,[lb[1]]:B,[lb[2]]:C,[lb[3]]:D};
    let body=poly([A,B,C,D],{f:FILL,c:INK,w:1.6}); if(String(o.cheo||'')==='1'){ const O=mid(A,C); P[lb[4]]=O; body+=L(A,C,{w:1.2})+L(B,D,{w:1.2})+dot(O)+T(O[0],O[1]+20,lb[4]); }
    const C0=centroid([A,B,C,D]); [0,1,2,3].forEach(i=>body+=lbl(P[lb[i]],lb[i],C0)); body+=extra(P,o.net); return svg(290,200,body); }
  function duongtron(o){ const O=[145,115], r=85; const P={O}; let body=`<circle cx="${O[0]}" cy="${O[1]}" r="${r}" fill="${FILL}" stroke="${INK}" stroke-width="1.6"/>`+dot(O)+T(O[0]+10,O[1]+16,'O');
    String(o.diem||'').split(',').map(s=>s.trim()).filter(Boolean).forEach(s=>{ const [n,deg]=s.split(':'); const a=-num(deg)*Math.PI/180; const p=[O[0]+r*Math.cos(a),O[1]+r*Math.sin(a)]; P[n]=p; body+=dot(p)+lbl(p,n,O,14); });
    if(o.bk) body+=L(O,[O[0]+r,O[1]],{d:1})+T(O[0]+r/2,O[1]-6,o.bk,{s:13}); body+=extra(P,o.net); return svg(290,235,body); }
  function oxyz(o){ const pts=[]; String(o.diem||o.pts||'').replace(/([A-Za-z]'?)\s*\(\s*(-?[\d.,]+)\s*;\s*(-?[\d.,]+)\s*;\s*(-?[\d.,]+)\s*\)/g,(m,n,x,y,z)=>{ pts.push({n,x:num(x),y:num(y),z:num(z)}); return m; });
    const mx=Math.max(2,...pts.flatMap(p=>[Math.abs(p.x),Math.abs(p.y),Math.abs(p.z)])); const u=95/mx, O=[120,150];
    const pr=(x,y,z)=>[O[0]+y*u-x*u*.55,O[1]-z*u+x*u*.45];
    let body=arrow(O,pr(mx*1.25,0,0))+arrow(O,pr(0,mx*1.3,0))+arrow(O,pr(0,0,mx*1.25))+T(...pr(mx*1.3,0,0).map((v,i)=>v+(i?14:-6)),'x')+T(...pr(0,mx*1.38,0).map((v,i)=>v+(i?14:0)),'y')+T(...pr(0,0,mx*1.33).map((v,i)=>v+(i?0:10)),'z')+T(O[0]-10,O[1]+16,'O');
    const P={}; pts.forEach(p=>{ const s=pr(p.x,p.y,p.z); P[p.n]=s; if(String(o.chieu||'')==='1'&&p.z){ const f=pr(p.x,p.y,0); body+=L(s,f,{d:1,w:1})+(p.x&&p.y?L(f,pr(p.x,0,0),{d:1,w:1})+L(f,pr(0,p.y,0),{d:1,w:1}):''); } });
    if(String(o.tri||'')==='1'&&pts.length>=3) body+=poly(pts.map(p=>P[p.n]),{f:'rgba(37,99,235,.12)',c:BLUE,w:1.6});
    body+=extra(P,o.net); pts.forEach(p=>{ body+=dot(P[p.n],RED)+T(P[p.n][0]+9,P[p.n][1]-7,p.n,{c:RED}); });
    return svg(300,250,body); }
  /* ---------- ĐỒ THỊ HÀM SỐ ---------- */
  function dothi(o){ const W=+o.w||300, H=+o.h||230, pad=26;
    const [x0,x1]=String(o.x||'-4:4').split(':').map(num), [y0,y1]=String(o.y||'-3:5').split(':').map(num);
    const X=x=>pad+(x-x0)/(x1-x0)*(W-2*pad), Y=y=>H-pad-(y-y0)/(y1-y0)*(H-2*pad);
    let body=`<defs><clipPath id="cp${(Math.random()*1e6)|0}"><rect x="${pad}" y="${pad-4}" width="${W-2*pad}" height="${H-2*pad+8}"/></clipPath></defs>`; const cpid=body.match(/id="(cp\d+)"/)[1];
    const span=Math.max(x1-x0,y1-y0); const st=span>24?5:span>12?2:1;
    if(String(o.luoi||'1')==='1'){ for(let x=Math.ceil(x0/st)*st;x<=x1;x+=st) body+=L([X(x),Y(y0)],[X(x),Y(y1)],{c:'#e2e8f0',w:.8}); for(let y=Math.ceil(y0/st)*st;y<=y1;y+=st) body+=L([X(x0),Y(y)],[X(x1),Y(y)],{c:'#e2e8f0',w:.8}); }
    const ax=Math.min(Math.max(0,y0),y1), ay=Math.min(Math.max(0,x0),x1);
    body+=arrow([X(x0)-6,Y(ax)],[X(x1)+12,Y(ax)],{w:1.2})+arrow([X(ay),Y(y0)+6],[X(ay),Y(y1)-12],{w:1.2});
    body+=T(X(x1)+12,Y(ax)+16,o.xl||'x',{s:14})+T(X(ay)+12,Y(y1)-8,o.yl||'y',{s:14,a:'start'})+T(X(ay)-9,Y(ax)+15,'O',{s:13});
    for(let x=Math.ceil(x0/st)*st;x<=x1;x+=st) if(Math.abs(x)>1e-9) body+=L([X(x),Y(ax)-3],[X(x),Y(ax)+3],{w:1})+T(X(x),Y(ax)+15,fmt(x),{i:false,s:11,c:'#475569'});
    for(let y=Math.ceil(y0/st)*st;y<=y1;y+=st) if(Math.abs(y)>1e-9) body+=L([X(ay)-3,Y(y)],[X(ay)+3,Y(y)],{w:1})+T(X(ay)-6,Y(y)+4,fmt(y),{i:false,s:11,c:'#475569',a:'end'});
    String(o.tcd||'').split(',').filter(s=>s.trim()!=='').forEach(v=>{ body+=L([X(num(v)),Y(y0)],[X(num(v)),Y(y1)],{d:1,c:RED,w:1.1}); });
    String(o.tcn||'').split(',').filter(s=>s.trim()!=='').forEach(v=>{ body+=L([X(x0),Y(num(v))],[X(x1),Y(num(v))],{d:1,c:RED,w:1.1}); });
    const cols=[BLUE,'#059669','#d97706'];
    String(o.f||'x').split('|').forEach((fe,k)=>{ let fn; try{ fn=compile(fe); }catch(e){ return; } let d='', pen=false, prev=null; const N=500;
      for(let i=0;i<=N;i++){ const x=x0+(x1-x0)*i/N; let y; try{ y=fn(x); }catch(e){ y=NaN; }
        if(!isFinite(y)||Math.abs(y-(prev??y))>(y1-y0)*1.5){ pen=false; prev=isFinite(y)?y:null; if(!isFinite(y)) continue; }
        const yy=Math.max(y0-(y1-y0),Math.min(y1+(y1-y0),y)); d+=(pen?'L':'M')+X(x).toFixed(1)+','+Y(yy).toFixed(1); pen=true; prev=y; }
      body+=`<path d="${d}" fill="none" stroke="${cols[k%3]}" stroke-width="2.2" clip-path="url(#${cpid})"/>`; });
    String(o.diem||'').split(',').map(s=>s.trim()).filter(Boolean).forEach(s=>{ const [a,b]=s.split(';').map(num); if(!isFinite(a)||!isFinite(b)) return; body+=L([X(a),Y(b)],[X(a),Y(ax)],{d:1,w:1,c:'#64748b'})+L([X(a),Y(b)],[X(ay),Y(b)],{d:1,w:1,c:'#64748b'})+dot([X(a),Y(b)],RED)+(Math.abs(b)>1e-9&&!(Math.abs(b-Math.round(b/st)*st)<1e-9)?T(X(ay)-6,Y(b)+4,fmt(b),{i:false,s:11,c:RED,a:'end'}):'')+(Math.abs(a-Math.round(a/st)*st)>1e-9?T(X(a),Y(ax)+15,fmt(a),{i:false,s:11,c:RED}):''); });
    if(o.ten) body+=T(W/2,16,o.ten,{s:13,i:false,b:1});
    return svg(W,H,body); }
  /* ---------- XÁC SUẤT ---------- */
  function cay(o){ const pa=num(o.pa??.5), pba=num(o.pba??.5), pbna=num(o.pbna??.5); const la=o.la||'A', lb=o.lb||'B';
    const bar=s=>s.length===1?s+'̅':'không '+s; const R=[20,130], A=[120,65], NA=[120,195];
    const leaf=[[230,30],[230,100],[230,160],[230,230]];
    let body=L(R,A)+L(R,NA)+L(A,leaf[0])+L(A,leaf[1])+L(NA,leaf[2])+L(NA,leaf[3])+dot(R);
    const node=(p,t)=>`<circle cx="${p[0]}" cy="${p[1]}" r="15" fill="#eef2ff" stroke="${BLUE}" stroke-width="1.2"/>`+T(p[0],p[1]+5,t,{s:14});
    const pl=(p,q,t,up)=>{ const m=mid(p,q); return T(m[0]-(up?6:6),m[1]+(up?-7:16),t,{i:false,s:13,c:RED}); };
    body+=pl(R,A,fmt(pa),1)+pl(R,NA,fmt(1-pa),0)+pl(A,leaf[0],fmt(pba),1)+pl(A,leaf[1],fmt(1-pba),0)+pl(NA,leaf[2],fmt(pbna),1)+pl(NA,leaf[3],fmt(1-pbna),0);
    body+=node(A,la)+node(NA,bar(la))+node(leaf[0],lb)+node(leaf[1],bar(lb))+node(leaf[2],lb)+node(leaf[3],bar(lb));
    if(String(o.tich||'')==='1'){ const pr=[pa*pba,pa*(1-pba),(1-pa)*pbna,(1-pa)*(1-pbna)]; leaf.forEach((p,i)=>body+=T(p[0]+24,p[1]+5,fmt(Math.round(pr[i]*10000)/10000),{a:'start',i:false,s:12,c:'#475569'})); }
    return svg(String(o.tich||'')==='1'?300:260,260,body); }
  function hopbi(o){ const cols=[['do','#ef4444','đỏ'],['xanh','#3b82f6','xanh'],['vang','#eab308','vàng'],['trang','#f8fafc','trắng'],['den','#1f2937','đen']]; const balls=[]; cols.forEach(([k,c])=>{ for(let i=0;i<(+o[k]||0);i++) balls.push(c); });
    const per=Math.min(6,Math.max(3,Math.ceil(Math.sqrt(balls.length*1.6)))); const rows=Math.ceil(balls.length/per)||1; const W=per*34+60, H=rows*34+70;
    let body=`<path d="M20,30 L20,${H-20} Q20,${H-10} 30,${H-10} L${W-30},${H-10} Q${W-20},${H-10} ${W-20},${H-20} L${W-20},30" fill="#f8fafc" stroke="${INK}" stroke-width="1.8"/>`;
    balls.forEach((c,i)=>{ const r=Math.floor(i/per), k=i%per; const cx=40+k*34, cy=H-30-r*34; body+=`<circle cx="${cx}" cy="${cy}" r="13" fill="${c}" stroke="#334155" stroke-width="1"/><circle cx="${cx-4}" cy="${cy-4}" r="3.5" fill="rgba(255,255,255,.6)"/>`; });
    const leg=cols.filter(([k])=>+o[k]).map(([k,,n])=>`${o[k]} ${n}`).join(', '); body+=T(W/2,20,leg,{i:false,s:13});
    return svg(Math.max(W,200),H,body); }
  function xucxac(o){ const faces=String(o.mat||'3,5').split(',').map(x=>+x||1); const pip={1:[[2,2]],2:[[1,1],[3,3]],3:[[1,1],[2,2],[3,3]],4:[[1,1],[1,3],[3,1],[3,3]],5:[[1,1],[1,3],[2,2],[3,1],[3,3]],6:[[1,1],[1,2],[1,3],[3,1],[3,2],[3,3]]};
    let body=''; faces.forEach((f,i)=>{ const x=20+i*90; body+=`<rect x="${x}" y="20" width="70" height="70" rx="12" fill="#fff" stroke="${INK}" stroke-width="2"/>`+pip[f].map(([r,c])=>`<circle cx="${x+c*17.5}" cy="${20+r*17.5}" r="6" fill="${f===1?RED:INK}"/>`).join(''); });
    return svg(faces.length*90+20,110,body); }
  /* ---------- THỐNG KÊ ---------- */
  function bieudo(o){ const data=String(o.data||'').split('|').map(num), nh=String(o.nhan||'').split('|'); const d2=o.data2?String(o.data2).split('|').map(num):null;
    const W=Math.max(300,data.length*60+80), H=240, pl=50, pb=40, pt=30; const mx=Math.max(...data,...(d2||[]))*1.15||1; const Y=v=>H-pb-(v/mx)*(H-pb-pt); const bw=(W-pl-20)/data.length;
    let body=L([pl,H-pb],[W-10,H-pb])+L([pl,pt-8],[pl,H-pb]);
    for(let i=0;i<=4;i++){ const v=mx/1.15*i/4; body+=L([pl-3,Y(v)],[W-10,Y(v)],{c:'#e2e8f0',w:.8})+T(pl-6,Y(v)+4,fmt(Math.round(v*10)/10),{a:'end',i:false,s:11,c:'#475569'}); }
    const line=(arr,c)=>{ const pts=arr.map((v,i)=>[pl+bw*(i+.5),Y(v)]); return `<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="2.2"/>`+pts.map((p,i)=>dot(p,c)+T(p[0],p[1]-9,fmt(arr[i]),{i:false,s:11.5,c})).join(''); };
    if((o.loai||'cot')==='duong') body+=line(data,BLUE); else data.forEach((v,i)=>{ const x=pl+bw*i+bw*.2; body+=`<rect x="${x.toFixed(1)}" y="${Y(v).toFixed(1)}" width="${(bw*.6).toFixed(1)}" height="${(H-pb-Y(v)).toFixed(1)}" fill="#6366f1" rx="2"/>`+T(x+bw*.3,Y(v)-5,fmt(v),{i:false,s:11.5}); });
    if(d2) body+=line(d2,RED);
    nh.forEach((t,i)=>body+=T(pl+bw*(i+.5),H-pb+16,t,{i:false,s:12}));
    body+=T(pl-4,pt-14,o.donvi||'',{a:'start',i:false,s:12})+(o.ten?T(W/2,H-6,o.ten,{i:false,s:12.5,b:1}):'');
    if(o.chu) body+=T(W-12,pt-14,o.chu,{a:'end',i:false,s:11.5,c:'#475569'});
    return svg(W,H,body); }
  function tansuat(o){ const k=String(o.khoang||'0|10|20|30|40').split('|').map(num), ts=String(o.ts||'').split('|').map(num); const W=320,H=240,pl=40,pb=40,pt=26; const mx=Math.max(...ts)*1.18||1;
    const X=v=>pl+(v-k[0])/(k[k.length-1]-k[0])*(W-pl-20), Y=v=>H-pb-(v/mx)*(H-pb-pt);
    let body=L([pl,H-pb],[W-8,H-pb])+L([pl,pt-6],[pl,H-pb]);
    ts.forEach((v,i)=>{ body+=`<rect x="${X(k[i]).toFixed(1)}" y="${Y(v).toFixed(1)}" width="${(X(k[i+1])-X(k[i])).toFixed(1)}" height="${(H-pb-Y(v)).toFixed(1)}" fill="#a5b4fc" stroke="#4338ca" stroke-width="1.2"/>`+T((X(k[i])+X(k[i+1]))/2,Y(v)-5,fmt(v),{i:false,s:12}); });
    k.forEach(v=>body+=T(X(v),H-pb+15,fmt(v),{i:false,s:11.5}));
    body+=T(W-8,H-6,o.xl||'',{a:'end',i:false,s:12})+T(pl+4,pt-10,o.yl||'Tần số',{a:'start',i:false,s:12});
    return svg(W,H,body); }
  /* ---------- MINH HOẠ THỰC TIỄN ---------- */
  function hopcat(o){ const s=150, x0=20, y0=25, c=30; let body=`<rect x="${x0}" y="${y0}" width="${s}" height="${s}" fill="#fef3c7" stroke="${INK}" stroke-width="1.6"/>`;
    [[x0,y0],[x0+s-c,y0],[x0,y0+s-c],[x0+s-c,y0+s-c]].forEach(([x,y])=>body+=`<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="#fff" stroke="${RED}" stroke-dasharray="4 3"/>`);
    body+=L([x0+c,y0+c],[x0+s-c,y0+c],{d:1,w:1})+L([x0+c,y0+s-c],[x0+s-c,y0+s-c],{d:1,w:1})+L([x0+c,y0+c],[x0+c,y0+s-c],{d:1,w:1})+L([x0+s-c,y0+c],[x0+s-c,y0+s-c],{d:1,w:1});
    body+=T(x0+s/2,y0+s+18,o.canh||'a',{i:false})+T(x0+c/2,y0+c/2+5,'x',{c:RED})+arrow([x0+s+18,y0+s/2+10],[x0+s+38,y0+s/2+10]);
    const bx=215,by=120; body+=poly([[bx,by],[bx+60,by],[bx+80,by-18],[bx+20,by-18]],{f:'#fde68a',c:INK})+poly([[bx,by],[bx+60,by],[bx+60,by+35],[bx,by+35]],{f:'#fef3c7',c:INK})+poly([[bx+60,by],[bx+80,by-18],[bx+80,by+17],[bx+60,by+35]],{f:'#fcd34d',c:INK});
    body+=T(bx+40,by+56,'hộp không nắp',{i:false,s:12}); return svg(310,205,body); }
  function thang(o){ const G=[30,190], top=[60,40], foot=[200,190]; let body=`<rect x="20" y="20" width="40" height="170" fill="#e5e7eb" stroke="${INK}"/>`+L([10,190],[290,190],{w:2})+`<line x1="${top[0]}" y1="${top[1]}" x2="${foot[0]}" y2="${foot[1]}" stroke="#b45309" stroke-width="6" stroke-linecap="round"/>`;
    for(let i=1;i<6;i++){ const t=i/6; const p=[top[0]+(foot[0]-top[0])*t,top[1]+(foot[1]-top[1])*t]; body+=`<circle cx="${p[0]}" cy="${p[1]}" r="2" fill="#78350f"/>`; }
    body+=right([60,190],[60,40],[200,190],10)+T(150,105,o.dai||'thang',{i:false,s:13})+T(130,208,o.chan||'',{i:false,s:13})+T(80,120,o.cao||'',{i:false,s:13,a:'start'});
    if(o.goc) body+=T(178,182,o.goc,{i:false,s:12,c:BLUE}); return svg(300,215,body); }
  function tru(o){ const cx=140, rx=70, ry=18, t=45, b=185; let body=`<path d="M${cx-rx},${t} L${cx-rx},${b} A${rx},${ry} 0 0 0 ${cx+rx},${b} L${cx+rx},${t}" fill="#dbeafe" stroke="${INK}" stroke-width="1.6"/>`+`<ellipse cx="${cx}" cy="${t}" rx="${rx}" ry="${ry}" fill="#bfdbfe" stroke="${INK}" stroke-width="1.6"/>`+`<path d="M${cx-rx},${b} A${rx},${ry} 0 0 1 ${cx+rx},${b}" fill="none" stroke="${INK}" stroke-dasharray="5 4"/>`;
    body+=L([cx,b],[cx+rx,b],{d:1,c:RED})+dot([cx,b])+T(cx+rx/2,b-6,o.r||'r',{s:14,c:RED})+L([cx+rx+14,t],[cx+rx+14,b],{w:1})+T(cx+rx+28,(t+b)/2,o.h||'h',{s:14}); return svg(280,220,body); }
  function non(o){ const cx=140, rx=75, ry=18, b=185, S=[cx,30]; let body=`<path d="M${cx-rx},${b} L${S[0]},${S[1]} L${cx+rx},${b} A${rx},${ry} 0 0 1 ${cx-rx},${b}" fill="#dcfce7" stroke="${INK}" stroke-width="1.6"/>`+`<path d="M${cx-rx},${b} A${rx},${ry} 0 0 1 ${cx+rx},${b}" fill="none" stroke="${INK}" stroke-dasharray="5 4"/>`;
    body+=L(S,[cx,b],{d:1})+L([cx,b],[cx+rx,b],{d:1,c:RED})+right([cx,b],S,[cx+rx,b],8)+T(cx+rx/2,b+16,o.r||'r',{c:RED})+T(cx-12,110,o.h||'h')+T(cx+rx/2+18,105,o.l||'l'); return svg(280,215,body); }
  function matcau(o){ const c=[140,115], r=85; let body=`<circle cx="${c[0]}" cy="${c[1]}" r="${r}" fill="#ede9fe" stroke="${INK}" stroke-width="1.6"/><path d="M${c[0]-r},${c[1]} A${r},22 0 0 0 ${c[0]+r},${c[1]}" fill="none" stroke="${INK}"/><path d="M${c[0]-r},${c[1]} A${r},22 0 0 1 ${c[0]+r},${c[1]}" fill="none" stroke="${INK}" stroke-dasharray="5 4"/>`+dot(c)+L(c,[c[0]+r*.7,c[1]-r*.71],{c:RED})+T(c[0]+r*.42,c[1]-r*.3,o.r||'R',{c:RED})+T(c[0]-10,c[1]+18,'O'); return svg(280,235,body); }
  function cong(o){ const W=300,H=220,g=190,w=200,h=140,x0=50; let d=''; for(let i=0;i<=60;i++){ const t=i/60, x=x0+w*t, y=g-h*(1-(2*t-1)**2); d+=(i?'L':'M')+x.toFixed(1)+','+y.toFixed(1); }
    let body=`<rect x="0" y="${g}" width="${W}" height="${H-g}" fill="#e2e8f0"/><path d="${d} Z" fill="#fde68a" stroke="#92400e" stroke-width="2"/>`+L([10,g],[W-10,g],{w:2});
    body+=arrow([x0+w/2,g],[x0+w/2,g-h],{c:RED,w:1.2})+arrow([x0+w/2,g-h],[x0+w/2,g],{c:RED,w:1.2})+T(x0+w/2+8,g-h/2,o.cao||'h',{a:'start',i:false,s:13,c:RED})+arrow([x0,g+16],[x0+w,g+16],{c:BLUE,w:1.2})+arrow([x0+w,g+16],[x0,g+16],{c:BLUE,w:1.2})+T(x0+w/2,g+30,o.rong||'d',{i:false,s:13,c:BLUE});
    return svg(W,H+20,body); }
  function cotden(o){ const g=190; let body=L([10,g],[290,g],{w:2})+`<rect x="34" y="30" width="8" height="${g-30}" fill="#475569"/><circle cx="38" cy="28" r="9" fill="#fde047" stroke="${INK}"/>`;
    const px=150, ph=60; body+=`<line x1="${px}" y1="${g}" x2="${px}" y2="${g-ph}" stroke="#0f766e" stroke-width="5" stroke-linecap="round"/><circle cx="${px}" cy="${g-ph-8}" r="8" fill="#0f766e"/>`+L([38,28],[250,g],{d:1,c:'#ca8a04'})+`<rect x="${px}" y="${g-3}" width="${250-px}" height="6" fill="#64748b"/>`;
    body+=T(16,110,o.cot||'',{i:false,s:13,a:'start'})+T(px+10,g-ph/2,o.nguoi||'',{i:false,s:13,a:'start'})+T((px+250)/2,g+18,o.bong||'',{i:false,s:13})+T((38+px)/2,g+18,o.kc||'',{i:false,s:13}); return svg(300,215,body); }
  function mach(o){ const R=String(o.r||'R1,R2').split(','); const ss=o.kieu==='song'; let body=`<rect x="30" y="40" width="240" height="130" fill="none" stroke="${INK}" stroke-width="1.8"/>`+L([135,170],[135,160],{w:1})+`<line x1="125" y1="160" x2="125" y2="180" stroke="${INK}" stroke-width="2.5"/><line x1="145" y1="165" x2="145" y2="175" stroke="${INK}" stroke-width="4"/><rect x="126" y="166" width="18" height="8" fill="#fff"/>`+T(150,198,o.nguon||'E',{});
    if(!ss) R.forEach((r,i)=>{ const x=70+i*(160/R.length); body+=`<rect x="${x}" y="32" width="46" height="16" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`+T(x+23,25,r.trim()); });
    else { body+=L([90,40],[90,105])+L([210,40],[210,105]); R.forEach((r,i)=>{ const y=80+i*45; body+=L([90,y],[210,y])+`<rect x="127" y="${y-8}" width="46" height="16" fill="#fff" stroke="${INK}" stroke-width="1.6"/>`+T(150,y-12,r.trim()); }); }
    return svg(300,210,body); }

  const KINDS={chop,hop,langtru,tamgiac,hbh,duongtron,oxyz,dothi,cay,hopbi,xucxac,bieudo,tansuat,hopcat,thang,tru,non,matcau,cong,cotden,mach};
  function parse(spec){ const s=String(spec||'').trim(); const m=s.match(/^@(\w+)\s*([\s\S]*)$/); if(!m) return null; const o={};
    m[2].split(/;(?=\s*[a-zA-Z]\w*\s*=)/).map(x=>x.trim()).filter(Boolean).forEach(kv=>{ const i=kv.indexOf('='); if(i>0) o[kv.slice(0,i).trim()]=kv.slice(i+1).trim().replace(/^"|"$/g,''); }); return {kind:m[1],o}; }
  function render(spec){ const s=String(spec||'').trim(); if(!s) return ''; if(/^<svg[\s>]/i.test(s)) return s.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/\son\w+="[^"]*"/gi,'').replace(/^<svg(?![^>]*class=)/i,'<svg class="qfig-svg"');
    const p=parse(s); if(!p||!KINDS[p.kind]) return `<div class="note">Không nhận dạng được hình “${esc2(s.slice(0,40))}”</div>`;
    try{ return KINDS[p.kind](p.o); }catch(e){ return `<div class="note">Lỗi vẽ hình: ${esc2(e.message)}</div>`; } }
  const PRESETS=[
    ['Hình chóp tứ giác, SA ⊥ đáy','@chop base=4; vuong=1'],['Hình chóp tứ giác đều + đường cao','@chop base=4; cao=1; cheo=1'],['Hình chóp tam giác, SA ⊥ đáy','@chop base=3; vuong=1'],['Hình hộp / lập phương',"@hop"],['Lăng trụ tam giác','@langtru'],
    ['Tam giác + cạnh + góc','@tamgiac ab=5; ca=7; gocA=60°'],['Tam giác vuông tại B','@tamgiac vuong=B; ab=3; bc=4'],['Hình bình hành + đường chéo','@hbh cheo=1'],['Đường tròn + điểm','@duongtron diem=A:200,B:340,C:80; net=AB,BC,CA'],
    ['Hệ trục Oxyz + điểm','@oxyz diem=A(2;0;0),B(0;3;0),C(0;0;2); tri=1'],['Đồ thị hàm số','@dothi f=x^3-3*x+1; x=-3:3; y=-3:4'],['Đồ thị có tiệm cận','@dothi f=(2*x+1)/(x-1); x=-4:5; y=-4:6; tcd=1; tcn=2'],['Đồ thị v(t)','@dothi f=-4*x+20; x=0:6; y=0:22; xl=t (s); yl=v (m/s)'],
    ['Sơ đồ cây xác suất','@cay pa=0,6; pba=0,7; pbna=0,2; tich=1'],['Hộp bi màu','@hopbi do=4; xanh=3'],['Xúc xắc','@xucxac mat=3,5'],['Biểu đồ cột','@bieudo data=40|45,1|42,8; nhan=2010|2015|2020; donvi=triệu tấn'],['Biểu đồ đường','@bieudo loai=duong; data=12|15|19|24; nhan=2019|2020|2021|2022; donvi=%'],
    ['Biểu đồ tần số ghép nhóm','@tansuat khoang=0|20|40|60|80; ts=5|8|12|7; xl=phút'],['Cắt góc tấm bìa làm hộp','@hopcat canh=30 cm'],['Thang dựa tường','@thang dai=5 m; chan=3 m'],['Hình trụ (bồn nước)','@tru r=r; h=h'],['Hình nón','@non r=r; h=h; l=l'],['Mặt cầu','@matcau r=R'],
    ['Cổng parabol','@cong rong=8 m; cao=6 m'],['Cột đèn – bóng người','@cotden cot=h; nguoi=1,6 m; bong=2 m; kc=4 m'],['Mạch điện nối tiếp','@mach r=R1,R2; kieu=noi'],['Mạch điện song song','@mach r=R1,R2; kieu=song']];
  return {render,parse,PRESETS,KINDS:Object.keys(KINDS)};
})();
function figHtml(q,cls='qfig'){ return q&&q.figure&&String(q.figure).trim()?`<div class="${cls}">${Fig.render(q.figure)}</div>`:''; }
