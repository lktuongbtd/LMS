/* LMS LKT – bank.js: cấu hình môn học, cấu trúc đề THPT, ngân hàng mẫu, câu hỏi tham số (số tương tự), nhập câu hỏi */
'use strict';
const SEED_VERSION = 2;
const LEVELS = [{v:'NB',t:'Nhận biết'},{v:'TH',t:'Thông hiểu'},{v:'VD',t:'Vận dụng'},{v:'VDC',t:'Vận dụng cao'}];
const MX_LEVELS = ['NB','TH','VD']; // ma trận theo chuẩn 2025: Biết – Hiểu – Vận dụng (VDC gộp vào VD)
const LV_NAME = {NB:'Nhận biết',TH:'Thông hiểu',VD:'Vận dụng',VDC:'Vận dụng cao'};
const QTYPES = [{v:'mcq',t:'Trắc nghiệm 4 phương án'},{v:'tf',t:'Đúng/Sai'},{v:'short',t:'Trả lời ngắn'},{v:'essay',t:'Tự luận'}];
const QT_NAME = {mcq:'Trắc nghiệm',tf:'Đúng/Sai',short:'Trả lời ngắn',essay:'Tự luận'};
const GRADES = [10,11,12];
/* Cấu trúc đề tốt nghiệp THPT từ 2025 (theo định dạng Bộ GD&ĐT công bố) */
const S_MCQ_TF_SA = (a,c,pt3)=>[{type:'mcq',n:a,pt:.25},{type:'tf',n:4,pt:1},{type:'short',n:c,pt:pt3}];
const SUBJECTS = {
  toan:{name:'Toán',icon:'📐',color:'#4f46e5',duration:90,struct:S_MCQ_TF_SA(12,6,.5)},
  li:{name:'Vật lí',icon:'⚛️',color:'#0891b2',duration:50,struct:S_MCQ_TF_SA(18,6,.25)},
  hoa:{name:'Hoá học',icon:'🧪',color:'#059669',duration:50,struct:S_MCQ_TF_SA(18,6,.25)},
  sinh:{name:'Sinh học',icon:'🧬',color:'#16a34a',duration:50,struct:S_MCQ_TF_SA(18,6,.25)},
  dia:{name:'Địa lí',icon:'🌏',color:'#ca8a04',duration:50,struct:S_MCQ_TF_SA(18,6,.25)},
  su:{name:'Lịch sử',icon:'📜',color:'#b45309',duration:50,struct:[{type:'mcq',n:24,pt:.25},{type:'tf',n:4,pt:1}]},
  gdktpl:{name:'GD Kinh tế & Pháp luật',icon:'⚖️',color:'#9333ea',duration:50,struct:[{type:'mcq',n:24,pt:.25},{type:'tf',n:4,pt:1}]},
  tin:{name:'Tin học',icon:'💻',color:'#2563eb',duration:50,struct:[{type:'mcq',n:24,pt:.25},{type:'tf',n:4,pt:1}]},
  cn:{name:'Công nghệ',icon:'🔧',color:'#64748b',duration:50,struct:[{type:'mcq',n:24,pt:.25},{type:'tf',n:4,pt:1}]},
  anh:{name:'Tiếng Anh',icon:'🇬🇧',color:'#dc2626',duration:50,struct:[{type:'mcq',n:40,pt:.25}]},
  van:{name:'Ngữ văn',icon:'📖',color:'#db2777',duration:120,struct:[{type:'essay',n:3,pt:null}]}
};
const subjName = s => (SUBJECTS[s]||{}).name||s;
const subjList = () => Object.entries(SUBJECTS).map(([v,o])=>({v,t:o.name}));
const PART_TITLE = {
  mcq:(n)=>`PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn. Thí sinh trả lời từ câu 1 đến câu ${n}. Mỗi câu hỏi thí sinh chỉ chọn một phương án.`,
  tf:(n)=>`PHẦN II. Câu trắc nghiệm đúng sai. Thí sinh trả lời từ câu 1 đến câu ${n}. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.`,
  short:(n)=>`PHẦN III. Câu trắc nghiệm trả lời ngắn. Thí sinh trả lời từ câu 1 đến câu ${n}.`,
  essay:(n)=>`PHẦN TỰ LUẬN (${n} câu).`
};
const PART_ORDER = ['mcq','tf','short','essay'];
const ROMAN = ['I','II','III','IV'];
/* Chủ đề gợi ý (giáo viên tự thêm được) */
const TOPICS = {
  toan:{10:['Mệnh đề và tập hợp','Bất phương trình bậc nhất hai ẩn','Hệ thức lượng trong tam giác','Vectơ','Hàm số bậc hai và đồ thị','Phương pháp toạ độ trong mặt phẳng','Đại số tổ hợp','Thống kê và xác suất'],
        11:['Hàm số lượng giác và phương trình lượng giác','Dãy số, cấp số cộng, cấp số nhân','Giới hạn. Hàm số liên tục','Hàm số mũ và hàm số lôgarit','Đạo hàm','Quan hệ song song','Quan hệ vuông góc','Xác suất'],
        12:['Ứng dụng đạo hàm để khảo sát hàm số','Nguyên hàm và tích phân','Vectơ và toạ độ trong không gian','Phương pháp toạ độ trong không gian','Thống kê mẫu số liệu ghép nhóm','Xác suất có điều kiện']},
  li:{10:['Động học','Động lực học','Năng lượng, công, công suất','Động lượng'],11:['Dao động','Sóng','Điện trường','Dòng điện, mạch điện'],12:['Vật lí nhiệt','Khí lí tưởng','Từ trường','Vật lí hạt nhân']},
  hoa:{10:['Cấu tạo nguyên tử','Bảng tuần hoàn','Liên kết hoá học','Phản ứng oxi hoá – khử'],11:['Cân bằng hoá học','Nitrogen và sulfur','Hydrocarbon','Dẫn xuất halogen – alcohol – phenol'],12:['Ester – Lipid','Carbohydrate','Hợp chất chứa nitrogen','Polymer','Pin điện và điện phân','Đại cương kim loại','Nguyên tố nhóm IA, IIA']},
  sinh:{10:['Thành phần hoá học của tế bào','Cấu trúc tế bào','Trao đổi chất ở tế bào','Phân bào'],11:['Trao đổi chất ở thực vật','Trao đổi chất ở động vật','Cảm ứng','Sinh trưởng và phát triển'],12:['Di truyền phân tử','Di truyền nhiễm sắc thể','Di truyền quần thể','Tiến hoá','Sinh thái học']},
  dia:{10:['Trái Đất','Thạch quyển','Khí quyển','Thuỷ quyển'],11:['Kinh tế – xã hội thế giới','Khu vực Đông Nam Á','Hoa Kỳ','Nhật Bản'],12:['Địa lí tự nhiên Việt Nam','Địa lí dân cư','Địa lí các ngành kinh tế','Địa lí các vùng kinh tế']},
  su:{10:['Lịch sử và Sử học','Các nền văn minh thế giới','Cách mạng công nghiệp','Văn minh Đông Nam Á'],11:['Cách mạng tư sản','Chủ nghĩa xã hội','Chiến tranh bảo vệ Tổ quốc','Cải cách trong lịch sử VN'],12:['Thế giới sau năm 1945','Cách mạng tháng Tám năm 1945','Kháng chiến chống Pháp và chống Mỹ','Công cuộc Đổi mới từ 1986','Hồ Chí Minh trong lịch sử Việt Nam']},
  gdktpl:{10:['Nền kinh tế và các chủ thể','Thị trường','Ngân sách nhà nước','Pháp luật'],11:['Cạnh tranh, cung cầu','Lạm phát, thất nghiệp','Quyền bình đẳng','Quyền tự do cơ bản'],12:['Tăng trưởng và phát triển kinh tế','Hội nhập kinh tế quốc tế','Bảo hiểm và an sinh xã hội','Quyền và nghĩa vụ công dân','Pháp luật quốc tế']},
  tin:{10:['Máy tính và xã hội tri thức','Mạng máy tính và Internet','Lập trình Python'],11:['Hệ điều hành','Cơ sở dữ liệu','Kĩ thuật lập trình'],12:['Trí tuệ nhân tạo','Mạng máy tính','Tạo trang web HTML/CSS','Đạo đức, pháp luật trong môi trường số']},
  cn:{10:['Công nghệ và đời sống','Vẽ kĩ thuật'],11:['Cơ khí chế tạo','Động cơ đốt trong'],12:['Kĩ thuật điện','Kĩ thuật điện tử']},
  anh:{10:['Phonetics','Grammar','Vocabulary','Communication','Reading','Writing'],11:['Phonetics','Grammar','Vocabulary','Communication','Reading','Writing'],12:['Phonetics','Grammar','Vocabulary','Communication','Reading','Writing']},
  van:{10:['Đọc hiểu','Viết đoạn văn nghị luận','Viết bài văn nghị luận'],11:['Đọc hiểu','Viết đoạn văn nghị luận','Viết bài văn nghị luận'],12:['Đọc hiểu','Viết đoạn văn nghị luận','Viết bài văn nghị luận']}
};
function topicsOf(subject,grade){ const base=((TOPICS[subject]||{})[grade])||[]; const extra=DB.all('topics').filter(t=>t.subject===subject&&+t.grade===+grade).map(t=>t.name);
  const fromBank=DB.all('questions').filter(q=>q.subject===subject&&+q.grade===+grade).map(q=>q.topic); return [...new Set([...base,...extra,...fromBank])].filter(Boolean); }

