import React,{useEffect,useState} from "react";
import { fetchOverview } from "../../../lib/overview";
export default function Overview({symbol}){
  const [d,setD]=useState(null);
  useEffect(()=>{ let on=true; fetchOverview(symbol).then(x=>on&&setD(x)); return ()=>on=false; },[symbol]);
  if(!d) return <div className="card">Loading overview…</div>;
  return (
    <details className="card" open>
      <summary style={{cursor:"pointer",fontWeight:600}}>Overview</summary>
      {d.error && <div style={{color:"#fecaca",marginTop:8}}>Note: {d.error}</div>}
      <div style={{marginTop:8, opacity:.9}}>
        <div>{d.summary || "—"}</div>
        <div style={{marginTop:8,display:"grid",gridTemplateColumns:"160px 1fr",gap:8}}>
          <div style={{opacity:.7}}>Sector</div><div>{d.sector || "—"}</div>
          <div style={{opacity:.7}}>Industry</div><div>{d.industry || "—"}</div>
          <div style={{opacity:.7}}>Location</div><div>{[d.city,d.country].filter(Boolean).join(", ") || "—"}</div>
          <div style={{opacity:.7}}>Website</div><div>{d.website ? <a href={d.website} target="_blank" rel="noreferrer">{d.website}</a> : "—"}</div>
        </div>
      </div>
    </details>
  );
}
