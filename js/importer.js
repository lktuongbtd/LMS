/* LMS LKT – importer.js: NHẬP ĐỀ từ Word (.docx) / PDF / Ảnh – chuẩn hoá trực tuyến, nhận dạng (AI Gemini hoặc OCR), cắt hình
 * Tác giả: Lương Khánh Tường – ĐT/Zalo 0916780807 */
'use strict';
/* ================= OMML (công thức Word) → LaTeX ================= */
const Omml = (()=>{
  const GR={'α':'alpha','β':'beta','γ':'gamma','δ':'delta','ε':'varepsilon','ζ':'zeta','η':'eta','θ':'theta','ι':'iota','κ':'kappa','λ':'lambda','μ':'mu','ν':'nu','ξ':'xi','π':'pi','ρ':'rho','σ':'sigma','τ':'tau','υ':'upsilon','φ':'varphi','ϕ':'phi','χ':'chi','ψ':'psi','ω':'omega','Γ':'Gamma','Δ':'Delta','∆':'Delta','Θ':'Theta','Λ':'Lambda','Ξ':'Xi','Π':'Pi','Σ':'Sigma','Φ':'Phi','Ψ':'Psi','Ω':'Omega'};
  const SYM={'≤':'\\le ','≥':'\\ge ','≠':'\\ne ','±':'\\pm ','∓':'\\mp ','×':'\\times ','÷':'\\div ','·':'\\cdot ','⋅':'\\cdot ','∞':'\\infty ','→':'\\to ','⇒':'\\Rightarrow ','⇔':'\\Leftrightarrow ','⟺':'\\Leftrightarrow ','⟹':'\\Rightarrow ','←':'\\leftarrow ','↔':'\\leftrightarrow ','∈':'\\in ','∉':'\\notin ','⊂':'\\subset ','⊃':'\\supset ','⊆':'\\subseteq ','∪':'\\cup ','∩':'\\cap ','∅':'\\varnothing ','∀':'\\forall ','∃':'\\exists ','°':'^\\circ ','∠':'\\angle ','⊥':'\\perp ','∥':'\\parallel ','//':'\\parallel ','≈':'\\approx ','≡':'\\equiv ','∼':'\\sim ','…':'\\ldots ','⋯':'\\cdots ','′':"'",'″':"''",'ℝ':'\\mathbb{R}','ℕ':'\\mathbb{N}','ℤ':'\\mathbb{Z}','ℚ':'\\mathbb{Q}','ℂ':'\\mathbb{C}','−':'-','∗':'*','∣':'|','‖':'\\|','⊕':'\\oplus ','∘':'\\circ ','∖':'\\setminus ','≔':':='};
  const FN=new Set(['sin','cos','tan','cot','ln','log','lim','max','min','exp','arcsin','arccos','arctan','sinh','cosh','tanh','det','gcd']);
  const kids=n=>n?[...n.childNodes].filter(x=>x.nodeType===1):[];
  const ln=n=>n.localName;
  const ch=(n,name)=>kids(n).find(x=>ln(x)===name);
  const val=(n,name)=>{ const c=ch(n,name); return c?(c.getAttribute('m:val')??c.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/math','val')):null; };
  const prop=(n,pn,name)=>{ const p=ch(n,pn); return p?val(p,name):null; };
  const grp=s=>{ s=s.trim(); return s.length===1||/^\\[a-zA-Z]+$/.test(s)?s:`{${s}}`; };
  function text(s,nor){ if(nor||(/[A-Za-zÀ-ỹ]{2,}/.test(s)&&/[À-ỹ]/.test(s))) return `\\text{${s.replace(/([{}%#&])/g,'\\$1')}}`;
    let o=''; for(const c of s){ if(GR[c]) o+='\\'+GR[c]+' '; else if(SYM[c]) o+=SYM[c]; else if('{}%#&'.includes(c)) o+='\\'+c; else if(c==='\u00a0') o+='~'; else o+=c; } return o; }
  function conv(n){ if(!n) return ''; switch(ln(n)){
    case 'oMathPara': return kids(n).filter(x=>ln(x)==='oMath').map(conv).join(' \\\\ ');
    case 'oMath': case 'e': case 'num': case 'den': case 'sub': case 'sup': case 'deg': case 'lim': case 'fName': case 'box': case 'borderBox': case 'phant': return kids(n).map(conv).join('');
    case 'r': { const t=kids(n).filter(x=>ln(x)==='t').map(x=>x.textContent).join(''); const rp=ch(n,'rPr'); const nor=rp&&ch(rp,'nor'); const s=t.trim(); if(FN.has(s)) return '\\'+s+' '; return text(t,!!nor); }
    case 'f': { const ty=prop(n,'fPr','type'); const a=conv(ch(n,'num')), b=conv(ch(n,'den')); return ty==='lin'?`${grp(a)}/${grp(b)}`:ty==='noBar'?`\\genfrac{}{}{0pt}{}{${a}}{${b}}`:`\\dfrac{${a}}{${b}}`; }
    case 'sSup': return `${grp(conv(ch(n,'e')))}^{${conv(ch(n,'sup'))}}`;
    case 'sSub': return `${grp(conv(ch(n,'e')))}_{${conv(ch(n,'sub'))}}`;
    case 'sSubSup': return `${grp(conv(ch(n,'e')))}_{${conv(ch(n,'sub'))}}^{${conv(ch(n,'sup'))}}`;
    case 'sPre': return `{}_{${conv(ch(n,'sub'))}}^{${conv(ch(n,'sup'))}}${conv(ch(n,'e'))}`;
    case 'rad': { const hide=prop(n,'radPr','degHide'); const d=conv(ch(n,'deg')); return (hide==='1'||hide==='on'||!d.trim())?`\\sqrt{${conv(ch(n,'e'))}}`:`\\sqrt[${d}]{${conv(ch(n,'e'))}}`; }
    case 'd': { const pr=ch(n,'dPr'); let b=pr&&val(pr,'begChr'), e=pr&&val(pr,'endChr'); const sep=(pr&&val(pr,'sepChr'))||'|'; if(b==null) b='('; if(e==null) e=')';
      const m=c=>c===''?'.':c==='{'?'\\{':c==='}'?'\\}':c==='⌊'?'\\lfloor ':c==='⌋'?'\\rfloor ':c==='⌈'?'\\lceil ':c==='⌉'?'\\rceil ':c==='〈'||c==='⟨'?'\\langle ':c==='〉'||c==='⟩'?'\\rangle ':c==='‖'?'\\|':c;
      return `\\left${m(b)}${kids(n).filter(x=>ln(x)==='e').map(conv).join(sep)}\\right${m(e)}`; }
    case 'nary': { const pr=ch(n,'naryPr'); const c=(pr&&val(pr,'chr'))||'∫'; const cmd={'∫':'\\int','∬':'\\iint','∭':'\\iiint','∮':'\\oint','∑':'\\sum','∏':'\\prod','⋃':'\\bigcup','⋂':'\\bigcap'}[c]||c;
      const sb=conv(ch(n,'sub')), sp=conv(ch(n,'sup')); return `${cmd}${sb.trim()?`_{${sb}}`:''}${sp.trim()?`^{${sp}}`:''} ${conv(ch(n,'e'))}`; }
    case 'acc': { const c=prop(n,'accPr','chr')||'\u0302'; const e=conv(ch(n,'e')); const long=e.replace(/\\[a-z]+|[{} ]/gi,'').length>1;
      const cmd={'\u20D7':long?'\\overrightarrow':'\\vec','\u2192':'\\overrightarrow','\u20D6':'\\overleftarrow','\u0302':long?'\\widehat':'\\hat','^':long?'\\widehat':'\\hat','\u0303':long?'\\widetilde':'\\tilde','~':'\\tilde','\u0305':'\\overline','\u00AF':'\\overline','\u0304':'\\bar','\u0307':'\\dot','\u0308':'\\ddot','\u030C':'\\check','\u0306':'\\breve'}[c]||'\\hat'; return `${cmd}{${e}}`; }
    case 'bar': return `${prop(n,'barPr','pos')==='bot'?'\\underline':'\\overline'}{${conv(ch(n,'e'))}}`;
    case 'groupChr': { const pr=ch(n,'groupChrPr'); const c=(pr&&val(pr,'chr'))||'⏟'; const e=conv(ch(n,'e')); return c==='⏞'?`\\overbrace{${e}}`:c==='⏟'?`\\underbrace{${e}}`:e; }
    case 'func': { const f=conv(ch(n,'fName')).trim(); const nm=f.replace(/\\text\{([a-z]+)\}/,'$1'); return `${FN.has(nm)?'\\'+nm+' ':f}${conv(ch(n,'e'))}`; }
    case 'limLow': { const e=conv(ch(n,'e')).trim(), l=conv(ch(n,'lim')); return /^\\(lim|max|min)/.test(e)?`${e.trim()}_{${l}} `:`\\underset{${l}}{${e}}`; }
    case 'limUpp': return `\\overset{${conv(ch(n,'lim'))}}{${conv(ch(n,'e'))}}`;
    case 'eqArr': return `\\begin{array}{l}${kids(n).filter(x=>ln(x)==='e').map(conv).join(' \\\\ ')}\\end{array}`;
    case 'm': return `\\begin{matrix}${kids(n).filter(x=>ln(x)==='mr').map(r=>kids(r).filter(x=>ln(x)==='e').map(conv).join(' & ')).join(' \\\\ ')}\\end{matrix}`;
    case 'rPr': case 'ctrlPr': case 'fPr': case 'dPr': case 'naryPr': case 'accPr': case 'barPr': case 'radPr': case 'sSupPr': case 'sSubPr': case 'sSubSupPr': case 'funcPr': case 'limLowPr': case 'limUppPr': case 'eqArrPr': case 'mPr': case 'groupChrPr': case 'boxPr': case 'borderBoxPr': case 'phantPr': case 'sPrePr': return '';
    default: return kids(n).map(conv).join(''); } }
  return {toTex:n=>{ let t=conv(n).replace(/\s+/g,' ').replace(/\s+([}^_])/g,'$1').trim(); if(/\\i+nt|\\oint/.test(t)) t=t.replace(/([^\\\s{(])\s?d([xtuyzθ])(?![a-zA-Z])/g,'$1\\,d$2'); return t; }};
})();

/* ================= Ảnh: thu nhỏ để tiết kiệm bộ nhớ ================= */
function shrinkImage(src,maxW=720){ return new Promise(res=>{ const img=new Image(); img.onload=()=>{ const k=Math.min(1,maxW/img.naturalWidth); const c=document.createElement('canvas'); c.width=Math.round(img.naturalWidth*k)||1; c.height=Math.round(img.naturalHeight*k)||1; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(img,0,0,c.width,c.height);
  const png=c.toDataURL('image/png'), jpg=c.toDataURL('image/jpeg',.85); res(png.length<jpg.length*1.3?png:jpg); }; img.onerror=()=>res(null); img.src=src; }); }
const fileToDataURL=f=>new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); });

