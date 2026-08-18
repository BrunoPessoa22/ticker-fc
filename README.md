# Ticker FC

Every publicly listed football club on one page — live prices, crypto-style charts,
market caps and revenue multiples. Live at https://clubs.brunopessoa.com

## How it works
- `server.js` — Express server: static frontend + two API routes.
- `/api/clubs` — all clubs with live price (Yahoo Finance v8 chart meta, no crumb needed),
  EUR market cap (live price × share-count snapshot), FY2024-25 revenue and cap/revenue multiple.
- `/api/chart/:id?range=1d|5d|1mo|6mo|1y|max` — cached price history per club.
- `data/clubs.js` — the registry: 26 clubs, share counts and fundamentals compiled 18 Aug 2026.
- Frontend: vanilla JS + TradingView lightweight-charts v4 (vendored). No build step.

## Caveats baked into the page
- Prices are 15-20 min delayed (Yahoo). Market caps inherit the 18 Aug 2026 share-count
  snapshot; `approx: true` rows are marked ○ in the UI.
- Revenue excludes player-trading income where the club separates it (`revIncl` holds the all-in figure).
- The FUTURE toggle draws a drift ± 1σ cone extrapolated from the visible range — a toy, labeled as such.

## Run
```
npm install && npm start   # :3000
```

## Deploy
Coolify (EC2) via Dockerfile, domain clubs.brunopessoa.com. Push to main, then trigger
the Coolify deploy API.
