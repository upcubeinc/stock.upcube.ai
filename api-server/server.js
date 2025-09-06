import http from "node:http";
import { URL } from "node:url";

// Helpers
const json = (res, code, obj) => { res.writeHead(code, {"content-type":"application/json"}); res.end(JSON.stringify(obj)); };
const text = (res, code, body, ct="application/rss+xml; charset=UTF-8") => { res.writeHead(code, {"content-type":ct}); res.end(body); };
const UA = {"user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Safari/537.36"};
const fetchJson = async (url) => { const r = await fetch(url, {headers:UA}); if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); };
const fetchText = async (url) => { const r = await fetch(url, {headers:UA}); if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); };

// Normalize OHLC candles
const normalizeCandles = (ts, q) => {
  const O=q.open||[], H=q.high||[], L=q.low||[], C=q.close||[], V=q.volume||[];
  return (ts||[]).map((t,i)=>({
    const raw = Number(t);
    const timeMs = raw > 1e12 ? raw : raw * 1000;
    time: timeMs,
    open:+O[i], high:+H[i], low:+L[i], close:+C[i],
    volume: Number.isFinite(+V[i]) ? +V[i] : 0,
  })).filter(c => Number.isFinite(c.open) && Number.isFinite(c.close));
};

// Fallback stooq daily CSV
const stooqDaily = async (symbol) => {
  const txt = await fetchText(`https://stooq.com/q/d/l/?s=${symbol.toLowerCase()}.us&i=d`);
  const rows = txt.trim().split(/\r?\n/).slice(1);
  return rows.map(line=>{
    const p=line.split(","), [date, open, high, low, close] = p;
    const vol = Number(p[5]||0);
    const t = new Date(date+"T00:00:00Z").getTime();
    return { time:t, open:+open, high:+high, low:+low, close:+close, volume:vol };
  }).filter(c=>Number.isFinite(c.open) && Number.isFinite(c.close));
};

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://localhost");
    res.setHeader("cache-control","no-store");

    // Health
    if (u.pathname === "/api/healthz") return json(res, 200, {ok:true});

    // /api/ohlc?symbol=AAPL&interval=1d&range=6mo
    if (u.pathname === "/api/ohlc") {
      const symbol = (u.searchParams.get("symbol")||"").toUpperCase();
      const interval = u.searchParams.get("interval") || "1d";
      const range = u.searchParams.get("range") || "6mo";
      if (!symbol) return json(res, 400, {error:"symbol required"});

      try {
        const j = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`);
        const r = j?.chart?.result?.[0];
        const candles = normalizeCandles(r?.timestamp, r?.indicators?.quote?.[0]||{});
        if (!candles.length) throw new Error("empty");
        return json(res, 200, {candles});
      } catch {
        const candles = await stooqDaily(symbol);
        return json(res, 200, {candles});
      }
    }

    // /api/quote?symbol=AAPL  (normalized snapshot)
    if (u.pathname === "/api/quote") {
      const symbol = (u.searchParams.get("symbol")||"").toUpperCase();
      if (!symbol) return json(res, 400, {error:"symbol required"});
      try {
        const j = await fetchJson(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`);
        const q = j?.quoteResponse?.result?.[0] || {};
        const out = {
          symbol,
          price: q.regularMarketPrice ?? null,
          change: q.regularMarketChange ?? null,
          changePct: q.regularMarketChangePercent ?? null,
          afterHoursPrice: q.postMarketPrice ?? null,
          marketState: q.marketState || null,
          previousClose: q.regularMarketPreviousClose ?? q.previousClose ?? null,
          open: q.regularMarketOpen ?? q.open ?? null,
          bid: q.bid ?? null, ask: q.ask ?? null,
          dayLow: q.regularMarketDayLow ?? null, dayHigh: q.regularMarketDayHigh ?? null,
          fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null, fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
          volume: q.regularMarketVolume ?? q.volume ?? null,
          avgVolume: q.averageDailyVolume3Month ?? q.averageDailyVolume10Day ?? null,
          marketCap: q.marketCap ?? null, beta: q.beta ?? q.beta3Year ?? null,
          pe: q.trailingPE ?? null, eps: q.epsTrailingTwelveMonths ?? null,
          earningsDate: q.earningsTimestamp ? new Date(q.earningsTimestamp*1000).toISOString() : null,
          dividendRate: q.trailingAnnualDividendRate ?? null,
          dividendYield: q.trailingAnnualDividendYield ?? null,
          exDividendDate: q.exDividendDate ? new Date(q.exDividendDate*1000).toISOString() : null,
          targetMeanPrice: q.targetMeanPrice ?? null,
        };
        return json(res, 200, out);
      } catch {
        // fallback from ohlc
        const j = await fetch(`http://localhost:8080/api/ohlc?symbol=${encodeURIComponent(symbol)}&interval=1d&range=6mo`).then(r=>r.json());
        const cs = j.candles||[], last=cs[cs.length-1], prev=cs[cs.length-2];
        const price = last?.close ?? null;
        const change = (last && prev) ? (last.close - prev.close) : null;
        const changePct = (last && prev) ? (change/prev.close*100) : null;
        return json(res, 200, {
          symbol, price, change, changePct,
          previousClose: prev?.close ?? null,
          open: last?.open ?? null, bid:null, ask:null,
          dayLow: last?.low ?? null, dayHigh: last?.high ?? null,
          volume: last?.volume ?? null, avgVolume:null, marketCap:null, beta:null, pe:null, eps:null,
          fiftyTwoWeekLow: cs.length ? Math.min(...cs.map(c=>c.low)) : null,
          fiftyTwoWeekHigh: cs.length ? Math.max(...cs.map(c=>c.high)) : null,
          earningsDate:null, exDividendDate:null, dividendRate:null, dividendYield:null, targetMeanPrice:null, afterHoursPrice:null, marketState:null
        });
      }
    }

    // /api/overview?symbol=AAPL
    if (u.pathname === "/api/overview") {
      const symbol = (u.searchParams.get("symbol")||"").toUpperCase();
      if (!symbol) return json(res, 400, {error:"symbol required"});
      try {
        const j = await fetchJson(`https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=assetProfile`);
        const p = j?.quoteSummary?.result?.[0]?.assetProfile || {};
        return json(res, 200, {
          summary: p.longBusinessSummary || "",
          website: p.website || "",
          industry: p.industry || "",
          sector: p.sector || "",
          city: p.city || "", country: p.country || ""
        });
      } catch {
        return json(res, 200, {summary:"", website:"", industry:"", sector:"", city:"", country:""});
      }
    }

    // /api/news?symbol=AAPL  (RSS passthrough)
    if (u.pathname === "/api/news") {
      const symbol = (u.searchParams.get("symbol")||"").toUpperCase();
      if (!symbol) return json(res, 400, {error:"symbol required"});
      try {
        const rss = await fetchText(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`);
        return text(res, 200, rss);
      } catch {
        return text(res, 200, "<rss/>");
      }
    }

    json(res, 404, {error:"not found"});
  } catch (e) {
    json(res, 500, {error: String(e?.message||e)});
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => console.log("API listening on", PORT));