/* ================= CÂU HỎI THAM SỐ – "SỐ TƯƠNG TỰ" =================
 * Tham số: "a=1..9; b=-5..5!0; k=[2,3,5]; c==a+b"
 *  - a=1..9      : số nguyên ngẫu nhiên trong đoạn
 *  - b=-5..5!0   : loại trừ giá trị 0 (có thể !0,1)
 *  - k=[2,3,5]   : chọn trong danh sách
 *  - c==a+b      : biến tính theo biểu thức
 * Điều kiện (tuỳ chọn): biểu thức đúng/sai, ví dụ "a!=b && a+b>3"
 * Trong nội dung: {a} chèn giá trị, {=2*a+b} chèn kết quả biểu thức. Hàm: sqrt, abs, round(x,n), pow, min, max, floor, ceil, ln, log10, pi */
const Param = {
  parse(spec){ return String(spec||'').split(/[;\n]/).map(s=>s.trim()).filter(Boolean).map(s=>{
      let m;
      if((m=s.match(/^([a-zA-Z]\w*)\s*==\s*(.+)$/))) return {n:m[1],expr:m[2]};
      if((m=s.match(/^([a-zA-Z]\w*)\s*=\s*\[(.+)\]$/))) return {n:m[1],list:m[2].split(',').map(x=>parseFloat(x.trim().replace(',','.'))).filter(x=>!isNaN(x))};
      if((m=s.match(/^([a-zA-Z]\w*)\s*=\s*(-?[\d.]+)\s*\.\.\s*(-?[\d.]+)(?:\s*!\s*([-\d.,\s]+))?$/))) return {n:m[1],lo:+m[2],hi:+m[3],ex:(m[4]||'').split(',').map(x=>x.trim()).filter(Boolean).map(Number)};
      return null; }).filter(Boolean); },
  ev(expr,vals){ const names=Object.keys(vals); const e=String(expr).replace(/\^/g,'**');
    const fn=new Function(...names,'sqrt','abs','round','pow','min','max','floor','ceil','ln','log10','pi','sin','cos','tan','exp','"use strict";return ('+e+');');
    return fn(...names.map(n=>vals[n]),Math.sqrt,Math.abs,(x,n=0)=>Math.round(x*10**n)/10**n,Math.pow,Math.min,Math.max,Math.floor,Math.ceil,Math.log,Math.log10,Math.PI,Math.sin,Math.cos,Math.tan,Math.exp); },
  fmt(x,inMath){ if(typeof x==='boolean') return x?'Đúng':'Sai'; if(typeof x!=='number'||!isFinite(x)) return String(x);
    let s = Number.isInteger(x) ? String(x) : String(Math.round(x*1e4)/1e4); return s.replace('.', inMath?'{,}':','); },
  draw(params,rnd){ const vals={};
    for(const p of params){
      if(p.expr!=null) vals[p.n]=this.ev(p.expr,vals);
      else if(p.list) vals[p.n]=p.list[Math.floor(rnd()*p.list.length)];
      else { let v,t=0; do{ v=p.lo+Math.floor(rnd()*(p.hi-p.lo+1)); }while(p.ex.includes(v)&&++t<50); vals[p.n]=v; }
    } return vals; },
  fill(str,vals){ if(str==null) return str; str=String(str);
    // tách theo $ để biết đang ở trong công thức
    const parts=str.split(/(\$\$?[^$]*\$\$?)/g);
    return parts.map(seg=>{ const inMath=/^\$/.test(seg);
      return seg.replace(/\{=([^{}]+)\}/g,(_,e)=>{ try{ return this.fmt(this.ev(e,vals),inMath); }catch(err){ return '[lỗi:'+e+']'; } })
                .replace(/\{([a-zA-Z]\w*)\}/g,(m,n)=> n in vals ? this.fmt(vals[n],inMath) : m); }).join(''); },
  has(q){ return !!(q && q.params && String(q.params).trim()); },
  instantiate(q,seed){
    if(!this.has(q)) return q;
    const params=this.parse(q.params); const rnd=seededRandom(String(seed)+'|'+q.id);
    let vals, tries=0, o;
    do{
      vals=this.draw(params,rnd);
      let okCond=true; if(q.cond){ try{ okCond=!!this.ev(q.cond,vals); }catch(e){ okCond=true; } }
      o={...q, content:this.fill(q.content,vals), explain:this.fill(q.explain,vals), _vals:vals, _seed:seed};
      if(q.options) o.options=q.options.map(x=>this.fill(x,vals));
      if(q.statements) o.statements=q.statements.map(x=>this.fill(x,vals));
      if(q.figure) o.figure=this.fill(q.figure,vals);
      if(q.type==='short') o.answer=this.fill(q.answer,vals);
      const dup = o.options && new Set(o.options.map(x=>x.trim())).size<o.options.length;
      if(okCond && !dup) break;
    }while(++tries<40);
    return o;
  },
  /* Sinh n câu cụ thể (không còn tham số) từ một câu tham số */
  clones(q,n){ const out=[], seen=new Set(); let k=0;
    while(out.length<n && k<n*20){ const inst=this.instantiate(q, Date.now()+'-'+(k++)+Math.random()); const key=inst.content+'|'+(inst.options||[]).join('|')+'|'+(inst.statements||[]).join('|');
      if(seen.has(key)) continue; seen.add(key);
      const c={...inst,id:uid('q'),params:'',cond:'',parentId:q.id,createdAt:Date.now()}; delete c._vals; delete c._seed; out.push(c); }
    return out; }
};

/* ================= NHẬP CÂU HỎI TỪ VĂN BẢN =================
 * Xem mẫu TEXT_TEMPLATE. */
