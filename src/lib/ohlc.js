export async function fetchOHLC(symbol, { interval = "1d", range = "6mo" } = {}) {
  symbol = String(symbol||"").trim().toUpperCase();
  const url = `/api/ohlc?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(range)}`;
  const j = await fetch(url).then(r=>r.json());
  return { candles: j.candles || [] };
}
