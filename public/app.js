/* Ticker FC front end — league table + drawer chart, polling every 60s. */
(() => {
  const POLL_MS = 60_000;
  const CSS = getComputedStyle(document.documentElement);
  const C = {
    up: CSS.getPropertyValue('--up').trim(),
    down: CSS.getPropertyValue('--down').trim(),
    amber: CSS.getPropertyValue('--amber').trim(),
    muted: CSS.getPropertyValue('--muted').trim(),
    faint: CSS.getPropertyValue('--faint').trim(),
    line: CSS.getPropertyValue('--line').trim(),
  };

  let clubs = [];
  let sortKey = 'mcap';
  let selected = null;      // club object currently in the drawer
  let currentRange = '1d';
  let futureOn = false;
  let chart, areaSeries, projSeries = [];
  let lastChartData = null; // { t, c, prevClose }

  const $ = (id) => document.getElementById(id);

  // ---------- formatting ----------
  const fmtPct = (v) => v == null ? '—'
    : `${v > 0 ? '+' : ''}${v.toFixed(Math.abs(v) >= 10 ? 1 : 2)}%`;
  const pctClass = (v) => v == null ? 'pct-flat' : v > 0.001 ? 'pct-up' : v < -0.001 ? 'pct-down' : 'pct-flat';
  const fmtPrice = (v) => {
    if (v == null) return '—';
    const d = v >= 1000 ? 0 : v >= 100 ? 1 : v >= 1 ? 2 : 3;
    return v.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  const fmtEurM = (m) => m == null ? '—'
    : m >= 995 ? `€${(m / 1000).toFixed(2).replace(/0$/, '')}B`
    : m >= 10 ? `€${Math.round(m)}M`
    : `€${m.toFixed(1)}M`;
  const fmtMult = (x) => x == null ? '—' : `${x.toFixed(1)}×`;

  // ---------- data ----------
  async function loadClubs() {
    const res = await fetch('/api/clubs');
    if (!res.ok) throw new Error('clubs fetch failed');
    const json = await res.json();
    clubs = json.clubs;
    renderTape();
    renderFacts();
    renderTable();
    renderGraveyard(json.offExchange);
    if (selected) {
      const fresh = clubs.find((c) => c.id === selected.id);
      if (fresh) { selected = fresh; renderDrawerNumbers(); }
    }
  }

  // ---------- tape ----------
  function renderTape() {
    const items = clubs.map((c) => {
      const cls = pctClass(c.dayPct).replace('pct', 'tape');
      return `<span class="tape-item"><b>${c.short}</b> ${fmtPrice(c.price)} <span class="${cls}">${fmtPct(c.dayPct)}</span></span>`;
    }).join('');
    $('tapeTrack').innerHTML = items + items; // doubled for the seamless loop
  }

  // ---------- headline facts ----------
  function renderFacts() {
    const caps = clubs.map((c) => c.mcapEurM).filter((v) => v != null);
    const total = caps.reduce((a, b) => a + b, 0);
    const mults = clubs.map((c) => c.mcRev).filter((v) => v != null).sort((a, b) => a - b);
    const median = mults.length ? mults[Math.floor(mults.length / 2)] : null;
    // Illiquid micro-caps (approx) gap wildly between rare trades — keep them out of the movers strip.
    const movers = clubs.filter((c) => c.dayPct != null && !c.approx);
    const best = movers.reduce((a, b) => (b.dayPct > (a?.dayPct ?? -1e9) ? b : a), null);
    const worst = movers.reduce((a, b) => (b.dayPct < (a?.dayPct ?? 1e9) ? b : a), null);
    $('facts').innerHTML = `
      <dl class="fact"><dd>${clubs.length}</dd><dt>clubs listed</dt></dl>
      <dl class="fact"><dd>${fmtEurM(total)}</dd><dt>combined market cap</dt></dl>
      <dl class="fact"><dd>${fmtMult(median)}</dd><dt>median cap / revenue</dt></dl>
      ${best ? `<dl class="fact"><dd class="${pctClass(best.dayPct)}">${best.short} ${fmtPct(best.dayPct)}</dd><dt>top 24h</dt></dl>` : ''}
      ${worst ? `<dl class="fact"><dd class="${pctClass(worst.dayPct)}">${worst.short} ${fmtPct(worst.dayPct)}</dd><dt>bottom 24h</dt></dl>` : ''}`;
  }

  // ---------- league table ----------
  const sortFns = {
    mcap: (a, b) => (b.mcapEurM ?? -1) - (a.mcapEurM ?? -1),
    mcrev: (a, b) => (b.mcRev ?? -1) - (a.mcRev ?? -1),
    day: (a, b) => (b.dayPct ?? -1e9) - (a.dayPct ?? -1e9),
  };

  function renderTable() {
    const rows = [...clubs].sort(sortFns[sortKey]).map((c, i) => `
      <tr data-id="${c.id}" tabindex="0" role="button" aria-label="Open ${c.name} chart">
        <td class="td-pos">${i + 1}</td>
        <td class="td-club"><span class="club-line"><span class="chip" style="background:${c.color}"></span>
          <span><span class="club-name">${c.name}</span><br><span class="club-sub">${c.symbol} · ${c.exchange} · ${c.country}</span></span>
        </span></td>
        <td class="td-num td-price">${fmtPrice(c.price)}<span class="ccy">${c.ccy}</span></td>
        <td class="td-num ${pctClass(c.dayPct)}">${fmtPct(c.dayPct)}</td>
        <td class="td-num">${fmtEurM(c.mcapEurM)}${c.approx ? '<span class="approx-mark" title="approximate share count">○</span>' : ''}</td>
        <td class="td-num td-rev">${c.revenueEurM ? `${fmtEurM(c.revenueEurM)}` : '—'}</td>
        <td class="td-num td-mult">${fmtMult(c.mcRev)}</td>
      </tr>`).join('');
    $('rows').innerHTML = rows;
  }

  function renderGraveyard(list) {
    $('graveyard').innerHTML = (list || []).map((g) =>
      `<article class="grave"><h3>${g.name}</h3><p>${g.note}</p></article>`).join('');
  }

  // ---------- drawer ----------
  function openDrawer(id) {
    selected = clubs.find((c) => c.id === id);
    if (!selected) return;
    $('drawer').hidden = false;
    $('scrim').hidden = false;
    document.body.style.overflow = 'hidden';
    $('dChip').style.background = selected.color;
    $('dName').textContent = selected.name;
    $('dMeta').textContent = `${selected.symbol} · ${selected.exchange} · ${selected.country}`;
    renderDrawerNumbers();
    ensureChart();
    loadChart();
  }

  function closeDrawer() {
    selected = null;
    $('drawer').hidden = true;
    $('scrim').hidden = true;
    document.body.style.overflow = '';
  }

  function renderDrawerNumbers() {
    if (!selected) return;
    $('dPrice').innerHTML = `${fmtPrice(selected.price)} <span class="ccy">${selected.ccy}</span>`;
    setHeaderChange();
    $('fCap').textContent = fmtEurM(selected.mcapEurM) + (selected.approx ? ' ○' : '');
    $('fRev').textContent = selected.revenueEurM
      ? fmtEurM(selected.revenueEurM) + (selected.revIncl ? ` (${fmtEurM(selected.revIncl)} incl. transfers)` : '')
      : 'not disclosed';
    $('fRevFY').textContent = selected.revFY ? `FY${selected.revFY}` : '';
    $('fMult').textContent = fmtMult(selected.mcRev);
    $('fExch').textContent = selected.exchange;
    $('fNote').textContent = selected.note || '';
  }

  function setHeaderChange() {
    let pct = null;
    if (currentRange === '1d') pct = selected?.dayPct ?? null;
    else if (lastChartData && lastChartData.c.length > 1) {
      const { c } = lastChartData;
      pct = ((c[c.length - 1] - c[0]) / c[0]) * 100;
    }
    const label = { '1d': '24h', '5d': '5 days', '1mo': '1 month', '6mo': '6 months', '1y': '1 year', 'max': 'all time' }[currentRange];
    const el = $('dChange');
    el.textContent = pct == null ? '' : `${fmtPct(pct)} ${label}`;
    el.className = `big-change ${pctClass(pct)}`;
  }

  // ---------- chart ----------
  function ensureChart() {
    if (chart) return;
    chart = LightweightCharts.createChart($('chart'), {
      autoSize: true,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: C.muted,
        fontFamily: '"IBM Plex Mono", Menlo, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(38,48,31,0.45)' },
        horzLines: { color: 'rgba(38,48,31,0.45)' },
      },
      rightPriceScale: { borderColor: C.line },
      timeScale: { borderColor: C.line, timeVisible: true, secondsVisible: false },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Magnet,
        vertLine: { color: C.faint, labelBackgroundColor: '#1a221a' },
        horzLine: { color: C.faint, labelBackgroundColor: '#1a221a' },
      },
    });
    areaSeries = chart.addAreaSeries({ lineWidth: 2, priceLineVisible: false });
    chart.subscribeCrosshairMove(onCrosshair);
  }

  function chartStatus(msg) {
    const el = $('chartStatus');
    el.hidden = !msg;
    el.textContent = msg || '';
  }

  async function loadChart() {
    if (!selected) return;
    chartStatus('loading…');
    clearProjection();
    try {
      const res = await fetch(`/api/chart/${selected.id}?range=${currentRange}`);
      if (!res.ok) throw new Error('chart fetch failed');
      const data = await res.json();
      lastChartData = data;
      const rising = data.c.length > 1 ? data.c[data.c.length - 1] >= data.c[0] : true;
      const col = rising ? C.up : C.down;
      areaSeries.applyOptions({
        lineColor: col,
        topColor: rising ? 'rgba(47,191,113,0.22)' : 'rgba(229,72,77,0.22)',
        bottomColor: 'rgba(0,0,0,0)',
      });
      areaSeries.setData(data.t.map((t, i) => ({ time: t, value: data.c[i] })));
      if (futureOn) drawProjection();
      chart.timeScale().fitContent();
      chartStatus(data.t.length ? '' : 'no data for this range');
      setHeaderChange();
    } catch {
      chartStatus('chart unavailable — retry shortly');
    }
  }

  // FUTURE: extrapolate log-drift ± 1σ from the visible range. A toy cone, clearly labeled.
  function drawProjection() {
    if (!lastChartData || lastChartData.c.length < 12) return;
    const { t, c } = lastChartData;
    const rets = [];
    for (let i = 1; i < c.length; i++) if (c[i - 1] > 0) rets.push(Math.log(c[i] / c[i - 1]));
    const mu = rets.reduce((a, b) => a + b, 0) / rets.length;
    const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mu) ** 2, 0) / rets.length);
    const dt = (t[t.length - 1] - t[0]) / (t.length - 1);
    const H = Math.max(8, Math.round(t.length / 4));
    const lastT = t[t.length - 1];
    const lastC = c[c.length - 1];
    const seed = { time: lastT, value: lastC };
    const med = [seed], hi = [seed], lo = [seed];
    for (let k = 1; k <= H; k++) {
      const time = Math.round(lastT + dt * k);
      med.push({ time, value: lastC * Math.exp(mu * k) });
      hi.push({ time, value: lastC * Math.exp(mu * k + sd * Math.sqrt(k)) });
      lo.push({ time, value: lastC * Math.exp(mu * k - sd * Math.sqrt(k)) });
    }
    const mk = (opts) => chart.addLineSeries({
      priceLineVisible: false, lastValueVisible: false, crosshairMarkerVisible: false, ...opts,
    });
    const sMed = mk({ color: C.amber, lineWidth: 2, lineStyle: LightweightCharts.LineStyle.Dashed });
    const sHi = mk({ color: 'rgba(226,169,59,0.5)', lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Dotted });
    const sLo = mk({ color: 'rgba(226,169,59,0.5)', lineWidth: 1, lineStyle: LightweightCharts.LineStyle.Dotted });
    sMed.setData(med); sHi.setData(hi); sLo.setData(lo);
    projSeries = [sMed, sHi, sLo];
    chart.timeScale().fitContent();
  }

  function clearProjection() {
    projSeries.forEach((s) => { try { chart.removeSeries(s); } catch {} });
    projSeries = [];
  }

  function onCrosshair(param) {
    const tip = $('chartTip');
    if (!param?.time || !param.seriesData?.get(areaSeries)) { tip.hidden = true; return; }
    const v = param.seriesData.get(areaSeries).value;
    const first = lastChartData?.c?.[0];
    const pct = first ? ((v - first) / first) * 100 : null;
    const d = new Date(param.time * 1000);
    const intraday = currentRange === '1d' || currentRange === '5d';
    const when = d.toLocaleString('en-GB', intraday
      ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
      : { day: 'numeric', month: 'short', year: 'numeric' });
    tip.innerHTML = `${when} · <b>${fmtPrice(v)} ${selected?.ccy ?? ''}</b>${pct != null ? ` · <span class="${pctClass(pct)}">${fmtPct(pct)}</span>` : ''}`;
    tip.hidden = false;
  }

  // ---------- events ----------
  document.querySelectorAll('.sorter').forEach((btn) => btn.addEventListener('click', () => {
    sortKey = btn.dataset.sort;
    document.querySelectorAll('.sorter').forEach((b) => b.classList.toggle('is-active', b === btn));
    renderTable();
  }));

  $('rows').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (tr) openDrawer(tr.dataset.id);
  });
  $('rows').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const tr = e.target.closest('tr[data-id]');
      if (tr) { e.preventDefault(); openDrawer(tr.dataset.id); }
    }
  });

  document.querySelectorAll('.range-btn[data-range]').forEach((btn) => btn.addEventListener('click', () => {
    currentRange = btn.dataset.range;
    document.querySelectorAll('.range-btn[data-range]').forEach((b) => b.classList.toggle('is-active', b === btn));
    loadChart();
  }));

  const futureBtn = document.querySelector('[data-future]');
  futureBtn.addEventListener('click', () => {
    futureOn = !futureOn;
    futureBtn.classList.toggle('is-active', futureOn);
    futureBtn.setAttribute('aria-pressed', String(futureOn));
    $('futureNote').hidden = !futureOn;
    if (futureOn) drawProjection(); else { clearProjection(); chart.timeScale().fitContent(); }
  });

  $('dClose').addEventListener('click', closeDrawer);
  $('scrim').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && selected) closeDrawer(); });

  // ---------- boot + poll ----------
  loadClubs().catch(() => {
    $('facts').innerHTML = '<p class="table-note">Quote engine warming up — refresh in a few seconds.</p>';
  });
  setInterval(() => {
    loadClubs().catch(() => {});
    if (selected && currentRange === '1d') loadChart();
  }, POLL_MS);
})();
