// Yahoo Finance v8 chart API client with in-memory caching.
// The v8 endpoint needs no crumb; quotes are read from chart meta.
// Yahoo 429s bursts from a single IP, so requests carry a session cookie,
// are staggered, and back off on 429; stale cache is served on failure.
// European exchange data is 15-20 min delayed — good enough for this page.

// Keep the UA minimal: Yahoo's limiter fingerprints full browser UA strings
// coming from non-browser clients and 429s them persistently.
const UA = 'Mozilla/5.0';
const HOSTS = ['https://query1.finance.yahoo.com', 'https://query2.finance.yahoo.com'];

// range → { interval, ttlMs } — short ranges refresh fast, long ranges rarely.
const RANGES = {
  '1d':  { interval: '5m',  ttl: 2 * 60 * 1000 },
  '5d':  { interval: '15m', ttl: 5 * 60 * 1000 },
  '1mo': { interval: '90m', ttl: 15 * 60 * 1000 },
  '6mo': { interval: '1d',  ttl: 60 * 60 * 1000 },
  '1y':  { interval: '1d',  ttl: 60 * 60 * 1000 },
  'max': { interval: '1wk', ttl: 6 * 60 * 60 * 1000 },
};

const cache = new Map(); // key → { at, data }
let hostIdx = 0;
let cookie = null;
let cookieAt = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cacheGet(key, ttl) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.data;
  return null;
}

function cacheGetStale(key) {
  const hit = cache.get(key);
  return hit ? hit.data : null;
}

// fc.yahoo.com 404s but sets the A3 session cookie Yahoo's limiter likes to see.
async function ensureCookie(force = false) {
  if (!force && cookie && Date.now() - cookieAt < 60 * 60 * 1000) return;
  try {
    const res = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': UA },
      redirect: 'manual',
    });
    const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    const jar = setCookie.map((c) => c.split(';')[0]).filter(Boolean);
    if (jar.length) { cookie = jar.join('; '); cookieAt = Date.now(); }
  } catch { /* cookie is best-effort; requests still work without it */ }
}

async function fetchJson(path) {
  await ensureCookie();
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    const host = HOSTS[hostIdx % HOSTS.length];
    hostIdx++;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(host + path, {
        headers: { 'User-Agent': UA, ...(cookie ? { Cookie: cookie } : {}) },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.status === 429) {
        lastErr = new Error('HTTP 429');
        await ensureCookie(true);
        await sleep(700 * (attempt + 1) + Math.random() * 400);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      await sleep(300);
    }
  }
  throw lastErr;
}

// Fetch one symbol's chart; returns { meta, t, c } (epoch seconds, closes).
async function fetchChart(symbol, range) {
  const spec = RANGES[range];
  if (!spec) throw new Error(`bad range: ${range}`);
  const key = `chart:${symbol}:${range}`;
  const cached = cacheGet(key, spec.ttl);
  if (cached) return cached;

  try {
    const json = await fetchJson(
      `/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${spec.interval}&includePrePost=false`
    );
    const result = json?.chart?.result?.[0];
    if (!result?.meta) throw new Error('empty chart result');
    const closes = result.indicators?.quote?.[0]?.close || [];
    const stamps = result.timestamp || [];
    const t = [];
    const c = [];
    for (let i = 0; i < stamps.length; i++) {
      if (closes[i] != null) { t.push(stamps[i]); c.push(closes[i]); }
    }
    const data = {
      meta: {
        price: result.meta.regularMarketPrice ?? null,
        prevClose: result.meta.chartPreviousClose ?? result.meta.previousClose ?? null,
        currency: result.meta.currency ?? null,
        marketTime: result.meta.regularMarketTime ?? null,
      },
      t, c,
    };
    cache.set(key, { at: Date.now(), data });
    return data;
  } catch (err) {
    const stale = cacheGetStale(key);
    if (stale) return stale;
    throw err;
  }
}

// Quote = 1d chart meta. Cheap, crumb-free, cached under the 1d TTL.
async function fetchQuote(symbol) {
  const { meta } = await fetchChart(symbol, '1d');
  return meta;
}

// Run fn over items with bounded concurrency and staggered starts;
// failures resolve to null so one bad symbol never breaks the batch.
async function pool(items, limit, fn) {
  const out = new Array(items.length).fill(null);
  let next = 0;
  async function worker(w) {
    await sleep(w * 180); // stagger worker starts to keep Yahoo's limiter calm
    while (next < items.length) {
      const i = next++;
      try { out[i] = await fn(items[i]); } catch { out[i] = null; }
      await sleep(120 + Math.random() * 120);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, (_, w) => worker(w)));
  return out;
}

module.exports = { fetchChart, fetchQuote, pool, RANGES };
