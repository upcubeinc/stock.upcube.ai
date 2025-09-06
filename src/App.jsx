import React from "react";
import MicroChart from "./components/MicroChart.jsx";

export default function App(){
  return (
    <div style={{padding:20,fontSize:18,background:"#0b0b0b",color:"#fff"}}>
      <h1>✅ React Loaded + MicroChart</h1>
      <p>This embeds a minimal line chart via the UMD global.</p>
      <MicroChart />
      <p style={{marginTop:16}}>If you see the chart, the library works. Next we’ll hook symbols.</p>
    </div>
  );
}
