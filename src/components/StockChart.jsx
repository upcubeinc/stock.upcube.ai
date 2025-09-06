import React, { useEffect, useRef, useState } from "react";
import { fetchOHLC } from "../lib/ohlc";
import { RSI, EMA, MACD } from "../lib/indicators";

export default function StockChart({ symbol, type="area", interval="1d", range="6mo", cmp="", pane="off" }) {
  const wrapRef = useRef(null);      // outer wrapper (relative)
  const mainRef = useRef(null);      // main pane host
  const paneRef = useRef(null);      // indicator pane host
  const [status, setStatus] = useState("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let chart, volSeries, overlaySeries, subChart, subSeries, histSeries;
    let alive = true;

    (async () => {
      try {
        setStatus("loading"); setMsg("");

        // wait UMD
        let tries=0; while(!(window.LightweightCharts && window.LightweightCharts.createChart)){
          await new Promise(r=>setTimeout(r,50));
          if(++tries>140) throw new Error("LightweightCharts UMD not ready");
        }
        const LWC = window.LightweightCharts;

        // data
        const { candles } = await fetchOHLC(symbol, { interval, range });
        if (!alive) return;
        const close = candles.map(c=>c.close);

        // main chart
        const width = mainRef.current?.clientWidth || 960;
        chart = LWC.createChart(mainRef.current, {
          width, height: 520,
          layout: { background: { type: "solid", color: "#0b0b0b" }, textColor: "#e5e7eb" },
          grid: { vertLines: { color: "rgba(255,255,255,0.08)" }, horzLines: { color: "rgba(255,255,255,0.08)" } },
          rightPriceScale: { borderVisible: false, visible: true },
          leftPriceScale:  { borderVisible: false, visible: true }
        });

        // series
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

        // volume
        volSeries = chart.addHistogramSeries({ priceFormat:{ type:"volume" }, color:"rgba(125,211,252,0.35)" });
        volSeries.setData(candles.map(c=>({ time:c.time, value:c.volume })));

        // compare
        const cmpSym = (cmp||"").trim().toUpperCase();
        if (cmpSym && cmpSym !== symbol) {
          try {
            const { candles: cmpCandles } = await fetchOHLC(cmpSym, { interval, range });
            if (cmpCandles?.length) {
              const base = cmpCandles.find(x=>Number.isFinite(x?.close))?.close || cmpCandles[0].close;
              const norm = cmpCandles.map(p=>({ time:p.time, value: (p.close/base)*100 }));
              overlaySeries = chart.addLineSeries({ lineWidth:1, color:"#22d3ee", priceScaleId:"left", priceFormat:{ type:"price", precision:2, minMove:0.01 } });
              overlaySeries.setData(norm);
            }
          } catch {}
        }

        // ----- Secondary pane: RSI or MACD -----
        if (pane!=="off") {
          subChart = LWC.createChart(paneRef.current, {
            width: paneRef.current?.clientWidth || width,
            height: pane==="macd" ? 200 : 160,
            layout: { background: { type:"solid", color:"#0b0b0b"}, textColor:"#e5e7eb" },
            grid:   { vertLines:{color:"rgba(255,255,255,0.06)"}, horzLines:{color:"rgba(255,255,255,0.06)"} },
            rightPriceScale:{ borderVisible:false }, timeScale:{ borderVisible:false }
          });

          if (pane==="rsi") {
            const arr = RSI(close, 14);
            subSeries = subChart.addLineSeries({ color:"#f59e0b", lineWidth:1 });
            subSeries.setData(arr.map((v,i)=> v==null? null : ({ time:candles[i].time, value:v })).filter(Boolean));
            [30,70].forEach(v=> subChart.createPriceLine({ price:v, color:"rgba(255,255,255,0.2)", lineWidth:1, lineStyle:0, axisLabelVisible:true }));
          }
          if (pane==="macd") {
            const { macd, signal, hist } = MACD(close,12,26,9);
            subSeries = subChart.addLineSeries({ color:"#60a5fa", lineWidth:1 }); // macd
            subSeries.setData(macd.map((v,i)=> v==null? null : ({ time:candles[i].time, value:v })).filter(Boolean));
            const sigSeries = subChart.addLineSeries({ color:"#f59e0b", lineWidth:1 });
            sigSeries.setData(signal.map((v,i)=> v==null? null : ({ time:candles[i].time, value:v })).filter(Boolean));
            histSeries = subChart.addHistogramSeries({ color:"rgba(34,197,94,0.6)" });
            histSeries.setData(hist.map((v,i)=> ({ time:candles[i].time, value: v==null? 0 : v, color: v>=0? "rgba(34,197,94,0.6)" : "rgba(239,68,68,0.6)"})));
          }
        }

        // ----- 1D pre/after-hours shading (approx first pass) -----
        if (range==="1d") {
          const overlay = document.createElement("div");
          overlay.style.position="absolute"; overlay.style.inset="0"; overlay.style.pointerEvents="none";
          const pre = document.createElement("div"), post = document.createElement("div");
          const tint = "rgba(255,255,255,0.03)";
          [pre,post].forEach(x=>{ x.style.position="absolute"; x.style.top="0"; x.style.bottom="0"; x.style.background=tint; });
          overlay.append(pre,post); wrapRef.current.appendChild(overlay);
          const layout = ()=>{ const w = wrapRef.current.clientWidth; pre.style.left="0"; pre.style.width = (w*0.18)+"px"; post.style.right="0"; post.style.width=(w*0.22)+"px"; };
          layout();
          const ro = new ResizeObserver(layout); ro.observe(wrapRef.current);
        }

        const onResize = () => {
          chart.applyOptions({ width: mainRef.current?.clientWidth || width });
          if (subChart) subChart.applyOptions({ width: paneRef.current?.clientWidth || width });
        };
        window.addEventListener("resize", onResize);

        setStatus("ready");
        return () => { window.removeEventListener("resize", onResize); chart?.remove(); subChart?.remove(); };
      } catch (e) {
        console.error(e);
        setStatus("error"); setMsg(String(e?.message || e));
      }
    })();

    return () => { alive = false; chart?.remove(); subChart?.remove(); };
  }, [symbol, type, interval, range, cmp, pane]);

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      {status === "loading" && <div style={{padding:"8px 0",opacity:0.7}}>Loading {symbol}…</div>}
      {status === "error"   && <div style={{padding:"8px 0",color:"#fecaca",border:"1px solid #ef4444",borderRadius:8}}>Error: {msg}</div>}
      <div ref={mainRef} style={{ width:"100%", height:520 }} />
      {pane!=="off" && <div ref={paneRef} style={{ width:"100%", marginTop:12 }} />}
    </div>
  );
}
