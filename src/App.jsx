import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import QuotePage from "./components/QuotePage/QuotePage.jsx";

function Page(){ const { symbol } = useParams(); return <QuotePage symbol={(symbol||"AAPL").toUpperCase()} />; }

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Navigate to="/AAPL" replace />} />
        <Route path="/:symbol" element={<Page />} />
        <Route path="*" element={<Navigate to="/AAPL" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
