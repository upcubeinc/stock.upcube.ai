import React, { useEffect, useRef, useState } from "react";
import { fetchOHLC } from "../lib/ohlc";

export default function StockChart({ symbol, type="area", interval="1d", range="6mo", cmp="" }) {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let chart, volSeries, overlaySeries;
    let alive = true;

    (async () => {
      try {
        setStatus("loading"); setMsg("");

        // wait for Lightweight-Charts UMD (v4)
        let tries=0; while(!(window.LightweightCharts && window.LightweightCharts.createChart)){
          await new Promise(r=>setTimeout(r,50));
          if(++tries>140) throw new Error("LightweightCharts UMD not ready");
        }
        const LWC = window.LightweightCharts;

        // fetch main data
        const { candles } = await fetchOHLC(symbol, { interval, range });
        if (!alive) return;

        const el = mountRef.current;
        const width = el?.clientWidth || 960;

        chart = LWC.createChart(el, {
          width, height: 520,
          layout: { background: { type: "solid", color: "#0b0b0b" }, textColor: "#e5e7eb" },
          grid: { vertLines: { color: "rgba(255,255,255,0.08)" }, horzLines: { color: "rgba(255,255,255,0.08)" } },
          rightPriceScale: { borderVisible: false, visible: true },
          leftPriceScale:  { borderVisible: false, visible: true }   // for compare overlay
        });

        // main series
        const useArea = type==="area";
        const useLine = type==="line";
        const main =
          useArea ? chart.addAreaSeries({ lineWidth:2, topColor:"rgba(125,211,252,0.30)", bottomColor:"rgba(125,211,252,0.06)" }) :
          useLine ? chart.addLineSeries({ lineWidth:2 }) :
          chart.addCandlestickSeries({
            upColor:"#16a34a", downColor:"#ef4444",
            borderUpColor:"#16a34a", borderDownColor:"#ef4444",
            wickUpColor:"#16a34a", wickDownColor:"#ef4444",
          });

        if (useArea || useLine) {
          main.setData(candles.map(c=>({ time:c.time, value:c.close })));
        } else {
          main.setData(candles.map(c=>({ time:c.time, open:c.open, high:c.high, low:c.low, close:c.close })));
        }

        // volume overlay
        volSeries = chart.addHistogramSeries({ priceFormat:{ type:"volume" }, color:"rgba(125,211,252,0.35)" });
        volSeries.setData(candles.map(c=>({ time:c.time, value:c.volume })));

        // compare overlay (normalize to 100 on first visible)
        const cmpSym = (cmp||"").trim().toUpperCase();
        if (cmpSym && cmpSym !== symbol) {
          try {
            const { candles: cmpCandles } = await fetchOHLC(cmpSym, { interval, range });
            if (cmpCandles && cmpCandles.length) {
              const base = cmpCandles.find(x=>Number.isFinite(x?.close))?.close || cmpCandles[0].close;
              const norm = cmpCandles.map(p=>({ time:p.time, value: (p.close/base)*100 }));
              overlaySeries = chart.addLineSeries({
                lineWidth: 1,
                color: "#22d3ee",
                priceScaleId: "left",
                priceFormat: { type: "price", precision: 2, minMove: 0.01 }
              });
              overlaySeries.setData(norm);
            }
          } catch (e) {
            console.warn("Compare fetch failed:", e?.message || e);
          }
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
  }, [symbol, type, interval, range, cmp]);

  return (
    <div>
      {status === "loading" && <div style={{padding:"8px 0",opacity:0.7}}>Loading {symbol}…</div>}
      {status === "error"   && <div style={{padding:"8px 0",color:"#fecaca",border:"1px solid #ef4444",borderRadius:8}}>Error: {msg}</div>}
      <div ref={mountRef} style={{ width:"100%", height:520 }} />
    </div>
  );
}
