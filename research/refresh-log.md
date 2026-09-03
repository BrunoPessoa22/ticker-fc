# Refresh log — private + listed fundamentals

One entry per refresh run (monthly launchd job `com.brunopessoa.tickerfc-refresh`,
3rd of each month 09:17; instructions in `~/bin/tickerfc-refresh-prompt.md`).

## 2026-08-24 — initial private-league load (manual, session)
- Added PRIVATE_CLUBS: 63 clubs across England (11), Spain (9), Germany (6), France (4),
  Italy (7), NL/Belgium (5), Nordics/CH/AT/PT (7), Brazil (12), Argentina (2).
- All fundamentals FY2024/25 (Brazil CY2025) from the 24 Aug 2026 five-agent research
  sweep — sources in `private-clubs-aug2026.md`. EUR conversions at 24 Aug 2026 spot
  (GBP 1.1692, USD 0.8566, BRL 0.16614, ARS 0.00057, SEK 0.0903, DKK 0.1338, CHF 1.0680).
- Enterprise-value estimates: Sportico (22 Apr 2026) for the top tier; remaining rows
  pending the Sportico 11-50 backfill.
- Known gaps to close next runs: Midtjylland FY24/25 total revenue; Vitória SC SAD
  FY24/25 total income; Famalicão FY24/25 accounts; Grêmio CY2025 total revenue;
  Boca FY121 total income.
- Next expected drops: Spanish club results (Real Madrid ~mid-July already in; Athletic
  late Sep; Barça assembly Oct; SAD juntas Dec), Bayern AGM Nov, Rangers Nov, Italian
  approvals Oct-Dec, Schalke Oct.
- Shipped 24 Aug 2026 (commit e84b0b7), Coolify deployment p8u4aa3j1n0qqz9oqrztfbyd
  verified live (63 private rows on prod). Go-live radar email sent to
  bruno.pessoa@chiliz.com (Resend 61da01e7). Estimates backfilled: 28/63 rows.

## 2026-09-03 — monthly refresh #1 (autonomous job)
Window: 24 Aug → 3 Sep 2026. Calendar slot = "Sep–Dec: Athletic (Sep), Barça assembly +
Vitória (Oct), Bayern AGM + Rangers (Nov), Spanish SAD juntas + Atlético (Dec)".
The real story this run is the **FY2025/26 cycle opening** for June-year-end clubs — three
items had already landed *before* the 24 Aug run and were missed by it.

### Updated
- **Real Madrid** (private) FY2024/25 → **FY2025/26**, accounts formulated 28 Jul 2026.
  Operating revenue ex-transfers €1,184.7M → **€1,221.3M** (+3.1%); revIncl €1,266.3M
  (€45M transfer gains); net result +€24.3M → **+€26.3M**; club-defined net debt €12M →
  **€8.7M** on €82.8M cash; equity €624.4M; EBITDA €287.4M (record). Bernabéu financing
  outstanding €1,131.7M → **€1,108.4M**, still flagged as outside "net debt". Stadium
  billed €363M ≈ 41% of ordinary revenue. Sources: realmadrid.com 28 Jul 2026 release
  (site 500s on fetch), 2Playbook 26 Jul 2026, capital.es, economia3 12 Aug 2026.
- **Borussia Dortmund** (listed, BVB.DE) FY2024/25 → **FY2025/26**, preliminary figures
  at the Bilanzpressekonferenz 21 Aug 2026. Konzernumsatz €526.0M → **€460.5M** (−€65.5M:
  CL last-16 exit vs Atalanta + no Club World Cup; TV €227.2M → €168.5M, sponsoring/
  hospitality +€7.3M to €170.3M). Net result +€6.5M → **−€21.7M** (first loss since
  2021/22). EBITDA €115.9M → €92.2M. Transfer result €59.3M (mostly Gittens → Chelsea).
  Gross group performance €537.2M. No dividend.
  **netDebtEurM set to null** — the preliminary release discloses equity (~€300M, ratio
  >50%) and states no new financial debt and no overdraft drawn, but gives no year-end
  net financial position. Rather than carry last year's €14M against a new FY, the row
  now shows n/d and EV/Revenue is blank. Pick up from the full Geschäftsbericht (due
  ~Oct 2026, with the AGM notice). Sources: EQS ad-hoc 21 Aug 2026 (via onvista),
  bvb.de, sportsbusiness.at, kicker, bvbwld.
