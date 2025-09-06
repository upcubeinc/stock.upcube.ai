import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useParams } from "react-router-dom";
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

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, display: "flex", gap: 12 }}>
        <Link to="/AAPL">AAPL</Link>
        <Link to="/MSFT">MSFT</Link>
      </nav>
      <Routes>
        {/* default to AAPL on home */}
        <Route index element={<Navigate to="/AAPL" replace />} />
        <Route path="/:symbol" element={<SymbolPage />} />
        {/* catch-all -> AAPL */}
        <Route path="*" element={<Navigate to="/AAPL" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
