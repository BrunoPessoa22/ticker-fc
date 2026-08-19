#!/usr/bin/env python3
"""Event study: do match results move listed football club stocks?
Pure python (no pandas). Data: Yahoo daily closes + football-data.co.uk results w/ B365 odds.
"""
import json, csv, math, pathlib, datetime as dt
from collections import defaultdict

HERE = pathlib.Path(__file__).parent

CLUBS = {  # symbol -> (football-data team name, league, index symbol file)
    "GSRAY.IS": ("Galatasaray", "T1", "XU100.IS"),
    "FENER.IS": ("Fenerbahce", "T1", "XU100.IS"),
    "BJKAS.IS": ("Besiktas", "T1", "XU100.IS"),
    "TSPOR.IS": ("Trabzonspor", "T1", "XU100.IS"),
    "BVB.DE":   ("Dortmund", "D1", "GDAXI"),
    "JUVE.MI":  ("Juventus", "I1", "FTSEMIB.MI"),
    "SSL.MI":   ("Lazio", "I1", "FTSEMIB.MI"),
    "MANU":     ("Man United", "E0", "GSPC"),
    "AJAX.AS":  ("Ajax", "N1", "AEX"),
    "CCP.L":    ("Celtic", "SC0", "FTSE"),
    "FCP.LS":   ("Porto", "P1", "PSI20.LS"),
    "SLBEN.LS": ("Benfica", "P1", "PSI20.LS"),
    "SCP.LS":   ("Sp Lisbon", "P1", "PSI20.LS"),
    "SCB.LS":   ("Sp Braga", "P1", "PSI20.LS"),
}
T1BIG = {"Galatasaray", "Fenerbahce", "Besiktas", "Trabzonspor"}
PDERBY = {"Porto", "Benfica", "Sp Lisbon"}

# ---------- price loading ----------
def load_series(name):
    f = HERE / "prices" / (name.replace("^", "").replace("=", "_") + ".json")
    d = json.load(open(f))
    r = d["chart"]["result"][0]
    ts = r["timestamp"]
    q = r["indicators"]["quote"][0]["close"]
    adj = r["indicators"].get("adjclose", [{}])[0].get("adjclose") or q
    out = []
    for t, c in zip(ts, adj):
        if c is None:
            continue
        out.append((dt.datetime.utcfromtimestamp(t).date(), c))
    return out  # sorted by construction

def returns_map(series):
    """date -> return ending that date (vs previous trading close)"""
    m = {}
    for i in range(1, len(series)):
        d, c = series[i]
        _, p = series[i - 1]
        if p:
            m[d] = c / p - 1
    return m

PRICES = {s: load_series(s) for s in CLUBS}
IDX = {v[2]: load_series(v[2]) for v in CLUBS.values()}
RET = {s: returns_map(v) for s, v in PRICES.items()}
IRET = {k: returns_map(v) for k, v in IDX.items()}

# ---------- stats helpers ----------
def mean(x): return sum(x) / len(x)
def sd(x):
    if len(x) < 2: return float("nan")
    m = mean(x); return math.sqrt(sum((v - m) ** 2 for v in x) / (len(x) - 1))
def tstat(x):
    if len(x) < 3: return float("nan")
    return mean(x) / (sd(x) / math.sqrt(len(x)))
def ols_beta(y, x):
    mx, my = mean(x), mean(y)
    cov = sum((a - mx) * (b - my) for a, b in zip(x, y))
    var = sum((a - mx) ** 2 for a in x)
    beta = cov / var
    # r2
    corr = cov / math.sqrt(var * sum((b - my) ** 2 for b in y)) if var else float("nan")
    return beta, corr ** 2

# ---------- beta per club (on common dates) ----------
BETA = {}
for s, (_, _, ix) in CLUBS.items():
    common = [d for d in RET[s] if d in IRET[ix]]
    y = [RET[s][d] for d in common]
    x = [IRET[ix][d] for d in common]
    BETA[s] = ols_beta(y, x)  # (beta, r2)

# ---------- abnormal daily returns (for baseline + big-move attribution) ----------
ABN = {}
for s, (_, _, ix) in CLUBS.items():
    b = BETA[s][0]
    raw = {d: RET[s][d] - b * IRET[ix].get(d, 0.0) for d in RET[s]}
    alpha = mean(list(raw.values()))  # strip club-level drift so buckets are pure match effect
    ABN[s] = {d: v - alpha for d, v in raw.items()}