/* ================= Word (.docx) → văn bản mẫu chuẩn ================= */
const DocxIn = (()=>{
  const W='http://schemas.openxmlformats.org/wordprocessingml/2006/main', R='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const kids=n=>[...n.childNodes].filter(x=>x.nodeType===1); const ln=n=>n.localName;
  const att=(n,a)=>n.getAttribute('w:'+a)??n.getAttributeNS(W,a);
  const isRed=hex=>{ if(!hex||hex==='auto') return false; const m=hex.match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i); if(!m) return false; const [r,g,b]=[1,2,3].map(i=>parseInt(m[i],16)); return r>=150&&g<=90&&b<=90; };
  async function parse(file){
    const zip=await JSZip.loadAsync(file); const xml=async p=>{ const f=zip.file(p); return f?new DOMParser().parseFromString(await f.async('string'),'application/xml'):null; };
    const doc=await xml('word/document.xml'); if(!doc) throw new Error('Không phải file Word .docx hợp lệ');
    const relsDoc=await xml('word/_rels/document.xml.rels'); const rels={}; if(relsDoc) [...relsDoc.getElementsByTagName('Relationship')].forEach(r=>rels[r.getAttribute('Id')]=r.getAttribute('Target'));
    // đánh số tự động
    const numDoc=await xml('word/numbering.xml'); const absMap={}, numMap={}, counters={};
    if(numDoc){ [...numDoc.getElementsByTagNameNS(W,'abstractNum')].forEach(a=>{ const id=att(a,'abstractNumId'); absMap[id]={}; [...a.getElementsByTagNameNS(W,'lvl')].forEach(l=>{ const g=t=>{ const e=l.getElementsByTagNameNS(W,t)[0]; return e?att(e,'val'):null; }; absMap[id][att(l,'ilvl')]={fmt:g('numFmt'),text:g('lvlText')||'',start:+(g('start')||1)}; }); });
      [...numDoc.getElementsByTagNameNS(W,'num')].forEach(n=>{ const a=n.getElementsByTagNameNS(W,'abstractNumId')[0]; if(a) numMap[att(n,'numId')]=att(a,'val'); }); }
    const fmtNum=(v,f)=>f==='upperLetter'?String.fromCharCode(64+v):f==='lowerLetter'?String.fromCharCode(96+v):f==='upperRoman'?['','I','II','III','IV','V','VI','VII','VIII','IX','X'][v]||v:f==='lowerRoman'?['','i','ii','iii','iv','v','vi'][v]||v:f==='bullet'?'•':String(v);
    const imgs=[], warn=new Set(); const media={}; const stat={};
    async function image(rid){ const t=rels[rid]; if(!t) return ''; const path=('word/'+t).replace(/word\/\.\.\//,''); if(media[path]!=null) return `[[img:${media[path]}]]`;
      const f=zip.file(path); if(!f) return ''; const ext=path.split('.').pop().toLowerCase();
      if(['wmf','emf'].includes(ext)){ warn.add('mathtype'); return '[[MathType]]'; }
      const b64=await f.async('base64'); const mime=ext==='jpg'?'jpeg':ext==='svg'?'svg+xml':ext; const small=await shrinkImage(`data:image/${mime};base64,${b64}`); if(!small) return '';
      imgs.push(small); media[path]=imgs.length-1; return `[[img:${imgs.length-1}]]`; }
    async function runSegs(node,out){ for(const c of kids(node)){ const n=ln(c);
        if(n==='r'){ const rp=kids(c).find(x=>ln(x)==='rPr'); const f={}; if(rp){ for(const p of kids(rp)){ const pn=ln(p), v=att(p,'val');
              if(pn==='u'&&v&&v!=='none') f.u=1; if(pn==='color'&&isRed(v)) f.red=1; if(pn==='highlight'&&v&&v!=='none') f.hl=1; if(pn==='shd'&&/^(FFFF00|FF0)/i.test(att(p,'fill')||'')) f.hl=1; } }
          for(const k of kids(c)){ const kn=ln(k);
            if(kn==='t') out.push({t:k.textContent,...f}); else if(kn==='tab') out.push({t:'\t'}); else if(kn==='br'||kn==='cr') out.push({t:'\n'}); else if(kn==='noBreakHyphen') out.push({t:'-'});
            else if(kn==='sym'){ const code=parseInt(att(k,'char')||'0',16); const map={0xB3:'≥',0xA3:'≤',0xB9:'≠',0xB1:'±',0xD0:'∠',0x5E:'⊥',0xDE:'⇒',0xDB:'⇔',0xAE:'→',0xCE:'∈',0xCF:'∉',0x70:'π',0x44:'Δ',0xA5:'∞'}; out.push({t:map[code&0xFF]||String.fromCharCode(code>0xF000?code-0xF000:code),...f}); }
            else if(kn==='drawing'){ const bl=k.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main','blip')[0]; if(bl){ const rid=bl.getAttributeNS(R,'embed')||bl.getAttribute('r:embed'); out.push({t:' '+await image(rid)+' '}); } }
            else if(kn==='pict'||kn==='object'){ const im=k.getElementsByTagName('v:imagedata')[0]; const isEq=/Equation|MathType/i.test(k.innerHTML||new XMLSerializer().serializeToString(k));
              if(isEq){ let tex=null; try{ const ole=k.getElementsByTagNameNS('urn:schemas-microsoft-com:office:office','OLEObject')[0]; const rid=ole&&(ole.getAttributeNS(R,'id')||ole.getAttribute('r:id')); const t=rid&&rels[rid];
                  const fz=t&&zip.file(('word/'+t).replace(/word\/\.\.\//,'')); if(fz&&typeof MathTypeOLE!=='undefined') tex=MathTypeOLE.toTex(await fz.async('uint8array')); }catch(e){ console.warn('MathType',e); tex=null; }
                if(tex){ stat.mt=(stat.mt||0)+1; out.push({t:'$'+tex+'$',math:1,...f}); } else { warn.add('mathtype'); out.push({t:' [[MathType]] '}); } } else if(im){ const rid=im.getAttributeNS(R,'id')||im.getAttribute('r:id'); out.push({t:' '+await image(rid)+' '}); } } } }
        else if(n==='oMath'){ out.push({t:'$'+Omml.toTex(c)+'$',math:1}); }
        else if(n==='oMathPara'){ kids(c).filter(x=>ln(x)==='oMath').forEach(m=>out.push({t:' $'+Omml.toTex(m)+'$ ',math:1})); }
        else if(['hyperlink','ins','smartTag','sdt','sdtContent','fldSimple','customXml','moveTo'].includes(n)) await runSegs(c,out);
      } }
    const lines=[];
    async function para(p){ const segs=[]; const pPr=kids(p).find(x=>ln(x)==='pPr'); let prefix='';
      if(pPr){ const np=kids(pPr).find(x=>ln(x)==='numPr'); if(np){ const il=kids(np).find(x=>ln(x)==='ilvl'), ni=kids(np).find(x=>ln(x)==='numId'); const numId=ni?att(ni,'val'):null, ilvl=il?att(il,'val'):'0';
          const lv=numId&&absMap[numMap[numId]]&&absMap[numMap[numId]][ilvl]; if(lv&&lv.fmt!=='bullet'&&lv.fmt!=='none'){ const key=numId+'|'+ilvl; counters[key]=(counters[key]??lv.start-1)+1; Object.keys(counters).forEach(k=>{ const [nid,l]=k.split('|'); if(nid===numId&&+l>+ilvl) delete counters[k]; });
            prefix=lv.text.replace(/%(\d)/g,(_,d)=>fmtNum(counters[numId+'|'+(+d-1)]??1,(absMap[numMap[numId]][+d-1]||lv).fmt))+' '; } } }
      await runSegs(p,segs); if(prefix) segs.unshift({t:prefix,auto:1});
      // tách theo xuống dòng mềm
      let cur=[]; segs.forEach(s=>{ if(s.t==='\n'){ lines.push(cur); cur=[]; } else cur.push(s); }); lines.push(cur); }
    async function block(node){ for(const c of kids(node)){ const n=ln(c); if(n==='p') await para(c); else if(n==='tbl'){ for(const tr of kids(c).filter(x=>ln(x)==='tr')) for(const tc of kids(tr).filter(x=>ln(x)==='tc')) await block(tc); } else if(['sdt','sdtContent','customXml'].includes(n)) await block(c); } }
    await block(doc.getElementsByTagNameNS(W,'body')[0]);
    return {lines,imgs,warn:[...warn],mt:stat.mt||0};
  }
  /* Đoạn có định dạng → dòng văn bản mẫu, nhận diện đáp án gạch chân / tô đỏ / tô vàng */
  function toText({lines}){
    const out=[]; let mode='', qn=0;
    const marked=(segs,a,b)=>{ let pos=0; for(const s of segs){ const e=pos+s.t.length; if(e>a&&pos<b&&(s.u||s.red||s.hl)&&s.t.trim()) return true; pos=e; } return false; };
    for(const segs of lines){ const txt=segs.map(s=>s.t).join(''); const line=txt.replace(/\u00a0/g,' ').replace(/[ ]+/g,' ').trim(); if(!line) { out.push(''); continue; }
      const P=line.match(/^PH[ẦA]N\s+(I{1,3}|IV|[1-4])\b/i); if(P){ const l=noAccent(line).toLowerCase(); mode=/dung\s*sai/.test(l)?'tf':/tra loi ngan/.test(l)?'short':/tu luan/.test(l)?'essay':'mcq'; out.push('# '+line); continue; }
      const C=line.match(/^(Câu|Bài|Question)\s*(\d+)\s*[.:)]?\s*/i);
      if(C){ qn=+C[2]; const tag=mode==='tf'?' [Đúng/Sai]':mode==='short'?' [Trả lời ngắn]':mode==='essay'?' [Tự luận]':'';
        const rest=line.slice(C[0].length); const om=findOpts(txt); if(om.length>=2){ out.push(`Câu ${qn}${tag}: ${rest.slice(0,rest.search(/\b[A-D][.)]/)).trim()}`); pushOpts(txt,segs,om); } else out.push(`Câu ${qn}${tag}: ${rest}`); continue; }
      const om=findOpts(txt); if(om.length){ pushOpts(txt,segs,om); continue; }
      const T=txt.match(/^\s*([a-d])\)\s*/); if(T){ out.push(`${T[1]}) ${txt.slice(T[0].length).replace(/\s+/g,' ').trim()} {{TF:${marked(segs,0,txt.length)?1:0}}}`); continue; }
      out.push(line); }
    function findOpts(t){ const r=[]; const re=/(^|[\s\t])([A-D])[.)]\s*/g; let m; while((m=re.exec(t))){ r.push({i:m.index+m[1].length,k:m[2],h:m[0].length-m[1].length}); } // phải theo thứ tự A,B,C,D
      const seq=[]; let need='A'; for(const o of r){ if(o.k===need){ seq.push(o); need=String.fromCharCode(need.charCodeAt(0)+1); } } return seq.length>=2&&seq[0].k==='A'?seq:(r.length===1&&/^[\s\t]*[A-D][.)]/.test(t)?r:[]); }
    function pushOpts(t,segs,om){ om.forEach((o,i)=>{ const end=i+1<om.length?om[i+1].i:t.length; const body=t.slice(o.i+o.h,end).replace(/\s+/g,' ').trim(); out.push(`${marked(segs,o.i,end)?'*':''}${o.k}. ${body}`); }); }
    // Đúng/Sai: chỉ ghi (Đ)/(S) nếu câu đó có đánh dấu
    let txt=out.join('\n'); txt=txt.split(/(?=^Câu \d+)/m).map(b=>/\{\{TF:1\}\}/.test(b)?b.replace(/\{\{TF:1\}\}/g,'(Đ)').replace(/\{\{TF:0\}\}/g,'(S)'):b.replace(/ ?\{\{TF:[01]\}\}/g,'')).join('');
    return applyKeyTable(txt);
  }
  /* Bảng đáp án cuối đề: "1.A 2.C ..." áp vào câu trắc nghiệm chưa có đáp án */
  function applyKeyTable(t){ const i=t.search(/^#?\s*(BẢNG ĐÁP ÁN|ĐÁP ÁN)\b/mi); if(i<0) return t; const key={}; t.slice(i).replace(/(\d{1,2})\s*[.:\-–]?\s*([A-D])\b/g,(_,n,k)=>{ if(!key[n]) key[n]=k; });
    if(Object.keys(key).length<3) return t; let part=0; return t.slice(0,i).split(/(?=^Câu \d+|^# )/m).map(b=>{ if(/^# /.test(b)){ part++; return b; } const m=b.match(/^Câu (\d+)(?![^\n]*\[)/); if(!m||part>1||/^\*[A-D]\./m.test(b)||!key[m[1]]) return b; return b.replace(new RegExp('^('+key[m[1]]+')\\.','m'),'*$1.'); }).join('')+t.slice(i); }
  return {parse,toText};
})();

/* ================= Chuẩn hoá văn bản nhập ================= */
function normalizeImportText(t){
  return String(t||'').replace(/\r/g,'').replace(/[\u00a0\t]+/g,' ').replace(/[ ]{2,}/g,' ')
    .replace(/^\s*(Câu|Bài|Question)\s*(\d+)\s*[.:)]?\s*(\[[^\]]*\])?\s*[:.]?\s*/gmi,(m,a,n,tag)=>`Câu ${n}${tag?' '+tag:''}: `)
    .replace(/^(\*?)\s*([A-D])\s*[:)]\s+/gm,'$1$2. ')
    .replace(/^((?:\*?[A-D]\.)[^\n]*?)\s+(?=\*?[B-D]\.\s)/gm,'$1\n').replace(/^((?:\*?[A-D]\.)[^\n]*?)\s+(?=\*?[B-D]\.\s)/gm,'$1\n').replace(/^((?:\*?[A-D]\.)[^\n]*?)\s+(?=\*?[B-D]\.\s)/gm,'$1\n')
    .replace(/^\s*(Đáp án đúng|Đáp án|ĐA|Đáp số|ĐS|Trả lời)\s*[:：]\s*/gmi,'Đáp án: ')
    .replace(/^\s*(Lời giải|Hướng dẫn giải|Hướng dẫn|HD|Giải)\s*[:：.]?\s*$/gmi,'Lời giải:')
    .replace(/^\s*(Lời giải|Hướng dẫn giải|HD giải)\s*[:：.]\s*/gmi,'Lời giải: ')
    .replace(/^\s*Chọn\s+(?:đáp án\s+)?([A-D])\s*\.?\s*$/gmi,'Đáp án: $1')
    .replace(/\n{3,}/g,'\n\n').trim()+'\n'; }

/* ================= Nhận dạng: PDF, OCR, AI ================= */
const Recog = {
  loadScript(src){ return new Promise((res,rej)=>{ if([...document.scripts].some(s=>s.src===src)) return res(); const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=()=>rej(new Error('Không tải được thư viện '+src.split('/').pop()+' (kiểm tra mạng)')); document.head.appendChild(s); }); },
  async pdfPages(file,onProg){ await this.loadScript(new URL('assets/vendor/pdfjs/pdf.min.js',location.href).href); pdfjsLib.GlobalWorkerOptions.workerSrc=new URL('assets/vendor/pdfjs/pdf.worker.min.js',location.href).href;
    const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise; const pages=[];
    for(let i=1;i<=pdf.numPages;i++){ onProg&&onProg(`Đang đọc trang ${i}/${pdf.numPages}…`); const pg=await pdf.getPage(i); const vp=pg.getViewport({scale:2}); const c=document.createElement('canvas'); c.width=vp.width; c.height=vp.height; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,c.width,c.height); await pg.render({canvasContext:g,viewport:vp}).promise;
      const tc=await pg.getTextContent(); let txt='', lastY=null; tc.items.forEach(it=>{ const y=Math.round(it.transform[5]); if(lastY!==null&&Math.abs(y-lastY)>4) txt+='\n'; else if(txt&&!txt.endsWith(' ')) txt+=' '; txt+=it.str; lastY=y; });
      pages.push({img:c.toDataURL('image/jpeg',.88),text:txt.trim(),name:`${file.name} – trang ${i}`}); }
    return pages; },
  PROMPT:`Bạn là chuyên gia số hoá đề thi Việt Nam. Hãy chép lại CHÍNH XÁC toàn bộ câu hỏi trong ảnh theo đúng định dạng sau (không thêm lời bình, không dùng markdown, không bọc trong \`\`\`):
Câu 1: <nội dung câu hỏi>
A. <phương án>
B. <phương án>
C. <phương án>
D. <phương án>
- Mọi công thức toán, kí hiệu, chỉ số viết bằng LaTeX đặt trong $...$ (ví dụ $\\dfrac{1}{x}$, $\\sqrt{2}$, $x^2$, $\\overrightarrow{AB}$).
- Nếu ảnh có đánh dấu đáp án đúng (gạch chân, tô màu, khoanh tròn, bảng đáp án) thì đặt dấu * ngay trước chữ cái đó, ví dụ *B.
- Câu Đúng/Sai: ghi "Câu n [Đúng/Sai]: ..." rồi các ý "a) ...", "b) ..."; nếu biết đáp án thì thêm (Đ) hoặc (S) ở cuối ý.
- Câu trả lời ngắn: ghi "Câu n [Trả lời ngắn]: ..." và dòng "Đáp án: ..." nếu có.
- Câu tự luận: ghi "Câu n [Tự luận]: ...".
- Nếu câu có hình vẽ, đồ thị, bảng biến thiên hay bảng số liệu dạng hình, thêm một dòng "Hình: [cần cắt hình]" ngay sau nội dung câu.
- Có lời giải thì ghi dòng "Lời giải: ...".
- Giữ nguyên số thứ tự câu và các tiêu đề PHẦN I, PHẦN II, PHẦN III nếu có (ghi trên một dòng bắt đầu bằng #).`,
  async ai(dataUrl,extraText){ const st=DB.data.settings; const key=(st.aiKey||CFG.aiKey||'').trim(); if(!key) throw new Error('Chưa nhập khoá API Gemini (mục ⚙️ Nhận dạng AI)');
    const model=(st.aiModel||CFG.aiModel||'gemini-2.5-flash').trim(); const parts=[{text:extraText?this.PROMPT+'\n\nVăn bản cần chuẩn hoá:\n'+extraText:this.PROMPT}];
    if(dataUrl){ const [meta,b64]=dataUrl.split(','); parts.push({inline_data:{mime_type:meta.match(/data:(.*?);/)[1],data:b64}}); }
    const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts}],generationConfig:{temperature:0}})});
    const j=await r.json().catch(()=>({})); if(!r.ok||j.error) throw new Error((j.error&&j.error.message)||('Lỗi máy chủ AI '+r.status));
    return ((j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts)||[]).map(p=>p.text||'').join('').replace(/^```[a-z]*\n?|```$/gm,'').trim(); },
  async ocr(dataUrl,onProg){ await this.loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
    const r=await Tesseract.recognize(dataUrl,'vie+eng',{logger:m=>{ if(m.status&&onProg) onProg(`OCR: ${m.status} ${m.progress?Math.round(m.progress*100)+'%':''}`); }}); return r.data.text; }
};

