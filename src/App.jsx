import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import StockChart from "./components/StockChart";

function App() {
  return (
    <Router>
      <nav style={{ padding: "10px" }}>
        <Link to="/AAPL" style={{ marginRight: "10px" }}>AAPL</Link>
        <Link to="/MSFT">MSFT</Link>
      </nav>
      <Routes>
        <Route path="/:symbol" element={<DynamicChart />} />
      </Routes>
    </Router>
  );
}

const DynamicChart = () => {
  const symbol = window.location.pathname.replace("/", "");
  return <StockChart symbol={symbol} />;
};

export default App;
