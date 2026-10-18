(()=>{
const R='mamad7202202/dragon-agent-mobile',D=document,H=D.documentElement,$=s=>D.querySelector(s),
S=(()=>{try{return localStorage}catch{return{}}})(),sv=(k,v)=>{try{S[k]=v}catch{}},
RM=matchMedia('(prefers-reduced-motion:reduce)').matches,
T={en:{err:'Live data is unavailable right now.',retry:'Retry',stale:'Showing saved data.',a:'Android arm64',u:'Android universal',i:'iOS',mb:'MB'},
fa:{err:'داده‌های زنده فعلاً در دسترس نیست.',retry:'تلاش دوباره',stale:'داده‌های ذخیره‌شده نمایش داده می‌شود.',a:'اندروید arm64',u:'اندروید universal',i:'iOS',mb:'مگابایت'}},
C=['var(--e1)','var(--e2)','var(--e3)'],
k=n=>/\.ipa$/i.test(n)?2:/arm64/i.test(n)?0:/universal/i.test(n)?1:3,
L=$('#live'),bar=$('.bar');let G,E=0,ST=0,first=1;
const tc=()=>{$('meta[name=theme-color]').content=getComputedStyle(H).getPropertyValue('--bg').trim()},ti=()=>{D.title=H.dataset[H.lang]};
ti();tc();
$('#tt').onclick=()=>{const t=H.dataset.t=='dark'?'light':'dark';H.dataset.t=t;sv('t',t);tc()};
$('#lg').onclick=()=>{const l=H.lang=='fa'?'en':'fa';H.lang=l;H.dir=l=='fa'?'rtl':'ltr';sv('l',l);ti();draw();msg(E,ST)};
const tg=o=>{H.classList.toggle('open',o);$('#mb').setAttribute('aria-expanded',o)};
$('#mb').onclick=()=>tg(!H.classList.contains('open'));
$('.scrim').onclick=()=>tg(false);
$('.sheet').onclick=e=>e.target.closest('a')&&tg(false);
addEventListener('keydown',e=>e.key=='Escape'&&tg(false));
const toc=$('#toc');
if(toc){
 $('.sheet>div').insertAdjacentHTML('beforeend','<hr>'+toc.innerHTML);
 const ls=[...toc.querySelectorAll('a')],io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&ls.forEach(a=>a.classList.toggle('on',a.hash=='#'+e.target.id))),{rootMargin:'-15% 0px -75% 0px'});
 D.querySelectorAll('.doc section[id]').forEach(s=>io.observe(s));
}
const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}}),{threshold:.1});
D.querySelectorAll('.rv').forEach(e=>ro.observe(e));
const hero=$('#hero');
if(hero&&!RM){
 const fx=$('.fx');let h='';
 for(let i=0;i<14;i++)h+=`<i class=sp style="left:${Math.random()*100}%;--z:${3+Math.random()*4|0}px;--x:${(Math.random()-.5)*90|0}px;--d:${5+Math.random()*5}s;--l:${-Math.random()*8}s"></i>`;
 fx.innerHTML=h;
 new IntersectionObserver(es=>hero.classList.toggle('off',!es[0].isIntersecting)).observe(hero);
}
function msg(e,s){
 E=e;ST=s;const m=$('#msg');if(!m)return;
 m.hidden=!(e||s);const t=T[H.lang];
 m.innerHTML=e?`${t.err} <button id=rt>${t.retry}</button>`:s?t.stale:'';
 const b=$('#rt');if(b)b.onclick=load;
}
const cu=(el,to,f)=>{if(RM||!first){el.textContent=f.format(to);return}let t0;const st=t=>{t0??=t;const p=Math.min((t-t0)/900,1);el.textContent=f.format(Math.round(to*(1-(1-p)**3)));p<1&&requestAnimationFrame(st)};requestAnimationFrame(st)};
function draw(){
 if(!G)return;
 const l=H.lang,t=T[l],loc=l=='fa'?'fa-IR':'en',f=new Intl.NumberFormat(loc),cf=new Intl.NumberFormat(loc,{notation:'compact'}),
 rs=G.rel.map(r=>{const v=[0,0,0,0];r.assets.forEach(a=>v[k(a.name)]+=a.download_count);return{n:r.tag_name,d:+new Date(r.published_at),v,s:v[0]+v[1]+v[2]+v[3]}}).sort((a,b)=>a.d-b.d),
 tot=rs.reduce((x,r)=>x+r.s,0),sh=rs.slice(-10),mx=Math.max(1,...sh.map(r=>r.s)),
 p=[0,1,2].map(j=>rs.reduce((x,r)=>x+r.v[j],0)),ps=p[0]+p[1]+p[2]||1,nm=[t.a,t.u,t.i];
 if(L){
  const d=(Date.now()-new Date(G.repo.pushed_at))/864e5,rt=new Intl.RelativeTimeFormat(loc,{numeric:'auto'});
  cu($('#s1'),tot,f);cu($('#s2'),rs.length,f);cu($('#s3'),G.repo.stargazers_count,f);
  $('#s4').textContent=d<1?rt.format(-Math.max(1,Math.round(d*24)),'hour'):d<60?rt.format(-Math.round(d),'day'):rt.format(-Math.round(d/30),'month');
  $('#bars').innerHTML=sh.map((r,i)=>`<li style="--n:${i}"><em>${cf.format(r.s)}</em><div class=col><span class=spk style="height:${r.s?Math.max(r.s/mx*100,8):0}%">${r.v.slice(0,3).map((v,j)=>`<u style="flex:${v};background:${C[j]}"></u>`).join('')}</span></div><b>${r.n}</b></li>`).join('');
  $('#sbw').innerHTML=`<div class=sb>${p.map((v,j)=>`<u style="flex:${v||.001};background:${C[j]}"></u>`).join('')}</div>`;
  const pf=new Intl.NumberFormat(loc,{style:'percent'});
  $('#lgd').innerHTML=p.map((v,j)=>`<li><span class=dot style="background:${C[j]}"></span>${nm[j]}<em>${pf.format(v/ps)}</em></li>`).join('');
 }
 const dl=$('#dl'),lr=G.rel.find(r=>r.tag_name=='latest')||G.rel[0];
 if(dl&&lr){
  const h=lr.assets.filter(a=>k(a.name)<3).map(a=>`<a class=pl href="${a.browser_download_url}"><span><b><bdi>${a.name}</bdi></b><small>${nm[k(a.name)]}</small></span><small>${f.format(Math.round(a.size/1048576))} ${t.mb}</small></a>`).join('');
  if(h)dl.innerHTML=h;
 }
}
function fin(s){draw();first=0;if(L){L.setAttribute('aria-busy',false);requestAnimationFrame(()=>requestAnimationFrame(()=>L.classList.add('go')))}msg(0,s)}
async function load(){
 const c=(()=>{try{return JSON.parse(S.d)}catch{}})();
 if(c&&Date.now()-c.at<6e5){G=c;return fin()}
 try{
  const [a,b]=await Promise.all([fetch(`https://api.github.com/repos/${R}`),fetch(`https://api.github.com/repos/${R}/releases?per_page=100`)]);
  if(!a.ok||!b.ok)throw 0;
  const r=await a.json(),x=await b.json();
  G={at:Date.now(),repo:{stargazers_count:r.stargazers_count,pushed_at:r.pushed_at},rel:x.map(e=>({tag_name:e.tag_name,published_at:e.published_at,assets:e.assets.map(s=>({name:s.name,size:s.size,download_count:s.download_count,browser_download_url:s.browser_download_url}))}))};
  sv('d',JSON.stringify(G));fin();
 }catch{
  if(c){G=c;fin(1)}else{if(L){L.setAttribute('aria-busy',false);L.classList.add('er')}msg(1,0)}
 }
}
if(L||$('#dl'))load();
})();