/* ================= TRANG NHẬP ĐỀ ================= */
const Imp={text:'',imgs:[],pages:[],warn:[],cursor:0,src:''};
function impResolve(q){ const R=s=>String(s??'').replace(/\[\[img:(\d+)\]\]/g,(_,i)=>Imp.imgs[+i]?`<img class="qimg" src="${Imp.imgs[+i]}">`:'').replace(/\[\[MathType\]\]/g,'<span class="badge bad">⚠ công thức MathType</span>');
  const o={...q}; if(o.figure){ const m=String(o.figure).match(/\[\[img:(\d+)\]\]/); o.figure=m&&Imp.imgs[+m[1]]?`<img src="${Imp.imgs[+m[1]]}">`:(/cần cắt hình/.test(o.figure)?'':o.figure); }
  if(!o.figure){ const m=String(o.content).match(/\[\[img:(\d+)\]\]/); if(m&&Imp.imgs[+m[1]]){ o.figure=`<img src="${Imp.imgs[+m[1]]}">`; o.content=o.content.replace(m[0],'').trim(); } }
  o.content=R(o.content); if(o.options) o.options=o.options.map(R); if(o.statements) o.statements=o.statements.map(R); o.explain=R(o.explain); return o; }
Router.add('import',el=>{
  const st=DB.data.settings;
  el.innerHTML=head('Nhập đề: Word · PDF · Ảnh','Tải lên → hệ thống tự chuyển về mẫu chuẩn → sửa trực tiếp, xem trước ngay → lưu vào bộ ngân hàng / tạo đề / tải Word đã chuẩn hoá')+
  `<div class="card" style="margin-bottom:14px"><div class="row" style="gap:10px">
     <button class="btn pri" data-act="docx">📄 Word (.docx)</button><button class="btn pri" data-act="pdf">📕 PDF</button><button class="btn pri" data-act="img">🖼 Ảnh chụp / scan</button><button class="btn" data-act="tpl">📝 Mẫu văn bản</button>
     <span class="grow"></span><select id="imEng" style="width:auto"><option value="ai" ${(st.aiKey||CFG.aiKey)?'selected':''}>🤖 Nhận dạng AI Gemini (chữ + công thức)</option><option value="text">📋 Lấy lớp chữ PDF (nhanh, PDF gốc)</option><option value="ocr" ${(st.aiKey||CFG.aiKey)?'':'selected'}>🔤 OCR miễn phí (chỉ chữ, cần mạng)</option></select></div>
   <details style="margin-top:10px" ${(st.aiKey||CFG.aiKey)?'':'open'}><summary style="cursor:pointer;font-weight:600">⚙️ Nhận dạng AI (Gemini) – khuyên dùng cho PDF/ảnh có công thức</summary>
     <div class="grid g3" style="margin-top:8px"><div class="field"><label>Khoá API Gemini (lưu trên máy này, không gửi lên máy chủ LMS)</label><input type="password" id="imKey" value="${esc(st.aiKey||'')}" placeholder="AIza..."></div><div class="field"><label>Mô hình</label><input type="text" id="imModel" value="${esc(st.aiModel||CFG.aiModel||'gemini-2.5-flash')}"></div><div class="field"><label>&nbsp;</label><button class="btn" data-act="savekey">Lưu khoá</button></div></div>
     <small class="muted">Lấy khoá miễn phí tại aistudio.google.com/apikey (đăng nhập Gmail → Create API key). Ảnh trang đề được gửi thẳng từ trình duyệt tới Google để nhận dạng.</small></details></div>
  <div id="imPages"></div>
  <div class="grid" style="grid-template-columns:1fr 1fr;align-items:start;gap:14px">
   <div class="card"><div class="row" style="margin-bottom:8px"><h3 class="grow" style="margin:0">✍️ Văn bản chuẩn hoá (sửa trực tiếp)</h3><button class="btn sm" data-act="norm">🧹 Chuẩn hoá</button><button class="btn sm" data-act="aifix" title="Nhờ AI sắp xếp lại văn bản về đúng mẫu">🤖 AI sắp xếp</button><button class="btn sm" data-act="help">❔</button></div>
     <div class="grid g4" style="gap:8px"><select id="imS">${opts(subjList(),BankState.subject||(me().subjects||[])[0]||'toan')}</select><select id="imG">${opts(GRADES,BankState.grade||12)}</select><select id="imL">${opts(LEVELS,'NB')}</select><input type="text" id="imT" list="imTL" placeholder="Chủ đề mặc định"><datalist id="imTL"></datalist></div>
     <textarea id="imText" spellcheck="false" style="min-height:58vh;font-family:Consolas,monospace;font-size:13px;margin-top:8px;line-height:1.5"></textarea>
     <div id="imWarn"></div></div>
   <div class="card"><div class="row"><h3 class="grow" style="margin:0">👁 Xem trước</h3><span id="imStat" class="pill-list"></span></div><div id="imPrev" style="margin-top:10px;max-height:66vh;overflow:auto"></div></div></div>
  <div class="card" style="margin-top:14px"><div class="row"><select id="imBank" style="max-width:340px">${bankOptions(BankState.bank&&BankState.bank!=='_sample'?BankState.bank:'')}</select><span class="grow"></span>
    <button class="btn" data-act="word">⬇ Tải Word đã chuẩn hoá</button><button class="btn" data-act="clear">🗑 Làm lại</button><button class="btn" data-act="exam">📝 Lưu + tạo đề</button><button class="btn pri" data-act="save">💾 Lưu vào ngân hàng</button></div></div>`;
  const ta=$('#imText',el); ta.value=Imp.text; let parsed={questions:[],errors:[]};
  const defs=()=>({subject:$('#imS',el).value,grade:$('#imG',el).value,level:$('#imL',el).value,topic:$('#imT',el).value.trim()});
  const preview=()=>{ Imp.text=ta.value; parsed=QImport.parse(ta.value.replace(/^#.*$/gm,''),defs());
    const errAt=i=>parsed.errors.filter(e=>e.startsWith('Câu '+(i+1)+':'));
    const g=groupBy(parsed.questions,q=>q.type);
    $('#imStat',el).innerHTML=`<span class="badge">${parsed.questions.length} câu</span>${Object.entries(g).map(([t,a])=>`<span class="badge gray">${QT_NAME[t]}: ${a.length}</span>`).join('')}${parsed.errors.length?`<span class="badge bad">${parsed.errors.length} lỗi</span>`:'<span class="badge ok">hợp lệ</span>'}`;
    $('#imPrev',el).innerHTML=parsed.questions.length?parsed.questions.map((q,i)=>{ const e=errAt(i); return `<div style="${e.length?'outline:2px solid #fca5a5;border-radius:12px;':''}">${qCard(Param.instantiate(impResolve(q),'imp'),{num:'Câu '+(i+1)+'.'})}${e.length?`<div class="note" style="margin:-6px 0 10px">${e.map(esc).join('<br>')}</div>`:''}</div>`; }).join(''):emptyBox('Tải file lên hoặc gõ/dán theo mẫu (bấm 📝 Mẫu văn bản)','📄');
    renderMath($('#imPrev',el));
    const mt=(ta.value.match(/\[\[MathType\]\]/g)||[]).length, cut=(ta.value.match(/cần cắt hình/g)||[]).length;
    $('#imWarn',el).innerHTML=(mt?`<div class="note" style="margin-top:8px">⚠ Có <b>${mt}</b> công thức <b>MathType</b> không đọc được (thường do file cũ lưu công thức dạng ảnh). Cách xử lý: trong Word chọn tab <b>MathType → Convert Equations</b> → chuyển sang <b>Microsoft Office equations</b> (Office Math) → lưu rồi tải lên lại.</div>`:'')+(cut?`<div class="note info" style="margin-top:8px">✂ Có <b>${cut}</b> chỗ ghi “cần cắt hình”: đặt con trỏ tại dòng đó, bấm vào trang ở trên để cắt hình.</div>`:''); };
  let tm; ta.oninput=()=>{ clearTimeout(tm); tm=setTimeout(preview,450); }; ta.onkeyup=ta.onclick=()=>{ Imp.cursor=ta.selectionStart; };
  ['#imS','#imG','#imL','#imT'].forEach(id=>$(id,el).addEventListener('change',preview));
  const topics=()=>{ $('#imTL',el).innerHTML=topicsOf($('#imS',el).value,$('#imG',el).value).map(x=>`<option value="${esc(x)}">`).join(''); }; $('#imS',el).addEventListener('change',topics); $('#imG',el).addEventListener('change',topics); topics();
  const append=t=>{ ta.value=(ta.value.trim()?ta.value.trim()+'\n\n':'')+normalizeImportText(t); preview(); };
  const insertAtCursor=s=>{ const p=Imp.cursor||ta.value.length; const before=ta.value.slice(0,p), after=ta.value.slice(p); const nl=before.endsWith('\n')||!before?'':'\n'; ta.value=before+nl+s+'\n'+after; Imp.cursor=(before+nl+s+'\n').length; preview(); };
  const busy=(msg)=>{ $('#imPages',el).querySelector('.imBusy')?.remove(); if(msg){ const d=document.createElement('div'); d.className='note info imBusy'; d.style.marginBottom='10px'; d.textContent='⏳ '+msg; $('#imPages',el).prepend(d); } };
  const drawPages=()=>{ const box=$('#imPages',el); box.innerHTML=Imp.pages.length?`<div class="card" style="margin-bottom:14px"><div class="row" style="margin-bottom:8px"><h3 class="grow" style="margin:0">📑 Trang đã tải (${Imp.pages.length}) – bấm vào trang để ✂ cắt hình chèn vào câu</h3><button class="btn sm pri" data-act="recall">🔎 Nhận dạng tất cả trang</button></div>
      <div class="row" style="gap:10px;overflow:auto;flex-wrap:nowrap;padding-bottom:6px">${Imp.pages.map((p,i)=>`<div style="flex:none;width:150px;text-align:center"><img src="${p.img}" data-crop="${i}" style="width:150px;height:200px;object-fit:cover;object-position:top;border:1px solid var(--line);border-radius:8px;cursor:crosshair"><div class="row" style="justify-content:center;gap:4px;margin-top:4px"><button class="btn sm" data-rec="${i}">🔎 Nhận dạng</button></div><small class="muted">Trang ${i+1}</small></div>`).join('')}</div></div>`:''; };
  drawPages(); preview();
  async function recognize(i){ const p=Imp.pages[i], eng=$('#imEng',el).value;
    if(eng==='text'){ if(!p.text) throw new Error('Trang '+(i+1)+' không có lớp chữ (PDF scan) – hãy chọn AI hoặc OCR'); return p.text; }
    if(eng==='ai') return await Recog.ai(p.img);
    return await Recog.ocr(p.img,m=>busy(`Trang ${i+1}: ${m}`)); }
  function cropModal(i){ const p=Imp.pages[i]; let sel=null;
    modal({title:`✂ Cắt hình – trang ${i+1}`,size:'xl',body:`<p class="muted">Kéo chuột (hoặc ngón tay) để khoanh vùng hình. Hình sẽ chèn vào <b>vị trí con trỏ</b> trong ô văn bản (đặt con trỏ ở câu cần chèn trước khi cắt).</p><div id="cpWrap" style="position:relative;display:inline-block;touch-action:none;user-select:none;max-width:100%"><img id="cpImg" src="${p.img}" style="max-width:100%;display:block;border:1px solid var(--line)" draggable="false"><div id="cpBox" style="position:absolute;border:2px dashed #dc2626;background:rgba(220,38,38,.08);display:none"></div></div>`,
      foot:`<button class="btn" data-x>Đóng</button><button class="btn pri" id="cpGo" disabled>Chèn hình đã cắt</button>`,onOpen:(m,close)=>{ const img=$('#cpImg',m), box=$('#cpBox',m); let st=null;
        const pt=e=>{ const r=img.getBoundingClientRect(); return [Math.max(0,Math.min(r.width,e.clientX-r.left)),Math.max(0,Math.min(r.height,e.clientY-r.top))]; };
        img.parentElement.onpointerdown=e=>{ st=pt(e); img.parentElement.setPointerCapture(e.pointerId); };
        img.parentElement.onpointermove=e=>{ if(!st) return; const c=pt(e); sel=[Math.min(st[0],c[0]),Math.min(st[1],c[1]),Math.abs(c[0]-st[0]),Math.abs(c[1]-st[1])]; Object.assign(box.style,{display:'block',left:sel[0]+'px',top:sel[1]+'px',width:sel[2]+'px',height:sel[3]+'px'}); $('#cpGo',m).disabled=sel[2]<10||sel[3]<10; };
        img.parentElement.onpointerup=()=>{ st=null; };
        $('#cpGo',m).onclick=async()=>{ const k=img.naturalWidth/img.getBoundingClientRect().width; const c=document.createElement('canvas'); c.width=sel[2]*k; c.height=sel[3]*k; c.getContext('2d').drawImage(img,sel[0]*k,sel[1]*k,sel[2]*k,sel[3]*k,0,0,c.width,c.height);
          const d=await shrinkImage(c.toDataURL('image/png'),640); Imp.imgs.push(d); const tok=`Hình: [[img:${Imp.imgs.length-1}]]`;
          const cutIdx=ta.value.indexOf('Hình: [cần cắt hình]', Math.max(0,ta.value.lastIndexOf('Câu ',Imp.cursor)));
          if(cutIdx>=0&&cutIdx<=(ta.value.indexOf('\nCâu ',Imp.cursor+1)>0?ta.value.indexOf('\nCâu ',Imp.cursor+1):ta.value.length)){ ta.value=ta.value.slice(0,cutIdx)+tok+ta.value.slice(cutIdx+'Hình: [cần cắt hình]'.length); preview(); } else insertAtCursor(tok);
          close(); toast('Đã chèn hình','ok'); }; }}); }
  on(el,'click','[data-act],[data-rec],[data-crop]',async b=>{
    if(b.dataset.crop!=null) return cropModal(+b.dataset.crop);
    if(b.dataset.rec!=null){ const i=+b.dataset.rec; try{ busy(`Đang nhận dạng trang ${i+1}…`); append(await recognize(i)); busy(''); toast('Đã nhận dạng trang '+(i+1),'ok'); }catch(e){ busy(''); toast(e.message,'bad'); } return; }
    const a=b.dataset.act;
    if(a==='savekey'){ st.aiKey=$('#imKey',el).value.trim(); st.aiModel=$('#imModel',el).value.trim()||'gemini-2.5-flash'; DB.save(); toast('Đã lưu khoá trên máy này','ok'); }
    if(a==='docx') pickFile('.docx',async f=>{ try{ busy('Đang đọc file Word…'); const r=await DocxIn.parse(f); r.imgs.forEach(x=>Imp.imgs.push(x)); const off=Imp.imgs.length-r.imgs.length; let t=DocxIn.toText(r).replace(/\[\[img:(\d+)\]\]/g,(_,i)=>`[[img:${+i+off}]]`);
        append(t); busy(''); toast(`Đã đọc ${f.name}: ${parsed.questions.length} câu`+(r.mt?` · đã chuyển ${r.mt} công thức MathType`:''),'ok'); if(r.warn.includes('mathtype')) toast('File có công thức MathType – xem hướng dẫn dưới ô văn bản','bad'); }catch(e){ busy(''); toast('Lỗi đọc Word: '+e.message,'bad'); } });
    if(a==='pdf') pickFile('.pdf',async f=>{ try{ const ps=await Recog.pdfPages(f,busy); Imp.pages.push(...ps); busy(''); drawPages(); const eng=$('#imEng',el).value;
        if(eng==='text'&&ps.some(p=>p.text.length>80)){ append(ps.map(p=>p.text).join('\n')); toast('Đã lấy lớp chữ PDF – công thức có thể bị lỗi, nên dùng AI nếu đề nhiều công thức','ok'); }
        else toast(`Đã tải ${ps.length} trang – bấm “Nhận dạng tất cả trang”`,'ok'); }catch(e){ busy(''); toast(e.message,'bad'); } });
    if(a==='img'){ const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.multiple=true; inp.onchange=async()=>{ for(const f of inp.files){ const d=await shrinkImage(await fileToDataURL(f),1600); if(d) Imp.pages.push({img:d,text:'',name:f.name}); } drawPages(); toast(`Đã tải ${inp.files.length} ảnh – bấm “Nhận dạng”`,'ok'); }; inp.click(); }
    if(a==='recall'){ for(let i=0;i<Imp.pages.length;i++){ try{ busy(`Đang nhận dạng trang ${i+1}/${Imp.pages.length}…`); append(await recognize(i)); }catch(e){ toast(e.message,'bad'); break; } } busy(''); }
    if(a==='tpl'){ if(!ta.value.trim()) ta.value=TEXT_TEMPLATE; else insertAtCursor(TEXT_TEMPLATE); preview(); }
    if(a==='norm'){ ta.value=normalizeImportText(ta.value); preview(); toast('Đã chuẩn hoá','ok'); }
    if(a==='aifix'){ if(!ta.value.trim()) return; try{ busy('AI đang sắp xếp văn bản…'); const imgsTok=ta.value; ta.value=normalizeImportText(await Recog.ai(null,imgsTok)); busy(''); preview(); }catch(e){ busy(''); toast(e.message,'bad'); } }
    if(a==='help') modal({title:'❔ Quy tắc mẫu chuẩn',body:`<ul><li><b>Câu n:</b> bắt đầu mỗi câu. Thẻ sau số câu: <code>[Đúng/Sai]</code>, <code>[Trả lời ngắn]</code>, <code>[Tự luận]</code>, <code>[TH]</code>, <code>[Chủ đề: …]</code>.</li><li>Phương án <code>A.</code> … <code>D.</code> mỗi dòng một phương án; đáp án đúng thêm <code>*</code>: <code>*B.</code> (Word: <b>gạch chân hoặc tô đỏ</b> phương án đúng sẽ tự nhận).</li><li>Đúng/Sai: <code>a) … (Đ)</code>, <code>b) … (S)</code> (Word: gạch chân/tô đỏ ý đúng).</li><li>Trả lời ngắn / tự luận: dòng <code>Đáp án: …</code>; lời giải: <code>Lời giải: …</code>.</li><li>Hình: dòng <code>Hình: [[img:n]]</code> (ảnh đã tải/cắt) hoặc hình vẽ tự động <code>Hình: @chop base=4; vuong=1</code>.</li><li>Công thức: LaTeX trong <code>$...$</code>. Công thức Equation trong Word tự chuyển sang LaTeX.</li><li>Dòng bắt đầu bằng <code>#</code> là ghi chú (bị bỏ qua).</li></ul>`});
    if(a==='clear') confirmBox('Xoá toàn bộ văn bản, ảnh và trang đã tải?',()=>{ Imp.text=''; Imp.imgs=[]; Imp.pages=[]; App.render(); });
    const finalQs=()=>parsed.questions.map(q=>{ const o=impResolve(q); o.id=uid('q'); o.ownerId=me().id; const bk=$('#imBank',el).value; if(bk) o.bankId=bk; else o.shared=true; o.createdAt=Date.now(); return normQ(o)||o; });
    if(a==='word'){ if(!parsed.questions.length) return toast('Chưa có câu hỏi','bad'); const qs=finalQs(); const g=groupBy(qs,q=>q.type); let h=`<h1>ĐỀ ĐÃ CHUẨN HOÁ</h1><p class="c"><i>Đáp án đúng được gạch chân và in đậm · ${qs.length} câu</i></p>`;
      PART_ORDER.filter(t=>g[t]).forEach((t,pi)=>{ h+=`<p class="part"><b>${PART_TITLE[t](g[t].length).replace(/^PHẦN [IV]+/,'PHẦN '+ROMAN[pi])}</b></p>`+g[t].map((q,i)=>Exam.qText({q,no:i+1,perm:[0,1,2,3],type:t},{withAnswer:true})).join(''); });
      exportWord('De_chuan_hoa_'+new Date().toISOString().slice(0,10),'Đề đã chuẩn hoá',h); }
    if(a==='save'||a==='exam'){ if(!parsed.questions.length) return toast('Chưa có câu hỏi','bad'); if(parsed.errors.length&&!confirm(`Còn ${parsed.errors.length} lỗi (câu thiếu đáp án…). Vẫn lưu?`)) return;
      const qs=finalQs(); qs.forEach(q=>DB.data.questions.push(q)); DB.save(); Sync.markDirty('questions');
      if(a==='exam'){ const ex={id:uid('ex'),title:'Đề nhập ngày '+fmtDay(Date.now()),subject:qs[0].subject,grade:+qs[0].grade,duration:(SUBJECTS[qs[0].subject]||{}).duration||45,questionIds:qs.map(q=>q.id),createdBy:me().id,createdAt:Date.now(),variants:[]}; DB.upsert('exams',ex); toast(`Đã lưu ${qs.length} câu và tạo đề`,'ok'); location.hash='#/exams/'+ex.id; }
      else toast(`Đã lưu ${qs.length} câu vào ngân hàng`,'ok');
      Imp.text=''; Imp.imgs=[]; Imp.pages=[]; if(a==='save') App.render(); }
  });
});
