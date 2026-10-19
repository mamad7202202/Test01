
(function(){var d=document,h=d.documentElement,L=h.lang,Z={};
function $(s){return d.querySelector(s)}
var tb=$('#th');tb&&tb.addEventListener('click',function(){var t=h.dataset.t=='dark'?'light':'dark';h.dataset.t=t;try{localStorage.t=t}catch(e){}});
var mb=$('#mb');mb&&mb.addEventListener('click',function(){d.body.classList.toggle('open')});
var sd=$('.side');if(sd&&mb){var cb=d.createElement('button');cb.className='ib sclose';cb.setAttribute('aria-label',mb.getAttribute('aria-label'));cb.textContent='×';cb.addEventListener('click',function(){d.body.classList.remove('open')});sd.insertBefore(cb,sd.firstChild)}
var sc=$('.scrim');sc&&sc.addEventListener('click',function(){d.body.classList.remove('open')});
d.addEventListener('keydown',function(e){if(e.key=='Escape')d.body.classList.remove('open')});
var box=$('#stats');if(!box)return;
var R=box.dataset.repo,nf=new Intl.NumberFormat(L),df=new Intl.DateTimeFormat(L,{dateStyle:'medium'});
function get(u){var k='g:'+u;try{var c=JSON.parse(localStorage[k]);if(Date.now()-c.t<9e5)return Promise.resolve(c.d)}catch(e){}
return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){try{localStorage[k]=JSON.stringify({t:Date.now(),d:j})}catch(e){}return j})}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return'&#'+c.charCodeAt(0)+';'})}
Promise.all([get('https://api.github.com/repos/'+R),get('https://api.github.com/repos/'+R+'/releases?per_page=30')]).then(function(a){
var r=a[0],rel=a[1],sum=function(x){return x.assets.reduce(function(n,s){return n+s.download_count},0)},tot=rel.reduce(function(n,x){return n+sum(x)},0),lt=rel.filter(function(x){return /^v\d/.test(x.tag_name)})[0]||rel[0],rl=rel.filter(function(x){return x.tag_name=='latest'})[0]||lt;
var T=JSON.parse(box.dataset.t);
var tiles=[[nf.format(r.stargazers_count),T.st],[nf.format(r.forks_count),T.fk],[lt?lt.tag_name:'-',T.ver],[nf.format(tot),T.dls],[df.format(new Date(r.pushed_at)),T.push]];
var html='<div class=tiles>'+tiles.map(function(t){return'<div class=tile><b>'+esc(t[0])+'</b><span>'+esc(t[1])+'</span></div>'}).join('')+'</div>';
var rs=rel.slice(0,8).reverse();
if(rs.length){var m=Math.max.apply(0,rs.map(sum).concat(1)),w=600/rs.length,bars=rs.map(function(x,i){var v=sum(x),hh=Math.max(3,v/m*150),X=i*w+w*.18,BW=w*.64;
return'<g><title>'+esc(x.tag_name)+': '+nf.format(v)+'</title><rect x='+X+' y='+(180-hh)+' width='+BW+' height='+hh+' rx=7 style="animation-delay:'+i*60+'ms"/><text class=v x='+(X+BW/2)+' y='+(172-hh)+' text-anchor=middle>'+nf.format(v)+'</text><text x='+(X+BW/2)+' y=200 text-anchor=middle>'+esc(x.tag_name.slice(0,9))+'</text></g>'}).join('');
html+='<div class=chart><h3>'+T.per+'</h3><svg viewBox="0 0 600 210" role=img aria-label="'+esc(T.per)+'">'+bars+'</svg></div>'}
else html+='<p class=msg>'+T.none+'</p>';
box.innerHTML=html;
var ib=$('#dl');if(ib&&rl){var ap=rl.assets.filter(function(s){return /\.apk$/i.test(s.name)}),as=ap.filter(function(s){return /arm64/i.test(s.name)})[0]||ap[0];ib.href=as?as.browser_download_url:rl.html_url}
}).catch(function(){var T=JSON.parse(box.dataset.t);box.innerHTML='<p class=msg>'+T.err+' <a href="https://github.com/'+R+'">'+T.open+'</a></p>'})})();
