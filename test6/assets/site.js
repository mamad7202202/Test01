(() => {
  const root = document.documentElement;
  const lang = root.lang === 'fa' ? 'fa' : 'en';
  const locale = lang === 'fa' ? 'fa-IR' : 'en-US';
  try { localStorage.setItem('dragon-language', lang); } catch {}

  // Theme preference is shared between the two language routes.
  const applyTheme = theme => {
    root.dataset.theme = theme;
    try { localStorage.setItem('dragon-theme', theme); } catch {}
  };
  document.querySelectorAll('.theme-toggle').forEach(button => {
    button.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
  });

  // Small docs drawer with focus containment and return focus.
  const drawer = document.querySelector('.docs-drawer');
  if (drawer) {
    const openButton = document.querySelector('.menu-open');
    const closeButton = document.querySelector('.menu-close');
    const backdrop = document.querySelector('.drawer-backdrop');
    let returnFocus = null;
    const focusable = () => [...drawer.querySelectorAll('a[href],button:not([disabled])')];
    const open = () => {
      returnFocus = document.activeElement;
      drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden','false');
      openButton.setAttribute('aria-expanded','true'); backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add('is-open'));
      document.body.classList.add('drawer-active'); closeButton.focus();
    };
    const close = () => {
      drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden','true');
      openButton.setAttribute('aria-expanded','false'); backdrop.classList.remove('is-open');
      document.body.classList.remove('drawer-active');
      window.setTimeout(() => { backdrop.hidden = true; }, 300);
      if (returnFocus) returnFocus.focus();
    };
    openButton.addEventListener('click',open); closeButton.addEventListener('click',close);
    backdrop.addEventListener('click',close);
    document.addEventListener('keydown',event => {
      if (!drawer.classList.contains('is-open')) return;
      if (event.key === 'Escape') { event.preventDefault(); close(); return; }
      if (event.key !== 'Tab') return;
      const items = focusable(); if (!items.length) return;
      const first = items[0], last = items[items.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }

  // Reveal only the hero and section heading once.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('js-reveal');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold:.12});
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  // Permalinks make article headings directly addressable.
  document.querySelectorAll('.doc-article h1[id],.doc-article h2[id],.doc-article h3[id]').forEach(heading => {
    const link = document.createElement('a'); link.className='anchor-link'; link.href=`#${heading.id}`;
    link.setAttribute('aria-label',lang === 'fa' ? 'پیوند مستقیم به این بخش' : 'Permalink to this section'); link.textContent='#';
    heading.append(link);
  });

  // Copy controls are added only to real code blocks.
  document.querySelectorAll('.doc-article pre').forEach(pre => {
    const controls = document.createElement('div'); controls.className='code-tools';
    const label = document.createElement('span'); label.className='code-language';
    label.textContent = pre.dataset.language || 'text'; controls.append(label);
    const button = document.createElement('button'); button.type='button'; button.className='copy-button';
    button.textContent = lang === 'fa' ? 'کپی' : 'Copy';
    button.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pre.querySelector('code')?.innerText || pre.innerText);
        button.textContent = lang === 'fa' ? 'کپی شد' : 'Copied';
        setTimeout(() => button.textContent = lang === 'fa' ? 'کپی' : 'Copy', 1400);
      } catch { button.textContent = lang === 'fa' ? 'کپی نشد' : 'Copy failed'; }
    });
    controls.append(button); pre.append(controls);
  });

  // GitHub stats: one cached snapshot, no fabricated fallback numbers.
  const statsRoot = document.querySelector('.stat-grid');
  if (!statsRoot) return;
  const repo = 'mamad7202202/dragon-agent-mobile';
  const cacheKey = 'dragon-gh-snapshot-v1';
  const ttl = 15 * 60 * 1000;
  const fmt = value => new Intl.NumberFormat(locale, {maximumFractionDigits:0}).format(value);
  const dateFmt = new Intl.DateTimeFormat(locale, {year:'numeric',month:'short',day:'numeric'});
  const markFailure = () => {
    document.querySelector('#downloads-chart')?.setAttribute('aria-busy','false');
    statsRoot.querySelectorAll('strong').forEach(n => {n.classList.remove('skeleton'); n.removeAttribute('aria-label'); n.textContent='—';});
    const panel = document.querySelector('.release-panel');
    const chart = document.querySelector('#downloads-chart');
    if (chart) chart.innerHTML='';
    panel?.querySelector('.stats-error')?.removeAttribute('hidden');
  };
  const setStat = (key, value, date=false) => {
    const node = statsRoot.querySelector(`[data-stat="${key}"] strong`);
    if (!node) return;
    node.classList.remove('skeleton'); node.removeAttribute('aria-label'); if (date) node.classList.add('date-value'); node.textContent=value;
  };
  const api = async path => {
    const controller=new AbortController(); const timeout=setTimeout(()=>controller.abort(),12000);
    let response; try {response=await fetch(`https://api.github.com/${path}`, {headers:{Accept:'application/vnd.github+json'},signal:controller.signal});} finally {clearTimeout(timeout)}
    if (!response.ok) throw new Error(`GitHub ${response.status}`);
    return response.json();
  };
  const loadStats = async () => {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (cached && Date.now()-cached.time < ttl) return cached.data;
    } catch {}
    const [r, issues, releases] = await Promise.all([
      api(`repos/${repo}`),
      api(`search/issues?q=${encodeURIComponent(`repo:${repo} type:issue state:open`)}&per_page=1`),
      api(`repos/${repo}/releases?per_page=20`)
    ]);
    const versioned = releases.filter(item => /^v?\d+\.\d+\.\d+$/.test(item.tag_name||'') && item.assets?.some(asset=>asset.name.toLowerCase().endsWith('.apk')))
      .sort((a,b)=>{const x=(a.tag_name.match(/\d+/g)||[]).map(Number),y=(b.tag_name.match(/\d+/g)||[]).map(Number);for(let i=0;i<3;i++){if((x[i]||0)!==(y[i]||0))return (y[i]||0)-(x[i]||0)}return 0});
    const latest=versioned[0] || null;
    const asset=latest?.assets?.find(a=>/arm64/i.test(a.name)&&/\.apk$/i.test(a.name)) || latest?.assets?.find(a=>/\.apk$/i.test(a.name));
    const chartReleases=releases.filter(item=>!item.draft && item.assets?.length).slice(0,6).reverse().map(item=>({tag:item.tag_name,downloads:item.assets.reduce((sum,a)=>sum+(Number(a.download_count)||0),0)}));
    const data={stars:r.stargazers_count,forks:r.forks_count,issues:issues.total_count,pushed:r.pushed_at,latest:latest?.tag_name?.replace(/^v/, '') || null,asset:asset?.browser_download_url || null,chartReleases};
    try {localStorage.setItem(cacheKey,JSON.stringify({time:Date.now(),data}));} catch {}
    return data;
  };
  const escapeHtml = value => String(value).replace(/[&<>\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
  const renderChart = releases => {
    const host=document.querySelector('#downloads-chart'); if (!host) return;
    host.setAttribute('aria-busy','false');
    if (!releases.length) {host.innerHTML=`<p class="chart-loading">${lang==='fa'?'هنوز release دارای فایل برای نمایش نیست.':'No release assets are available to chart yet.'}</p>`;return;}
    const width=420,height=210,pad={l:48,r:8,t:18,b:42};
    const max=Math.max(1,...releases.map(x=>x.downloads));
    const slot=(width-pad.l-pad.r)/releases.length, barW=Math.min(38,slot*.54), chartH=height-pad.t-pad.b;
    const ticks=3; let grid='';
    for(let i=0;i<=ticks;i++){const val=Math.round(max*i/ticks),y=pad.t+chartH-(chartH*i/ticks);grid+=`<line class="chart-grid" x1="${pad.l}" x2="${width-pad.r}" y1="${y}" y2="${y}"/><text x="${pad.l-7}" y="${y+4}" text-anchor="end">${fmt(val)}</text>`;}
    let bars='';
    releases.forEach((rel,i)=>{const h=Math.max(rel.downloads?2:0,chartH*rel.downloads/max),x=pad.l+slot*i+(slot-barW)/2,y=pad.t+chartH-h;
      const safeTag=escapeHtml(rel.tag); const label=`${safeTag}: ${fmt(rel.downloads)} ${lang==='fa'?'دریافت':'downloads'}`;
      bars+=`<g><rect class="bar" x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" tabindex="0" role="img" aria-label="${label}"><title>${label}</title></rect><text class="bar-label" x="${x+barW/2}" y="${Math.max(pad.t+10,y-5)}" text-anchor="middle">${fmt(rel.downloads)}</text><text class="chart-axis" x="${x+barW/2}" y="${height-12}" text-anchor="middle">${escapeHtml(rel.tag.slice(0,10))}</text></g>`;
    });
    const title=lang==='fa'?'دریافت فایل‌ها در releaseها':'Downloads by release';
    const desc=lang==='fa'?'مجموع تعداد دریافت assetهای هر انتشار. با کلید Tab روی ستون‌ها حرکت کنید.':'Total downloads across assets in each release. Tab through bars to hear values.';
    const rows=releases.map(r=>`<tr><th scope="row">${escapeHtml(r.tag)}</th><td>${fmt(r.downloads)}</td></tr>`).join('');
    host.innerHTML=`<svg class="download-chart" viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="chart-title chart-desc"><title id="chart-title">${title}</title><desc id="chart-desc">${desc}</desc>${grid}${bars}</svg><table class="chart-table"><caption>${title}</caption><thead><tr><th>${lang==='fa'?'نسخه':'Release'}</th><th>${lang==='fa'?'تعداد دریافت':'Downloads'}</th></tr></thead><tbody>${rows}</tbody></table>`;
  };
  loadStats().then(data=>{
    setStat('stars',fmt(data.stars));setStat('forks',fmt(data.forks));setStat('issues',fmt(data.issues));
    setStat('updated',data.pushed?dateFmt.format(new Date(data.pushed)):'—',true);
    setStat('version',data.latest||'—');
    const install=document.querySelector('#install-link'),version=document.querySelector('#release-version');
    if(data.asset){try{const target=new URL(data.asset);if(target.protocol==='https:'&&target.hostname==='github.com'){install.href=target.href;install.removeAttribute('target');install.removeAttribute('rel');}}catch{}}
    if(data.latest&&version)version.textContent=`${lang==='fa'?'نسخهٔ':'v'}${data.latest}`;
    renderChart(data.chartReleases);
  }).catch(markFailure);
})();
