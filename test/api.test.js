const { test } = require('node:test');
const assert = require('node:assert/strict');
const yahoo = require('../lib/yahoo');

let quoteMode = 'delayed';
yahoo.pool = async (items, _limit, fn) => Promise.all(items.map(fn));
yahoo.fetchQuote = async (symbol) => {
  if (symbol.endsWith('=X')) return { price: 1 };
  if (quoteMode === 'snapshot') return null;
  return {
    price: 2.78, prevClose: 2.78, marketTime: 1792765815,
    fetchedAt: 1792772608424, stale: quoteMode === 'cached',
  };
};
const app = require('../server');

test('Porto financials, dates and quote fallbacks stay distinct in the API', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}/api/clubs`;

  for (const mode of ['delayed', 'cached', 'snapshot']) {
    quoteMode = mode;
    const response = await fetch(url);
    assert.equal(response.status, 200);
    const payload = await response.json();
    const porto = payload.clubs.find((c) => c.id === 'porto');
    assert.equal(porto.revFY, '2025/26');
    assert.equal(porto.revenueEurM, 150.283);
    assert.equal(porto.revIncl, 247.210);
    assert.equal(porto.netResultEurM, -26.262);
    assert.equal(porto.netDebtEurM, 228.803);
    assert.equal(porto.financialSourcePublishedAt, '2026-10-09');
    assert.equal(porto.financialReviewedAt, '2026-10-23');
    assert.equal(porto.financialPeriodEnd, '2026-06-30');
    assert.equal(porto.quoteStatus, mode);
    assert.equal(porto.live, mode === 'delayed');
    assert.equal(porto.marketTime, mode === 'snapshot' ? null : 1792765815);
    assert.equal(porto.quoteFetchedAt, mode === 'snapshot' ? null : 1792772608424);
    assert.equal(porto.quoteSnapshotAt, mode === 'snapshot' ? '2026-08-18' : null);
    assert.ok(Math.abs(porto.evRev - (porto.price * 22.5 + 228.803) / 150.283) < 1e-10);
    assert.equal(payload.clubs.length, 27);
    assert.equal(payload.privateClubs.length, 63);
    assert.equal(payload.financialReviews.unverified, 89);
    assert.ok(payload.privateClubs.every((c) => c.financialReviewedAt === null));
  }
});
