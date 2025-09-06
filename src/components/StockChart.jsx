import React, { useEffect, useRef, useState } from "react";
import { fetchDailyOHLC } from "../lib/ohlc";

const LWC_URL = "https://unpkg.com/lightweight-charts@5.0.8/dist/lightweight-charts.standalone.production.js";

function ensureLWC() {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.LightweightCharts?.createChart) {
      return resolve(window.LightweightCharts);
    }
    let s = document.querySelector('script[data-lwc-standalone]');
    if (!s) {
      s = document.createElement('script');
      s.src = LWC_URL;
      s.defer = true;
      s.dataset.lwcStandalone = "1";
      s.onload = () => resolve(window.LightweightCharts);
      s.onerror = () => reject(new Error("Failed to load LightweightCharts UMD"));
      document.head.appendChild(s);
    } else {
      s.addEventListener('load', () => resolve(window.LightweightCharts));
      s.addEventListener('error', () => reject(new Error("Failed to load LightweightCharts UMD")));
    }
    const start = Date.now();
    const id = setInterval(() => {
      if (window.LightweightCharts?.createChart) {
        clearInterval(id); resolve(window.LightweightCharts);
      } else if (Date.now() - start > 7000) {
        clearInterval(id); reject(new Error("LightweightCharts not available"));
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
        const LWC = await ensureLWC();
        if (!alive) return;

        const data = await fetchDailyOHLC(symbol);
        if (!alive) return;

        const width = mountRef.current?.clientWidth || 960;
        chart = LWC.createChart(mountRef.current, {
          width, height: 440,
          layout: { background: { type: "solid", color: "#0b0b0b" }, textColor: "#e5e7eb" },
          grid: { vertLines: { color: "rgba(255,255,255,0.08)" }, horzLines: { color: "rgba(255,255,255,0.08)" } },
          rightPriceScale: { borderVisible: false },
          timeScale: { borderVisible: false },
        });

        const canC = typeof chart.addCandlestickSeries === "function";
        const canL = typeof chart.addLineSeries === "function";
        const canA = typeof chart.addAreaSeries === "function";

        const series = canC
          ? chart.addCandlestickSeries({
              upColor: "#16a34a", downColor: "#ef4444",
              borderUpColor: "#16a34a", borderDownColor: "#ef4444",
              wickUpColor: "#16a34a", wickDownColor: "#ef4444",
            })
          : canL
            ? chart.addLineSeries({ lineWidth: 2 })
            : canA
              ? chart.addAreaSeries({ lineWidth: 2 })
              : null;

        if (!series) throw new Error("Chart API has no series methods");

        if (canC) series.setData(data);
        else      series.setData(data.map(d => ({ time: d.time, value: d.close })));

        const onResize = () => chart.applyOptions({ width: mountRef.current?.clientWidth || width });
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
