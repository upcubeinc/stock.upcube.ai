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

        // Use the exact same API the probe used
        const LWC = window.LightweightCharts;
        if (!LWC || typeof LWC.createChart !== "function") throw new Error("UMD LightweightCharts not ready");

        const data = await fetchDailyOHLC(symbol);
        if (!alive) return;

        const el = mountRef.current;
        const width = el?.clientWidth || 960;
        chart = LWC.createChart(el, {
          width, height: 440,
          layout: { background: { type: "solid", color: "#0b0b0b" }, textColor: "#e5e7eb" },
          grid: { vertLines: { color: "rgba(255,255,255,0.08)" }, horzLines: { color: "rgba(255,255,255,0.08)" } },
          rightPriceScale: { borderVisible: false },
          timeScale: { borderVisible: false },
        });

        // Prefer candles; fallback to line/area if ever missing
        const canC = typeof chart.addCandlestickSeries === "function";
        const canL = typeof chart.addLineSeries === "function";
        const canA = typeof chart.addAreaSeries === "function";
        let series = null;

        if (canC) {
          series = chart.addCandlestickSeries({
            upColor: "#16a34a", downColor: "#ef4444",
            borderUpColor: "#16a34a", borderDownColor: "#ef4444",
            wickUpColor: "#16a34a", wickDownColor: "#ef4444",
          });
          series.setData(data);
        } else if (canL) {
          series = chart.addLineSeries({ lineWidth: 2 });
          series.setData(data.map(d => ({ time: d.time, value: d.close })));
        } else if (canA) {
          series = chart.addAreaSeries({ lineWidth: 2 });
          series.setData(data.map(d => ({ time: d.time, value: d.close })));
        } else {
          throw new Error("Chart API has no series methods (candlestick/line/area)");
        }

        const onResize = () => chart.applyOptions({ width: el?.clientWidth || width });
        window.addEventListener("resize", onResize);
        setStatus("ready");

        return () => {
          window.removeEventListener("resize", onResize);
          chart?.remove();
        };
      } catch (e) {
        console.error(e);
        setStatus("error"); setMsg(String(e?.message || e));
      }
    })();

    return () => { alive = false; chart?.remove(); };
  }, [symbol]);

  return (
    <div style={{ width:"100%", maxWidth: 1200, margin:"0 auto" }}>
      {status === "loading" && <div style={{padding:12,opacity:0.8}}>Loading {symbol}…</div>}
      {status === "error"   && <div style={{padding:12,border:"1px solid #ef4444",color:"#fecaca"}}>Error: {msg}</div>}
      <div ref={mountRef} style={{ width:"100%", height: 440, border:"1px solid rgba(255,255,255,0.12)", borderRadius:12 }} />
    </div>
  );
}