- **Liverpool** (private) est. value €4,920M (Sportico Apr 2026) → **€6,400M**, and the
  basis changes from estimate to **transaction print**: FSG sold **30% to 1892 Holdings
  for £1.65B on 14 Aug 2026** → £5.5B / ~$7.45B club valuation. Consortium = Amit Bhatia
  (lead, now vice-chairman), Bezos' K5 Sports, the Saverins' EE Capital, Mittal family
  trusts. FSG keeps majority ownership and operational control. Record valuation for a
  football club investment (tops Ratcliffe's ~$5.8B Man United mark). This moves
  Liverpool to #2 on the private est.-value table, ahead of Barcelona. Reporting on the
  option for the consortium to go majority (~$8B within 12 months) appears in Sportico/
  Al Jazeera but not in the club release — not encoded. GBP 1.1631 (3 Sep spot).
  Sources: liverpoolfc.com 14 Aug 2026 (terms not disclosed), ESPN, Inside World
  Football, Sportico (paywalled/tollbit-blocked, used secondaries).
- **GKS Katowice** (listed, GKS.WA) FY2024 → **CY2025** audited statements, filed to
  NewConnect 22 Apr 2026 (EBI 6/2026) — this one had simply aged out of the calendar.
  Revenue €9.7M (unsourced legacy figure) → **€7.0M** = PLN 30,495,549 net sales, +71%
  on promotion to Ekstraklasa and the new municipal stadium (2024 restated PLN 17.8M).
  Added netResultEurM **−€2.1M** = PLN −9,085,315 (2024: PLN −4,783,373). Total assets
  PLN 16.7M. PLN 4.328 (3 Sep spot). Source: gkskatowice.eu "Sprawozdanie finansowe za
  2025 rok" PDF, read directly.
- **Botafogo** (private) note rewritten — structural, no figure change. Textor lost
  control of the SAF 23 Apr 2026 (FGV arbitral tribunal), a court-appointed *interventor
  judicial* has run the company since 28 Apr (Durcésio Mello, now Eduardo Iglesias), and
  an EGM in late Jun 2026 removed Textor, Kevin Weston and Jordan Fikesenbaum from the
  board. Eagle Football Holdings still holds 90% / club 10%. The old note's "an Eagle US
  IPO would make it indirectly tradable" is dead: **Eagle Football Holdings Bidco went
  into administration (Cork Gully) on 27 Mar 2026.**
- **Eagle Football / Lyon** (listed, EFG.PA) note — added the Botafogo suit filed in the
  French courts 4 Apr 2026 seeking **€125M** (~R$ 745M) it says was extracted from Brazil
  to fund Lyon, plus the Bidco administration. Michele Kang remains president. EFG.PA
  still quotes normally (€1.79, Euronext Paris) — no delisting.
- Header comments in `data/clubs.js` updated: registry is no longer uniformly FY2024/25,
  and estValueEurM can now be a transaction print (Liverpool, Rangers) not an estimate.

### Checked, no change
- **Turkish four** already correct. Annual filings for FY 1 Jun 2025 – 31 May 2026 were
  reported 11 Aug 2026 (Forbes Türkiye compilation of the KAP filings) and the 24 Aug run
  had them: Galatasaray TRY 20.67bn rev / +TRY 608.6M net / TRY 17.03bn equity,
  Fenerbahçe TRY 13.57bn / −TRY 4.17bn, Beşiktaş TRY 7.02bn / −TRY 1.33bn, Trabzonspor
  TRY 3.95bn / −TRY 1.98bn. Re-converted at TRY 56.2359 they land within ~1.5% of the
  stored EUR values (pure FX drift since 24 Aug) — left alone rather than churn the diff.
  TAS 29 inflation-restatement caveat already in the notes.
- **No Brazilian SAF has IPO'd on B3** — still zero as of Sep 2026; six SAFs in Série A
  2026. OFF_EXCHANGE note stands.
- Live quote check on EFG.PA, MANU, BVB.DE, CCP.L, AJAX.AS, JUVE.MI — all trading, no
  delisting or ticker change.
- Premier League / Championship FY2025/26 accounts: none possible yet (Companies House
  filing deadline is end-Mar 2027; Man City is the fastest at ~Nov–Dec).
- DFL Finanzkennzahlen, DNCG comptes individuels, Sportico, Forbes, Football Benchmark,
  Deloitte Money League, EY Brazil: all annual, none due in this window.

### Skipped / open
- **Ruch Chorzów** (RCW.WA, €5.2M, revFY 2024/25): could not confirm the fiscal-year
  convention. BiznesRadar carries CY2024 (PLN 26.7M rev / −PLN 8.0M) which conflicts with
  the stored 2024/25 basis, and I could not get the EBI annual report itself. Left
  untouched rather than mix bases on a €5M micro-cap. Revisit in Oct with the FY report.
- Aug 2026 gaps from the last run (Midtjylland total revenue, Grêmio FY headline) are
  disclosure limits, not timing — no new filings to close them.
- Sportico blocks WebFetch via a tollbit.* redirect that does not resolve; used ESPN /
  Inside World Football / CNBC-adjacent secondaries for the Liverpool terms. Real Madrid's
  own site returned an application error; used 2Playbook + capital.es.

### Due in the next ~5 weeks (heavy September — the June-FYE reporting wall)
| Club / source | Expected | Note |
|---|---|---|
| Manchester United (MANU) Q4+FY2026 | ~mid-Sep | FY25 was 17 Sep; guidance raised to £655–665M on 27 May |
| Celtic (CCP.L) FY2026 | ~mid–late Sep | FY25 was 19 Sep; H1 rev £59.4M, guided H2 "significantly lower" |
| Lazio (SSL.MI) FY2026 | 15–22 Sep window | H1 was −€20M; FY25 was −€17.1M on €143.5M |
| Juventus (JUVE.MI) FY2026 | CdA 24–30 Sep | H1 rev €260.6M (−11%), −€2.5M; FY guided to stay in loss |
| Brøndby (BIF.CO) FY2025/26 | 24 Sep (scheduled) | H1 rev DKK 155.4M, PBT +DKK 88.8M; FY guided DKK 0–50M |
| Athletic Club FY2025/26 | ~late Sep | budgeted €186M rev / +€10M net; FY25 was €172.5M / +€7M |
| Ajax (AJAX.AS) FY2025/26 | Sep–Oct | H1 rev €110.6M (+18%), +€16.4M — CL year, big swing from −€37.3M |
| AGF Aarhus FY2025/26 | Sep–Oct | Jul–Jun fiscal year |
| Barça assembly, Vitória SC, Schalke, Eredivisie/KNVB, Portuguese SAD R&C | Oct | |
| Bayern AGM, Rangers | Nov | |

### Ship
- Sanity: `node -e "require('./data/clubs')"` OK; `PORT=3199 node server.js` → /api/health
  `{"ok":true,"clubs":27}`, /api/clubs 27 listed + 63 private, BVB EV/evRev correctly null.
- No HTML/CSS/JS changes, so no `?v=` bump.
