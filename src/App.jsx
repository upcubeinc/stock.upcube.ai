import React from "react";
import MicroChart from "./components/MicroChart.jsx";
export default function App(){
  return (
    <div style={{padding:20,fontSize:18,background:"#0b0b0b",color:"#fff"}}>
      <h1>✅ React Loaded + MicroChart</h1>
      <p>This page proves React + UMD chart render. Once visible, we’ll reconnect symbol routes.</p>
      <MicroChart />
    </div>
  );
}
