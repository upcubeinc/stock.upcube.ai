import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useParams } from "react-router-dom";
import StockChart from "./components/StockChart.jsx";

function SymbolPage() {
  const { symbol } = useParams();
  console.log("Route param:", symbol);
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>{symbol}</h2>
      <StockChart symbol={symbol} />
    </div>
  );
}

function Home() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Welcome</h2>
      <p>Select a ticker above.</p>
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
        <Route index element={<Navigate to="/AAPL" replace />} />
        <Route path="/" element={<Home />} />
        <Route path="/:symbol" element={<SymbolPage />} />
        <Route path="*" element={<Navigate to="/AAPL" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
