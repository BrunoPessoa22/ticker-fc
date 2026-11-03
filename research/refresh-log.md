# Refresh log — private + listed fundamentals

One entry per refresh run (monthly launchd job `com.brunopessoa.tickerfc-refresh`,
3rd of each month 09:17; instructions in `~/bin/tickerfc-refresh-prompt.md`).

## 2026-11-03 — monthly refresh #2 (autonomous job)
Window: 23 Oct → 3 Nov 2026. Calendar slot = "Nov: Bayern AGM + Rangers", but the real
backlog was the **June-FYE listed wall from Sep–Oct 2026**: the 3 Sep run listed nine of
these as due inside five weeks and the 23 Oct session only corrected Porto. Seven of them
had reported and were still showing FY2024/25. All seven are now ingested from primary
filings where one exists. FX 3 Nov 2026 spot (Yahoo, Mozilla/5.0 UA): GBP/EUR 1.19861
(EURGBP 0.8343), USD 0.89270, DKK 0.133803.

### Updated (7 listed clubs, all rolled FY2024/25 → FY2025/26)
- **Manchester United** (MANU) — SEC Form 6-K, released 23 Sep 2026, *primary, read
  directly*. Revenue £666.5M → **£677.6M** (+1.7%, a record with no European football);
  adjusted EBITDA £182.8M → **£216.4M** (+18.4%, record); operating result −£18.4M →
  **+£22.6M**; but loss for the period £33.0M → **£43.0M** because net finance costs went
  £21.2M → £69.6M. EUR: rev 779 → **812.2**, net −39 → **−51.5**, net debt 636 → **745.2**.
  The release carries **no net debt line** — figure is borrowings incl. accrued interest
  (£577.554M non-current + £111.400M current = £689.0M) minus £67.246M cash = **£621.708M**,
  and `netDebtBasis` now says so. Same basis the prior row used (FY25: £637.0M − £86.1M =
  £550.9M). USD non-current borrowings $775M, up $125M. FY2027 guided £740–760M.
- **Celtic** (CCP.L) — Stock Exchange Announcement 22 Sep 2026, *primary PDF, read
  directly*. Revenue £143.597M → **£111.032M** (−22.7%, Europa League not Champions
  League); operating profit £42.173M → **−£10.489M**; loss before tax £6.563M; profit
  after tax £33.934M → **loss of £4.781M**. Opex +4.3% to £122.146M, player-sale gains
  £31.488M → £16.045M, amortisation up to £15.385M. Cash £77.310M → **£66.385M** against
  £0.096M borrowings → net cash £66.289M. EUR: rev 168 → **133.1**, net +40 → **−5.7**,
  net debt −90 → **−79.5**.
- **Juventus** (JUVE.MI) — CdA approved 29 Sep 2026; figures from the Calcio e Finanza
  breakdown of 13 Oct 2026 (sanctioned secondary; the club PDF was not needed for these
  lines). Total ricavi e proventi €529.6M → **€474.7M** (−10.4%: no Club World Cup, player
  trading €109.7M → €57.8M of which plusvalenze €89.7M → €36.5M). Net loss €58.1M →
  **€66.0M**, sixth straight. Costs €405.7M → €363.6M; operating result −€39.4M. Net
  financial debt €280.2M → **€331.1M** incl. leases (€327.6M ex-leases) after €102.4M of
  transfers and a €23M property purchase. Equity €13.2M → €11.5M; capital increase of up
  to €250M in play.
  **Basis correction, flagged on the row:** the stored FY2024/25 revenue of €439M was
  total *minus plusvalenze only* (529.6 − 89.7), not minus all player-trading income,
  which contradicted the file header. The row now uses the club's own ex-player-trading
  basis — **€416.9M**, against a restated €419.9M comparative. So the headline "−10.4%"
  is a player-trading effect; underlying revenue is flat, and the row says so.
- **Lazio** (SSL.MI) — Consiglio di Gestione 21–22 Sep 2026, via Teleborsa/Borsa Italiana
  and Investing's filing summary. Valore della produzione €143.49M → **€131.75M** (−8.18%,
  no European football): TV €88.45M, matchday €18.06M, sponsorship €17.82M. Added
  **revIncl €173.7M** (Calcio e Finanza all-in, incl. January plusvalenze). Net loss
  €17.16M → **€10.04M**. Payroll +6.51% to €104.31M, operating costs €140.59M. Net
  financial position €66M → **€126.40M** of debt (+€60.10M — which independently confirms
  the stored €66M was right). Equity positive €113.56M, largely via an **IAS 16 revaluation
  of the Formello training centre** — noted on the row, since it is what saves the equity.
