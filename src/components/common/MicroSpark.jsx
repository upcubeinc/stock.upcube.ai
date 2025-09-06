import React,{useEffect,useRef,useState} from "react";
import { fetchOHLC } from "../../lib/ohlc";
export default function MicroSpark({symbol, range="6mo", interval="1d"}){
  const ref = useRef(null); const [err,setErr]=useState("");
  useEffect(()=>{ let ch,alive=true;
    (async ()=>{
      try{
        let tries=0; while(!(window.LightweightCharts&&window.LightweightCharts.createChart)){ await new Promise(r=>setTimeout(r,50)); if(++tries>140) throw new Error("LWC not ready"); }
        const L=window.LightweightCharts; const { candles } = await fetchOHLC(symbol,{range,interval}); if(!alive) return;
        const el=ref.current; ch=L.createChart(el,{width: el.clientWidth||280, height: 80, layout:{background:{type:"solid",color:"#0b0b0b"},textColor:"#aaa"}, grid:{vertLines:{color:"rgba(255,255,255,0.06)"},horzLines:{color:"rgba(255,255,255,0.06)"}}, rightPriceScale:{visible:false}, timeScale:{visible:false}});
        const s = ch.addAreaSeries({lineWidth:2, topColor:"rgba(125,211,252,0.25)", bottomColor:"rgba(125,211,252,0.05)"});
        s.setData(candles.map(c=>({time:c.time, value:c.close})));
        const ro=new ResizeObserver(()=>ch.applyOptions({width:el.clientWidth||280})); ro.observe(el); el.__ro=ro;
      }catch(e){ setErr(e.message||String(e)); }
    })();
    return ()=>{ alive=false; if(ref.current?.__ro) ref.current.__ro.disconnect(); ch?.remove(); };
  },[symbol,range,interval]);
  return <div style={{display:"grid",gridTemplateColumns:"60px 1fr",gap:8,alignItems:"center"}}><div style={{opacity:.8}}>{symbol}</div><div ref={ref} style={{height:80}}/>{err&&<div style={{gridColumn:"1/-1",color:"#fba"}}>{err}</div>}</div>;
}
