export async function fetchQuote(symbol){
  symbol = String(symbol||"").trim().toUpperCase();
  const j = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`).then(r=>r.json());
  return j;
}
export const prettyMoney = (v) => {
  if (v==null) return "—";
  const abs = Math.abs(v);
  const units = [["T",1e12],["B",1e9],["M",1e6],["K",1e3]];
  for (const [u,m] of units) if (abs>=m) return (v/m).toFixed(2)+u;
  return (+v).toFixed(2);
};
