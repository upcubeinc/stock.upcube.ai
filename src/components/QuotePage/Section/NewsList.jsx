import React,{useEffect,useState} from "react";
import { fetchNews } from "../../../lib/news";
export default function NewsList({symbol}){
  const [d,setD]=useState(null);
  useEffect(()=>{ let on=true; fetchNews(symbol).then(x=>on&&setD(x)); return ()=>on=false; },[symbol]);
  if(!d) return <div className="card">Loading news…</div>;
  return (
    <details className="card" open>
      <summary style={{cursor:"pointer",fontWeight:600}}>News</summary>
      {d.error && <div style={{color:"#fecaca",marginTop:8}}>Note: {d.error}</div>}
      <ul style={{listStyle:"none", padding:0, margin:8}}>
        {(d.items||[]).map((n,i)=>(
          <li key={i} style={{padding:"8px 0", borderBottom:"1px dashed rgba(255,255,255,0.08)"}}>
            <a href={n.link} target="_blank" rel="noreferrer">{n.title}</a>
            <div style={{opacity:.6, fontSize:12}}>{n.src || ""} {n.pub? " • " + new Date(n.pub).toLocaleString(): ""}</div>
          </li>
        ))}
        {!d.items?.length && <li style={{opacity:.7}}>No stories.</li>}
      </ul>
    </details>
  );
}
