/* LMS LKT – docx.js: xuất Word .docx thật – công thức LaTeX được biên dịch sang công thức Word (Office Math/OMML),
 * hình vẽ nhúng ảnh PNG, bảng – tiêu đề đề thi giữ nguyên bố cục. Tác giả: Lương Khánh Tường – ĐT/Zalo 0916780807 */
'use strict';
const Docx = (()=>{
  const X=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const PAGE_W=9921; // twips: A4 21cm – lề trái 2cm – lề phải 1,5cm
  /* ================= MathML → OMML ================= */
  const NARY=new Set(['∑','∫','∬','∭','∮','∏','⋃','⋂','⨁']);
  const ACC={'→':'⃗','⃗':'⃗','←':'⃖','↔':'⃡','^':'̂','ˆ':'̂','̂':'̂','~':'̃','˜':'̃','̃':'̃','˙':'̇','̇':'̇','¨':'̈','ˇ':'̌','´':'́','`':'̀'};
  const BAR=new Set(['¯','‾','ˉ','̄','_','̅','―']);
  const DS={R:'ℝ',N:'ℕ',Z:'ℤ',Q:'ℚ',C:'ℂ'};
  const mr=(t,sty)=>`<m:r>${sty?`<m:rPr><m:sty m:val="${sty}"/></m:rPr>`:''}<w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/></w:rPr><m:t xml:space="preserve">${X(t)}</m:t></m:r>`;
  const el=n=>n?[...n.children]:[];
  const tag=n=>n&&(n.localName||n.nodeName||'').toLowerCase();
  function isNary(n){ const t=tag(n); if(!['msubsup','munderover','msub','munder','msup','mover','mo'].includes(t)) return false; const b=t==='mo'?n:n.children[0]; return !!b&&tag(b)==='mo'&&NARY.has(b.textContent.trim()); }
  function nary(n,e){ const t=tag(n), c=el(n); const chr=(t==='mo'?n:c[0]).textContent.trim(); let sub='',sup='';
    if(t==='msubsup'||t==='munderover'){ sub=conv(c[1]); sup=conv(c[2]); } else if(t==='msub'||t==='munder') sub=conv(c[1]); else if(t==='msup'||t==='mover') sup=conv(c[1]);
    const loc=(t==='munderover'||t==='munder'||t==='mover')?'undOvr':'subSup';
    return `<m:nary><m:naryPr><m:chr m:val="${X(chr)}"/><m:limLoc m:val="${loc}"/>${sub?'':'<m:subHide m:val="1"/>'}${sup?'':'<m:supHide m:val="1"/>'}</m:naryPr><m:sub>${sub}</m:sub><m:sup>${sup}</m:sup><m:e>${e}</m:e></m:nary>`; }
  function seq(nodes){ let out=''; for(let i=0;i<nodes.length;i++){ const n=nodes[i]; if(isNary(n)){ out+=nary(n,seq(nodes.slice(i+1))); break; } out+=conv(n); } return out; }
  function row(n){ const c=el(n);
    if(c.length>=2&&tag(c[0])==='mo'&&c[0].getAttribute('fence')==='true'&&tag(c[c.length-1])==='mo'&&c[c.length-1].getAttribute('fence')==='true')
      return `<m:d><m:dPr><m:begChr m:val="${X(c[0].textContent)}"/><m:endChr m:val="${X(c[c.length-1].textContent)}"/></m:dPr><m:e>${seq(c.slice(1,-1))}</m:e></m:d>`;
    return seq(c); }
  function conv(n){ if(!n) return ''; const c=el(n);
    switch(tag(n)){
      case 'semantics': return conv(c[0]);
      case 'annotation': case 'annotation-xml': case 'mphantom': return '';
      case 'mi': { let s=n.textContent; const mv=n.getAttribute('mathvariant'); if(mv==='double-struck') return mr([...s].map(ch=>DS[ch]||ch).join(''),'p');
        return mr(s, mv==='normal'||(s.length>1&&mv!=='italic')?'p':mv==='bold'?'b':mv==='bold-italic'?'bi':''); }
      case 'mn': return mr(n.textContent,'p');
      case 'mo': { const s=n.textContent; if(/^[\u2061-\u2064]$/.test(s)) return ''; return mr(s,'p'); }
      case 'mtext': return `<m:r><m:rPr><m:nor/></m:rPr><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><m:t xml:space="preserve">${X(n.textContent.replace(/ /g,' '))}</m:t></m:r>`;
      case 'mspace': { const w=parseFloat(n.getAttribute('width')||'0'); return w>=0.25?mr(' ','p'):''; }
      case 'mfrac': { const lt=n.getAttribute('linethickness'); return `<m:f>${lt&&parseFloat(lt)===0?'<m:fPr><m:type m:val="noBar"/></m:fPr>':''}<m:num>${conv(c[0])}</m:num><m:den>${conv(c[1])}</m:den></m:f>`; }
      case 'msup': return `<m:sSup><m:e>${conv(c[0])}</m:e><m:sup>${conv(c[1])}</m:sup></m:sSup>`;
      case 'msub': return `<m:sSub><m:e>${conv(c[0])}</m:e><m:sub>${conv(c[1])}</m:sub></m:sSub>`;
      case 'msubsup': return `<m:sSubSup><m:e>${conv(c[0])}</m:e><m:sub>${conv(c[1])}</m:sub><m:sup>${conv(c[2])}</m:sup></m:sSubSup>`;
      case 'msqrt': return `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${row(n)}</m:e></m:rad>`;
      case 'mroot': return `<m:rad><m:deg>${conv(c[1])}</m:deg><m:e>${conv(c[0])}</m:e></m:rad>`;
      case 'mover': { const o=c[1]; if(o&&tag(o)==='mo'){ const ch=o.textContent.trim(); if(BAR.has(ch)) return `<m:bar><m:barPr><m:pos m:val="top"/></m:barPr><m:e>${conv(c[0])}</m:e></m:bar>`;
          if(ACC[ch]||n.getAttribute('accent')==='true') return `<m:acc><m:accPr><m:chr m:val="${X(ACC[ch]||ch)}"/></m:accPr><m:e>${conv(c[0])}</m:e></m:acc>`; }
        return `<m:limUpp><m:e>${conv(c[0])}</m:e><m:lim>${conv(o)}</m:lim></m:limUpp>`; }
      case 'munder': { const u=c[1]; if(u&&tag(u)==='mo'&&BAR.has(u.textContent.trim())) return `<m:bar><m:barPr><m:pos m:val="bot"/></m:barPr><m:e>${conv(c[0])}</m:e></m:bar>`;
        return `<m:limLow><m:e>${conv(c[0])}</m:e><m:lim>${conv(u)}</m:lim></m:limLow>`; }
      case 'munderover': return `<m:limUpp><m:e><m:limLow><m:e>${conv(c[0])}</m:e><m:lim>${conv(c[1])}</m:lim></m:limLow></m:e><m:lim>${conv(c[2])}</m:lim></m:limUpp>`;
      case 'mtable': { const rows=c.filter(r=>tag(r)==='mtr'||tag(r)==='mlabeledtr'); const nc=Math.max(1,...rows.map(r=>el(r).length));
        return `<m:m><m:mPr><m:mcs><m:mc><m:mcPr><m:count m:val="${nc}"/><m:mcJc m:val="left"/></m:mcPr></m:mc></m:mcs></m:mPr>${rows.map(r=>`<m:mr>${el(r).map(td=>`<m:e>${row(td)}</m:e>`).join('')}${'<m:e/>'.repeat(nc-el(r).length)}</m:mr>`).join('')}</m:m>`; }
      default: return row(n);
    } }
  const parser=new DOMParser();
  function texToOmml(tex,display){
    if(!window.katex) return null;
    let mml; try{ mml=katex.renderToString(tex,{output:'mathml',throwOnError:false,displayMode:!!display,strict:'ignore'}); }catch(e){ return null; }
    const m=mml.match(/<math[\s\S]*<\/math>/); if(!m) return null;
    const doc=parser.parseFromString(m[0],'application/xml'); if(doc.getElementsByTagName('parsererror').length) return null;
    const body=conv(doc.documentElement); if(!body) return null;
    return display?`<m:oMathPara><m:oMath>${body}</m:oMath></m:oMathPara>`:`<m:oMath>${body}</m:oMath>`; }
  /* ================= HTML → WordprocessingML ================= */
  function build(html,{size=12,font='Times New Roman',imgs=[]}){
    const doc=parser.parseFromString(`<body>${html}</body>`,'text/html'); const rels=[]; let pid=1;
    const rPr=f=>{ const s=(f.b?'<w:b/>':'')+(f.i?'<w:i/>':'')+(f.u?'<w:u w:val="single"/>':'')+(f.bdr?'<w:bdr w:val="single" w:sz="8" w:space="2" w:color="000000"/>':'')+(f.mono?'<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>':'')+(f.color?`<w:color w:val="${f.color}"/>`:'')+(f.sz?`<w:sz w:val="${f.sz}"/><w:szCs w:val="${f.sz}"/>`:'')+(f.va?`<w:vertAlign w:val="${f.va}"/>`:''); return s?`<w:rPr>${s}</w:rPr>`:''; };
    const tr=(t,f)=>t?`<w:r>${rPr(f)}<w:t xml:space="preserve">${X(t)}</w:t></w:r>`:'';
    const SYM={'\\circ':'°','\\%':'%','-':'−','+':'+','\\cdot':'·'};
    function mathOrText(tex,display,f){
      // chỉ số dưới/trên đứng riêng (công thức hoá học: CH$_3$, HCO$_3^-$)
      const ss=tex.match(/^\s*(?:_\{?([^{}^]*)\}?)?\s*(?:\^\{?([^{}]*)\}?)?\s*$/);
      if(ss&&(ss[1]!=null||ss[2]!=null)){ const fix=s=>String(s||'').replace(/\\circ/g,'°').replace(/-/g,'−'); return tr(fix(ss[1]),{...f,va:'subscript'})+tr(fix(ss[2]),{...f,va:'superscript'}); }
      const o=texToOmml(tex,display); return o||tr((display?'$$':'$')+tex+(display?'$$':'$'),f); }
    function text(t,f){ t=t.replace(/[\r\n\t ]+/g,' '); if(!t) return ''; let out='';
      t.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g).forEach(seg=>{ if(!seg) return; if(/^\$\$/.test(seg)) out+=mathOrText(seg.slice(2,-2),true,f); else if(/^\$/.test(seg)) out+=mathOrText(seg.slice(1,-1),false,f); else out+=tr(seg,f); }); return out; }
    function drawing(i){ const im=imgs[i]; if(!im) return ''; const w=Math.round(Math.min(im.w,330)*.95), h=Math.round(w*im.h/im.w); const cx=w*9525, cy=h*9525; const id=pid++; const rid='rIdImg'+i; if(!rels.includes(i)) rels.push(i);
      return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${id}" name="Hinh ${id}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name="img${i}.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`; }
    function inline(n,f){ if(n.nodeType===3) return text(n.nodeValue,f); if(n.nodeType!==1) return ''; const t=tag(n), st=n.getAttribute('style')||'';
      if(t==='br') return '<w:r><w:br/></w:r>'; if(t==='img'){ const i=n.getAttribute('data-img'); return i!=null?drawing(+i):''; }
      if(t==='style'||t==='script'||t==='button') return '';
      const g={...f}; if(t==='b'||t==='strong'||/font-weight:\s*(bold|[6-9]00)/.test(st)) g.b=1; if(t==='i'||t==='em'||/font-style:\s*italic/.test(st)) g.i=1; if(t==='u'||/underline/.test(st)) g.u=1;
      if(t==='sup') g.va='superscript'; if(t==='sub') g.va='subscript'; if(t==='code') g.mono=1; if(t==='small') g.sz=(size-1)*2; if(/border/.test(st)&&t==='span') g.bdr=1;
      return [...n.childNodes].map(c=>inline(c,g)).join(''); }
    const isBlock=n=>n.nodeType===1&&['p','h1','h2','h3','h4','div','table','ul','ol','li','section'].includes(tag(n));
    function pPr(n,t,cell){ const cls=(n.getAttribute&&n.getAttribute('class'))||'', st=(n.getAttribute&&n.getAttribute('style'))||'';
      const center=t==='h1'||/\bc\b/.test(cls)||/qfigp/.test(cls)||/text-align:\s*center/.test(st)||(cell&&cell.center); const right=/text-align:\s*right/.test(st)||(cell&&cell.right);
      const ml=(st.match(/margin-left:\s*([\d.]+)pt/)||[])[1];
      const before=t==='h1'?120:t==='h2'?160:t==='h3'?100:/part/.test(cls)?100:/qp/.test(cls)?60:0;
      return `<w:pPr>${/keep/.test(cls)?'<w:keepNext/>':''}<w:spacing w:before="${cell?0:before}" w:after="${cell?0:30}" w:line="264" w:lineRule="auto"/>${ml?`<w:ind w:left="${Math.round(ml*20)}"/>`:''}${center?'<w:jc w:val="center"/>':right?'<w:jc w:val="right"/>':(cell?'':'<w:jc w:val="both"/>')}</w:pPr>`; }
    function para(n,t,cell,prefix=''){ if([...n.childNodes].some(isBlock)) return blocks(n,cell);
      const f={}; if(/^h[1-4]$/.test(t)){ f.b=1; f.sz=(t==='h1'?size+3:t==='h2'?size+1:size)*2; } if(cell&&cell.th) f.b=1;
      return `<w:p>${pPr(n,t,cell)}${prefix?tr(prefix,{}):''}${[...n.childNodes].map(c=>inline(c,f)).join('')}</w:p>`; }
    function blocks(parent,cell){ let out='', inl='', hasInl=false; const flush=()=>{ if(hasInl){ out+=`<w:p>${pPr(parent,'p',cell)}${inl}</w:p>`; } inl=''; hasInl=false; };
      for(const n of parent.childNodes){
        if(n.nodeType===3){ if(!hasInl&&!n.nodeValue.trim()) continue; inl+=inline(n,cell&&cell.th?{b:1}:{}); hasInl=true; continue; }
        if(n.nodeType!==1) continue; const t=tag(n);
        if(t==='br'&&/page-break/.test(n.getAttribute('style')||'')){ flush(); out+='<w:p><w:r><w:br w:type="page"/></w:r></w:p>'; continue; }
        if(t==='table'){ flush(); out+=table(n); if(cell) out+='<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>'; continue; }
        if(t==='ul'||t==='ol'){ flush(); [...n.children].forEach((li,i)=>out+=para(li,'li',cell,t==='ol'?(i+1)+'. ':'• ')); continue; }
        if(t==='div'||t==='section'){ flush(); out+=blocks(n,cell); continue; }
        if(['p','h1','h2','h3','h4','li'].includes(t)){ flush(); out+=para(n,t,cell); continue; }
        if(t==='style'||t==='script') continue;
        inl+=inline(n,cell&&cell.th?{b:1}:{}); hasInl=true; }
      flush(); return out; }
    function table(tb){ const rows=[...tb.rows]; if(!rows.length) return ''; const cls=tb.getAttribute('class')||'';
      const border=!/\bnb\b/.test(cls)&&(tb.getAttribute('border')==='1'||/\btbl\b/.test(cls));
      const grid=[]; rows.forEach((r,ri)=>{ grid[ri]=grid[ri]||[]; let c=0; [...r.cells].forEach(td=>{ while(grid[ri][c]) c++; const cs=Math.max(1,td.colSpan||1), rs=Math.max(1,td.rowSpan||1);
        for(let i=0;i<rs;i++){ grid[ri+i]=grid[ri+i]||[]; for(let j=0;j<cs;j++) grid[ri+i][c+j]=(i===0&&j===0)?{td,cs,rs}:(j===0?{cont:1,cs}:{skip:1}); } c+=cs; }); });
      const nc=Math.max(...grid.map(r=>r.length)); let wd=Array(nc).fill(0); const first=rows[0]?[...rows[0].cells]:[];
      let ci=0; first.forEach(td=>{ const m=(td.getAttribute('style')||'').match(/width:\s*([\d.]+)%/); if(m&&(td.colSpan||1)===1) wd[ci]=Math.round(PAGE_W*parseFloat(m[1])/100); ci+=td.colSpan||1; });
      if(border&&!wd.some(Boolean)){ // tự co giãn cột theo độ dài nội dung
        const wt=Array(nc).fill(4.5); grid.forEach(r=>r.forEach((g,c)=>{ if(g&&g.td&&g.cs===1){ const len=g.td.textContent.replace(/\$[^$]*\$/g,'xxxx').trim().split(/\s+/).reduce((m,w)=>Math.max(m,w.length),0)*1.2+Math.sqrt(g.td.textContent.length)*1.6; wt[c]=Math.max(wt[c],Math.min(len,45)); } }));
        const tot=wt.reduce((a,b)=>a+b,0); wd=wt.map(w=>Math.floor(PAGE_W*w/tot)); }
      const rest=PAGE_W-wd.reduce((a,b)=>a+b,0), free=wd.filter(x=>!x).length; wd=wd.map(x=>x||Math.floor(rest/Math.max(1,free)));
      const bd=border?'<w:top w:val="single" w:sz="4" w:color="000000"/><w:left w:val="single" w:sz="4" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:color="000000"/><w:right w:val="single" w:sz="4" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:color="000000"/><w:insideV w:val="single" w:sz="4" w:color="000000"/>':'<w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/>';
      let x=`<w:tbl><w:tblPr><w:tblW w:w="${PAGE_W}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders>${bd}</w:tblBorders><w:tblCellMar><w:left w:w="${border?70:0}" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${wd.map(w=>`<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>`;
      grid.forEach((r,ri)=>{ x+='<w:tr><w:trPr><w:cantSplit/></w:trPr>'; for(let c=0;c<nc;c++){ const g=r[c]; if(g&&g.skip) continue; const cs=g?(g.cs||1):1; const w=wd.slice(c,c+cs).reduce((a,b)=>a+b,0);
          let tcPr=`<w:tcW w:w="${w}" w:type="dxa"/>${cs>1?`<w:gridSpan w:val="${cs}"/>`:''}`;
          if(!g||g.cont){ if(g&&g.cont) tcPr+='<w:vMerge/>'; x+=`<w:tc><w:tcPr>${tcPr}</w:tcPr><w:p/></w:tc>`; continue; }
          const td=g.td, th=tag(td)==='th', tst=td.getAttribute('style')||'', tcl=td.getAttribute('class')||'';
          if(g.rs>1) tcPr+='<w:vMerge w:val="restart"/>'; if(th) tcPr+='<w:shd w:val="clear" w:color="auto" w:fill="E8ECF7"/>';
          tcPr+=`<w:vAlign w:val="${/vertical-align:\s*top/.test(tst)?'top':/vertical-align:\s*middle/.test(tst)||th||border?'center':'top'}"/>`;
          const cell={th,center:th||/\bc\b/.test(tcl)||/text-align:\s*center/.test(tst)||(border&&/center/.test(cls)),right:/text-align:\s*right/.test(tst)};
          let inner=blocks(td,cell); if(!/<w:p[ >]/.test(inner)||/<\/w:tbl>$/.test(inner)) inner+='<w:p/>';
          x+=`<w:tc><w:tcPr>${tcPr}</w:tcPr>${inner}</w:tc>`; c+=cs-1; }
        x+='</w:tr>'; });
      return x+'</w:tbl>'; }
    const body=blocks(doc.body,null);
    return {body,rels}; }
  /* ================= Đóng gói .docx ================= */
  const NS='xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
  async function make(html,{size=12,font='Times New Roman',title='',footer=''}={}){
    const svgs=[]; html=html.replace(/<svg[\s\S]*?<\/svg>|<img[^>]*src="data:image\/[^"]+"[^>]*>/g,m=>{ svgs.push(m); return `<img data-img="${svgs.length-1}">`; });
    const imgs=await Promise.all(svgs.map(s=>svgToPng(s,2.5)));
    const {body,rels}=build(html,{size,font,imgs});
    const hdr='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    const document=`${hdr}<w:document ${NS}><w:body>${body}<w:sectPr><w:footerReference w:type="default" r:id="rIdFtr"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="851" w:right="851" w:bottom="851" w:left="1134" w:header="425" w:footer="425" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const styles=`${hdr}<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:eastAsia="${font}" w:cs="${font}"/><w:sz w:val="${size*2}"/><w:szCs w:val="${size*2}"/><w:lang w:val="vi-VN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>`;
    const settings=`${hdr}<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><w:defaultTabStop w:val="720"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat><m:mathPr><m:mathFont m:val="Cambria Math"/><m:dispDef/><m:wrapIndent m:val="1440"/><m:intLim m:val="subSup"/><m:naryLim m:val="undOvr"/></m:mathPr></w:settings>`;
    const ftr=`${hdr}<w:ftr ${NS}><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t xml:space="preserve">${X(footer)}${footer?' – ':''}Trang </w:t></w:r><w:fldSimple w:instr="PAGE"><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>/</w:t></w:r><w:fldSimple w:instr="NUMPAGES"><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>`;
    const docRels=`${hdr}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdSty" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdSet" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/><Relationship Id="rIdFtr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>${rels.map(i=>`<Relationship Id="rIdImg${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/img${i}.png"/>`).join('')}</Relationships>`;
    const ct=`${hdr}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;
    const rootRels=`${hdr}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;
    const now=new Date().toISOString().replace(/\.\d+Z$/,'Z');
    const core=`${hdr}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${X(title)}</dc:title><dc:creator>${X(CFG.author)} – LMS LKT</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
    const app=`${hdr}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>LMS LKT</Application></Properties>`;
    const files=[{name:'[Content_Types].xml',data:ct},{name:'_rels/.rels',data:rootRels},{name:'docProps/core.xml',data:core},{name:'docProps/app.xml',data:app},{name:'word/document.xml',data:document},{name:'word/styles.xml',data:styles},{name:'word/settings.xml',data:settings},{name:'word/footer1.xml',data:ftr},{name:'word/_rels/document.xml.rels',data:docRels}];
    rels.forEach(i=>{ if(imgs[i]) files.push({name:`word/media/img${i}.png`,data:b64ToBytes(imgs[i].data)}); });
    const blob=makeZip(files); return new Blob([blob],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}); }
  return {make,texToOmml};
})();
