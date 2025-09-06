const KEY = "watchlist";
export function getWatchlist(){ try{ return JSON.parse(localStorage.getItem(KEY)||"[]"); }catch{return [];} }
export function addToWatchlist(sym){ const s=String(sym||"").toUpperCase(); const w=new Set(getWatchlist()); w.add(s); localStorage.setItem(KEY, JSON.stringify([...w])); return [...w]; }
export function removeFromWatchlist(sym){ const s=String(sym||"").toUpperCase(); const w=new Set(getWatchlist()); w.delete(s); localStorage.setItem(KEY, JSON.stringify([...w])); return [...w]; }