const TEXT_TEMPLATE = `[Môn: toan] [Lớp: 12] [Chủ đề: Nguyên hàm và tích phân] [Mức: NB]

Câu 1: Họ nguyên hàm của hàm số $f(x)=\\cos x$ là
A. $-\\sin x+C$
*B. $\\sin x+C$
C. $\\cos x+C$
D. $-\\cos x+C$
Lời giải: $\\int \\cos x\\,dx=\\sin x+C$.

Câu 2 [TH]: Tích phân $\\int_0^{2}({a}x+1)\\,dx$ bằng
A. $\\{=2*a+2}$
B. $\\{=2*a+1}$
C. $\\{=a+2}$
D. $\\{=4*a}$
Đáp án: A
Tham số: a=1..9

Câu 3 [Đúng/Sai] [Chủ đề: Ứng dụng đạo hàm để khảo sát hàm số]: Cho hàm số $y=x^3-3x$.
a) Hàm số đồng biến trên khoảng $(1;+\\infty)$. (Đ)
b) Hàm số đạt cực đại tại $x=1$. (S)
c) Giá trị cực tiểu của hàm số bằng $-2$. (Đ)
d) Đồ thị hàm số đi qua gốc toạ độ. (Đ)

Câu 4 [Trả lời ngắn] [VD]: Tính $\\int_1^{3} 2x\\,dx$.
Đáp án: 8

Câu 5 [Tự luận]: Tìm giá trị lớn nhất của hàm số $y=-x^2+4x$.
Đáp án: Đạo hàm $y'=-2x+4=0 \\Leftrightarrow x=2$; GTLN bằng $4$ tại $x=2$.
Điểm: 1

Câu 6 [Lớp: 11] [Chủ đề: Quan hệ vuông góc] [TH]: Cho hình chóp $S.ABCD$ có đáy là hình vuông, $SA\\perp(ABCD)$. Đường thẳng $BC$ vuông góc với mặt phẳng nào?
Hình: @chop base=4; vuong=1
A. $(SAC)$
*B. $(SAB)$
C. $(SAD)$
D. $(SCD)$
`.replace(/\\\{=/g,'{=');
const QImport = {
  parse(text,defaults={}){
    const ctx={subject:defaults.subject||'toan',grade:+defaults.grade||12,topic:defaults.topic||'',level:defaults.level||'NB'};
    const tagRe=/\[([^\]:]+?)(?::\s*([^\]]*))?\]/g;
    const applyTags=(s,c)=>{ let m; const out={...c}, flags={}; tagRe.lastIndex=0;
      while((m=tagRe.exec(s))){ const k=noAccent(m[1]).toLowerCase().trim(), v=(m[2]||'').trim();
        if(/^mon$/.test(k)) out.subject=this.subjCode(v); else if(/^lop$/.test(k)) out.grade=+v||out.grade; else if(/^chu de$/.test(k)) out.topic=v;
        else if(/^muc( do)?$/.test(k)) out.level=v.toUpperCase(); else if(/^(nb|th|vd|vdc)$/.test(k)) out.level=k.toUpperCase();
        else if(/dung\/?sai|ds/.test(k)) flags.type='tf'; else if(/tra loi ngan|tln/.test(k)) flags.type='short'; else if(/tu luan|tl/.test(k)) flags.type='essay'; else if(/trac nghiem|tn/.test(k)) flags.type='mcq'; }
      return {ctx:out,flags}; };
    const blocks=text.replace(/\r/g,'').split(/^(?=\s*Câu\s*\d+)/m);
    const res=[], errors=[];
    blocks.forEach((blk,bi)=>{
      if(!/^\s*Câu\s*\d+/.test(blk)){ Object.assign(ctx,applyTags(blk,ctx).ctx); return; }
      const lines=blk.split('\n'); let head=lines.shift().replace(/^\s*Câu\s*\d+\s*/,'');
      const colon=head.search(/[:.]\s/); let tagPart=head, rest='';
      // thẻ nằm trước dấu ":" đầu tiên ngoài ngoặc vuông
      const m=head.match(/^((?:\s*\[[^\]]*\])*)\s*[:.]?\s*(.*)$/); if(m){ tagPart=m[1]; rest=m[2]; } else rest=head;
      const {ctx:c,flags}=applyTags(tagPart,ctx);
      const q={id:uid('q'),subject:c.subject,grade:c.grade,topic:c.topic,level:['NB','TH','VD','VDC'].includes(c.level)?c.level:'NB',content:'',explain:'',params:'',createdAt:Date.now()};
      const body=[rest], opts=[], sts=[], stAns=[]; let correct=-1, answer='', explain='', mode='body', points=null;
      lines.forEach(L=>{ const l=L.trimEnd(); let mm;
        if((mm=l.match(/^\s*(\*?)\s*([ABCD])[.)]\s*(.*)$/))){ if(mm[1]) correct=opts.length; opts.push(mm[3]); mode='opt'; }
        else if((mm=l.match(/^\s*([abcd])\)\s*(.*)$/))){ let t=mm[2], v=null; const k=t.match(/\(\s*(Đ|S|Đúng|Sai|T|F)\s*\)\s*$/i); if(k){ v=/^(Đ|Đúng|T)$/i.test(k[1]); t=t.slice(0,k.index).trim(); } sts.push(t); stAns.push(v); mode='st'; }
        else if((mm=l.match(/^\s*(Đáp án|ĐA)\s*[:：]\s*(.*)$/i))){ answer=mm[2].trim(); mode='ans'; }
        else if((mm=l.match(/^\s*(Lời giải|Hướng dẫn|HD)\s*[:：]\s*(.*)$/i))){ explain=mm[2]; mode='exp'; }
        else if((mm=l.match(/^\s*Tham số\s*[:：]\s*(.*)$/i))){ q.params=mm[1].trim(); }
        else if((mm=l.match(/^\s*Hình\s*[:：]\s*(.*)$/i))){ q.figure=mm[1].trim(); }
        else if((mm=l.match(/^\s*Điều kiện\s*[:：]\s*(.*)$/i))){ q.cond=mm[1].trim(); }
        else if((mm=l.match(/^\s*Điểm\s*[:：]\s*([\d.,]+)/i))){ points=parseFloat(mm[1].replace(',','.')); }
        else if(l.trim()){ if(mode==='body') body.push(l); else if(mode==='exp') explain+='\n'+l; else if(mode==='ans') answer+='\n'+l; else if(mode==='opt'&&opts.length) opts[opts.length-1]+=' '+l.trim(); else if(mode==='st'&&sts.length) sts[sts.length-1]+=' '+l.trim(); }
      });
      q.content=body.join('\n').trim(); q.explain=explain.trim();
      let type=flags.type || (opts.length>=2?'mcq':sts.length>=2?'tf':(points!=null?'essay':'short'));
      q.type=type;
      if(type!=='tf'&&sts.length) q.content+='\n'+sts.map((s,i)=>'abcd'[i]+') '+s).join('\n');
      if(type==='mcq'){ while(opts.length<4) opts.push(''); q.options=opts.slice(0,4); if(correct<0&&answer){ correct='ABCD'.indexOf(answer.trim().charAt(0).toUpperCase()); } q.answer=correct; if(correct<0) errors.push(`Câu ${res.length+1}: chưa có đáp án đúng (dùng *B. hoặc "Đáp án: B")`); }
      else if(type==='tf'){ while(sts.length<4){ sts.push(''); stAns.push(null);} q.statements=sts.slice(0,4); let a=stAns.slice(0,4);
        if(answer && a.some(x=>x==null)){ const s=noAccent(answer).toUpperCase().replace(/[^DS]/g,''); a=[...s].slice(0,4).map(ch=>ch==='D'); }
        q.answer=a.map(x=>!!x); if(a.some(x=>x==null)) errors.push(`Câu ${res.length+1}: thiếu đáp án Đ/S cho một số ý`); }
      else if(type==='short'){ q.answer=answer.trim(); if(!answer) errors.push(`Câu ${res.length+1}: thiếu "Đáp án:"`); }
      else { q.answer=answer.trim(); q.points=points||1; }
      res.push(q);
    });
    return {questions:res, errors};
  },
  subjCode(v){ const s=slug(v); const hit=Object.entries(SUBJECTS).find(([k,o])=>k===s||slug(o.name)===s||slug(o.name).startsWith(s)); return hit?hit[0]:s||'toan'; },
  fromRows(rows){ // Excel: Môn|Lớp|Chủ đề|Mức độ|Loại|Nội dung|A|B|C|D|Đáp án|Lời giải|Tham số|Điểm
    const out=[], errors=[]; rows.slice(1).forEach((r,i)=>{ if(!r[5]) return;
      const t=slug(r[4]||'TN'); const type= /^(ds|dungsai)/.test(t)?'tf':/^(tln|traloingan)/.test(t)?'short':/^(tl|tuluan)/.test(t)?'essay':'mcq';
      const q={id:uid('q'),subject:this.subjCode(r[0]||'toan'),grade:+r[1]||12,topic:String(r[2]||'').trim(),level:String(r[3]||'NB').toUpperCase().trim(),type,content:String(r[5]),explain:String(r[11]||''),params:String(r[12]||''),figure:String(r[14]||'').trim(),createdAt:Date.now()};
      if(!['NB','TH','VD','VDC'].includes(q.level)) q.level='NB';
      const ans=String(r[10]||'').trim();
      if(type==='mcq'){ q.options=[r[6],r[7],r[8],r[9]].map(x=>String(x??'')); q.answer='ABCD'.indexOf(ans.toUpperCase()); if(q.answer<0) errors.push(`Dòng ${i+2}: đáp án phải là A/B/C/D`); }
      else if(type==='tf'){ q.statements=[r[6],r[7],r[8],r[9]].map(x=>String(x??'')); const s=noAccent(ans).toUpperCase().replace(/[^DS]/g,''); if(s.length<4) errors.push(`Dòng ${i+2}: đáp án Đ/S cần 4 ký tự, ví dụ ĐSĐĐ`); q.answer=[...s.padEnd(4,'S')].slice(0,4).map(c=>c==='D'); }
      else if(type==='short'){ q.answer=ans; }
      else { q.answer=ans; q.points=parseFloat(String(r[13]||'1').replace(',','.'))||1; }
      out.push(q); }); return {questions:out,errors}; },
  excelTemplate(){ return [['Môn','Lớp','Chủ đề','Mức độ (NB/TH/VD/VDC)','Loại (TN/DS/TLN/TL)','Nội dung (LaTeX trong $...$)','A / ý a','B / ý b','C / ý c','D / ý d','Đáp án','Lời giải','Tham số (số tương tự)','Điểm (tự luận)','Hình (@chop..., @dothi..., xem mục Hình)'],
    ['Toán',12,'Nguyên hàm và tích phân','NB','TN','Họ nguyên hàm của $f(x)=2x$ là','$x^2+C$','$2x^2+C$','$x+C$','$2+C$','A','$\\int 2x\\,dx=x^2+C$','',''],
    ['Toán',12,'Nguyên hàm và tích phân','TH','TN','$\\int_0^{2}({a}x+1)dx$ bằng','{=2*a+2}','{=2*a+1}','{=a+2}','{=4*a}','A','','a=1..9',''],
    ['Toán',12,'Ứng dụng đạo hàm để khảo sát hàm số','TH','DS','Cho hàm số $y=x^3-3x$.','Hàm số đồng biến trên $(1;+\\infty)$','Hàm số đạt cực đại tại $x=1$','Giá trị cực tiểu bằng $-2$','Đồ thị đi qua gốc toạ độ','ĐSĐĐ','','',''],
    ['Vật lí',12,'Khí lí tưởng','VD','TLN','Nén đẳng nhiệt khí từ 6 lít còn 2 lít, áp suất tăng bao nhiêu lần?','','','','','3','','',''],
    ['Ngữ văn',12,'Viết đoạn văn nghị luận','VD','TL','Viết đoạn văn khoảng 200 chữ về ý nghĩa của lòng biết ơn.','','','','','Đảm bảo hình thức đoạn văn; nêu được ý nghĩa…','','','2']]; }
};

