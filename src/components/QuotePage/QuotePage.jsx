import React from "react";
import QuoteHeader from "./QuoteHeader.jsx";
import QuoteToolbar from "./QuoteToolbar.jsx";
import QuoteChart from "./QuoteChart.jsx";
import StatsGrid from "./StatsGrid.jsx";

export default function QuotePage({ symbol }) {
  return (
    <>
      <QuoteHeader symbol={symbol} />
      <QuoteToolbar />
      <div className="container" style={{marginTop:12}}>
        <div className="card">
          <QuoteChart symbol={symbol} />
        </div>
      </div>
      <div className="container" style={{marginTop:12}}>
        <StatsGrid symbol={symbol} />
      </div>
    </>
  );
}
