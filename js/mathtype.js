/* LMS LKT – mathtype.js
 * Đọc công thức MathType / Microsoft Equation 3.0 nhúng trong file Word (oleObject*.bin)
 * → LaTeX. Gồm: bộ đọc OLE Compound File + bộ giải mã MTEF v3/v5. Chạy hoàn toàn trên trình duyệt. */
'use strict';
const MathTypeOLE = (()=>{
  /* ---------- 1. OLE Compound File (CFB) ---------- */
  function cfbStream(bytes, wanted){
    const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    if(dv.getUint32(0,true)!==0xE011CFD0) throw new Error('not CFB');
    const ss=1<<dv.getUint16(30,true), mss=1<<dv.getUint16(32,true);
    const nFat=dv.getUint32(44,true), dir0=dv.getUint32(48,true), cutoff=dv.getUint32(56,true);
    const mfat0=dv.getUint32(60,true), nMfat=dv.getUint32(64,true); let difat=dv.getUint32(68,true);
    const off=s=>512+s*ss; const fatSecs=[];
    for(let i=0;i<109&&fatSecs.length<nFat;i++){ const s=dv.getUint32(76+i*4,true); if(s<0xFFFFFFFA) fatSecs.push(s); }
    let guard=0; while(difat<0xFFFFFFFA&&fatSecs.length<nFat&&guard++<1000){ const n=ss/4-1; for(let i=0;i<n&&fatSecs.length<nFat;i++){ const s=dv.getUint32(off(difat)+i*4,true); if(s<0xFFFFFFFA) fatSecs.push(s); } difat=dv.getUint32(off(difat)+n*4,true); }
    const fat=[]; fatSecs.forEach(s=>{ for(let i=0;i<ss/4;i++) fat.push(dv.getUint32(off(s)+i*4,true)); });
    const chain=(s,tab)=>{ const out=[]; let g=0; while(s<0xFFFFFFFA&&g++<200000){ out.push(s); s=tab[s]; } return out; };
    const readBig=(s,size)=>{ const out=new Uint8Array(size); let p=0; for(const c of chain(s,fat)){ const n=Math.min(ss,size-p); if(n<=0) break; out.set(bytes.subarray(off(c),off(c)+n),p); p+=n; } return out; };
    const dirBytes=readBig(dir0, chain(dir0,fat).length*ss); const ddv=new DataView(dirBytes.buffer);
    const entries=[]; for(let o=0;o+128<=dirBytes.length;o+=128){ const nl=ddv.getUint16(o+64,true); let name=''; for(let i=0;i<Math.max(0,nl/2-1);i++) name+=String.fromCharCode(ddv.getUint16(o+i*2,true));
      entries.push({name,type:dirBytes[o+66],start:ddv.getUint32(o+116,true),size:ddv.getUint32(o+120,true)}); }
    const root=entries[0]; const e=entries.find(x=>x.type===2&&x.name===wanted); if(!e) return null;
    if(e.size>=cutoff) return readBig(e.start,e.size);
    const mini=readBig(root.start,root.size); const mfat=[]; chain(mfat0,fat).slice(0,nMfat||1e9).forEach(s=>{ for(let i=0;i<ss/4;i++) mfat.push(dv.getUint32(off(s)+i*4,true)); });
    const out=new Uint8Array(e.size); let p=0; for(const c of chain(e.start,mfat)){ const n=Math.min(mss,e.size-p); if(n<=0) break; out.set(mini.subarray(c*mss,c*mss+n),p); p+=n; } return out;
  }

  /* ---------- 2. Giải mã MTEF thành cây ---------- */
  const SEL5=['ANGLE','PAREN','BRACE','BRACK','BAR','DBAR','FLOOR','CEILING','OBRACK','INTERVAL','ROOT','FRACT','UBAR','OBAR','ARROW','INTEG','SUM','PROD','COPROD','UNION','INTER','INTOP','SUMOP','LIM','HBRACE','HBRACK','LDIV','SUB','SUP','SUBSUP','DIRAC','VEC','TILDE','HAT','ARC','JSTATUS','STRIKE','BOX'];
  const SEL3={0:'ANGLE',1:'PAREN',2:'BRACE',3:'BRACK',4:'BAR',5:'DBAR',6:'FLOOR',7:'CEILING',8:'INTERVAL',9:'INTERVAL',10:'INTERVAL',11:'INTERVAL',12:'INTERVAL',13:'ROOT',14:'FRACT',15:'SCRIPT3',16:'UBAR',17:'OBAR',18:'ARROW',19:'ARROW',20:'ARROW',21:'INTEG',22:'INTEG',23:'INTEG',24:'INTEG',25:'INTEG',26:'INTEG',27:'HBRACE',28:'HBRACE',29:'SUM',30:'SUM',31:'PROD',32:'PROD',33:'COPROD',34:'COPROD',35:'UNION',36:'UNION',37:'INTER',38:'INTER',39:'LIM',40:'LDIV',41:'SLASH',42:'INTOP',43:'SUMOP',44:'SCRIPT3',45:'DIRAC',46:'VEC',47:'VEC',48:'BOX'};
  function decode(m){
    let p=0; const u8=()=>m[p++], i16=()=>{ const v=m[p]|(m[p+1]<<8); p+=2; return v; }, sz=()=>{ let s=''; while(p<m.length&&m[p]) s+=String.fromCharCode(m[p++]); p++; return s; };
    const ver=u8(); if(ver!==5&&ver!==3&&ver!==4) throw new Error('MTEF v'+ver);
    p+=4; if(ver>=4){ sz(); p++; }
    const v5=ver>=4; const mtuint=()=>{ const a=u8(); return a<255?a:i16(); };
    let lastDy=0; const nudge=()=>{ const a=u8(),b=u8(); if(a===128&&b===128){ p+=2; let d=i16(); if(d>32767) d-=65536; lastDy=d; } else lastDy=b-128; };
    const ruler=()=>{ const n=u8(); p+=n*3; };
    function rec(){ // trả về nút hoặc {end:1}
      if(p>=m.length) return {end:1};
      const tag=u8(); let type=tag, op=0;
      if(!v5){ type=tag&0x0F; op=tag>>4; }
      if(type===0) return {end:1};
      if(v5 && type<=6) op=u8();
      const NUDGE=0x08;
      switch(type){
        case 1:{ if(op&NUDGE) nudge(); if(op&0x04) p+=2; if(op&0x02) ruler(); if(op&0x01) return {t:'line',items:null}; return {t:'line',items:list()}; }
        case 2:{ lastDy=0; if(op&NUDGE) nudge(); const dy=lastDy; const tf=(u8()+128)&0xFF; let code=null, f8=null;
          if(v5){ if(!(op&0x20)) code=i16(); if(op&0x04) f8=u8(); if(op&0x10) f8=i16(); }
          else code=i16();
          const emb=[]; if(v5?(op&0x01):(op&0x02)){ list().forEach(e=>{ if(e.t==='emb') emb.push(e.e); }); }
          return {t:'char',tf,code,f8,emb,dy,fs:v5&&(op&0x02)}; }
        case 3:{ if(op&NUDGE) nudge(); const sel=u8(); let vr=u8(); if(v5&&(vr&0x80)) vr=(vr&0x7F)|(u8()<<8); p++;
          return {t:'tmpl',sel:v5?SEL5[sel]:SEL3[sel],raw:sel,vr,v5,items:list()}; }
        case 4:{ if(op&NUDGE) nudge(); const ha=u8(); u8(); if(op&0x02) ruler(); return {t:'pile',ha,items:list()}; }
        case 5:{ if(op&NUDGE) nudge(); u8(); u8(); u8(); const rows=u8(), cols=u8(); p+=Math.ceil((rows+1)*2/8)+Math.ceil((cols+1)*2/8);
          return {t:'matrix',rows,cols,items:list()}; }
        case 6:{ if(op&NUDGE) nudge(); const e=u8(); if(!v5) p++; return {t:'emb',e}; }
        case 7: ruler(); return {t:'skip'};
        case 8: if(v5){ mtuint(); p++; } else { p+=2; sz(); } return {t:'skip'};
        case 9:{ const s=u8(); if(s===101) p+=2; else if(s===100){ p+=3; } else p++; return {t:'skip'}; }
        case 10: case 13: return {t:'size',k:'full'}; case 11: case 12: case 14: return {t:'size',k:'sub'};
      }
      if(!v5) return {t:'skip'};
      switch(type){
        case 15: mtuint(); return {t:'skip'};
        case 16:{ const o=u8(); p+=(o&1)?8:6; if(o&4) sz(); return {t:'skip'}; }
        case 17: mtuint(); sz(); return {t:'skip'};
        case 18:{ p++; for(let k=0;k<2;k++){ const n=u8(); let hi=true, done=0; const nib=()=>{ let v; if(hi){ v=m[p]>>4; hi=false; } else { v=m[p]&15; hi=true; p++; } return v; };
            while(done<n){ nib(); while(nib()!==15){} done++; } if(!hi) p++; }
          const ns=u8(); for(let i=0;i<ns;i++){ if(u8()) p++; } return {t:'skip'}; }
        case 19: sz(); return {t:'skip'};
        case 102:{ mtuint(); sz(); sz(); return {t:'skip'}; }
      }
      if(type>=100){ const n=u8(); p+=n; return {t:'skip'}; }
      throw new Error('record '+type);
    }
    function list(){ const out=[]; let g=0; while(g++<100000){ const r=rec(); if(r.end) break; if(r.t!=='skip') out.push(r); } return out; }
    return list();
  }

  /* ---------- 3. Cây → LaTeX ---------- */
  const U={0x3B1:'\\alpha',0x3B2:'\\beta',0x3B3:'\\gamma',0x3B4:'\\delta',0x3B5:'\\varepsilon',0x3F5:'\\epsilon',0x3B6:'\\zeta',0x3B7:'\\eta',0x3B8:'\\theta',0x3D1:'\\vartheta',0x3B9:'\\iota',0x3BA:'\\kappa',0x3BB:'\\lambda',0x3BC:'\\mu',0x3BD:'\\nu',0x3BE:'\\xi',0x3BF:'o',0x3C0:'\\pi',0x3C1:'\\rho',0x3C2:'\\varsigma',0x3C3:'\\sigma',0x3C4:'\\tau',0x3C5:'\\upsilon',0x3C6:'\\varphi',0x3D5:'\\phi',0x3C7:'\\chi',0x3C8:'\\psi',0x3C9:'\\omega',
    0x393:'\\Gamma',0x394:'\\Delta',0x2206:'\\Delta',0x398:'\\Theta',0x39B:'\\Lambda',0x39E:'\\Xi',0x3A0:'\\Pi',0x3A3:'\\Sigma',0x3A5:'\\Upsilon',0x3A6:'\\Phi',0x3A8:'\\Psi',0x3A9:'\\Omega',0x2126:'\\Omega',
    0x2264:'\\le',0x2265:'\\ge',0x2A7D:'\\le',0x2A7E:'\\ge',0x2260:'\\ne',0x2248:'\\approx',0x2261:'\\equiv',0x223C:'\\sim',0x2245:'\\cong',0x221D:'\\propto',0x226A:'\\ll',0x226B:'\\gg',
    0x221E:'\\infty',0x2208:'\\in',0x2209:'\\notin',0x220B:'\\ni',0x2282:'\\subset',0x2283:'\\supset',0x2286:'\\subseteq',0x2287:'\\supseteq',0x2284:'\\not\\subset',0x222A:'\\cup',0x2229:'\\cap',0x2205:'\\varnothing',0x2216:'\\setminus',
    0x2192:'\\to',0x2190:'\\leftarrow',0x2194:'\\leftrightarrow',0x21D2:'\\Rightarrow',0x21D0:'\\Leftarrow',0x21D4:'\\Leftrightarrow',0x27F9:'\\Longrightarrow',0x27FA:'\\Longleftrightarrow',0x2191:'\\uparrow',0x2193:'\\downarrow',0x21A6:'\\mapsto',
    0xB1:'\\pm',0x2213:'\\mp',0xD7:'\\times',0xF7:'\\div',0x22C5:'\\cdot',0xB7:'\\cdot',0x2219:'\\cdot',0x2022:'\\cdot',0x2218:'\\circ',0xB0:'^{\\circ}',0x2212:'-',0x2013:'-',0x2032:"'",0x2033:"''",0x2034:"'''",
    0x2200:'\\forall',0x2203:'\\exists',0x2204:'\\nexists',0x2202:'\\partial',0x2207:'\\nabla',0x22A5:'\\perp',0x2225:'\\parallel',0x2016:'\\|',0x2220:'\\angle',0x2221:'\\measuredangle',0x25B3:'\\triangle',0x2026:'\\ldots',0x22EF:'\\cdots',0x22EE:'\\vdots',0x22F1:'\\ddots',
    0x2115:'\\mathbb{N}',0x2124:'\\mathbb{Z}',0x211A:'\\mathbb{Q}',0x211D:'\\mathbb{R}',0x2102:'\\mathbb{C}',0x2113:'\\ell',0x2135:'\\aleph',0x2234:'\\therefore',0x2235:'\\because',0x2223:'|',0x2227:'\\wedge',0x2228:'\\vee',0xAC:'\\neg',
    0x222B:'\\int',0x222C:'\\iint',0x222D:'\\iiint',0x222E:'\\oint',0x2211:'\\sum',0x220F:'\\prod',0x2210:'\\coprod',0x221A:'\\surd',0x27E8:'\\langle',0x27E9:'\\rangle',0x2329:'\\langle',0x232A:'\\rangle',0x230A:'\\lfloor',0x230B:'\\rfloor',0x2308:'\\lceil',0x2309:'\\rceil',
    0x7B:'\\{',0x7D:'\\}',0x25:'\\%',0x23:'\\#',0x26:'\\&',0x24:'\\$',0x5C:'\\backslash',0x7E:'\\sim',0x5E:'\\wedge',0x5F:'\\_',0x2245:'\\cong',0x2299:'\\odot',0x2295:'\\oplus',0x2297:'\\otimes',0x25CB:'\\circ',0x2205:'\\varnothing',0x2300:'\\varnothing'};
  const SYM8={0x61:0x3B1,0x62:0x3B2,0x63:0x3C7,0x64:0x3B4,0x65:0x3B5,0x66:0x3C6,0x67:0x3B3,0x68:0x3B7,0x69:0x3B9,0x6A:0x3D5,0x6B:0x3BA,0x6C:0x3BB,0x6D:0x3BC,0x6E:0x3BD,0x6F:0x3BF,0x70:0x3C0,0x71:0x3B8,0x72:0x3C1,0x73:0x3C3,0x74:0x3C4,0x75:0x3C5,0x77:0x3C9,0x78:0x3BE,0x79:0x3C8,0x7A:0x3B6,
    0x44:0x394,0x46:0x3A6,0x47:0x393,0x4C:0x39B,0x50:0x3A0,0x51:0x398,0x53:0x3A3,0x57:0x3A9,0x58:0x39E,0x59:0x3A8,0xA3:0x2264,0xB3:0x2265,0xB9:0x2260,0xA5:0x221E,0xB1:0xB1,0xB4:0xD7,0xB8:0xF7,0xAE:0x2192,0xDE:0x21D2,0xDB:0x21D4,0xCE:0x2208,0xCF:0x2209,0xC8:0x222A,0xC7:0x2229,0xCC:0x2282,0xC6:0x2205,0xB0:0xB0,0xD7:0x22C5,0xBB:0x2248,0xBA:0x2261,0xF2:0x222B,0xE5:0x2211,0x5E:0x22A5,0xD0:0x2220,0x22:0x2200,0x24:0x2203,0xB6:0x2202,0xD1:0x2207,0x2D:0x2212,0xA2:0x2032,0xBC:0x2026,0xE1:0x27E8,0xF1:0x27E9};
  const FN=new Set(['sin','cos','tan','cot','sec','csc','log','ln','lg','lim','exp','max','min','sup','inf','arcsin','arccos','arctan','sinh','cosh','tanh','coth','det','gcd','deg','dim','ker','arg','Pr','mod']);
  const VN_FN={tg:'\\tan',cotg:'\\cot'};
  const charOf=c=>{ let code=c.code; if((code==null||code===0)&&c.f8!=null) code=(c.tf===6||c.tf===4||c.tf===5)?(SYM8[c.f8]||c.f8):c.f8; return code; };
  const atom=(code,tf)=>{
    if(code==null) return '';
    if(code>=0xE000&&code<=0xF8FF){ if(code>=0xEF00&&code<=0xEF0F) return code===0xEF08||code===0xEF09?'':'\\,'; if(code>=0xF000&&code<=0xF0FF){ const s=SYM8[code-0xF000]; return s?atom(s,tf):''; } return ''; }
    if(code===0x20||code===0xA0||(code>=0x2000&&code<=0x200B)) return '\\ ';
    if(U[code]) return U[code];
    if(tf===7&&/[A-Za-z]/.test(String.fromCharCode(code))) return '\\mathbf{'+String.fromCharCode(code)+'}';
    return String.fromCodePoint(code); };
  const EMB={2:'\\dot',3:'\\ddot',4:'\\dddot',8:'\\tilde',9:'\\hat',11:'\\overrightarrow',12:'\\overleftarrow',13:'\\overleftrightarrow',14:'\\overrightarrow',15:'\\overleftarrow',17:'\\overline',19:'\\overset{\\frown}',24:'\\ddddot',29:'\\underline',30:'\\utilde',33:'\\underrightarrow',34:'\\underleftarrow'};
  const embWrap=(t,emb)=>{ emb.forEach(e=>{ if(e===5) t+="'"; else if(e===6) t+="''"; else if(e===18) t+="'''"; else if(e===7) t="{}'"+t; else if(e===10) t='\\not '+t; else if(EMB[e]) t=EMB[e]+'{'+t+'}'; }); return t; };
  const isEmpty=n=>!n||(n.t==='line'&&(!n.items||!n.items.length));
  const slotTex=n=>!n?'':n.t==='line'?lineTex(n.items):nodeTex(n);
  function lineTex(items){ if(!items) return ''; const out=[]; let i=0;
    while(i<items.length){ const n=items[i];
      if(n.t==='size'){ if(n.k==='sub'){ let j=i+1; const grp=[]; while(j<items.length&&!(items[j].t==='size')){ grp.push(items[j]); j++; }
          if(grp.length){ const dy=(grp.find(x=>x.t==='char')||{}).dy||0; const t=lineTex(grp); out.push(dy<0?'^{'+t+'}':dy>0?'_{'+t+'}':t); } i=j; continue; } i++; continue; }
      if(n.t==='char'&&(n.tf===2||n.tf===1||n.tf===9||n.tf===10)&&!n.emb.length){ // gom chữ hàm số / chữ văn bản
        const tf=n.tf===2?2:1; let s=''; let j=i; while(j<items.length&&items[j].t==='char'&&(items[j].tf===2?2:(items[j].tf===1||items[j].tf===9||items[j].tf===10)?1:0)===tf&&!items[j].emb.length&&(j===i||!(tf===2&&items[j].fs))){ s+=String.fromCodePoint(charOf(items[j])||32); j++; }
        if(tf===2){ const w=s.trim(); out.push(FN.has(w)?'\\'+w:VN_FN[w]?VN_FN[w]:/^[A-Za-z]+$/.test(w)&&w.length>1?'\\operatorname{'+w+'}':[...s].map(ch=>atom(ch.codePointAt(0),2)).join('')); }
        else { if(/^[\s\d.,;:()=+\-]*$/.test(s)) out.push([...s].map(ch=>atom(ch.codePointAt(0),3)).join('')); else out.push('\\text{'+s.replace(/\u00a0/g,' ').replace(/[{}\\]/g,'')+'}'); }
        i=j; continue; }
      out.push(nodeTex(n)); i++; }
    return join(out); }
  function join(arr){ let s=''; arr.forEach(t=>{ if(!t) return; if(/\\[A-Za-z]+$/.test(s)&&/^[A-Za-z0-9]/.test(t)) s+=' '; s+=t; }); return s; }
  const FENCE={ANGLE:['\\langle','\\rangle'],PAREN:['(',')'],BRACE:['\\{','\\}'],BRACK:['[',']'],BAR:['|','|'],DBAR:['\\|','\\|'],FLOOR:['\\lfloor','\\rfloor'],CEILING:['\\lceil','\\rceil'],OBRACK:['[',']']};
  const BIG={SUM:'\\sum',PROD:'\\prod',COPROD:'\\coprod',UNION:'\\bigcup',INTER:'\\bigcap'};
  function pileTex(n,env){ const rows=n.items.filter(x=>x.t==='line').map(l=>lineTex(l.items)); if(env==='cases') return '\\begin{cases}'+rows.join(' \\\\ ')+'\\end{cases}';
    const al=n.ha===3?'r':n.ha===2?'c':'l'; return '\\begin{array}{'+al+'}'+rows.join(' \\\\ ')+'\\end{array}'; }
  function nodeTex(n){
    if(n.t==='char') return embWrap(atom(charOf(n),n.tf),n.emb);
    if(n.t==='line') return lineTex(n.items);
    if(n.t==='pile') return pileTex(n);
    if(n.t==='matrix'){ const cells=n.items.map(slotTex); const rows=[]; for(let r=0;r<n.rows;r++) rows.push(cells.slice(r*n.cols,(r+1)*n.cols).join(' & ')); return '\\begin{array}{'+'c'.repeat(n.cols||1)+'}'+rows.join(' \\\\ ')+'\\end{array}'; }
    if(n.t!=='tmpl') return '';
    const S=n.items.filter(x=>x.t==='line'||x.t==='pile'||x.t==='matrix'), C=n.items.filter(x=>x.t==='char'), s=i=>slotTex(S[i]), v=n.vr, name=n.sel;
    if(FENCE[name]){ let L=true,R=true; if(n.v5){ if(v&3){ L=!!(v&1); R=!!(v&2); } } else { if(v===1) R=false; else if(v===2) L=false; }
      const main=S[0]; const onlyPile=main&&main.t==='line'&&main.items&&main.items.length===1&&main.items[0].t==='pile'?main.items[0]:main&&main.t==='pile'?main:null;
      if(name==='BRACE'&&L&&!R&&onlyPile) return pileTex(onlyPile,'cases');
      const [a,b]=FENCE[name]; return '\\left'+(L?a:'.')+' '+s(0)+' \\right'+(R?b:'.'); }
    switch(name){
      case 'INTERVAL':{ const a=C[0]?atom(charOf(C[0])):'(', b=C[1]?atom(charOf(C[1])):')'; return '\\left'+a+' '+s(0)+' \\right'+b; }
      case 'ROOT': return (n.v5?v===1:(!isEmpty(S[1])))&&!isEmpty(S[1])?'\\sqrt['+s(1)+']{'+s(0)+'}':'\\sqrt{'+s(0)+'}';
      case 'FRACT': return (n.v5&&(v&2))?s(0)+'/'+s(1):(n.v5&&(v&1))?'\\frac{'+s(0)+'}{'+s(1)+'}':'\\dfrac{'+s(0)+'}{'+s(1)+'}';
      case 'SLASH': return s(0)+'/'+s(1);
      case 'UBAR': return '\\underline{'+s(0)+'}';
      case 'OBAR': return '\\overline{'+s(0)+'}';
      case 'ARROW':{ const t=s(0), b=s(1); return '\\xrightarrow'+(b?'['+b+']':'')+'{'+t+'}'; }
      case 'INTEG':{ let k=n.v5?(v&3)||1:({22:2,23:3}[n.raw]||1); const loop=n.v5?(v&0x0C):(n.raw===24); const sym=loop?'\\oint':['\\int','\\iint','\\iiint'][k-1];
        const lo=s(1), up=s(2); return sym+(lo?'_{'+lo+'}':'')+(up?'^{'+up+'}':'')+' '+s(0); }
      case 'SUM': case 'PROD': case 'COPROD': case 'UNION': case 'INTER':{ const lo=s(1), up=s(2); return BIG[name]+(lo?'_{'+lo+'}':'')+(up?'^{'+up+'}':'')+' '+s(0); }
      case 'INTOP': case 'SUMOP':{ const op=C[0]?atom(charOf(C[0])):'\\sum'; const up=s(0), lo=s(1); return op+(lo?'_{'+lo+'}':'')+(up?'^{'+up+'}':''); }
      case 'LIM':{ const m=s(0)||'\\lim', lo=s(1), up=s(2); return m+(lo?'_{'+lo+'}':'')+(up?'^{'+up+'}':''); }
      case 'HBRACE': case 'HBRACK': return (n.v5?(v&1):n.raw===27)?'\\overbrace{'+s(0)+'}'+(s(1)?'^{'+s(1)+'}':''):'\\underbrace{'+s(0)+'}'+(s(1)?'_{'+s(1)+'}':'');
      case 'LDIV': return s(1)+'\\,\\big)\\,'+s(0);
      case 'SUB': case 'SUP': case 'SUBSUP':{ const a=s(0), b=s(1); return (n.v5&&(v&1)?'{}':'')+((a?'_{'+a+'}':'')+(b?'^{'+b+'}':'')||'{}'); }
      case 'SCRIPT3':{ const a=s(0), b=s(1); if(v===0) return '^{'+(a||b)+'}'; if(v===1) return '_{'+(a||b)+'}'; return (a?'_{'+a+'}':'')+(b?'^{'+b+'}':''); }
      case 'DIRAC': return '\\langle '+s(0)+(S.length>1?' | '+s(1):'')+' \\rangle';
      case 'VEC':{ let c='\\overrightarrow'; if(n.v5){ if((v&3)===3) c='\\overleftrightarrow'; else if(v&1) c='\\overleftarrow'; if(v&4) c=c.replace('over','under'); } else if(n.raw===46) c='\\overleftarrow'; return c+'{'+s(0)+'}'; }
      case 'TILDE': return '\\widetilde{'+s(0)+'}';
      case 'HAT': return '\\widehat{'+s(0)+'}';
      case 'ARC': return '\\overset{\\frown}{'+s(0)+'}';
      case 'STRIKE': return '\\cancel{'+s(0)+'}';
      case 'BOX': return '\\boxed{'+s(0)+'}';
      default: return S.map((x,i)=>s(i)).join(' ');
    }
  }
  function tidy(t){ return t.replace(/\\left\( *\\right\)/g,'()').replace(/\s{2,}/g,' ').replace(/(\\[,;: ])+$/,'').replace(/^(\\[,;: ])+/,'').replace(/\^\{\\circ\}\^\{/g,'^{\\circ}{').trim(); }

  /* ---------- 4. API ---------- */
  function mtefToTex(mtef){ const tree=decode(mtef); return tidy(tree.map(nodeTex).join('')); }
  function toTex(bytes){ // bytes: Uint8Array của oleObject*.bin
    const eq=cfbStream(bytes,'Equation Native'); if(!eq) return null;
    const hdr=eq[0]|(eq[1]<<8); return mtefToTex(eq.subarray(hdr||28)); }
  return {toTex, mtefToTex, cfbStream, decode};
})();
if(typeof module!=='undefined') module.exports=MathTypeOLE;
