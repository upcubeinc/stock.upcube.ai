import React from "react";
import { useSearchParams } from "react-router-dom";
import StockChart from "../StockChart.jsx";

export default function QuoteChart({ symbol }){
  const [sp]=useSearchParams();
  return (
    <StockChart
      symbol={symbol}
      interval={sp.get("interval")||"1d"}
      range={sp.get("tf")||"6mo"}
      type={sp.get("type")||"area"}
    />
  );
}
