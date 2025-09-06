import React, { useEffect, useRef, useState } from "react";
import { fetchDailyOHLC } from "../lib/ohlc";

function waitForLWC() {
  return new Promise((resolve, reject) => {
    let tries = 0, id = setInterval(() => {
      const LWC = window.LightweightCharts;
      if (LWC && typeof LWC.createChart === "function") {
        clearInterval(id); resolve(LWC);
      } else if (++tries > 140) {
        clearInterval(id); reject(new Error("LightweightCharts UMD not ready"));
      }
    }, 50);
  });
}

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
        const LWC = await waitForLWC();
        if (!alive) return;

        const data = await fetchDailyOHLC(symbol);
        if (!alive) return;

        const el = mountRef.current;
        if (!el) throw new Error("mountRef missing");

        const chartWidth = el.clientWidth || 960;
        chart = LWC.createChart(el, {
          width: chartWidth, height: 440,
          layout: { background: { type: "solid", color: "#0b0b0b" }, textColor: "#e5e7eb" },
          grid: { vertLines: { color: "rgba(255,255,255,0.08)" }, horzLines: { color: "rgba(255,255,255,0.08)" } },
          rightPriceScale: { borderVisible: false },
          timeScale: { borderVisible: false },
        });

        if (typeof chart.addLineSeries !== "function") throw new Error("Chart API missing addLineSeries");
        const series = chart.addLineSeries({ lineWidth: 2 });
        series.setData(data.map(d => ({ time: d.time, value: d.close })));

        const onResize = () => chart.applyOptions({ width: el.clientWidth || chartWidth });
        window.addEventListener("resize", onResize);

        setStatus("ready");
        return () => { window.removeEventListener("resize", onResize); chart.remove(); };
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
