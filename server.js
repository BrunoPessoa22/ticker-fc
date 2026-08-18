const express = require('express');
const path = require('path');
const { CLUBS, FX_CURRENCIES, OFF_EXCHANGE } = require('./data/clubs');
const { fetchChart, fetchQuote, pool, RANGES } = require('./lib/yahoo');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h', index: 'index.html' }));

const CLUB_BY_ID = new Map(CLUBS.map((c) => [c.id, c]));

// EUR per unit of quote currency, e.g. rates.USD = 0.863 means $1 = €0.863.
async function fetchFxRates() {
  const symbols = FX_CURRENCIES.map((ccy) => `EUR${ccy}=X`);
  const quotes = await pool(symbols, 4, fetchQuote);
  const rates = { EUR: 1 };
  FX_CURRENCIES.forEach((ccy, i) => {
    const px = quotes[i]?.price;
    if (px && px > 0) rates[ccy] = 1 / px;
  });
  return rates;
}

function toEur(value, ccy, rates) {
  if (value == null) return null;
  if (ccy === 'EUR') return value;
  if (ccy === 'GBp') return rates.GBP ? (value / 100) * rates.GBP : null;
  return rates[ccy] ? value * rates[ccy] : null;
}

app.get('/api/clubs', async (_req, res) => {
  try {
    const [rates, quotes] = await Promise.all([
      fetchFxRates(),
      pool(CLUBS, 6, (c) => fetchQuote(c.symbol)),
    ]);
    const now = Date.now();
    const clubs = CLUBS.map((c, i) => {
      const q = quotes[i];
      const price = q?.price ?? c.lastKnown;
      const prevClose = q?.prevClose ?? null;
      const dayPct = price != null && prevClose ? ((price - prevClose) / prevClose) * 100 : null;
      const mcapLocalM = price != null ? price * c.sharesM : null;
      const mcapEurM = toEur(mcapLocalM, c.ccy, rates);
      const mcRev = mcapEurM != null && c.revenueEurM ? mcapEurM / c.revenueEurM : null;
      return {
        id: c.id, name: c.name, short: c.short, country: c.country,
        symbol: c.symbol, exchange: c.exchange, ccy: c.ccy, color: c.color,
        price, dayPct, mcapEurM, mcRev,
        revenueEurM: c.revenueEurM, revIncl: c.revIncl ?? null, revFY: c.revFY,
        note: c.note, approx: !!c.approx,
        live: !!q, marketTime: q?.marketTime ?? null,
      };
    });
    res.json({ asOf: now, clubs, offExchange: OFF_EXCHANGE });
  } catch (err) {
    res.status(502).json({ error: 'quote engine unavailable', detail: String(err.message || err) });
  }
});

app.get('/api/chart/:id', async (req, res) => {
  const club = CLUB_BY_ID.get(req.params.id);
  if (!club) return res.status(404).json({ error: 'unknown club' });
  const range = RANGES[req.query.range] ? req.query.range : '1d';
  try {
    const { meta, t, c } = await fetchChart(club.symbol, range);
    res.json({ id: club.id, symbol: club.symbol, ccy: club.ccy, range, prevClose: meta.prevClose, t, c });
  } catch (err) {
    res.status(502).json({ error: 'chart unavailable', detail: String(err.message || err) });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, clubs: CLUBS.length }));

app.listen(PORT, () => console.log(`ticker-fc listening on :${PORT}`));
