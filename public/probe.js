(function () {
  function ready(fn){ if(document.readyState!=='loading'){fn()} else {document.addEventListener('DOMContentLoaded',fn)}}
  function ensureLWC(cb){
    var tries = 0, max=140;
    (function tick(){
      if (window.LightweightCharts && typeof window.LightweightCharts.createChart === 'function') {
        cb(window.LightweightCharts);
      } else if (++tries < max) {
        setTimeout(tick,50);
      } else {
        console.error('Probe: LightweightCharts not available');
        var el = document.getElementById('probe');
        if (el) el.innerHTML = '<div style="padding:8px;border:1px solid #ef4444;color:#fecaca">Probe error: LightweightCharts not available</div>';
      }
    })();
  }

  ready(function(){
    var el = document.getElementById('probe');
    if (!el) return;
    ensureLWC(function(LWC){
      console.log('Probe: LWC keys:', Object.keys(LWC).slice(0,20));
      var chart = LWC.createChart(el, { width: el.clientWidth||900, height: 180 });
      console.log('Probe: chart has methods:', {
        addLineSeries: typeof chart.addLineSeries,
        addCandlestickSeries: typeof chart.addCandlestickSeries,
        addAreaSeries: typeof chart.addAreaSeries
      });
      var line = chart.addLineSeries({ lineWidth: 2 });
      var now = Math.floor(Date.now()/1000), day=86400;
      line.setData([
        { time: now-4*day, value: 100 },
        { time: now-3*day, value: 101 },
        { time: now-2*day, value: 102.2 },
        { time: now-1*day, value: 101.4 },
        { time: now,       value: 103.1 }
      ]);
      window.addEventListener('resize', function(){ chart.applyOptions({ width: el.clientWidth||900 }); });
      console.log('Probe: chart rendered.');
    });
  });
})();
