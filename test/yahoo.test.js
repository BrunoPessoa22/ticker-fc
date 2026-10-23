const { test } = require('node:test');
const assert = require('node:assert/strict');

test('provider failure preserves the last successful fetch date and marks its cache stale', async (t) => {
  let now = Date.parse('2026-10-23T16:00:00Z');
  let failing = false;
  t.mock.method(Date, 'now', () => now);
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url === 'https://fc.yahoo.com') return { headers: { getSetCookie: () => [] } };
    if (failing) throw new Error('provider unavailable');
    return { ok: true, json: async () => ({ chart: { result: [{
      meta: { regularMarketPrice: 2.78, regularMarketTime: 1792765815 },
      timestamp: [1792765815], indicators: { quote: [{ close: [2.78] }] },
    }] } }) };
  });
  const { fetchQuote } = require('../lib/yahoo');
  const fresh = await fetchQuote('FCP.LS');
  assert.equal(fresh.stale, false);
  assert.equal(fresh.fetchedAt, now);

  now += 121_000;
  failing = true;
  const cached = await fetchQuote('FCP.LS');
  assert.equal(cached.stale, true);
  assert.equal(cached.fetchedAt, fresh.fetchedAt);
  assert.equal(cached.marketTime, fresh.marketTime);

  failing = false;
  const recovered = await fetchQuote('FCP.LS');
  assert.equal(recovered.stale, false);
  assert.equal(recovered.fetchedAt, now);
});
