import React from "react";
import { useSearchParams } from "react-router-dom";
const PRESETS=[["1D","1d","1d"],["5D","5d","1d"],["1M","1mo","1d"],["6M","6mo","1d"],["YTD","ytd","1d"],["1Y","1y","1d"],["5Y","5y","1wk"],["All","max","1mo"]];

export default function QuoteToolbar(){
  const [sp,setSP]=useSearchParams();
  const set=(k,v)=>{ const n=new URLSearchParams(sp); n.set(k,v); setSP(n,{replace:true}); };
  const tf = sp.get("tf")||"6mo";
  const it = sp.get("interval")||"1d";
  const type = sp.get("type")||"area";

  return (
    <div className="container" style={{display:"flex",gap:8, padding:"8px 16px", alignItems:"center"}}>
      {PRESETS.map(([lbl,range,ival])=>{
        const active = tf===range && it===ival;
        return <button key={lbl} onClick={()=>{set("tf",range); set("interval",ival);}} style={btn(active)}>{lbl}</button>;
      })}
      <span style={{flex:1}}/>
      {["area","line","candles"].map(t=>(
        <button key={t} onClick={()=>set("type",t)} style={btn(type===t)}>{t}</button>
      ))}
    </div>
  );
}
const btn = (active=false)=>({
  background: active?"#111827":"#0d0d0d",
  border:"1px solid rgba(255,255,255,0.12)",
  color:"#e5e7eb",
  padding:"6px 10px",
  borderRadius:8,
  cursor:"pointer"
});