# ---------- match loading ----------
def parse_date(x):
    d, m, y = x.split("/")
    y = int(y);  y += 2000 if y < 100 else 0
    return dt.date(y, int(m), int(d))

def implied(h, d_, a):
    try:
        ih, id_, ia = 1 / float(h), 1 / float(d_), 1 / float(a)
    except (ValueError, ZeroDivisionError, TypeError):
        return None
    s = ih + id_ + ia
    return ih / s, id_ / s, ia / s

events = []
name2sym = {v[0]: (s, v[1]) for s, v in CLUBS.items()}
for f in sorted((HERE / "matches").glob("*.csv")):
    div = f.name.split("_")[0]
    try:
        rows = list(csv.DictReader(open(f, encoding="utf-8-sig", errors="replace")))
    except Exception:
        continue
    for r in rows:
        if not r.get("Date") or not r.get("FTR"):
            continue
        home, away = r["HomeTeam"], r["AwayTeam"]
        for team, is_home in ((home, True), (away, False)):
            if team not in name2sym or name2sym[team][1] != div:
                continue
            sym = name2sym[team][0]
            date = parse_date(r["Date"])
            ftr = r["FTR"]
            res = {"H": "W", "D": "D", "A": "L"}[ftr] if is_home else {"H": "L", "D": "D", "A": "W"}[ftr]
            probs = implied(r.get("B365H"), r.get("B365D"), r.get("B365A"))
            pwin = (probs[0] if is_home else probs[2]) if probs else None
            opp = away if is_home else home
            derby = (div == "T1" and home in T1BIG and away in T1BIG) or \
                    (div == "P1" and home in PDERBY and away in PDERBY)
            events.append(dict(sym=sym, team=team, date=date, res=res, home=is_home,
                               pwin=pwin, opp=opp, derby=derby))

# ---------- align to next trading day ----------
def event_abnormal(sym, mdate):
    """abnormal return of first trading close AFTER the match vs last close ON/BEFORE it"""
    dates = [d for d, _ in PRICES[sym]]
    post = next((d for d in dates if d > mdate), None)
    if post is None or post not in ABN[sym]:
        return None, None
    if (post - mdate).days > 7:
        return None, None
    return ABN[sym][post], post

used = []
for e in events:
    ar, post = event_abnormal(e["sym"], e["date"])
    if ar is None:
        continue
    e["ar"] = ar; e["post"] = post
    used.append(e)

# de-dup: same club, same post trading day, two matches (shouldn't happen in league-only)
seen = {}
for e in used:
    seen[(e["sym"], e["post"])] = e
used = list(seen.values())

# ---------- report ----------
out = {}

