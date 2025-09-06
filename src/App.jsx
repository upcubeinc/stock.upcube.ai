import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams, Link } from "react-router-dom";
import QuotePage from "./components/QuotePage/QuotePage.jsx";
import MarketsPage from "./components/pages/MarketsPage.jsx";
import WatchlistPage from "./components/pages/WatchlistPage.jsx";

function Quote(){ const { symbol } = useParams(); return <QuotePage symbol={(symbol||"AAPL").toUpperCase()} />; }

function TopNav(){
  return (
    <div style={{display:"flex",gap:12, padding:"10px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)", position:"sticky", top:0, background:"#0b0b0b", zIndex:50}}>
      <Link to="/AAPL">Quote</Link>
      <Link to="/markets">Markets</Link>
      <Link to="/watchlist">Watchlist</Link>
    </div>
  );
}

export default function App(){
  return (
    <BrowserRouter>
      <TopNav/>
      <Routes>
        <Route index element={<Navigate to="/AAPL" replace />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/:symbol" element={<Quote />} />
        <Route path="*" element={<Navigate to="/AAPL" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