/* ================= NGÂN HÀNG MẪU THEO MÔN ================= */
const SEED = {
  install(d){
    const now=Date.now(); const Q=[];
    const base=(s,g,t,l,type,content,extra={})=>Q.push({id:uid('q'),subject:s,grade:g,topic:t,level:l,type,content,explain:'',params:'',shared:true,ownerId:'u_admin',createdAt:now,...extra});
    const mc=(s,g,t,l,c,o,a,ex='',p='',cond='')=>base(s,g,t,l,'mcq',c,{options:o,answer:a,explain:ex,params:p,cond});
    const tf=(s,g,t,l,c,st,a,ex='',p='')=>base(s,g,t,l,'tf',c,{statements:st,answer:[...a].map(x=>x==='Đ'),explain:ex,params:p});
    const sa=(s,g,t,l,c,a,ex='',p='')=>base(s,g,t,l,'short',c,{answer:a,explain:ex,params:p});
    const es=(s,g,t,l,c,a,pt)=>base(s,g,t,l,'essay',c,{answer:a,points:pt});
    /* ---------- TOÁN 12 ---------- */
    const T1='Ứng dụng đạo hàm để khảo sát hàm số',T2='Nguyên hàm và tích phân',T3='Vectơ và toạ độ trong không gian',T4='Phương pháp toạ độ trong không gian',T5='Thống kê mẫu số liệu ghép nhóm',T6='Xác suất có điều kiện';
    mc('toan',12,T1,'NB','Hàm số $y=x^3-3x+{a}$ đạt cực đại tại điểm',['$x=-1$','$x=1$','$x=0$','$x=3$'],0,"$y'=3x^2-3=0\\Leftrightarrow x=\\pm1$; $y'$ đổi dấu từ $+$ sang $-$ tại $x=-1$.",'a=1..9');
    mc('toan',12,T1,'NB','Đường tiệm cận ngang của đồ thị hàm số $y=\\dfrac{{a}x+1}{x-{b}}$ là',['$y={a}$','$x={b}$','$y={b}$','$x={a}$'],0,'$\\lim\\limits_{x\\to\\pm\\infty}y={a}$.','a=2..5; b=6..9');
    mc('toan',12,T1,'TH','Giá trị lớn nhất của hàm số $y=x^3-3x$ trên đoạn $[0;{a}]$ bằng',['${=a^3-3*a}$','${=a^3-3*a+2}$','$0$','$-2$'],0,'$y(0)=0,\\ y(1)=-2,\\ y({a})={=a^3-3*a}$.','a=2..4');
    mc('toan',12,T1,'VD','Một vật chuyển động theo quy luật $s(t)=-t^3+{=3*k}t^2$ (mét, $t$ tính bằng giây). Vận tốc của vật lớn nhất tại thời điểm',['$t={k}$ s','$t={=2*k}$ s','$t={=3*k}$ s','$t={=k+1}$ s'],0,"$v(t)=-3t^2+{=6*k}t$ đạt lớn nhất tại $t={k}$.",'k=2..5');
    mc('toan',12,T1,'TH','Hàm số $y=-x^4+{=2*a}x^2+1$ có bao nhiêu điểm cực trị?',['$3$','$1$','$2$','$0$'],0,"$y'=-4x(x^2-{a})$ có 3 nghiệm phân biệt.",'a=1..6');
    mc('toan',12,T2,'NB','Họ nguyên hàm của hàm số $f(x)={=3*k}x^2$ là',['${k}x^3+C$','${=6*k}x+C$','${=3*k}x^3+C$','${=9*k}x^3+C$'],0,'','k=2..5');
    mc('toan',12,T2,'NB','Tích phân $\\displaystyle\\int_1^{e}\\dfrac{1}{x}\\,dx$ bằng',['$1$','$e$','$0$','$e-1$'],0,'$=\\ln x\\big|_1^e=1$.');
    mc('toan',12,T2,'TH','Cho $\\displaystyle\\int_0^2 f(x)\\,dx={a}$. Giá trị của $\\displaystyle\\int_0^2\\left[2f(x)+1\\right]dx$ bằng',['${=2*a+2}$','${=2*a+1}$','${=2*a}$','${=a+2}$'],0,'$=2\\cdot{a}+2$.','a=2..9');
    mc('toan',12,T2,'VD','Diện tích hình phẳng giới hạn bởi $y=x^2$ và $y={=k*k}$ bằng',['$\\dfrac{{=4*k^3}}{3}$','$\\dfrac{{=2*k^3}}{3}$','${=k^3}$','$\\dfrac{{=k^3}}{3}$'],0,'$S=\\int_{-{k}}^{{k}}({=k*k}-x^2)dx$.','k=1..4');
    mc('toan',12,T3,'NB','Trong không gian $Oxyz$, cho $A({a};1;{b})$ và $B({c};3;{d})$. Toạ độ vectơ $\\overrightarrow{AB}$ là',['$({=c-a};2;{=d-b})$','$({=a-c};-2;{=b-d})$','$({=a+c};4;{=b+d})$','$({=c-a};4;{=d-b})$'],0,'','a=1..4; b=1..4; c=5..9; d=5..9');
    mc('toan',12,T3,'TH','Trong không gian $Oxyz$, cho $\\vec u=({a};0;{b})$ và $\\vec v=(1;2;-1)$. Tích vô hướng $\\vec u\\cdot\\vec v$ bằng',['${=a-b}$','${=a+b}$','${=b-a}$','${=a+2-b}$'],0,'','a=2..9; b=1..9','a!=b && a-b!=2');
    mc('toan',12,T4,'NB','Trong không gian $Oxyz$, mặt phẳng $(P):\\ {a}x-{b}y+z-3=0$ có một vectơ pháp tuyến là',['$({a};-{b};1)$','$({a};{b};1)$','$({a};-{b};-3)$','$(-{b};{a};1)$'],0,'','a=2..6; b=2..6');
    mc('toan',12,T4,'TH','Khoảng cách từ gốc toạ độ $O$ đến mặt phẳng $2x-y+2z-{=3*k}=0$ bằng',['${k}$','${=3*k}$','${=k+1}$','${=2*k}$'],0,'$d=\\dfrac{{=3*k}}{3}={k}$.','k=2..5');
    mc('toan',12,T4,'TH','Phương trình mặt cầu tâm $I({a};0;-1)$, bán kính $R={r}$ là',['$(x-{a})^2+y^2+(z+1)^2={=r*r}$','$(x+{a})^2+y^2+(z-1)^2={=r*r}$','$(x-{a})^2+y^2+(z+1)^2={r}$','$(x+{a})^2+y^2+(z-1)^2={r}$'],0,'','a=1..5; r=2..4');
    mc('toan',12,T5,'NB','Mẫu số liệu ghép nhóm có các nhóm $[{a};{=a+5}),\\ [{=a+5};{=a+10}),\\ldots,\\ [{=a+20};{=a+25})$. Khoảng biến thiên của mẫu là',['$25$','$20$','$5$','$30$'],0,'','a=10..40');
    mc('toan',12,T5,'TH','Mẫu số liệu ghép nhóm có $Q_1={a}$ và $Q_3={b}$. Khoảng tứ phân vị của mẫu bằng',['${=b-a}$','${=b+a}$','${=(b-a)/2}$','${b}$'],0,'$\\Delta_Q=Q_3-Q_1$.','a=10..20; b=25..40');
    mc('toan',12,T6,'NB','Cho hai biến cố $A,B$ với $P(B)=0{,}5$ và $P(AB)=0{,}{a}$. Xác suất $P(A|B)$ bằng',['${=a/5}$','${=a/10}$','${=a/20}$','${=a/10+0.5}$'],0,'$P(A|B)=\\dfrac{P(AB)}{P(B)}$.','a=1..4');
    mc('toan',12,T6,'TH','Một hộp có {a} bi đỏ và {b} bi xanh. Lấy lần lượt 2 bi không hoàn lại. Xác suất lần thứ hai lấy được bi đỏ, biết lần thứ nhất lấy được bi đỏ là',['$\\dfrac{{=a-1}}{{=a+b-1}}$','$\\dfrac{{a}}{{=a+b}}$','$\\dfrac{{=a-1}}{{=a+b}}$','$\\dfrac{{a}}{{=a+b-1}}$'],0,'','a=3..6; b=2..5');
    tf('toan',12,T1,'TH','Cho hàm số $y=x^3-3x^2+{a}$.',['Hàm số đồng biến trên khoảng $(2;+\\infty)$.','Hàm số đạt cực tiểu tại $x=0$.','Giá trị cực đại của hàm số bằng ${a}$.','Đồ thị hàm số cắt trục tung tại điểm $(0;{=a+1})$.'],'ĐSĐS',"$y'=3x^2-6x$; cực đại tại $x=0$, cực tiểu tại $x=2$.",'a=1..9');
    tf('toan',12,T1,'VD','Cho hàm số $f(x)=\\ln(x^2+1)$.',["$f'(x)=\\dfrac{2x}{x^2+1}$.",'Hàm số nghịch biến trên $(0;+\\infty)$.',"$f'(1)=1$.",'Giá trị nhỏ nhất của $f(x)$ trên $\\mathbb R$ bằng $0$.'],'ĐSĐĐ');
    tf('toan',12,T2,'TH','Cho hàm số $f(x)=2x+{a}$.',['$F(x)=x^2+{a}x$ là một nguyên hàm của $f(x)$.','$\\displaystyle\\int_0^1 f(x)\\,dx={=a+1}$.','Diện tích hình phẳng giới hạn bởi $y=f(x)$, trục hoành, $x=0$, $x=1$ bằng ${=a+2}$.','$\\displaystyle\\int_0^2 f(x)\\,dx={=4+2*a}$.'],'ĐĐSĐ','','a=1..9');
    tf('toan',12,T4,'VD','Trong không gian $Oxyz$, cho điểm $A(1;2;{a})$ và mặt phẳng $(P):\\ x+2y-2z+1=0$.',['Mặt phẳng $(P)$ đi qua điểm $M(-1;0;0)$.','$(P)$ có một vectơ pháp tuyến $\\vec n=(1;2;2)$.','Khoảng cách từ $A$ đến $(P)$ bằng ${=(2*a-6)/3}$.','Đường thẳng qua $A$ vuông góc với $(P)$ có vectơ chỉ phương $(2;1;-2)$.'],'ĐSĐS','$d=\\dfrac{|1+4-2\\cdot{a}+1|}{3}$.','a=[6,9]');
    tf('toan',12,T6,'TH','Một hộp có 3 bi đỏ và 2 bi xanh. Lấy ngẫu nhiên lần lượt 2 bi không hoàn lại. Gọi $A$: "lần 1 lấy được bi đỏ", $B$: "lần 2 lấy được bi đỏ".',['$P(A)=\\dfrac35$.','$P(B|A)=\\dfrac12$.','$P(AB)=\\dfrac{3}{10}$.','$P(B)=\\dfrac25$.'],'ĐĐĐS','$P(B)=P(A)P(B|A)+P(\\bar A)P(B|\\bar A)=\\frac{3}{10}+\\frac{3}{10}=\\frac35$.');
    sa('toan',12,T2,'TH','Tính tích phân $\\displaystyle\\int_0^{2}({a}x+1)\\,dx$.','{=2*a+2}','','a=1..9');
    sa('toan',12,T1,'TH','Cho hàm số $y=x^3-3x+{a}$. Tính tổng giá trị cực đại và giá trị cực tiểu của hàm số.','{=2*a}','$y_{CĐ}+y_{CT}=({a}+2)+({a}-2)$.','a=1..9');
    sa('toan',12,T1,'VD','Từ một tấm bìa hình vuông cạnh {=6*k} dm, người ta cắt bỏ 4 hình vuông bằng nhau cạnh $x$ dm ở 4 góc rồi gấp thành hộp không nắp. Tìm $x$ để thể tích hộp lớn nhất.','{k}','$V=x({=6*k}-2x)^2$ lớn nhất khi $x=\\dfrac{{=6*k}}{6}$.','k=1..5');
    sa('toan',12,T3,'TH','Trong không gian $Oxyz$, cho $A({=3*k};0;0)$ và $B(0;{=4*k};0)$. Tính độ dài đoạn $AB$.','{=5*k}','','k=1..3');
    sa('toan',12,T6,'TH','Cho $P(A)=0{,}6$ và $P(B|A)=0{,}{a}$. Tính $P(AB)$ (viết dạng số thập phân).','{=round(0.06*a,2)}','','a=1..9');
    sa('toan',12,T5,'VD','Mẫu số liệu ghép nhóm: nhóm $[0;10)$ có tần số {a}, nhóm $[10;20)$ có tần số {b}. Tính số trung bình của mẫu (làm tròn đến hàng phần mười).','{=round((5*a+15*b)/(a+b),1)}','','a=2..9; b=2..9');
    sa('toan',12,T1,'NB','Tính hệ số góc của tiếp tuyến với đồ thị hàm số $y=x^2+{a}x$ tại điểm có hoành độ $x=2$.','{=4+a}','','a=1..9');
    es('toan',12,T2,'VD','Tính diện tích hình phẳng giới hạn bởi đồ thị $y=x^2-2x$ và trục hoành.','$S=\\int_0^2|x^2-2x|dx=\\dfrac43$. (0,5đ lập công thức; 0,5đ tính đúng)',1);
    /* ---------- TOÁN 11, 10 ---------- */
    mc('toan',11,'Dãy số, cấp số cộng, cấp số nhân','NB','Cấp số cộng $(u_n)$ có $u_1={a}$, công sai $d={b}$. Số hạng $u_5$ bằng',['${=a+4*b}$','${=a+5*b}$','${=a*b}$','${=4*a+b}$'],0,'','a=1..9; b=2..6');
    mc('toan',11,'Hàm số mũ và hàm số lôgarit','NB','Giá trị của $\\log_2 {=2^k}$ bằng',['${k}$','${=2*k}$','${=2^k}$','${=k+1}$'],0,'','k=3..8');
    mc('toan',11,'Đạo hàm','NB','Đạo hàm của hàm số $y=x^{{n}}$ là',['$y\'={n}x^{{=n-1}}$','$y\'=x^{{=n-1}}$','$y\'={n}x^{{n}}$','$y\'={=n-1}x^{{n}}$'],0,'','n=3..9');
    sa('toan',11,'Dãy số, cấp số cộng, cấp số nhân','TH','Cấp số nhân có $u_1={a}$, công bội $q=2$. Tính tổng 5 số hạng đầu.','{=31*a}','','a=1..9');
    mc('toan',10,'Hàm số bậc hai và đồ thị','NB','Trục đối xứng của parabol $y=x^2-{=2*a}x+3$ là',['$x={a}$','$x=-{a}$','$x={=2*a}$','$y={a}$'],0,'','a=1..6');
    mc('toan',10,'Mệnh đề và tập hợp','NB','Cho $A=\\{1;2;3;{a}\\}$ và $B=\\{2;{a};10\\}$. Tập $A\\cap B$ là',['$\\{2;{a}\\}$','$\\{1;2;3\\}$','$\\{10\\}$','$\\{1;3;10\\}$'],0,'','a=4..9');
    sa('toan',10,'Đại số tổ hợp','TH','Có bao nhiêu cách xếp {n} học sinh thành một hàng dọc?','{=[1,1,2,6,24,120,720,5040][n]}','','n=3..7');
    /* ---------- VẬT LÍ 12 ---------- */
    mc('li',12,'Vật lí nhiệt','NB','Nhiệt độ sôi của nước ở áp suất tiêu chuẩn theo thang Kelvin là',['$273$ K','$373$ K','$100$ K','$212$ K'],1);
    mc('li',12,'Vật lí nhiệt','NB','Khi nhiệt độ của vật tăng thì',['các phân tử chuyển động nhiệt nhanh hơn','khối lượng của vật tăng','các phân tử đứng yên','khoảng cách giữa các phân tử luôn giảm'],0);
    mc('li',12,'Vật lí nhiệt','TH','Nhiệt lượng cần cung cấp để đun nóng {m} kg nước từ $20^\\circ$C lên $30^\\circ$C là bao nhiêu? Biết $c=4200$ J/(kg.K).',['${=42000*m}$ J','${=4200*m}$ J','${=420*m}$ J','${=126000*m}$ J'],0,'$Q=mc\\Delta t$.','m=2..6');
    mc('li',12,'Khí lí tưởng','TH','Một lượng khí lí tưởng có áp suất {a} atm, thể tích 6 lít. Nén đẳng nhiệt đến thể tích 3 lít thì áp suất khí là',['${=2*a}$ atm','${=a/2}$ atm','${=3*a}$ atm','${a}$ atm'],0,'$p_1V_1=p_2V_2$.','a=2..6');
    mc('li',12,'Từ trường','NB','Trong hệ SI, đơn vị của cảm ứng từ là',['tesla (T)','weber (Wb)','henry (H)','vôn (V)'],0);
    mc('li',12,'Từ trường','TH','Đoạn dây dài $0{,}5$ m mang dòng điện {I} A đặt vuông góc với các đường sức của từ trường đều $B=0{,}2$ T. Độ lớn lực từ là',['${=0.1*I}$ N','${=0.2*I}$ N','${=0.5*I}$ N','${=I}$ N'],0,'$F=BIl$.','I=2..9');
    mc('li',12,'Vật lí hạt nhân','NB','Hạt nhân $^{235}_{92}\\mathrm U$ có số neutron là',['$143$','$92$','$235$','$327$'],0);
    mc('li',12,'Vật lí hạt nhân','TH','Một chất phóng xạ có chu kì bán rã $T$. Sau thời gian $2T$, số hạt nhân còn lại bằng bao nhiêu phần số hạt nhân ban đầu?',['$\\dfrac14$','$\\dfrac12$','$\\dfrac18$','$\\dfrac34$'],0);
    tf('li',12,'Khí lí tưởng','TH','Một lượng khí lí tưởng ở $27^\\circ$C có áp suất 1 atm.',['Nhiệt độ của khí theo thang Kelvin là 300 K.','Đun nóng đẳng tích đến $327^\\circ$C thì áp suất khí là 2 atm.','Trong quá trình đẳng tích, khí thực hiện công dương.','Động năng trung bình của phân tử khí tăng khi nhiệt độ tăng.'],'ĐĐSĐ');
    tf('li',12,'Vật lí hạt nhân','TH','Xét các hiện tượng hạt nhân.',['Phản ứng phân hạch $^{235}$U toả năng lượng.','Hạt nhân có năng lượng liên kết riêng càng lớn thì càng kém bền.','Tia $\\alpha$ là dòng hạt nhân $^4_2\\mathrm{He}$.','Tia $\\gamma$ bị lệch trong điện trường.'],'ĐSĐS');
    sa('li',12,'Khí lí tưởng','VD','Một khối khí có thể tích 2 lít ở áp suất ${a}\\cdot10^5$ Pa được nén đẳng nhiệt đến 0,5 lít. Áp suất của khí khi đó là bao nhiêu (đơn vị $10^5$ Pa)?','{=4*a}','','a=1..5');
    sa('li',12,'Vật lí hạt nhân','VD','Một chất phóng xạ có chu kì bán rã 8 ngày. Sau {=8*k} ngày, lượng chất còn lại bằng bao nhiêu phần trăm ban đầu?','{=100/2^k}','','k=1..3');
    /* ---------- HOÁ HỌC 12 ---------- */
    mc('hoa',12,'Ester – Lipid','NB','Công thức của ethyl acetate là',['CH$_3$COOC$_2$H$_5$','HCOOC$_2$H$_5$','C$_2$H$_5$COOCH$_3$','CH$_3$COOCH$_3$'],0);
    mc('hoa',12,'Ester – Lipid','VD','Thuỷ phân hoàn toàn {=0.1*k} mol ethyl acetate bằng dung dịch NaOH dư. Khối lượng muối thu được là',['{=8.2*k} gam','{=6.8*k} gam','{=9.6*k} gam','{=4.6*k} gam'],0,'Muối CH$_3$COONa có $M=82$.','k=1..5');
    mc('hoa',12,'Carbohydrate','NB','Glucose có công thức phân tử là',['C$_6$H$_{12}$O$_6$','C$_{12}$H$_{22}$O$_{11}$','(C$_6$H$_{10}$O$_5$)$_n$','C$_6$H$_{10}$O$_5$'],0);
    mc('hoa',12,'Hợp chất chứa nitrogen','NB','Chất nào sau đây là amine bậc một?',['CH$_3$NH$_2$','(CH$_3$)$_2$NH','(CH$_3$)$_3$N','CH$_3$CONH$_2$'],0);
    mc('hoa',12,'Polymer','NB','Polymer nào sau đây được điều chế bằng phản ứng trùng hợp?',['Polyethylene (PE)','Nylon-6,6','Cellulose','Tinh bột'],0);
    mc('hoa',12,'Đại cương kim loại','TH','Kim loại có tính khử mạnh nhất trong các kim loại Na, Mg, Al, Fe là',['Na','Mg','Al','Fe'],0);
    mc('hoa',12,'Pin điện và điện phân','NB','Trong pin điện hoá Zn – Cu, điện cực âm (anode) là',['Zn','Cu','dung dịch CuSO$_4$','cầu muối'],0);
    mc('hoa',12,'Nguyên tố nhóm IA, IIA','TH','Nước cứng tạm thời chứa các ion',['Ca$^{2+}$, Mg$^{2+}$, HCO$_3^-$','Na$^+$, K$^+$, Cl$^-$','Ca$^{2+}$, Mg$^{2+}$, SO$_4^{2-}$','Na$^+$, HCO$_3^-$'],0);
    tf('hoa',12,'Carbohydrate','TH','Xét glucose và fructose.',['Hai chất đều có công thức phân tử C$_6$H$_{12}$O$_6$.','Glucose có phản ứng tráng bạc.','Fructose thuộc loại polysaccharide.','Glucose làm mất màu nước bromine.'],'ĐĐSĐ');
    tf('hoa',12,'Pin điện và điện phân','TH','Xét pin điện hoá Zn – Cu ở điều kiện chuẩn ($E^\\circ_{Zn^{2+}/Zn}=-0{,}76$ V; $E^\\circ_{Cu^{2+}/Cu}=0{,}34$ V).',['Kẽm bị oxi hoá.','Electron di chuyển từ Cu sang Zn qua dây dẫn.','Sức điện động chuẩn của pin là 1,10 V.','Khối lượng điện cực Cu giảm dần.'],'ĐSĐS');
    sa('hoa',12,'Ester – Lipid','TH','Có bao nhiêu ester đồng phân cấu tạo ứng với công thức phân tử C$_4$H$_8$O$_2$?','4');
    sa('hoa',12,'Carbohydrate','NB','Phân tử khối của glucose là bao nhiêu?','180');
    /* ---------- SINH HỌC 12 ---------- */
    mc('sinh',12,'Di truyền phân tử','NB','Đơn phân cấu tạo nên phân tử DNA là',['nucleotide','amino acid','glucose','acid béo'],0);
    mc('sinh',12,'Di truyền phân tử','NB','Bộ ba mở đầu trên mRNA là',['AUG','UAA','UAG','UGA'],0);
    mc('sinh',12,'Di truyền nhiễm sắc thể','TH','Phép lai Aa × Aa cho đời con có tỉ lệ kiểu gene là',['1AA : 2Aa : 1aa','3AA : 1aa','1Aa : 1aa','100% Aa'],0);
    mc('sinh',12,'Di truyền quần thể','TH','Một quần thể cân bằng di truyền có tần số allele a là $0{,}{a}$. Tần số kiểu gene aa là',['${=(a/10)^2}$','${=a/10}$','${=2*(a/10)*(1-a/10)}$','${=(1-a/10)^2}$'],0,'','a=2..4');
    mc('sinh',12,'Tiến hoá','NB','Nhân tố tiến hoá làm thay đổi tần số allele theo một hướng xác định là',['chọn lọc tự nhiên','đột biến','di – nhập gene','giao phối ngẫu nhiên'],0);
    mc('sinh',12,'Sinh thái học','NB','Giới hạn sinh thái là',['khoảng giá trị của một nhân tố sinh thái mà trong đó sinh vật tồn tại và phát triển','nơi ở của loài','tập hợp các cá thể cùng loài','môi trường sống của quần xã'],0);
    mc('sinh',12,'Di truyền nhiễm sắc thể','TH','Ở người ($2n=46$), thể ba (2n + 1) có số nhiễm sắc thể trong tế bào sinh dưỡng là',['47','45','69','48'],0);
    mc('sinh',12,'Di truyền nhiễm sắc thể','NB','Đột biến mất đoạn thuộc loại',['đột biến cấu trúc nhiễm sắc thể','đột biến số lượng nhiễm sắc thể','đột biến điểm','thường biến'],0);
    tf('sinh',12,'Di truyền phân tử','TH','Về quá trình nhân đôi DNA.',['Diễn ra theo nguyên tắc bổ sung và bán bảo toàn.','DNA polymerase tổng hợp mạch mới theo chiều 5\'→3\'.','Ở sinh vật nhân thực, mỗi DNA chỉ có một đơn vị tái bản.','Mạch mới tổng hợp liên tục được tổng hợp trên mạch khuôn có chiều 3\'→5\'.'],'ĐĐSĐ');
    tf('sinh',12,'Sinh thái học','TH','Về quần xã và hệ sinh thái.',['Quần xã gồm nhiều quần thể sinh vật khác loài.','Chuỗi thức ăn luôn bắt đầu bằng sinh vật sản xuất.','Năng lượng truyền qua các bậc dinh dưỡng bị thất thoát phần lớn.','Hiệu suất sinh thái giữa hai bậc dinh dưỡng thường khoảng 10%.'],'ĐSĐĐ');
    sa('sinh',12,'Di truyền nhiễm sắc thể','TH','Cơ thể có kiểu gene AaBbDd giảm phân bình thường tạo ra tối đa bao nhiêu loại giao tử?','8');
    sa('sinh',12,'Di truyền phân tử','TH','Một gene có {=300*k} cặp nucleotide. Tổng số nucleotide của gene là bao nhiêu?','{=600*k}','','k=2..9');
    /* ---------- TIẾNG ANH ---------- */
    const A='anh';
    mc(A,12,'Phonetics','NB','Choose the word whose underlined part is pronounced differently.',['w<u>ea</u>ther','h<u>ea</u>d','br<u>ea</u>d','m<u>ea</u>t'],3);
    mc(A,12,'Phonetics','NB','Choose the word that differs from the others in the position of primary stress.',['environment','information','economy','biology'],1);
    mc(A,12,'Grammar','NB','If I ______ you, I would accept the offer.',['were','am','will be','had'],0);
    mc(A,12,'Grammar','NB','She has lived in this city ______ 2015.',['since','for','in','from'],0);
    mc(A,12,'Grammar','TH','The man ______ car was stolen called the police.',['whose','who','which','whom'],0);
    mc(A,12,'Grammar','TH','English ______ in many countries around the world.',['is spoken','speaks','is speaking','spoke'],0);
    mc(A,12,'Vocabulary','TH','The government should take measures to protect ______ species.',['endangered','dangerous','danger','endanger'],0);
    mc(A,12,'Vocabulary','TH','Students should ______ an effort to learn new words every day.',['make','do','take','get'],0);
    mc(A,12,'Reading','VD','Read the passage: <i>"Artificial intelligence is changing the way students learn. Many schools now use AI tutors that give instant feedback, so learners can practise at their own pace. However, teachers remain essential to guide and motivate students."</i><br>What is the passage mainly about?',['The role of AI in learning and the importance of teachers','How to build an AI tutor','Why teachers will be replaced','The history of schools'],0);
    mc(A,12,'Writing','VD','Choose the sentence closest in meaning: "It isn\'t necessary for you to finish the report today."',['You don\'t have to finish the report today.','You mustn\'t finish the report today.','You should finish the report today.','You can\'t finish the report today.'],0);
    /* ---------- NGỮ VĂN ---------- */
    es('van',12,'Đọc hiểu','TH','<b>Đọc đoạn văn sau và trả lời câu hỏi:</b><br><i>"Mỗi cuốn sách là một ô cửa sổ. Mở nó ra, ta thấy những miền đất chưa từng đặt chân, gặp những con người chưa từng quen biết. Trong thời đại mà màn hình điện thoại chiếm gần hết thời gian rảnh, giữ được thói quen đọc sách là giữ cho tâm hồn mình một khoảng lặng để suy ngẫm."</i> (Văn bản do giáo viên biên soạn)<br>1. Xác định phương thức biểu đạt chính của đoạn văn.<br>2. Chỉ ra biện pháp tu từ trong câu đầu tiên và nêu tác dụng.<br>3. Theo tác giả, vì sao cần giữ thói quen đọc sách?<br>4. Anh/chị có đồng tình với quan điểm trên không? Vì sao?','1. Nghị luận (0,5đ). 2. So sánh/ẩn dụ "cuốn sách là ô cửa sổ" – nhấn mạnh sách mở rộng hiểu biết (1,0đ). 3. Giữ khoảng lặng để suy ngẫm giữa thời đại màn hình (1,0đ). 4. Nêu quan điểm, lí giải thuyết phục (1,5đ).',4);
    es('van',12,'Viết đoạn văn nghị luận','VD','Viết đoạn văn nghị luận (khoảng 200 chữ) trình bày suy nghĩ của anh/chị về ý nghĩa của việc tự học trong thời đại số.','Đảm bảo hình thức đoạn văn (0,25đ); xác định đúng vấn đề (0,25đ); triển khai: giải thích, ý nghĩa, dẫn chứng, phê phán, bài học (1,0đ); chính tả, ngữ pháp (0,25đ); sáng tạo (0,25đ).',2);
    es('van',12,'Viết bài văn nghị luận','VD','Viết bài văn nghị luận (khoảng 600 chữ) bàn về trách nhiệm của người trẻ đối với việc giữ gìn bản sắc văn hoá dân tộc trong bối cảnh hội nhập.','Bố cục đủ mở – thân – kết (0,25đ); xác định đúng vấn đề (0,5đ); triển khai luận điểm với lí lẽ, dẫn chứng (2,5đ); chính tả, ngữ pháp (0,25đ); sáng tạo (0,5đ).',4);
    /* ---------- LỊCH SỬ 12 ---------- */
    mc('su',12,'Thế giới sau năm 1945','NB','Tổ chức Liên hợp quốc được thành lập vào năm',['1945','1919','1949','1955'],0);
    mc('su',12,'Thế giới sau năm 1945','TH','Trật tự thế giới hai cực Ianta được hình thành sau',['Chiến tranh thế giới thứ hai','Chiến tranh thế giới thứ nhất','Chiến tranh lạnh kết thúc','Cách mạng tháng Mười Nga'],0);
    mc('su',12,'Cách mạng tháng Tám năm 1945','NB','Nước Việt Nam Dân chủ Cộng hoà ra đời ngày',['2/9/1945','19/8/1945','30/4/1975','7/5/1954'],0);
    mc('su',12,'Kháng chiến chống Pháp và chống Mỹ','TH','Thắng lợi của chiến dịch Điện Biên Phủ năm 1954 đã',['đập tan kế hoạch Nava, buộc Pháp kí Hiệp định Giơnevơ','buộc Mỹ rút quân khỏi miền Nam','kết thúc cuộc kháng chiến chống Mỹ','mở đầu cuộc kháng chiến toàn quốc'],0);
    mc('su',12,'Kháng chiến chống Pháp và chống Mỹ','NB','Hiệp định Pari về chấm dứt chiến tranh, lập lại hoà bình ở Việt Nam được kí kết năm',['1973','1968','1975','1954'],0);
    mc('su',12,'Công cuộc Đổi mới từ 1986','NB','Đường lối Đổi mới đất nước được Đảng Cộng sản Việt Nam đề ra tại',['Đại hội VI (12/1986)','Đại hội V (1982)','Đại hội VII (1991)','Đại hội IV (1976)'],0);
    mc('su',12,'Công cuộc Đổi mới từ 1986','TH','Việt Nam chính thức gia nhập ASEAN vào năm',['1995','1997','2000','2007'],0);
    mc('su',12,'Hồ Chí Minh trong lịch sử Việt Nam','NB','Nguyễn Tất Thành rời bến Nhà Rồng ra đi tìm đường cứu nước vào năm',['1911','1920','1930','1919'],0);
    tf('su',12,'Kháng chiến chống Pháp và chống Mỹ','TH','Về Chiến dịch Hồ Chí Minh năm 1975.',['Chiến dịch bắt đầu ngày 26/4/1975.','Chiến dịch kết thúc thắng lợi ngày 30/4/1975.','Đây là chiến dịch mở đầu cuộc Tổng tiến công và nổi dậy Xuân 1975.','Thắng lợi của chiến dịch tạo điều kiện giải phóng hoàn toàn miền Nam.'],'ĐĐSĐ','Chiến dịch mở đầu là Tây Nguyên.');
    tf('su',12,'Công cuộc Đổi mới từ 1986','TH','Về công cuộc Đổi mới ở Việt Nam.',['Công cuộc Đổi mới bắt đầu từ năm 1986.','Đổi mới lấy đổi mới kinh tế làm trọng tâm.','Đổi mới chuyển sang nền kinh tế kế hoạch hoá tập trung.','Việt Nam trở thành thành viên WTO năm 2007.'],'ĐĐSĐ');
    /* ---------- ĐỊA LÍ 12 ---------- */
    mc('dia',12,'Địa lí tự nhiên Việt Nam','NB','Khí hậu Việt Nam mang tính chất',['nhiệt đới ẩm gió mùa','ôn đới hải dương','cận nhiệt khô','xích đạo lục địa'],0);
    mc('dia',12,'Địa lí tự nhiên Việt Nam','NB','Đồng bằng có diện tích lớn nhất nước ta là',['Đồng bằng sông Cửu Long','Đồng bằng sông Hồng','Đồng bằng Thanh – Nghệ – Tĩnh','Đồng bằng Nam Trung Bộ'],0);
    mc('dia',12,'Địa lí tự nhiên Việt Nam','TH','Gió mùa Đông Bắc ảnh hưởng mạnh nhất đến khu vực',['Miền Bắc','Tây Nguyên','Nam Bộ','Duyên hải Nam Trung Bộ'],0);
    mc('dia',12,'Địa lí các ngành kinh tế','NB','Vùng dẫn đầu cả nước về sản lượng lúa là',['Đồng bằng sông Cửu Long','Đồng bằng sông Hồng','Bắc Trung Bộ','Tây Nguyên'],0);
    mc('dia',12,'Địa lí các vùng kinh tế','TH','Thế mạnh nổi bật của vùng Tây Nguyên là',['trồng cây công nghiệp lâu năm','khai thác dầu khí','đánh bắt hải sản xa bờ','trồng lúa nước'],0);
    mc('dia',12,'Địa lí dân cư','NB','Vùng có mật độ dân số cao nhất nước ta là',['Đồng bằng sông Hồng','Tây Nguyên','Trung du và miền núi Bắc Bộ','Đông Nam Bộ'],0);
    mc('dia',12,'Địa lí các vùng kinh tế','NB','Tỉnh An Giang thuộc vùng kinh tế',['Đồng bằng sông Cửu Long','Đông Nam Bộ','Tây Nguyên','Duyên hải Nam Trung Bộ'],0);
    tf('dia',12,'Địa lí các vùng kinh tế','TH','Về vùng Đồng bằng sông Cửu Long.',['Được bồi đắp bởi phù sa sông Mê Công.','Có diện tích đất phèn, đất mặn lớn.','Là vùng trọng điểm cà phê lớn nhất nước ta.','Chịu ảnh hưởng của xâm nhập mặn vào mùa khô.'],'ĐĐSĐ');
    tf('dia',12,'Địa lí tự nhiên Việt Nam','TH','Về khí hậu Việt Nam.',['Nhiệt độ trung bình năm trên 20°C (trừ vùng núi cao).','Lượng mưa trung bình năm phổ biến 1500 – 2000 mm.','Miền Nam có mùa đông lạnh kéo dài.','Có sự phân hoá theo mùa rõ rệt.'],'ĐĐSĐ');
    sa('dia',12,'Địa lí dân cư','VD','Năm 2023, dân số nước ta khoảng 100,3 triệu người, diện tích khoảng 331 nghìn km². Tính mật độ dân số (người/km², làm tròn đến hàng đơn vị).','303');
    sa('dia',12,'Địa lí các ngành kinh tế','VD','Một tỉnh có sản lượng lúa {a} nghìn tấn trên diện tích {b} nghìn ha. Tính năng suất lúa (tạ/ha, làm tròn đến hàng phần mười).','{=round(a*10/b,1)}','','a=300..900; b=50..120');
    /* ---------- TIN HỌC 12 ---------- */
    mc('tin',12,'Tạo trang web HTML/CSS','NB','Thẻ HTML dùng để tạo siêu liên kết là',['&lt;a&gt;','&lt;link&gt;','&lt;p&gt;','&lt;href&gt;'],0);
    mc('tin',12,'Tạo trang web HTML/CSS','NB','Thuộc tính CSS dùng để thay đổi màu chữ là',['color','font-color','text-color','background'],0);
    mc('tin',12,'Mạng máy tính','NB','Thiết bị dùng để kết nối các mạng khác nhau và định tuyến gói tin là',['Router','Switch','Hub','Repeater'],0);
    mc('tin',12,'Trí tuệ nhân tạo','TH','Trí tuệ nhân tạo hẹp (Narrow AI) là',['hệ thống AI được thiết kế để thực hiện một nhiệm vụ cụ thể','AI có trí tuệ vượt con người ở mọi lĩnh vực','robot có cảm xúc như con người','phần mềm diệt virus'],0);
    mc('tin',12,'Mạng máy tính','NB','Giao thức truyền tải siêu văn bản trên web là',['HTTP','FTP','SMTP','DNS'],0);
    mc('tin',12,'Đạo đức, pháp luật trong môi trường số','TH','Hành vi nào sau đây vi phạm đạo đức và pháp luật trên không gian mạng?',['Chia sẻ thông tin cá nhân của người khác khi chưa được phép','Đặt mật khẩu mạnh cho tài khoản','Trích dẫn nguồn khi sử dụng tài liệu','Báo cáo nội dung xấu độc'],0);
    tf('tin',12,'Tạo trang web HTML/CSS','TH','Về HTML và CSS.',['Thẻ &lt;p&gt; dùng để tạo đoạn văn.','Thẻ &lt;img&gt; cần thuộc tính src để chỉ đường dẫn ảnh.','Thẻ &lt;ul&gt; tạo danh sách có thứ tự.','Có thể nhúng CSS vào trang bằng thẻ &lt;style&gt;.'],'ĐĐSĐ');
    tf('tin',12,'Mạng máy tính','TH','Về mạng máy tính.',['Địa chỉ IPv4 có độ dài 32 bit.','LAN là mạng diện rộng.','Wi-Fi là công nghệ mạng không dây.','Switch dùng để kết nối các thiết bị trong một mạng cục bộ.'],'ĐSĐĐ');
    /* ---------- GDKT&PL 12 ---------- */
    mc('gdktpl',12,'Tăng trưởng và phát triển kinh tế','NB','Tăng trưởng kinh tế là',['sự gia tăng quy mô sản lượng của nền kinh tế trong một thời gian nhất định','sự thay đổi cơ cấu dân số','sự gia tăng giá cả hàng hoá','sự giảm tỉ lệ thất nghiệp'],0);
    mc('gdktpl',12,'Bảo hiểm và an sinh xã hội','NB','Loại hình bảo hiểm do Nhà nước tổ chức mà người lao động và người sử dụng lao động phải tham gia là',['bảo hiểm xã hội bắt buộc','bảo hiểm thương mại','bảo hiểm xã hội tự nguyện','bảo hiểm tài sản'],0);
    mc('gdktpl',12,'Hội nhập kinh tế quốc tế','TH','Hội nhập kinh tế quốc tế song phương là sự liên kết kinh tế giữa',['hai quốc gia','các quốc gia trong một khu vực','tất cả các nước trên thế giới','các doanh nghiệp trong nước'],0);
    mc('gdktpl',12,'Quyền và nghĩa vụ công dân','NB','Công dân Việt Nam có quyền bầu cử khi đủ',['18 tuổi','16 tuổi','20 tuổi','21 tuổi'],0);
    mc('gdktpl',12,'Bảo hiểm và an sinh xã hội','TH','Vai trò của an sinh xã hội là',['bảo đảm đời sống cho người dân khi gặp rủi ro, khó khăn','tăng lợi nhuận cho doanh nghiệp','thay thế hoàn toàn thu nhập từ lao động','hạn chế quyền tự do kinh doanh'],0);
    mc('gdktpl',12,'Pháp luật quốc tế','NB','Công ước của Liên hợp quốc về Luật biển được thông qua năm',['1982','1945','1992','2002'],0);
    tf('gdktpl',12,'Bảo hiểm và an sinh xã hội','TH','Về bảo hiểm.',['Bảo hiểm y tế là chính sách xã hội do Nhà nước tổ chức thực hiện.','Bảo hiểm thương mại bắt buộc với mọi công dân.','Người tham gia bảo hiểm xã hội tự nguyện được lựa chọn mức đóng.','Bảo hiểm giúp chia sẻ rủi ro trong cộng đồng.'],'ĐSĐĐ');
    tf('gdktpl',12,'Quyền và nghĩa vụ công dân','TH','Về quyền bầu cử và ứng cử.',['Công dân đủ 18 tuổi có quyền bầu cử.','Công dân đủ 21 tuổi có quyền ứng cử.','Cử tri có thể nhờ người khác bỏ phiếu thay trong mọi trường hợp.','Bầu cử được thực hiện theo nguyên tắc bỏ phiếu kín.'],'ĐĐSĐ');
    d.questions=Q;
    /* ---------- Người dùng, lớp ---------- */
    d.users=[{id:'u_admin',username:'admin',pw:hashPw('admin123'),name:'Quản trị hệ thống',role:'admin',createdAt:now},
             {id:'u_gv1',username:'gv.toan',pw:hashPw('123456'),name:'Lương Khánh Tường',role:'teacher',subjects:['toan'],createdAt:now}];
    d.classes=[{id:'c_12a1',name:'12A1',grade:12,year:'2026-2027',teacherId:'u_gv1',code:'12A1-LKT'},{id:'c_12a2',name:'12A2',grade:12,year:'2026-2027',teacherId:'u_gv1',code:'12A2-LKT'}];
    const names=['Nguyễn Văn An','Trần Thị Bình','Lê Hoàng Châu','Phạm Minh Đức','Võ Thị Hà','Huỳnh Gia Huy','Đặng Ngọc Khánh','Bùi Thanh Lam','Ngô Phương Mai','Dương Quốc Nam'];
    names.forEach((n,i)=>d.users.push({id:'u_hs'+(i+1),username:'hs'+String(i+1).padStart(2,'0'),pw:hashPw('123456'),name:n,role:'student',classId:i<6?'c_12a1':'c_12a2',createdAt:now}));
    d.lessons=[
      {id:'l1',title:'Ứng dụng đạo hàm – Tính đơn điệu và cực trị',subject:'toan',grade:12,topic:T1,type:'video',url:'https://www.youtube.com/watch?v=WUvTyaaNkzM',content:'<p>Video bài giảng về đạo hàm. Sau khi xem, các em làm phiếu luyện tập ở mục Bài tập.</p>',classIds:['c_12a1','c_12a2'],createdBy:'u_gv1',createdAt:now},
      {id:'l2',title:'Nguyên hàm – Bảng nguyên hàm cơ bản',subject:'toan',grade:12,topic:T2,type:'html',content:'<h3>Bảng nguyên hàm cơ bản</h3><ul><li>$\\int x^\\alpha dx=\\dfrac{x^{\\alpha+1}}{\\alpha+1}+C\\ (\\alpha\\ne-1)$</li><li>$\\int \\dfrac1x dx=\\ln|x|+C$</li><li>$\\int e^x dx=e^x+C$</li><li>$\\int \\cos x\\,dx=\\sin x+C$</li><li>$\\int \\sin x\\,dx=-\\cos x+C$</li></ul><p><b>Ví dụ:</b> $\\int (3x^2+2x)dx=x^3+x^2+C$.</p>',classIds:['c_12a1','c_12a2'],createdBy:'u_gv1',createdAt:now},
      {id:'l3',title:'Tài liệu: Cấu trúc đề thi tốt nghiệp THPT môn Toán',subject:'toan',grade:12,topic:'',type:'link',url:'https://moet.gov.vn',content:'<p>Đọc kĩ cấu trúc 3 phần: 12 câu trắc nghiệm, 4 câu Đúng/Sai, 6 câu trả lời ngắn.</p>',classIds:['c_12a1'],createdBy:'u_gv1',createdAt:now}];
    d.announcements=[{id:'a1',title:'Chào mừng năm học mới 2026 – 2027',body:'Các em đăng nhập, đổi mật khẩu và hoàn thành bài kiểm tra khảo sát đầu năm.',classIds:['c_12a1','c_12a2'],createdBy:'u_gv1',createdAt:now}];
    if(typeof SEED2!=='undefined') SEED2.add(d); d.seedVersion=SEED_VERSION;
    d._seedPending=true; // tạo ma trận/đề/giao bài mẫu khi exam.js sẵn sàng
  },
  finish(d){ if(!d._seedPending||typeof Exam==='undefined') return; delete d._seedPending;
    const mx=Exam.defaultMatrix('toan',12,'Ma trận đề kiểm tra Toán 12 – chuẩn 2025'); mx.id='mx_toan12'; d.matrices.push(mx);
    const built=Exam.buildFromMatrix(mx,{autoClone:true}); d.questions.push(...built.newQuestions);
    const ex={id:'ex_demo',title:'Đề khảo sát đầu năm – Toán 12',subject:'toan',grade:12,duration:90,questionIds:built.questionIds,matrixId:mx.id,createdBy:'u_gv1',createdAt:Date.now(),variants:[]};
    Exam.mix(ex,4); d.exams.push(ex);
    const now=Date.now();
    d.assignments.push({id:'as_demo',examId:ex.id,title:ex.title,classIds:['c_12a1','c_12a2'],start:now-86400000,end:now+7*86400000,duration:90,attempts:1,showResult:true,showAnswer:true,createdBy:'u_gv1',createdAt:now});
    // minh hoạ vài bài nộp
    ['u_hs1','u_hs2','u_hs3','u_hs7'].forEach((sid,i)=>{ const u=d.users.find(x=>x.id===sid); const v=ex.variants[i%ex.variants.length];
      const items=Exam.items(ex,v); const ans={}; const rnd=seededRandom(sid);
      items.forEach(it=>{ const q=it.q; const good=rnd()<[.85,.7,.55,.75][i];
        if(q.type==='mcq') ans[q.id]= good?q.answer:(q.answer+1)%4;
        else if(q.type==='tf') ans[q.id]=q.answer.map(x=>rnd()<.8?x:!x);
        else if(q.type==='short') ans[q.id]= good?q.answer:'0'; });
      const g=Exam.grade(ex,v,ans); const cls=d.classes.find(c=>c.id===u.classId);
      d.submissions.push({id:uid('s'),assignmentId:'as_demo',examId:ex.id,studentId:sid,studentName:u.name,className:cls?cls.name:'',variant:v.code,answers:ans,score:g.score,detail:g.detail,status:g.pending?'pending':'graded',startedAt:now-3600000*(i+2),submittedAt:now-3600000*(i+1),updatedAt:now}); });
    d.progress.push({studentId:'u_hs1',lessonId:'l1',done:true,at:now,updatedAt:now},{studentId:'u_hs1',lessonId:'l2',done:true,at:now,updatedAt:now},{studentId:'u_hs2',lessonId:'l1',done:true,at:now,updatedAt:now});
  }
};
