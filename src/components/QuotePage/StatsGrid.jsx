import React,{useEffect,useState} from "react";
import { fetchQuote, prettyMoney } from "../../lib/quote";

const Item = ({k,v}) => (
  <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:10,padding:"8px 0",borderBottom:"1px dashed rgba(255,255,255,0.06)"}}>
    <div style={{opacity:.7}}>{k}</div>
    <div>{v}</div>
  </div>
);

export default function StatsGrid({ symbol }){
  const [q,setQ]=useState(null);
  useEffect(()=>{ let on=true; fetchQuote(symbol).then(x=>on&&setQ(x)).catch(()=>{}); return ()=>on=false; },[symbol]);

  const fDate = (d)=> d? new Date(d).toLocaleDateString(): "—";
  const grid = [
    ["Previous Close", q?.previousClose ?? "—"],
    ["Open", q?.open ?? "—"],
    ["Bid", q?.bid ?? "—"],
    ["Ask", q?.ask ?? "—"],
    ["Day's Range", q?.dayLow!=null&&q?.dayHigh!=null ? `${q.dayLow} - ${q.dayHigh}` : "—"],
    ["52 Week Range", q?.fiftyTwoWeekLow!=null&&q?.fiftyTwoWeekHigh!=null ? `${q.fiftyTwoWeekLow} - ${q.fiftyTwoWeekHigh}` : "—"],
    ["Volume", q?.volume ?? "—"],
    ["Avg Volume", q?.avgVolume ?? "—"],
    ["Market Cap", prettyMoney(q?.marketCap)],
    ["Beta (5Y Monthly)", q?.beta ?? "—"],
    ["PE Ratio (TTM)", q?.pe ?? "—"],
    ["EPS (TTM)", q?.eps ?? "—"],
    ["Earnings Date", fDate(q?.earningsDate)],
    ["Forward Dividend & Yield", q?.dividendRate!=null && q?.dividendYield!=null ? `${q.dividendRate} (${(q.dividendYield*100).toFixed(2)}%)` : "—"],
    ["Ex-Dividend Date", fDate(q?.exDividendDate)],
    ["1y Target Est", q?.targetMeanPrice ?? "—"],
  ];

  return (
    <div className="card" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
      {grid.map(([k,v])=> <Item key={k} k={k} v={v} />)}
    </div>
  );
}
