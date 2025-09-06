import React, { useEffect, useRef } from "react";

export default function MicroChart(){
  const ref = useRef(null);

  useEffect(() => {
    let chart;
    const el = ref.current;
    if (!el) return;

    // Wait up to ~7s for the UMD to be present
    let tries = 0;
    const id = setInterval(() => {
      const LWC = window.LightweightCharts;
      if (LWC && typeof LWC.createChart === "function") {
        clearInterval(id);
        chart = LWC.createChart(el, { width: el.clientWidth || 900, height: 260 });
        const line = chart.addLineSeries({ lineWidth: 2 });
        const now = Math.floor(Date.now()/1000), d=86400;
        line.setData([
          { time: now-4*d, value: 100 },
          { time: now-3*d, value: 101 },
          { time: now-2*d, value: 102.2 },
          { time: now-1*d, value: 101.4 },
          { time: now,     value: 103.1 }
        ]);
        window.addEventListener("resize", onResize);
        function onResize(){ chart.applyOptions({ width: el.clientWidth || 900 }); }
      } else if (++tries > 140) {
        clearInterval(id);
        el.innerHTML = "<div style='padding:8px;border:1px solid #a00;color:#fee;background:#210'>UMD LightweightCharts not ready</div>";
      }
    }, 50);

    return () => { clearInterval(id); if (chart) chart.remove(); };
  }, []);

  return <div ref={ref} style={{ width:"100%", height:260, border:"1px solid #333", borderRadius:8 }} />;
}
