# Ticker FC

Every publicly listed football club on one page — delayed prices, charts,
market caps and dated financial accounts. At https://clubs.brunopessoa.com

## How it works
- `server.js` — Express server: static frontend + two API routes.
- `/api/clubs` — all clubs with live price (Yahoo Finance v8 chart meta, no crumb needed),
  EUR market cap (quoted price × share-count snapshot), revenue and valuation multiples.
- `/api/chart/:id?range=1d|5d|1mo|6mo|1y|max` — cached price history per club.
- `data/clubs.js` — 27 listed and 63 private clubs, with fiscal years and optional source/review metadata.
- Frontend: vanilla JS + TradingView lightweight-charts v4 (vendored). No build step.

## Caveats baked into the page
- Prices are 15-20 min delayed (Yahoo). Market caps inherit the 18 Aug 2026 share-count
  snapshot; `approx: true` rows are marked ○ in the UI.
- Revenue excludes player-trading income where the club separates it (`revIncl` holds the all-in figure).
- Financial reviews and prices have separate clocks. `asOf` is response generation time;
  `marketTime` is the last trade, and `quoteFetchedAt` is the last successful Yahoo retrieval.
  `quoteStatus` distinguishes delayed quotes, cached data after a failed retrieval, historical
  snapshots and unavailable prices. A closed or illiquid market can have an old last trade
  even when the retrieval succeeded.
- `financialReviewedAt` records an actual source check, never a page refresh. Reviews become
  overdue after 35 days; missing or invalid dates are unverified. Source publication date,
  accounting period end and source link are separate fields. Existing rows without a recorded
  review stay unverified until researched. Updating one club does not refresh the whole registry.
- Porto uses net result attributable to parent shareholders and borrowings minus cash for
  net debt. Leases and deductions for other financial assets are excluded from that debt basis.
- The FUTURE toggle draws a drift ± 1σ cone extrapolated from the visible range — a toy, labeled as such.

## Run
```
npm install && npm start   # :3000
```

## Validation and monthly refresh

`npm test` runs offline checks for Porto's financial basis, API quote fallbacks, overdue
review dates and Yahoo cache recovery. No external quote requests are needed for these tests.
`python3 -m unittest discover -s test -p '*_test.py'` checks refresh-runner exit codes,
deadlines and termination of child processes without invoking an AI job.

The existing Mac monthly job runs `~/bin/tickerfc-refresh.sh` on the third at 09:17.
`scripts/run-refresh.py` enforces a 30-minute deadline, prevents concurrent runs and writes
`~/Library/Logs/ticker-fc/status.json`. The wrapper retains output in `refresh.log` in that
directory and propagates failures to launchd. `python3 scripts/run-refresh.py --check`
validates executable/prompt paths without an AI request or deployment. A completed process
is not proof of publication: the refresh instructions require checking the changed values
and review metadata on the production `/api/clubs` endpoint.

The October 2026 fix was requested by Bruno after Porto's new annual results were missing
while the site still appeared live. Only clubs actually researched receive new review dates.

## Deploy
Coolify (EC2) via Dockerfile, domain clubs.brunopessoa.com. Push to main, then trigger
the Coolify deploy API.
