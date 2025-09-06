import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

const StockChart = ({ symbol }) => {
  const chartContainerRef = useRef();

  useEffect(() => {
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const lineSeries = chart.addLineSeries();

    // Mock data — replace with API calls later
    lineSeries.setData([
      { time: "2025-09-01", value: 190 },
      { time: "2025-09-02", value: 200 },
      { time: "2025-09-03", value: 210 },
    ]);

    return () => chart.remove();
  }, [symbol]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />;
};

export default StockChart;
