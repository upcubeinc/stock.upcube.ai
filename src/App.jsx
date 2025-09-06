import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useParams } from "react-router-dom";
import StockChart from "./components/StockChart.jsx";

function SymbolPage() {
  const { symbol } = useParams();
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>{symbol}</h2>
      <StockChart symbol={symbol} />
    </div>
  );
}

function TopBar() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  return (
    <nav style={{ padding: 12, display: "flex", gap: 12, alignItems:"center" }}>
      <Link to="/AAPL">AAPL</Link>
      <Link to="/MSFT">MSFT</Link>
      <input
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        onKeyDown={(e)=>{ if(e.key==="Enter" && q.trim()) nav("/" + q.trim().toUpperCase()); }}
        placeholder="Jump to symbol (e.g. TSLA)"
        style={{ background:"#141414", color:"#fff", border:"1px solid #333", borderRadius:8, padding:"8px 10px" }}
      />
    </nav>
  );
}

export default function App() {
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
