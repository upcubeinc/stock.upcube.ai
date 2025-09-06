import React,{useEffect,useState} from "react";
import { fetchQuote } from "../../lib/quote";

export default function QuoteHeader({ symbol }){
  const [q,setQ]=useState(null);
  useEffect(()=>{ let on=true; fetchQuote(symbol).then(x=>on&&setQ(x)).catch(()=>{}); return ()=>on=false; },[symbol]);

  const price = q?.price;
  const chg   = q?.change ?? 0;
  const pct   = q?.changePct ?? 0;
  const ah    = q?.afterHoursPrice;
  const sign  = chg>=0 ? "+" : "";
  const color = chg>=0 ? "#16a34a" : "#ef4444";

  return (
    <div className="container" style={{padding:"12px 16px"}}>
      <div style={{fontSize:26, fontWeight:700, marginBottom:6}}>{symbol}</div>
      <div style={{display:"flex",gap:12,alignItems:"baseline",flexWrap:"wrap"}}>
        <div style={{fontSize:36, fontWeight:700}}>{price!=null? price: "—"}</div>
        <div style={{color, fontSize:18}}>{price!=null? `${sign}${chg?.toFixed?.(2)} (${sign}${pct?.toFixed?.(2)}%)`:""}</div>
        {ah!=null && <div style={{opacity:.8}}>After hours: {ah}</div>}
      </div>
    </div>
  );
}
