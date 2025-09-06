import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function StockChart({ symbol }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    console.log("Rendering chart for:", symbol);

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth || 800,
      height: 400,
      layout: { background: { type: "solid", color: "#0b0b0b" }, textColor: "#ddd" },
      grid: { vertLines: { color: "rgba(255,255,255,0.08)" }, horzLines: { color: "rgba(255,255,255,0.08)" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    const line = chart.addLineSeries();
    // temporary mock data (replace with API later)
    line.setData([
      { time: "2025-09-01", value: 190 },
      { time: "2025-09-02", value: 200 },
      { time: "2025-09-03", value: 210 },
      { time: "2025-09-04", value: 205 },
      { time: "2025-09-05", value: 215 },
    ]);

    const onResize = () => {
      chart.applyOptions({ width: chartRef.current?.clientWidth || 800 });
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
    };
  }, [symbol]);

  return (
    <div style={{ width: "100%", maxWidth: 960, margin: "0 auto" }}>
      <div ref={chartRef} style={{ width: "100%", height: 400 }} />
    </div>
  );
}
