/* LMS LKT – templates.js: thư viện MẪU SINH CÂU (câu tham số có hình) + Xưởng sinh câu hàng loạt */
'use strict';
const TEMPLATES = (()=>{ const T=[]; let n=0;
  const add=(s,g,t,l,type,c,x)=>T.push({id:'tpl-'+(++n),tpl:true,subject:s,grade:g,topic:t,level:l,type,content:c,explain:x.ex||'',params:x.p||'',cond:x.cond||'',figure:x.fig||'',...x.more});
  const mc=(s,g,t,l,c,o,a,x={})=>add(s,g,t,l,'mcq',c,{...x,more:{options:o,answer:a}});
  const sa=(s,g,t,l,c,a,x={})=>add(s,g,t,l,'short',c,{...x,more:{answer:a}});
  const tf=(s,g,t,l,c,st,a,x={})=>add(s,g,t,l,'tf',c,{...x,more:{statements:st,answer:[...a].map(v=>v==='Đ')}});
  const T1='Ứng dụng đạo hàm để khảo sát hàm số',T2='Nguyên hàm và tích phân',T3='Vectơ và toạ độ trong không gian',T4='Phương pháp toạ độ trong không gian',T5='Thống kê mẫu số liệu ghép nhóm',T6='Xác suất có điều kiện';
  /* ---- Toán 12 ---- */
  mc('toan',12,T1,'TH','Cho hàm số $y=f(x)$ có đồ thị như hình vẽ. Giá trị cực đại của hàm số bằng',['${=2+c}$','${=c-2}$','$-1$','$1$'],0,{p:'c=[0,1,2]',fig:'@dothi f=x^3-3*x+{c}; x=-3:3; y=-3:6; diem=-1;{=2+c},1;{=c-2}'});
  mc('toan',12,T1,'NB','Cho hàm số $y=f(x)$ có đồ thị như hình vẽ. Số điểm cực trị của hàm số là',['$3$','$2$','$1$','$4$'],0,{p:'c=[-1,0,1,2]',fig:'@dothi f=x^4-2*x^2+{c}; x=-2.5:2.5; y=-3:5'});
  mc('toan',12,T1,'NB','Cho hàm số $y=\\dfrac{{a}x+{b}}{x-{c}}$ có đồ thị như hình. Tiệm cận đứng của đồ thị là',['$x={c}$','$y={a}$','$x=-{c}$','$y={c}$'],0,{p:'a=[1,2]; b=[1,3]; c=[1,2]',cond:'a!=c',fig:'@dothi f=({a}*x+{b})/(x-{c}); x=-4:6; y=-4:7; tcd={c}; tcn={a}'});
  sa('toan',12,T1,'VD','Cho hàm số $y=x^3-3x$ có đồ thị như hình. Phương trình $x^3-3x={m}$ có bao nhiêu nghiệm thực?','{=(m>-2&&m<2)?3:((m==2||m==-2)?2:1)}',{p:'m=[-3,-2,-1,0,1,2,3]',fig:'@dothi f=x^3-3*x|{m}; x=-3:3; y=-4:4'});
  sa('toan',12,T2,'TH','Tính diện tích hình phẳng (phần tô) giới hạn bởi $y=x^2$, trục hoành, $x=0$ và $x={a}$.','{=a^3/3}',{p:'a=[3,6]',fig:'@dothi f=x^2; x=-1:{=a+1}; y=-1:{=a*a+2}; diem={a};{=a*a}'});
  sa('toan',12,T2,'VD','Một vật chuyển động với vận tốc $v(t)={=2*k}t$ (m/s). Tính quãng đường vật đi được trong ${n}$ giây đầu.','{=k*n*n}',{p:'k=1..4; n=[3,4,5]',fig:'@dothi f={=2*k}*x; x=0:{=n+1}; y=0:{=2*k*(n+1)}; xl=t; yl=v; diem={n};{=2*k*n}'});
  sa('toan',12,T3,'TH','Trong không gian $Oxyz$, cho $A(1;1;1)$ và $B({=1+2*k};{=1+3*k};{=1+6*k})$. Tính độ dài đoạn $AB$.','{=7*k}',{p:'k=1..3',fig:'@oxyz diem=A(1;1;1),B({=1+2*k};{=1+3*k};{=1+6*k}); net=AB'});
  sa('toan',12,T4,'VD','Trong không gian $Oxyz$, cho $A({a};0;0)$, $B(0;{b};0)$, $C(0;0;{c})$. Tính thể tích tứ diện $OABC$.','{=a*b*c/6}',{p:'a=[2,3,6]; b=[1,2,3]; c=[1,2,3]',cond:'(a*b*c)%6==0',fig:'@oxyz diem=A({a};0;0),B(0;{b};0),C(0;0;{c}); tri=1'});
  sa('toan',12,T5,'VD','Cho biểu đồ tần số thời gian chạy bộ (phút) như hình. Tính số trung bình (làm tròn hàng phần mười).','{=round((15*a+25*b+35*c+45*d)/(a+b+c+d),1)}',{p:'a=2..6; b=5..10; c=8..14; d=2..7',fig:'@tansuat khoang=10|20|30|40|50; ts={a}|{b}|{c}|{d}; xl=phút'});
  mc('toan',12,T5,'NB','Cho biểu đồ tần số như hình. Nhóm chứa mốt của mẫu số liệu là',['$[30;40)$','$[10;20)$','$[20;30)$','$[40;50)$'],0,{p:'a=2..6; b=5..9; d=2..7',fig:'@tansuat khoang=10|20|30|40|50; ts={a}|{b}|12|{d}'});
  sa('toan',12,T6,'VD','Một trường có tỉ lệ học sinh nữ là $0{,}{a}$. Tỉ lệ học sinh nữ thích Toán là $0{,}{b}$, học sinh nam thích Toán là $0{,}{c}$ (sơ đồ cây như hình, $N$: nữ, $T$: thích Toán). Chọn ngẫu nhiên một học sinh. Tính xác suất học sinh đó thích Toán (làm tròn hàng phần trăm).','{=round(a/10*b/10+(1-a/10)*c/10,2)}',{p:'a=4..6; b=3..7; c=4..8',fig:'@cay pa=0,{a}; pba=0,{b}; pbna=0,{c}; la=N; lb=T'});
  tf('toan',12,T6,'VD','Gieo hai con xúc xắc cân đối (như hình). Gọi $A$: "tổng số chấm bằng ${s}$", $B$: "con thứ nhất ra mặt 6 chấm".',['$P(B)=\\dfrac16$.','$n(\\Omega)=36$.','$P(A)=\\dfrac{{=[0,0,1,2,3,4,5,6,5,4,3,2,1][s]}}{36}$.','$A$ và $B$ là hai biến cố xung khắc.'],'ĐĐĐS',{p:'s=[7,8,9,10]',fig:'@xucxac mat=6,{=s-6}'});
  /* ---- Toán 11 ---- */
  sa('toan',11,'Quan hệ vuông góc','VD','Cho hình chóp $S.ABC$ có $SA\\perp(ABC)$, tam giác $ABC$ vuông tại $B$, $AB={a}$, $BC={b}$, $SA={h}$. Tính thể tích khối chóp.','{=a*b*h/6}',{p:'a=[2,3,4]; b=[3,6]; h=[2,4,6]',cond:'(a*b*h)%6==0',fig:'@chop base=3; vuong=1'});
  sa('toan',11,'Quan hệ vuông góc','TH','Cho lăng trụ đứng có đáy là tam giác vuông với hai cạnh góc vuông ${a}$ và ${b}$, chiều cao ${h}$. Tính thể tích khối lăng trụ.','{=a*b*h/2}',{p:'a=[2,3,4]; b=[2,4,6]; h=[3,5]',fig:'@langtru'});
  sa('toan',11,'Quan hệ vuông góc','TH','Hình hộp chữ nhật có ba kích thước ${=k}$, ${=2*k}$, ${=2*k}$. Tính độ dài đường chéo của hình hộp.','{=3*k}',{p:'k=1..5',fig:"@hop; net=AC':d"});
  sa('toan',11,'Dãy số, cấp số cộng, cấp số nhân','VD','Một quần thể vi khuẩn ban đầu có ${=100*a}$ con, cứ sau mỗi giờ số lượng tăng gấp đôi. Sau ${n}$ giờ có bao nhiêu con?','{=100*a*2^n}',{p:'a=1..5; n=3..6'});
  sa('toan',11,'Hàm số mũ và hàm số lôgarit','VD','Theo đồ thị (dân số tăng theo hàm mũ $P(t)={a}\\cdot{=1+r/100}^t$ triệu người), tính dân số sau 10 năm (triệu người, làm tròn hàng phần mười).','{=round(a*(1+r/100)^10,1)}',{p:'a=[80,90,100]; r=[1,2]',fig:'@dothi f={a}*{=1+r/100}^x; x=0:12; y=0:{=round(a*1.3)}; xl=t; yl=P'});
  /* ---- Toán 10 ---- */
  sa('toan',10,'Hệ thức lượng trong tam giác','VD','Một chiếc thang dài ${=5*k}$ m dựa vào tường thẳng đứng, chân thang cách tường ${=3*k}$ m (như hình). Đầu thang cách mặt đất bao nhiêu mét?','{=4*k}',{p:'k=1..2',fig:'@thang dai={=5*k} m; chan={=3*k} m; cao=?'});
  sa('toan',10,'Hệ thức lượng trong tam giác','VD','Một người cao $1{,}6$ m đứng cách cột đèn ${d}$ m thì bóng của người trên mặt đất dài $2$ m (như hình). Tính chiều cao cột đèn (m).','{=0.8*(d+2)}',{p:'d=[3,4,5,6,8]',fig:'@cotden cot=h; nguoi=1,6 m; bong=2 m; kc={d} m'});
  sa('toan',10,'Hệ thức lượng trong tam giác','TH','Cho tam giác $ABC$ có $AB={=3*k}$, $AC={=5*k}$, $\\widehat{A}=120^\\circ$ (như hình). Tính độ dài $BC$.','{=7*k}',{p:'k=1..4',fig:'@tamgiac ab={=3*k}; ca={=5*k}; gocA=120°'});
  sa('toan',10,'Hàm số bậc hai và đồ thị','VD','Một chiếc cổng hình parabol có chiều rộng chân cổng ${=2*a}$ m và chiều cao ${h}$ m (như hình). Tính chiều cao của cổng tại điểm cách tâm cổng $1$ m (làm tròn hàng phần mười).','{=round(h*(1-1/(a*a)),1)}',{p:'a=[3,4,5]; h=[4,6,8]',fig:'@cong rong={=2*a} m; cao={h} m'});
  /* ---- Thực tiễn hình khối ---- */
  sa('toan',12,T2,'VD','Một bồn nước hình trụ có bán kính đáy ${r}$ m và chiều cao ${h}$ m (như hình). Tính thể tích bồn (m³, làm tròn hàng phần mười).','{=round(pi*r*r*h,1)}',{p:'r=[0.5,0.6,0.8,1]; h=[1.2,1.5,2]',fig:'@tru r={r} m; h={h} m'});
  sa('toan',11,'Quan hệ vuông góc','TH','Một chiếc nón lá có bán kính đáy ${r}$ dm và chiều cao ${h}$ dm (như hình). Tính thể tích khối nón (dm³, làm tròn hàng phần mười).','{=round(pi*r*r*h/3,1)}',{p:'r=[2,2.5,3]; h=[2,3,4]',fig:'@non r={r} dm; h={h} dm; l=l'});
  /* ---- Vật lí ---- */
  sa('li',10,'Động học','TH','Đồ thị vận tốc – thời gian của một vật như hình. Tính gia tốc của vật (m/s²).','{a}',{p:'v=[2,4,5]; a=[1,2,3]',fig:'@dothi f={v}+{a}*x; x=0:6; y=0:{=v+6*a+2}; xl=t (s); yl=v (m/s); diem=0;{v},4;{=v+4*a}'});
  mc('li',12,'Khí lí tưởng','NB','Đồ thị trong hình biểu diễn áp suất $p$ theo nhiệt độ tuyệt đối $T$ của một lượng khí là đường thẳng đi qua gốc toạ độ. Đây là quá trình',['đẳng tích','đẳng nhiệt','đẳng áp','đoạn nhiệt'],0,{p:'k=[1,2]',fig:'@dothi f={k}*x; x=0:6; y=0:{=6*k+1}; xl=T; yl=p; luoi=0'});
  sa('li',12,'Vật lí hạt nhân','VD','Đồ thị số hạt nhân còn lại (%) theo thời gian như hình. Sau ${=3*T}$ ngày, lượng chất còn lại bao nhiêu phần trăm?','12.5',{p:'T=[2,3,4,5]',fig:'@dothi f=100*2^(-x/{T}); x=0:{=4*T}; y=0:110; xl=t (ngày); yl=N (%); diem={T};50'});
  /* ---- Địa lí ---- */
  sa('dia',12,'Địa lí các ngành kinh tế','VD','Cho biểu đồ giá trị xuất khẩu của một tỉnh (triệu USD). Tính tốc độ tăng trưởng năm 2023 so với năm 2017 (%, lấy năm 2017 = 100%, làm tròn hàng phần mười).','{=round(d/a*100,1)}',{p:'a=40..55; b=50..62; c=58..70; d=65..85',fig:'@bieudo data={a}|{b}|{c}|{d}; nhan=2017|2019|2021|2023; donvi=Triệu USD; chu=Số liệu giả định'});
  sa('dia',12,'Địa lí dân cư','VD','Cho biểu đồ dân số một tỉnh (nghìn người). Tính dân số trung bình của 4 năm (nghìn người, làm tròn hàng đơn vị).','{=round((a+b+c+d)/4)}',{p:'a=1800..1900; b=1850..1950; c=1900..2000; d=1950..2050',fig:'@bieudo loai=duong; data={a}|{b}|{c}|{d}; nhan=2020|2021|2022|2023; donvi=Nghìn người; chu=Số liệu giả định'});
  /* ---- Công nghệ ---- */
  sa('cn',12,'Kĩ thuật điện','TH','Hai điện trở $R_1={a}\\ \\Omega$, $R_2={b}\\ \\Omega$ mắc song song như hình. Tính điện trở tương đương ($\\Omega$, làm tròn hàng phần mười).','{=round(a*b/(a+b),1)}',{p:'a=[2,3,4,6]; b=[3,6,12]',cond:'a!=b',fig:'@mach r=R1,R2; kieu=song'});
  return T; })();

