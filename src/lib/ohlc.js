export async function fetchDailyOHLC(symbol) {
  symbol = String(symbol||"").trim().toUpperCase();

  // Yahoo (may CORS-block sometimes)
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=6mo`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Yahoo status " + res.status);
    const j = await res.json();
    const r = j?.chart?.result?.[0];
    const ts = r?.timestamp || [];
    const q = r?.indicators?.quote?.[0] || {};
    const O=q.open||[], H=q.high||[], L=q.low||[], C=q.close||[];
    const data = ts.map((t,i)=>({ time:Number(t), open:+O[i], high:+H[i], low:+L[i], close:+C[i] }))
      .filter(d => Number.isFinite(d.open) && Number.isFinite(d.close));
    if (data.length) return data;
    throw new Error("Yahoo empty");
  } catch {}

  // Stooq CSV fallback (daily)
  try {
    const txt = await fetch(`https://stooq.com/q/d/l/?s=${symbol.toLowerCase()}.us&i=d`).then(r=>r.text());
    const rows = txt.trim().split(/\r?\n/).slice(1);
    const data = rows.map(line=>{
      const [date, open, high, low, close] = line.split(",");
      const t = Math.floor(new Date(date+"T00:00:00Z").getTime()/1000);
      return { time:t, open:+open, high:+high, low:+low, close:+close };
    }).filter(d => Number.isFinite(d.open) && Number.isFinite(d.close));
    if (data.length) return data;
  } catch {}

  // Demo if both fail
  const now = Math.floor(Date.now()/1000), day=86400, base=100;
  return Array.from({length:30},(_,i)=>{
    const t = now - (29-i)*day;
    const o = base + i*0.8;
    const c = o + (Math.random()-0.5)*2;
    const h = Math.max(o,c) + Math.random()*1.5;
    const l = Math.min(o,c) - Math.random()*1.5;
    return { time:t, open:o, high:h, low:l, close:c };
  });
}
