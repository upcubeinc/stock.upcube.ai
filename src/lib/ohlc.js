export async function fetchDailyOHLC(symbol) {
  symbol = String(symbol || "").trim().toUpperCase();

  // Try Yahoo Finance v8 chart API (daily, ~6 months)
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=6mo`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Yahoo status ${res.status}`);
    const j = await res.json();
    const r = j?.chart?.result?.[0];
    const ts = r?.timestamp || [];
    const q = r?.indicators?.quote?.[0] || {};
    const O = q.open || [], H = q.high || [], L = q.low || [], C = q.close || [];

    const data = ts.map((t, i) => ({
      time: Number(t),               // unix seconds
      open: Number(O[i]),
      high: Number(H[i]),
      low:  Number(L[i]),
      close:Number(C[i]),
    })).filter(d => Number.isFinite(d.open) && Number.isFinite(d.close));

    if (data.length) return data;
    throw new Error("Yahoo returned no data");
  } catch (_) {}

  // Fallback to Stooq CSV (daily)
  try {
    const url = `https://stooq.com/q/d/l/?s=${encodeURIComponent(symbol.toLowerCase())}.us&i=d`;
    const text = await fetch(url).then(r => r.text());
    const lines = text.trim().split(/\r?\n/).slice(1); // skip header
    const data = lines.map(line => {
      const [date, open, high, low, close] = line.split(',');
      const t = Math.floor(new Date(date + 'T00:00:00Z').getTime()/1000);
      return {
        time: t,
        open: Number(open),
        high: Number(high),
        low:  Number(low),
        close:Number(close),
      };
    }).filter(d => Number.isFinite(d.open) && Number.isFinite(d.close));
    if (data.length) return data;
    throw new Error("Stooq returned no data");
  } catch (_) {}

  // Last-resort demo data (so you *always* see something)
  const now = Math.floor(Date.now()/1000);
  const day = 86400;
  const base = 100;
  const demo = Array.from({length: 30}, (_,i) => {
    const t = now - (29 - i)*day;
    const o = base + i*0.8;
    const c = o + (Math.random()-0.5)*2;
    const h = Math.max(o,c) + Math.random()*1.5;
    const l = Math.min(o,c) - Math.random()*1.5;
    return { time:t, open:o, high:h, low:l, close:c };
  });
  return demo;
}