/* ===================== XƯỞNG SINH CÂU ===================== */
function generatorModal(onDone){
  const G={subject:BankState.subject||'toan',grade:+BankState.grade||12,topic:'',level:'',per:5,src:'both',figOnly:false,bank:''};
  modal({title:'🏭 Xưởng sinh câu ngẫu nhiên',size:'xl',body:`<div class="note info">Sinh hàng loạt câu hỏi <b>khác số</b> (có hình vẽ thay đổi theo số) từ <b>${TEMPLATES.length} mẫu sinh câu LKT</b> và các <b>câu tham số</b> trong ngân hàng. Mỗi câu sinh ra là câu cố định, lưu vào bộ ngân hàng bạn chọn.</div>
    <div class="grid g4" style="margin-top:10px"><div class="field"><label>Môn</label><select id="gS">${opts(subjList(),G.subject)}</select></div><div class="field"><label>Lớp</label><select id="gG">${opts(GRADES,G.grade)}</select></div><div class="field"><label>Mức độ</label><select id="gL">${opts(LEVELS,'','— Tất cả —')}</select></div><div class="field"><label>Số câu sinh mỗi mẫu</label><input type="number" id="gN" value="5" min="1" max="50"></div></div>
    <div class="grid g3"><div class="field"><label>Chủ đề</label><select id="gT"></select></div><div class="field"><label>Nguồn mẫu</label><select id="gSrc"><option value="both">Mẫu LKT + câu tham số trong ngân hàng</option><option value="tpl">Chỉ mẫu sinh câu LKT</option><option value="bank">Chỉ câu tham số trong ngân hàng</option></select></div><div class="field"><label>Lưu vào bộ ngân hàng</label><select id="gB">${bankOptions('')}</select></div></div>
    <label style="display:flex;gap:6px;align-items:center;font-weight:500"><input type="checkbox" class="chk" id="gF"> Chỉ dùng mẫu có hình vẽ</label>
    <div class="row" style="margin-top:10px"><b id="gInfo" class="grow"></b><button class="btn" id="gAll" title="Sinh từ TẤT CẢ mẫu có hình của mọi môn">⚡ Nạp nhanh mọi mẫu có hình</button><button class="btn" id="gPrev">🎲 Sinh thử</button></div><div id="gOut" style="margin-top:10px;max-height:46vh;overflow:auto"></div>`,
    foot:`<button class="btn" data-x>Đóng</button><button class="btn pri" id="gSave" disabled>Lưu vào ngân hàng</button>`,onOpen:(m,close)=>{ let made=[];
      const pool=()=>{ const s=$('#gS',m).value,g=+$('#gG',m).value,t=$('#gT',m).value,l=$('#gL',m).value,src=$('#gSrc',m).value,f=$('#gF',m).checked;
        const ok=q=>q.subject===s&&+q.grade===g&&(!t||q.topic===t)&&(!l||q.level===l)&&(!f||q.figure);
        return [...(src!=='bank'?TEMPLATES.filter(ok):[]),...(src!=='tpl'?visibleQuestions().filter(q=>Param.has(q)&&ok(q)):[])]; };
      const topics=()=>{ const s=$('#gS',m).value,g=+$('#gG',m).value; const ts=[...new Set([...topicsOf(s,g),...TEMPLATES.filter(q=>q.subject===s&&+q.grade===g).map(q=>q.topic)])]; $('#gT',m).innerHTML=opts(ts,'','— Tất cả chủ đề —'); };
      const info=()=>{ const p=pool(); $('#gInfo',m).textContent=`${p.length} mẫu phù hợp (${p.filter(q=>q.figure).length} mẫu có hình) → sinh tối đa ${p.length*(+$('#gN',m).value||1)} câu`; };
      ['#gS','#gG'].forEach(id=>$(id,m).onchange=()=>{ topics(); info(); }); ['#gT','#gL','#gSrc','#gF','#gN'].forEach(id=>$(id,m).addEventListener('change',info)); $('#gN',m).oninput=info;
      $('#gPrev',m).onclick=()=>{ const p=pool(), per=Math.min(50,Math.max(1,+$('#gN',m).value||1)); made=[]; p.forEach(q=>{ Param.clones(q,per).forEach(c=>{ delete c.tpl; if(q.tpl) c.parentId=q.id; made.push(c); }); });
        $('#gOut',m).innerHTML=made.length?`<p><b>${made.length}</b> câu đã sinh (hiển thị 30 câu đầu):</p>`+made.slice(0,30).map((q,i)=>qCard(q,{num:'#'+(i+1)})).join(''):emptyBox('Không có mẫu phù hợp');
        renderMath($('#gOut',m)); $('#gSave',m).disabled=!made.length; };
      $('#gAll',m).onclick=()=>{ const per=Math.min(50,Math.max(1,+$('#gN',m).value||1)); made=[]; TEMPLATES.filter(q=>q.figure).forEach(q=>Param.clones(q,per).forEach(c=>{ delete c.tpl; c.parentId=q.id; made.push(c); }));
        $('#gOut',m).innerHTML=`<p><b>${made.length}</b> câu có hình từ mọi môn (hiển thị 30 câu đầu) – bấm <b>Lưu vào ngân hàng</b>:</p>`+made.slice(0,30).map((q,i)=>qCard(q,{num:'#'+(i+1)})).join(''); renderMath($('#gOut',m)); $('#gSave',m).disabled=!made.length; };
      $('#gSave',m).onclick=()=>{ const b=$('#gB',m).value; made.forEach(q=>{ q.ownerId=me().id; q.bankId=b||undefined; q.shared=b?undefined:true; q.createdAt=Date.now(); DB.data.questions.push(q); }); DB.save(); Sync.markDirty('questions'); close(); toast(`Đã thêm ${made.length} câu vào ngân hàng`,'ok'); onDone&&onDone(); };
      topics(); info(); }});
}

