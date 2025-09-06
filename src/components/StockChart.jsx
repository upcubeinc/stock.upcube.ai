import React, { useEffect, useRef, useState } from "react";
import { fetchDailyOHLC } from "../lib/ohlc";

export default function StockChart({ symbol }) {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let chart;
    let alive = true;

    (async () => {
      try {
        setStatus("loading"); setMsg("");

        // wait for UMD
        let tries=0; while(!(window.LightweightCharts && window.LightweightCharts.createChart)){
          await new Promise(r=>setTimeout(r,50));
          if(++tries>140) throw new Error("LightweightCharts UMD not ready");
        }
        const LWC = window.LightweightCharts;

        const data = await fetchDailyOHLC(symbol);
        if (!alive) return;

        const el = mountRef.current;
        const width = el?.clientWidth || 960;

        chart = LWC.createChart(el, {
          width, height: 420,
          layout: { background: { type: "solid", color: "#0b0b0b" }, textColor: "#e5e7eb" },
          grid: { vertLines: { color: "rgba(255,255,255,0.08)" }, horzLines: { color: "rgba(255,255,255,0.08)" } },
          rightPriceScale: { borderVisible: false },
          timeScale: { borderVisible: false },
        });

        // v4 has candlesticks API
        const series = chart.addCandlestickSeries({
          upColor: "#16a34a", downColor: "#ef4444",
          borderUpColor: "#16a34a", borderDownColor: "#ef4444",
          wickUpColor: "#16a34a", wickDownColor: "#ef4444",
        });
        series.setData(data);

        const onResize = () => chart.applyOptions({ width: el?.clientWidth || width });
        window.addEventListener("resize", onResize);

        setStatus("ready");
        return () => { window.removeEventListener("resize", onResize); chart?.remove(); };
      } catch (e) {
        console.error(e);
        setStatus("error"); setMsg(String(e?.message || e));
      }
    })();

    return () => { alive = false; chart?.remove(); };
  }, [symbol]);

  return (
    <div>
      {status === "loading" && <div style={{padding:"8px 0",opacity:0.7}}>Loading {symbol}…</div>}
      {status === "error"   && <div style={{padding:"8px 0",color:"#fecaca",border:"1px solid #ef4444",borderRadius:8}}>Error: {msg}</div>}
      <div ref={mountRef} style={{ width:"100%", height:420 }} />
    </div>
  );
}