def bucket(evs, label):
    if not evs: return None
    x = [e["ar"] for e in evs]
    return dict(label=label, n=len(x), mean_bps=round(mean(x) * 1e4), med_bps=round(sorted(x)[len(x)//2] * 1e4), t=round(tstat(x), 2))

print("=" * 100)
print("POOLED — abnormal return on first trading day after LEAGUE match (beta-adjusted vs home index)")
pooled = []
for res in "WDL":
    b = bucket([e for e in used if e["res"] == res], {"W": "after WIN", "D": "after DRAW", "L": "after LOSS"}[res])
    pooled.append(b); print(f"  {b['label']:<12} n={b['n']:<5} mean={b['mean_bps']:+5d} bps  median={b['med_bps']:+5d}  t={b['t']}")
out["pooled"] = pooled

print("\nSURPRISE (odds-adjusted, B365 implied win prob):")
sur = []
for lbl, cond in [
    ("expected win (p>60%) WON ", lambda e: e["res"] == "W" and e["pwin"] and e["pwin"] > .60),
    ("expected win (p>60%) LOST", lambda e: e["res"] == "L" and e["pwin"] and e["pwin"] > .60),
    ("expected win (p>60%) DREW", lambda e: e["res"] == "D" and e["pwin"] and e["pwin"] > .60),
    ("underdog   (p<30%) WON   ", lambda e: e["res"] == "W" and e["pwin"] and e["pwin"] < .30),
    ("underdog   (p<30%) LOST  ", lambda e: e["res"] == "L" and e["pwin"] and e["pwin"] < .30),
]:
    b = bucket([e for e in used if cond(e)], lbl)
    if b: sur.append(b); print(f"  {lbl} n={b['n']:<4} mean={b['mean_bps']:+5d} bps  t={b['t']}")
out["surprise"] = sur

# continuous: corr(ar, points_surprise) where exp points from odds
evp = [e for e in used if e["pwin"] is not None]
pts = {"W": 1.0, "D": 0.4, "L": 0.0}
ys = [e["ar"] for e in evp]
xs = [pts[e["res"]] - e["pwin"] for e in evp]  # crude surprise: outcome - p(win)
_, r2 = ols_beta(ys, xs)
print(f"\n  corr(abnormal ret, result surprise) = {math.copysign(math.sqrt(r2),  ols_beta(ys,xs)[0]):.3f}  (n={len(evp)})")
out["surprise_corr"] = round(math.copysign(math.sqrt(r2), ols_beta(ys, xs)[0]), 3)

print("\nDERBIES (Istanbul big-four + PT big-three head-to-heads):")
for res in "WL":
    b = bucket([e for e in used if e["derby"] and e["res"] == res], f"derby {res}")
    if b: print(f"  {b['label']:<9} n={b['n']:<4} mean={b['mean_bps']:+5d} bps  t={b['t']}")
out["derby"] = [bucket([e for e in used if e["derby"] and e["res"] == r], r) for r in "WL"]

print("\n" + "=" * 100)
print(f"{'PER CLUB':<10} {'n(W/D/L)':<14} {'win bps':>8} {'draw bps':>9} {'loss bps':>9} {'W-L spread':>11} {'beta':>6} {'R2':>5}")
per = {}
for s in CLUBS:
    ev = [e for e in used if e["sym"] == s]
    w = [e["ar"] for e in ev if e["res"] == "W"]
    d_ = [e["ar"] for e in ev if e["res"] == "D"]
    l = [e["ar"] for e in ev if e["res"] == "L"]
    if not w or not l: continue
    row = dict(n=f"{len(w)}/{len(d_)}/{len(l)}", w=round(mean(w)*1e4), d=round(mean(d_)*1e4) if d_ else None,
               l=round(mean(l)*1e4), spread=round((mean(w)-mean(l))*1e4), beta=round(BETA[s][0],2), r2=round(BETA[s][1],2))
    per[s] = row
    print(f"{s:<10} {row['n']:<14} {row['w']:>+8} {row['d'] if row['d'] is not None else '—':>9} {row['l']:>+9} {row['spread']:>+11} {row['beta']:>6} {row['r2']:>5}")
out["per_club"] = per

print("\nBIG-MOVE ATTRIBUTION — top-decile |abnormal| days that are post-match days:")
attr = {}
for s in CLUBS:
    abn = ABN[s]
    postdays = {e["post"] for e in used if e["sym"] == s}
    if not postdays: continue
    ranked = sorted(abn.items(), key=lambda kv: -abs(kv[1]))
    top = ranked[: max(1, len(ranked) // 10)]
    hit = sum(1 for d, _ in top if d in postdays)
    base = len(postdays) / len(abn)
    attr[s] = dict(top_n=len(top), post_match_share=round(hit/len(top), 2), base_share=round(base, 2),
                   lift=round((hit/len(top))/base, 1) if base else None)
    print(f"  {s:<10} {hit}/{len(top)} big days post-match ({hit/len(top):.0%}) vs {base:.0%} of all days  → lift {attr[s]['lift']}x")
out["bigmoves"] = attr

json.dump(out, open(HERE / "results.json", "w"), indent=1)
with open(HERE / "events.csv", "w", newline="") as f:
    wcsv = csv.writer(f); wcsv.writerow(["sym","date","post","res","home","pwin","derby","abn_ret"])
    for e in sorted(used, key=lambda e: (e["sym"], e["date"])):
        wcsv.writerow([e["sym"], e["date"], e["post"], e["res"], int(e["home"]),
                       round(e["pwin"],3) if e["pwin"] else "", int(e["derby"]), round(e["ar"],5)])
print(f"\nevents used: {len(used)}   (saved events.csv + results.json)")
