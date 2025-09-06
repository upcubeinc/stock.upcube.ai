import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useParams } from "react-router-dom";
import StockChart from "./components/StockChart.jsx";

function TopBar() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const go = () => { if (q.trim()) nav("/" + q.trim().toUpperCase()); };
  return (
    <nav>
      <Link to="/AAPL">AAPL</Link>
      <Link to="/MSFT">MSFT</Link>
      <Link to="/TSLA">TSLA</Link>
      <Link to="/NVDA">NVDA</Link>
      <Link to="/SPY">SPY</Link>
      <input
        type="text"
        placeholder="Jump to symbol (e.g. AMZN)"
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        onKeyDown={(e)=>{ if(e.key==="Enter") go(); }}
      />
    </nav>
  );
}

function SymbolPage(){
  const { symbol } = useParams();
  return (
    <div className="container">
      <h2>{symbol}</h2>
      <div className="card">
        <StockChart symbol={symbol} />
      </div>
    </div>
  );
}

export default function App(){
  return (
    <BrowserRouter>
      <TopBar />
      <Routes>
        <Route index element={<Navigate to="/AAPL" replace />} />
        <Route path="/:symbol" element={<SymbolPage />} />
        <Route path="*" element={<Navigate to="/AAPL" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
