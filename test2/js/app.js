(()=>{
const R='mamad7202202/dragon-agent-mobile',D=document,H=D.documentElement,$=s=>D.querySelector(s),
S=(()=>{try{return localStorage}catch{return{}}})(),sv=(k,v)=>{try{S[k]=v}catch{}},
T={en:{err:'Live data is unavailable right now.',retry:'Retry',stale:'Showing saved data.',a:'Android arm64',u:'Android universal',i:'iOS',mb:'MB'},
fa:{err:'داده‌های زنده فعلاً در دسترس نیست.',retry:'تلاش دوباره',stale:'داده‌های ذخیره‌شده نمایش داده می‌شود.',a:'اندروید arm64',u:'اندروید universal',i:'iOS',mb:'مگابایت'}},
C=['var(--c1)','var(--c2)','var(--c3)'],
k=n=>/\.ipa$/i.test(n)?2:/arm64/i.test(n)?0:/universal/i.test(n)?1:3,
L=$('#live');let G,E=0,ST=0;
const bar=()=>{$('meta[name=theme-color]').content=getComputedStyle(H).getPropertyValue('--bg').trim()},
ti=()=>{D.title=H.dataset[H.lang]};
ti();bar();
$('#tt').onclick=()=>{const t=H.dataset.t=='dark'?'light':'dark';H.dataset.t=t;sv('t',t);bar()};
$('#lg').onclick=()=>{const l=H.lang=='fa'?'en':'fa';H.lang=l;H.dir=l=='fa'?'rtl':'ltr';sv('l',l);ti();draw();msg(E,ST)};
const tg=o=>{H.classList.toggle('open',o);$('#mb').setAttribute('aria-expanded',o)};
$('#mb').onclick=()=>tg(!H.classList.contains('open'));
$('.scrim').onclick=()=>tg(false);
$('.sheet').onclick=e=>e.target.closest('a')&&tg(false);
addEventListener('keydown',e=>e.key=='Escape'&&tg(false));
const toc=$('#toc');
if(toc){
 $('.sheet').insertAdjacentHTML('beforeend','<hr>'+toc.innerHTML);
 const ls=[...toc.querySelectorAll('a')],io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&ls.forEach(a=>a.classList.toggle('on',a.hash=='#'+e.target.id))),{rootMargin:'-15% 0px -75% 0px'});
 D.querySelectorAll('.doc section[id]').forEach(s=>io.observe(s));
}
function msg(e,s){
 E=e;ST=s;const m=$('#msg');if(!m)return;
 m.hidden=!(e||s);const t=T[H.lang];
 m.innerHTML=e?`${t.err} <button id=rt>${t.retry}</button>`:s?t.stale:'';
 const b=$('#rt');if(b)b.onclick=load;
}
function draw(){
 if(!G)return;
 const l=H.lang,t=T[l],loc=l=='fa'?'fa-IR':'en',f=new Intl.NumberFormat(loc),
 rs=G.rel.map(r=>{const v=[0,0,0,0];r.assets.forEach(a=>v[k(a.name)]+=a.download_count);return{n:r.tag_name,d:+new Date(r.published_at),v,s:v[0]+v[1]+v[2]+v[3]}}).sort((a,b)=>a.d-b.d),
 tot=rs.reduce((x,r)=>x+r.s,0),sh=rs.slice(-10).reverse(),mx=Math.max(1,...sh.map(r=>r.s)),
 p=[0,1,2].map(j=>rs.reduce((x,r)=>x+r.v[j],0)),ps=p[0]+p[1]+p[2]||1,
 nm=[t.a,t.u,t.i];
 if(L){
  const d=(Date.now()-new Date(G.repo.pushed_at))/864e5,rt=new Intl.RelativeTimeFormat(loc,{numeric:'auto'});
  $('#s1').textContent=f.format(tot);$('#s2').textContent=f.format(rs.length);$('#s3').textContent=f.format(G.repo.stargazers_count);
  $('#s4').textContent=d<1?rt.format(-Math.max(1,Math.round(d*24)),'hour'):d<60?rt.format(-Math.round(d),'day'):rt.format(-Math.round(d/30),'month');
  $('#bars').innerHTML=sh.map((r,i)=>`<li><b>${r.n}</b><span class=tr><i style="width:${r.s?Math.max(r.s/mx*100,1.5):0}%;--n:${i}">${r.v.map((v,j)=>`<u style="flex:${v};background:${C[j]||'var(--mu)'}"></u>`).join('')}</i></span><em>${f.format(r.s)}</em></li>`).join('');
  let a=0;
  $('#dn').innerHTML='<circle r="15.9155" cx="21" cy="21" style="stroke:var(--s2);stroke-dasharray:100 0"/>'+p.map((v,j)=>{const w=v/ps*100,c=`<circle r="15.9155" cx="21" cy="21" data-w="${Math.max(w-1.2,0)}" style="stroke:${C[j]};stroke-dashoffset:${-a};stroke-dasharray:0 100"/>`;a+=w;return c}).join('');
  const pf=new Intl.NumberFormat(loc,{style:'percent'});
  $('#lgd').innerHTML=p.map((v,j)=>`<li><span class=dot style="background:${C[j]}"></span>${nm[j]}<em>${pf.format(v/ps)}</em></li>`).join('');
  requestAnimationFrame(()=>requestAnimationFrame(()=>$('#dn').querySelectorAll('[data-w]').forEach(c=>c.style.strokeDasharray=c.dataset.w+' 100')));
 }
 const dl=$('#dl'),lr=G.rel.find(r=>r.tag_name=='latest')||G.rel[0];
 if(dl&&lr){
  const h=lr.assets.filter(a=>k(a.name)<3).map(a=>`<a class=row href="${a.browser_download_url}"><span><b><bdi>${a.name}</bdi></b><small>${nm[k(a.name)]}</small></span><small>${f.format(Math.round(a.size/1048576))} ${t.mb}</small></a>`).join('');
  if(h)dl.innerHTML=h;
 }
}
function fin(s){draw();if(L){L.setAttribute('aria-busy',false);requestAnimationFrame(()=>L.classList.add('go'))}msg(0,s)}
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
const cap=$('.cap');let y=scrollY;
addEventListener('scroll',()=>{const n=scrollY;cap.classList.toggle('hide',n>y&&n>140&&!H.classList.contains('open'));y=n},{passive:true});
const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}}),{threshold:.12});
D.querySelectorAll('.rv').forEach(e=>ro.observe(e));
})();
