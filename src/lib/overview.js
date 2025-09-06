export async function fetchOverview(symbol){
  symbol = String(symbol||"").trim().toUpperCase();
  return await fetch(`/api/overview?symbol=${encodeURIComponent(symbol)}`).then(r=>r.json());
}
