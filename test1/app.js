/* Dragon Agent Mobile docs
   The menu works without JavaScript (checkbox + label). This file adds the
   theme switch, Escape-to-close, and live data from the GitHub API, cached
   for 10 minutes. Stale cache is used when GitHub is unreachable. */
(() => {
  'use strict';
  const REPO = 'mamad7202202/dragon-agent-mobile';
  const API = 'https://api.github.com/repos/' + REPO;
  const FA = document.documentElement.lang === 'fa';
  const L = FA ? 'fa' : 'en';
  const T = FA ? {
    rel: 'انتشار', dl: 'دانلود', latest: 'latest', none: 'هنوز دانلودی ثبت نشده است.',
    err: 'پاسخی از GitHub نیامد. چند دقیقه‌ی دیگر دوباره امتحان کنید.', open: 'باز کردن ریلیزها در GitHub',
    hint: ['بیشتر گوشی‌ها', 'همه‌ی پردازنده‌ها', 'نصب دستی'],
    kinds: ['اندروید arm64', 'اندروید universal', 'iOS', 'سایر'], lic: 'مجوز'
  } : {
    rel: 'Released', dl: 'downloads', latest: 'latest', none: 'No downloads recorded yet.',
    err: 'GitHub didn’t respond. Try again in a minute.', open: 'Open releases on GitHub',
    hint: ['Most phones', 'Every chip', 'Sideload'],
    kinds: ['Android arm64', 'Android universal', 'iOS', 'Other'], lic: 'license'
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- theme ---------- */
  const root = document.documentElement, themeBtns = $$('[data-th]');
  const paint = () => themeBtns.forEach(b => b.setAttribute('aria-pressed',
    String(b.dataset.th === (root.dataset.theme || 'system'))));
  themeBtns.forEach(b => b.addEventListener('click', () => {
    const t = b.dataset.th;
    try { t === 'system' ? localStorage.removeItem('dg-theme') : localStorage.setItem('dg-theme', t); } catch {}
    t === 'system' ? delete root.dataset.theme : (root.dataset.theme = t);
    paint();
  }));
  paint();

  /* ---------- menu ---------- */
  const mt = $('#mt');
  if (mt) {
    addEventListener('keydown', e => { if (e.key === 'Escape') mt.checked = false; });
    addEventListener('pageshow', () => { mt.checked = false; });
    matchMedia('(min-width: 860px)').addEventListener('change', () => { mt.checked = false; });
  }

  /* ---------- formatting ---------- */
  const nf = new Intl.NumberFormat(L);
  const cf = new Intl.NumberFormat(L, { notation: 'compact', maximumFractionDigits: 1 });
  const fmt = n => n >= 1e4 ? cf.format(n) : nf.format(n);
  const rtf = new Intl.RelativeTimeFormat(L, { numeric: 'auto' });
  const UNITS = [['year', 31536e3], ['month', 2592e3], ['day', 864e2], ['hour', 36e2], ['minute', 60]];
  const ago = d => {
    const s = (new Date(d) - Date.now()) / 1e3;
    for (const [unit, size] of UNITS) if (Math.abs(s) >= size) return rtf.format(Math.round(s / size), unit);
    return rtf.format(0, 'minute');
  };
  const kind = n => /arm64/.test(n) ? 0 : /universal/.test(n) ? 1 : /\.ipa$/i.test(n) ? 2 : 3;
  const tagText = t => t === 'latest' ? T.latest : t.replace(/^v/, '');

  /* ---------- data ---------- */
  const get = async (key, url, map, ttl = 6e5) => {
    let cached;
    try { cached = JSON.parse(localStorage[key]); } catch {}
    if (cached && Date.now() - cached.t < ttl) return cached.d;
    try {
      const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw 0;
      const d = map(await res.json());
      try { localStorage[key] = JSON.stringify({ t: Date.now(), d }); } catch {}
      return d;
    } catch {
      if (cached) return cached.d;
      throw 0;
    }
  };

  const needsReleases = $('[data-assets], #c-bars');
  const releases = needsReleases ? get('dg-rel2', API + '/releases?per_page=100', list => {
    const all = list.filter(r => !r.draft);
    const formal = all.filter(r => /^v\d/.test(r.tag_name));
    const top = formal[0] || all[0];
    const rolling = all.find(r => r.tag_name === 'latest') || top;
    const rels = all.filter(r => r.assets.length).map(r => ({
      t: r.tag_name, at: r.published_at,
      a: r.assets.map(a => ({ n: a.name, c: a.download_count }))
    })).sort((a, b) => a.at < b.at ? -1 : 1);
    return {
      tag: top && top.tag_name, at: top && top.published_at, formal: formal.length, rels,
      assets: (rolling ? rolling.assets : []).map(a => ({ n: a.name, s: a.size, c: a.download_count, u: a.browser_download_url }))
    };
  }) : null;
  const repo = $('#f-star') ? get('dg-repo2', API, r => ({ stars: r.stargazers_count })) : null;
  const commits = $('#cl') ? get('dg-log2', API + '/commits?per_page=8', list => list.map(c => ({
    m: c.commit.message.split('\n')[0], d: c.commit.author.date, u: c.html_url
  }))) : null;

  const sum = r => r.a.reduce((n, a) => n + a.c, 0);
  const failMsg = `${T.err} <a href="https://github.com/${REPO}/releases">${T.open}</a>`;
  const reveal = el => requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('go')));

  /* ---------- download rows ---------- */
  const panel = d => {
    const rows = d.assets.filter(a => /\.(apk|ipa)$/i.test(a.n)).sort((a, b) => kind(a.n) - kind(b.n)).map(a => {
      const k = kind(a.n);
      return `<a class="row" href="${esc(a.u)}"><span class="t"><b>${esc(T.kinds[k])}</b>` +
        (T.hint[k] ? `<i class="chip e">${T.hint[k]}</i>` : '') + `<small>${esc(a.n)}</small></span>` +
        `<span class="m">${(a.s / 1048576).toFixed(1)} MB</span>` +
        `<span class="m c">${fmt(a.c)} ${T.dl}</span><svg class="ic"><use href="#i-dl"/></svg></a>`;
    }).join('');
    if (!rows) return '';
    return `<div class="dl-h"><span class="v">${esc(d.tag)}</span>` +
      `<span class="live-s"><i class="dot"></i>${T.rel} ${ago(d.at)}</span></div>${rows}`;
  };

  /* ---------- charts ---------- */
  const barsChart = (rels, cur, n) => {
    const list = rels.slice(-n), max = Math.max(1, ...list.map(sum));
    return `<div class="bars">${list.map(r => {
      const v = sum(r);
      return `<div class="col${r.t === cur ? ' cur' : ''}" title="${esc(r.t)}: ${nf.format(v)} ${T.dl}">` +
        `<span class="val">${fmt(v)}</span><div class="trk"><i style="--h:${Math.round(v / max * 100)}%"></i></div>` +
        `<span class="tag">${esc(tagText(r.t))}</span></div>`;
    }).join('')}</div>`;
  };

  const growthChart = rels => {
    const W = 400, H = 170, P = 8;
    let run = 0;
    const cum = rels.map(r => (run += sum(r)));
    if (cum.length < 2) cum.push(cum[0] || 0);
    const total = cum[cum.length - 1] || 1, step = (W - 2 * P) / (cum.length - 1);
    const xs = cum.map((_, i) => P + i * step);
    const ys = cum.map(v => H - P - (v / total) * (H - 2 * P - 6));
    let d = `M${xs[0]},${ys[0]}`;
    for (let i = 1; i < xs.length; i++) {
      const mx = (xs[i - 1] + xs[i]) / 2;
      d += ` C${mx},${ys[i - 1]} ${mx},${ys[i]} ${xs[i]},${ys[i]}`;
    }
    const grid = [.25, .5, .75].map(f => `<line class="gd" x1="0" x2="${W}" y1="${(H - P - f * (H - 2 * P - 6)).toFixed(1)}" y2="${(H - P - f * (H - 2 * P - 6)).toFixed(1)}"/>`).join('');
    const mon = r => new Date(r.at).toLocaleDateString(L, { month: 'short', year: 'numeric' });
    const first = rels[0], last = rels[rels.length - 1];
    return `<svg class="area" viewBox="0 0 ${W} ${H}" role="img" aria-label="${nf.format(total)} ${T.dl}">${grid}` +
      `<path class="fl" d="${d} L${xs[xs.length - 1]},${H - P} L${xs[0]},${H - P}Z"/>` +
      `<path class="ln" pathLength="1" d="${d}"/>` +
      `<circle class="pt" cx="${xs[xs.length - 1]}" cy="${ys[ys.length - 1]}" r="4.5"/></svg>` +
      `<div class="axis"><span>${esc(mon(first))}</span><b>${nf.format(total)}</b><span>${esc(mon(last))}</span></div>`;
  };

  const splitChart = rels => {
    const totals = [0, 0, 0, 0];
    rels.forEach(r => r.a.forEach(a => { totals[kind(a.n)] += a.c; }));
    const all = totals.reduce((a, b) => a + b, 0);
    if (!all) return `<p class="empty">${T.none}</p>`;
    const parts = totals.map((v, i) => ({ v, i })).filter(p => p.v > 0);
    const color = i => `var(--c${i + 1})`;
    return `<div class="seg" role="img">${parts.map(p => `<i style="--v:${p.v};--k:${color(p.i)}"></i>`).join('')}</div>` +
      `<ul class="leg">${parts.map(p => `<li style="--k:${color(p.i)}"><i></i><span>${esc(T.kinds[p.i])}</span>` +
        `<b>${nf.format(p.v)}</b><em>${new Intl.NumberFormat(L, { style: 'percent' }).format(p.v / all)}</em></li>`).join('')}</ul>`;
  };

  let last = null;
  const drawCharts = () => {
    if (!last) return;
    const narrow = matchMedia('(max-width: 560px)').matches;
    const slots = { bars: $('#c-bars .cb'), grow: $('#c-grow .cb'), split: $('#c-split .cb') };
    if (!last.rels.length) { Object.values(slots).forEach(el => { el.innerHTML = `<p class="empty">${T.none}</p>`; }); return; }
    const cur = last.rels.find(r => r.t === last.tag) ? last.tag : last.rels[last.rels.length - 1].t;
    slots.bars.innerHTML = barsChart(last.rels, cur, narrow ? 7 : 12);
    slots.grow.innerHTML = growthChart(last.rels);
    slots.split.innerHTML = splitChart(last.rels);
    Object.values(slots).forEach(reveal);
  };

  if (releases) {
    releases.then(d => {
      last = d;
      const html = panel(d);
      if (html) $$('[data-assets]').forEach(el => { el.innerHTML = html; });
      if ($('#c-bars')) {
        $('#f-dl').textContent = fmt(d.rels.reduce((n, r) => n + sum(r), 0));
        $('#f-rel').textContent = nf.format(d.formal);
        $('#f-ver').textContent = d.tag || '—';
        drawCharts();
      }
    }).catch(() => {
      $$('#c-bars .cb, #c-grow .cb, #c-split .cb').forEach(el => { el.innerHTML = `<p class="empty">${failMsg}</p>`; });
    });
    matchMedia('(max-width: 560px)').addEventListener('change', drawCharts);
  }
  if (repo) repo.then(r => { $('#f-star').textContent = fmt(r.stars); }).catch(() => {});
  if (commits) commits.then(list => {
    $('#cl').innerHTML = list.map(c =>
      `<li><a href="${esc(c.u)}">${esc(c.m)}</a><time datetime="${esc(c.d)}">${ago(c.d)}</time></li>`).join('');
  }).catch(() => {});
})();
