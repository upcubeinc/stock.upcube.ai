import React,{useEffect,useState} from "react";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../../lib/watchlist";
import MicroSpark from "../common/MicroSpark.jsx";
export default function WatchlistPage(){
  const [w,setW]=useState(getWatchlist()); const [q,setQ]=useState("");
  useEffect(()=>{ setW(getWatchlist()); },[]);
  const add=()=>{ if(!q.trim()) return; setW(addToWatchlist(q)); setQ(""); };
  const del=(s)=> setW(removeFromWatchlist(s));
  return (
    <div className="container" style={{padding:"16px 0"}}>
      <h2 style={{margin:"8px 0"}}>Watchlist</h2>
      <div style={{display:"flex",gap:8, marginBottom:12}}>
        <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add symbol (e.g., META)" style={{ background:"#111", color:"#fff", border:"1px solid #2a2a2a", borderRadius:8, padding:"6px 8px" }}/>
        <button onClick={add} style={{ background:"#0d0d0d", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"#e5e7eb", padding:"6px 10px" }}>Add</button>
      </div>
      {!w.length && <div className="card">No symbols yet. Add some!</div>}
      <div className="card" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
        {w.map(s=>(
          <div key={s} style={{position:"relative", padding:"8px", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8}}>
            <button onClick={()=>del(s)} title="Remove" style={{position:"absolute",right:8,top:8, background:"#1a1a1a",border:"1px solid rgba(255,255,255,0.14)",color:"#eee",borderRadius:6,padding:"2px 6px"}}>×</button>
            <MicroSpark symbol={s}/>
          </div>
        ))}
      </div>
    </div>
  );
}
