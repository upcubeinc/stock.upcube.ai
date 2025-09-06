(function () {
  function ready(f){document.readyState!=='loading'?f():document.addEventListener('DOMContentLoaded',f)}
  ready(function(){
    var el=document.getElementById('probe'); if(!el) return;
    var tries=0, id=setInterval(function(){
      var L=window.LightweightCharts;
      if(L && typeof L.createChart==='function'){
        clearInterval(id);
        var ch=L.createChart(el,{width:el.clientWidth||900,height:180});
        // Log what the chart actually has
        var proto=Object.getOwnPropertyNames(Object.getPrototypeOf(ch));
        console.log('Probe: chart proto methods:', proto);
        var hasLine=typeof ch.addLineSeries, hasCandle=typeof ch.addCandlestickSeries, hasArea=typeof ch.addAreaSeries;
        console.log('Probe:', {hasLine,hasCandle,hasArea});
        if (typeof ch.addLineSeries==='function'){
          var s=ch.addLineSeries({lineWidth:2});
          var now=Math.floor(Date.now()/1000),d=86400;
          s.setData([{time:now-4*d,value:100},{time:now-3*d,value:101},{time:now-2*d,value:102.2},{time:now-1*d,value:101.4},{time:now,value:103.1}]);
        } else {
          el.innerHTML="<div style='padding:8px;border:1px solid #a00;color:#fee;background:#210'>Chart has no addLineSeries — see console dump above.</div>";
        }
        window.addEventListener('resize',()=>ch.applyOptions({width:el.clientWidth||900}));
      } else if(++tries>140){clearInterval(id); el.innerHTML="<div style='padding:8px;border:1px solid #a00;color:#fee;background:#210'>LightweightCharts not ready</div>";}
    },50);
  });
})();
