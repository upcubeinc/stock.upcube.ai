import React from "react";
import MicroSpark from "../common/MicroSpark.jsx";
const SECTIONS = [
  ["Major ETFs", ["SPY","QQQ","DIA","IWM","VTI"]],
  ["Sectors (ETFs)", ["XLF","XLE","XLK","XLV","XLI","XLY","XLP","XLU","XLB","XLRE"]],
  ["Mega Tech", ["AAPL","MSFT","GOOGL","AMZN","META","NVDA","TSLA"]]
];
export default function MarketsPage(){
  return (
    <div className="container" style={{padding:"16px 0"}}>
      <h2 style={{margin:"8px 0"}}>Markets</h2>
      {SECTIONS.map(([title,list])=>(
        <div key={title} className="card" style={{margin:"12px 0"}}>
          <div style={{fontWeight:600, marginBottom:8}}>{title}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
            {list.map(s=> <MicroSpark key={s} symbol={s} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