- **Ajax** (AJAX.AS) — club release per 30 Jun 2026, *primary PDF, read directly*; PwC
  unqualified opinion 25 Sep 2026. Netto-omzet €178.1M → **€188.3M** (+€10.2M on Champions
  League premies); bedrijfslasten €197.5M → €206.5M, so the operating result is still
  **−€18.2M** (from −€19.4M). Result after tax −€37.3M → **+€2.0M**, essentially all player
  trading: resultaat vergoedingssommen €10.3M → **€65.5M** (Hato→Chelsea, Brobbey→Sunderland,
  Taylor→Lazio), saldo after amortisation −€31.0M → **+€26.7M**. Equity €191.0M. Share count
  in the release is 18,333,333 — **confirms the stored sharesM 18.33**. AVA 10 Nov 2026.
  **netDebtEurM set to null** (was −40): the release discloses no year-end cash or net
  financial position, and carrying a FY2024/25 net-cash figure against FY2025/26 revenue is
  the exact error the BVB row avoided in September. EV/Revenue blank until the jaarverslag.
- **Benfica** (SLBEN.LS) — R&C 2025/26, reported 8 Sep 2026, approved unanimously at the
  AG on 2 Oct 2026; figures via Jornal Economico (ojogo 403s on fetch). Operating income
  ex-player-rights €230.5M → **€214.4M** (−7%); player-rights result **€47.4M** (+1.4%);
  operating result €32.4M; net result €34.4M → **€19.1M**. Net debt €196.9M → **€184.9M**
  (−6.1%) — the stored 197 is confirmed as the right prior figure and basis. Assets €649.4M
  (+9.9%), liabilities €513.9M (+8.2%), equity €135.5M (+16.5%). Record matchday €45.2M.
  **revIncl basis changed and labelled**: the old €348M was gross transfer proceeds; the new
  €261.8M is operating income plus the *net* player-rights result, which is what the sources
  disclose. `revenueBasis` states this on the row so the two are not read as comparable.
- **SC Braga** (SCB.LS) — R&C approved at the AG on 22 Sep 2026, via RTP/Lusa. Total
  revenue **€115.682M**, a record and a first above €100M; net result −€11.0M → **+€17.315M**;
  EBITDA record **€39.614M**; equity €86.335M. Driven by **€67.339M** of net income on player
  rights (Roger Fernandes, Zalazar, Banza). Liabilities €100.7M → ~€144M. EUR revenueEurM
  **48.3** = 115.682 − 67.339, an arithmetic split of two reported figures, labelled as such
  in `revenueBasis`. **netDebtEurM set to null** (was 19): no year-end net debt in the
  sources used. 2026/27 budget forecasts only €1.56M of profit.

### Checked, no change
- **BVB** (BVB.DE): the full Geschäftsbericht 2025/26 is **still not out** — only the 21 Aug
  2026 preliminary ad-hoc. So the September decision stands: revenue €460.5M, net −€21.7M,
  netDebt null, EV blank. The one IR "Kennzahlen auf einen blick" PDF that surfaced is the
  FY2025 edition. Carry to the next run; the AGM (normally Nov) should force it out.
- **Porto** already on FY2025/26 from the 23 Oct correction; not re-researched, review date
  left at 2026-10-23 rather than restamped.
- Turkish four (FY 1 Jun – 31 May) already on FY2025/26 from the August KAP filings; next
  drop ~Aug 2027. Parken/AaB/AIK/GKS are calendar-year — nothing due before Feb–Apr 2027.

### Skipped / open
- **Sporting CP** (SCP.LS) — **reported but deliberately not encoded.** Net result is well
  sourced (+€20M → **+€34.7M**, +74%, fifth straight profit, €117M cumulative; published
  22 Sep 2026; operating result €50.7M, +12%). But the revenue basis could not be resolved:
  secondaries give "rendimentos operacionais ~€187.7M" *and* a record "volume de negócios"
  of €300M, and neither reconciles with the stored €148M / revIncl €265M. Encoding the net
  result alone would have put a FY2025/26 result next to FY2024/25 revenue under a single
  `revFY`, so the whole row was left on FY2024/25. **Next run: pull the CMVM R&C PDF and
  resolve the basis — this is the top item.**
