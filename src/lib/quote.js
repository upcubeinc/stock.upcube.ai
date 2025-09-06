import { fetchOHLC } from "./ohlc";

const num = (v, d=2) => (v==null||Number.isNaN(+v)) ? null : +(+v).toFixed(d);
const fmt2 = (v) => v==null ? "—" : (+v).toFixed(2);

export async function fetchQuote(symbol) {
  symbol = String(symbol||"").trim().toUpperCase();

  // Yahoo quote endpoint
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Yahoo quote status " + res.status);
    const j = await res.json();
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
      bid: q.bid ?? null,
      ask: q.ask ?? null,
      dayLow: q.regularMarketDayLow ?? null,
      dayHigh: q.regularMarketDayHigh ?? null,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,

      volume: q.regularMarketVolume ?? q.volume ?? null,
      avgVolume: q.averageDailyVolume3Month ?? q.averageDailyVolume10Day ?? null,
      marketCap: q.marketCap ?? null,
      beta: q.beta ?? q.beta3Year ?? null,
      pe: q.trailingPE ?? null,
      eps: q.epsTrailingTwelveMonths ?? null,
      earningsDate: q.earningsTimestamp ? new Date(q.earningsTimestamp*1000) : null,
      dividendRate: q.trailingAnnualDividendRate ?? null,
      dividendYield: q.trailingAnnualDividendYield ?? null,
      exDividendDate: q.exDividendDate ? new Date(q.exDividendDate*1000) : null,
      targetMeanPrice: q.targetMeanPrice ?? null,
    };
    return out;
  } catch {}

  // Fallback: compute from OHLC last candle
  try {
    const { candles } = await fetchOHLC(symbol, { interval:"1d", range:"6mo" });
    const last = candles[candles.length-1];
    const prev = candles[candles.length-2];
    if (!last) throw new Error("No OHLC");
    const price = last.close;
    const change = prev ? price - prev.close : 0;
    const changePct = prev ? (change/prev.close)*100 : 0;
    return {
      symbol, price, change, changePct,
      previousClose: prev?.close ?? null,
      open: last.open, bid:null, ask:null,
      dayLow: last.low, dayHigh: last.high,
      volume: last.volume, marketCap:null, beta:null, pe:null, eps:null,
      fiftyTwoWeekLow: Math.min(...candles.map(c=>c.low)),
      fiftyTwoWeekHigh: Math.max(...candles.map(c=>c.high)),
      avgVolume: null, dividendRate:null, dividendYield:null,
      earningsDate:null, exDividendDate:null, targetMeanPrice:null, afterHoursPrice:null, marketState:null
    };
  } catch {
    return { symbol, price:null, change:null, changePct:null };
  }
}

// small helpers for StatsGrid
export const prettyMoney = (v) => {
  if (v==null) return "—";
  const abs = Math.abs(v);
  const units = [["T",1e12],["B",1e9],["M",1e6],["K",1e3]];
  for (const [u,m] of units) if (abs>=m) return (v/m).toFixed(2)+u;
  return fmt2(v);
};
