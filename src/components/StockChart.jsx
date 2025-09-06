import React, { useEffect, useRef, useState } from "react";
import { createChart as createChartModule } from "lightweight-charts";
import { fetchDailyOHLC } from "../lib/ohlc";

// pick the best available createChart
function getCreateChart() {
  if (typeof window !== "undefined" && window.LightweightCharts?.createChart) {
    return window.LightweightCharts.createChart;
  }
  if (typeof createChartModule === "function") return createChartModule;
  throw new Error("Lightweight Charts not loaded");
}

export default function StockChart({ symbol }) {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let chart, series, alive = true;

    (async () => {
      try {
        setStatus("loading"); setMsg("");

        const createChart = getCreateChart(); // <-- always valid now
        const data = await fetchDailyOHLC(symbol);
        if (!alive) return;

        const width = mountRef.current?.clientWidth || 960;
        chart = createChart(mountRef.current, {
          width,
          height: 440,
          layout: { background: { type: "solid", color: "#0b0b0b" }, textColor: "#e5e7eb" },
          grid: { vertLines: { color: "rgba(255,255,255,0.08)" }, horzLines: { color: "rgba(255,255,255,0.08)" } },
          rightPriceScale: { borderVisible: false },
          timeScale: { borderVisible: false },
        });

        // Prefer candles; fallback to line (shouldn’t be needed with UMD build)
        if (typeof chart.addCandlestickSeries === "function") {
          series = chart.addCandlestickSeries({
            upColor: "#16a34a", downColor: "#ef4444",
            borderUpColor: "#16a34a", borderDownColor: "#ef4444",
            wickUpColor: "#16a34a", wickDownColor: "#ef4444",
          });
          series.setData(data);
        } else if (typeof chart.addLineSeries === "function") {
          series = chart.addLineSeries({ lineWidth: 2 });
          series.setData(data.map(d => ({ time: d.time, value: d.close })));
        } else {
          throw new Error("Chart API missing series methods");
        }

        const onResize = () => chart.applyOptions({ width: mountRef.current?.clientWidth || 960 });
        window.addEventListener("resize", onResize);
        setStatus("ready");

        return () => {
          window.removeEventListener("resize", onResize);
          chart.remove();
        };
      } catch (e) {
        console.error(e);
        setStatus("error");
        setMsg(String(e?.message || e));
      }
    })();

    return () => { alive = false; if (chart) chart.remove(); };
  }, [symbol]);

  return (
    <div style={{ width:"100%", maxWidth:1200, margin:"0 auto" }}>
      {status === "loading" && <div style={{padding:12,opacity:0.8}}>Loading {symbol}…</div>}
      {status === "error"   && <div style={{padding:12,border:"1px solid #ef4444",color:"#fecaca"}}>Error: {msg}</div>}
      <div ref={mountRef} style={{ width:"100%", height:440, border:"1px solid rgba(255,255,255,0.12)", borderRadius:12 }} />
    </div>
  );
}
