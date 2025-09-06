import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";

export default function StockChart({ symbol }) {
  const wrapRef = useRef(null);
  const chartRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (!wrapRef.current) return;

    try {
      // Ensure container has a width; defer to next tick to let layout settle
      const mount = () => {
        const width = wrapRef.current.clientWidth || 900;
        const height = 420;

        const chart = createChart(wrapRef.current, {
          width,
          height,
          layout: { background: { type: "solid", color: "#0b0b0b" }, textColor: "#e5e7eb" },
          grid: {
            vertLines: { color: "rgba(255,255,255,0.08)" },
            horzLines: { color: "rgba(255,255,255,0.08)" },
          },
          rightPriceScale: { borderVisible: false },
          timeScale: { borderVisible: false },
        });
        chartRef.current = chart;

        const series = chart.addLineSeries();
        // Temporary demo data
        series.setData([
          { time: "2025-09-01", value: 190 },
          { time: "2025-09-02", value: 200 },
          { time: "2025-09-03", value: 210 },
          { time: "2025-09-04", value: 205 },
          { time: "2025-09-05", value: 215 },
        ]);

        const onResize = () => {
          if (!wrapRef.current || !chartRef.current) return;
          chartRef.current.applyOptions({ width: wrapRef.current.clientWidth || 900 });
        };
        window.addEventListener("resize", onResize);
        // Cleanup
        return () => {
          window.removeEventListener("resize", onResize);
          chart.remove();
          chartRef.current = null;
        };
      };

      console.log("Rendering chart for:", symbol);
      // Wait a frame to avoid 0-width container
      const id = requestAnimationFrame(() => mount());
      return () => cancelAnimationFrame(id);

    } catch (e) {
      console.error("Chart init error:", e);
      setError(String(e?.message || e));
    }
  }, [symbol]);

  return (
    <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
      {error && (
        <div style="padding:12px;border:1px solid #ef4444;color:#fecaca;margin:12px 0;background:#1f0000">
          Chart error: {error}
        </div>
      )}
      <div
        ref={wrapRef}
        style={{ width: "100%", height: 420, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
      />
    </div>
  );
}