/* ===================== NẠP SẴN CÂU MẪU (kể cả câu có hình) =====================
 * Chạy khi mở app và sau mỗi lần tải dữ liệu từ máy chủ: nếu ngân hàng chưa có bộ câu mẫu
 * phiên bản mới thì bổ sung (không trùng, không xoá câu của giáo viên). */
const SeedSync = {
  VER: 5, PER: 3,
  ensure(d,force){ d.settings=d.settings||{}; const first=(d.settings.seedDone||0)<this.VER; if(!force&&!first) return 0;
    const have=new Set(d.questions.map(q=>q.seedKey).filter(Boolean)); let n=0; const now=Date.now();
    const norm=q=>String((q.content||'')+'¦'+JSON.stringify(q.options||q.statements||'')).replace(/<[^>]+>|\$|\\[a-z]+|[{}\s.,:;!?()"'\[\]¦]/gi,'').toLowerCase();
    const seen=new Set(d.questions.map(q=>q.type+'|'+norm(q)));
    const put=q=>{ const k=q.type+'|'+norm(q); if(have.has(q.seedKey)||seen.has(k)) return; q.id=q.id||('q_'+q.seedKey); d.questions.push(q); have.add(q.seedKey); seen.add(k); n++; };
    if(typeof SEED4!=='undefined') SEED4.build().forEach(put);
    if(typeof SEED3!=='undefined') SEED3.build().forEach(put);
    if(typeof SEED2!=='undefined') SEED2.build().forEach(put);
    if(first) TEMPLATES.forEach(t=>{ let cs=[]; try{ cs=Param.clones(t,this.PER); }catch(e){}
      cs.forEach((c,i)=>{ if(have.has(`t3-${t.id}-${i}`)) return; delete c.tpl; c.seedKey=`t3-${t.id}-${i}`; c.id='q_'+c.seedKey; c.parentId=t.id; c.shared=true; c.ownerId='u_admin'; c.createdAt=now; put(c); }); });
    d.seedVersion=Math.max(d.seedVersion||0,SEED_VERSION); d.settings.seedDone=this.VER; return n; }
};