- **Brøndby** (BIF.CO, FY ends ~Jun) and **AGF Aarhus** (AGF-B.CO) FY2025/26: not reached
  before the deadline. Both were on the September due list. Carry forward.
- Private clubs: none researched this run (Athletic Club ~late Sep, Barça assembly Oct,
  Vitória SC, Schalke, Rangers and Bayern AGM Nov are all outstanding). 82 of 90 rows remain
  `unverified` — that is a backlog, not freshness, and the API counter says so.
- Non-ASCII in Portuguese/Italian source labels written without accents to keep the diff
  clean; club notes keep proper accents.

### Ship
- Sanity: `node -e "require('./data/clubs')"` OK. `PORT=3199 node server.js` → /api/health
  `{"ok":true,"clubs":27}`; /api/clubs 27 listed + 63 private, live quotes retrieved,
  EV/Revenue computed for MANU 4.97 / Juve 2.38 / Lazio 1.97 / Benfica 1.57 / Celtic 0.95
  and correctly **null for Ajax, Braga and BVB** (null net debt). `financialReviews` →
  reviewed 8, overdue 0, unverified 82.
- No HTML/CSS/JS change, so no `?v=` bump.

## 2026-10-23 — Porto correction and visible data dates

Origin: Bruno asked whether the live site was current, specifically Porto, then requested
the fix. Quotes were updating, but Porto remained on FY2024/25 after its next annual report.

- Porto FY2025/26, year ended 30 Jun 2026, report published 9 Oct 2026 and checked 23 Oct:
  revenue excluding player trading EUR150.283M; including player-trading income EUR247.210M
  (150.283 + 96.927); net result attributable to parent shareholders **−EUR26.262M**.
  The headline consolidated loss before minority interests is −EUR21.099M; these bases
  must not be interchanged. Source: [FC Porto annual report, mirrored ESEF filing](https://financialfilings.com/filings/futebol-clube-porto/annual-report-esef/2026/69518081/),
  consolidated income statement pp. 260–261 and note 28.
- Comparable debt-minus-cash: borrowings EUR248.341M (note 19) minus cash EUR19.538M
  (consolidated balance sheet) = **EUR228.803M**, excluding leases. The club's EUR220.8M
  headline also deducts EUR7.963M of other financial assets. Kept the prior debt-minus-cash
  basis and documented it explicitly. Share count confirmed at 22.5M in note 17.
- Added accounting period, source publication date, actual review date, source link and
  accounting-basis labels for Porto. No other club was researched in this correction;
  89 existing rows lack per-club review dates and remain explicitly unverified. The prior
  September partial review is not used as a blanket review date for all clubs.
- UI distinguishes fiscal years/review dates from last-trade and quote-retrieval dates.
  Reviews expire after 35 days. Cached Yahoo responses and historical snapshots no longer
  masquerade as current retrievals; failed page refreshes are visible.
- Monthly automation: retained its existing monthly frequency. Hardened the local wrapper
  with persistent private logs, real exit-code propagation and a 30-minute process-group
  deadline via scripts/run-refresh.py. Updated its prompt to preserve per-club provenance
  and verify deployed values, rather than health alone. No paid AI job was invoked.
- Validation: offline API/freshness/cache-recovery tests; refresh-runner success/failure/
  timeout/child-termination simulations; desktop/mobile browser checks with recorded
  quote fixtures; live local API smoke against Yahoo confirmed Porto EUR2.78 with the
  corrected financials and EV/revenue 1.9387. Read-only review found no remaining bug.
- Publication: prepared locally; production deployment requires Bruno's approval under
  the global AGENTS.md push/deploy rule. No email or other outbound message sent.

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
- Pushed 53d25f4 to origin/main. Coolify deployment `tp43kl87ayuepwqwh52o8o8h` queued and
  verified live within ~20s: /api/health `{"ok":true,"clubs":27}`, prod /api/clubs returns
  BVB 460 / FY2025/26 and Liverpool est. 6400.
- Radar email sent to bruno.pessoa@chiliz.com, subject "Ticker FC radar — September 2026"
  (Resend id `01a06637-ef2c-77d2-bd79-b9c3ec5e9190`). Signal on both counts: figures
  changed this run, and the September June-FYE wall is inside the 5-week window.
