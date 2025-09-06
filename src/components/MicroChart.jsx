import React,{useEffect,useRef} from "react";
export default function MicroChart(){
  const ref=useRef(null);
  useEffect(()=>{
    let ch; const el=ref.current; if(!el) return;
    let t=0, id=setInterval(()=>{
      const L=window.LightweightCharts;
      if(L && typeof L.createChart==='function'){
        clearInterval(id);
        ch=L.createChart(el,{width:el.clientWidth||900,height:260});
        const proto=Object.getOwnPropertyNames(Object.getPrototypeOf(ch));
        console.log('React Micro: chart proto methods:', proto);
        if (typeof ch.addLineSeries==='function'){
          const s=ch.addLineSeries({lineWidth:2});
          const now=Math.floor(Date.now()/1000),d=86400;
          s.setData([{time:now-4*d,value:100},{time:now-3*d,value:101},{time:now-2*d,value:102.2},{time:now-1*d,value:101.4},{time:now,value:103.1}]);
        } else {
          el.innerHTML="<div style='padding:8px;border:1px solid #a00;color:#fee;background:#210'>React: no addLineSeries — see console proto dump.</div>";
        }
        const onR=()=>ch.applyOptions({width:el.clientWidth||900}); window.addEventListener('resize',onR);
      } else if(++t>140){ clearInterval(id); el.innerHTML="<div style='padding:8px;border:1px solid #a00;color:#fee;background:#210'>UMD not ready</div>"; }
    },50);
    return ()=>{clearInterval(id); ch?.remove();}
  },[]);
  return <div ref={ref} style={{width:"100%",height:260,border:"1px solid #333",borderRadius:8}}/>;
}
