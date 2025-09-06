export function SMA(values, period) {
  const out = Array(values.length).fill(undefined);
  let sum = 0;
  for (let i=0;i<values.length;i++){
    const v = values[i]; if (v==null) continue;
    sum += v;
    if (i>=period) sum -= values[i-period];
    if (i>=period-1) out[i] = sum/period;
  }
  return out;
}
export function EMA(values, period) {
  const out = Array(values.length).fill(undefined);
  const k = 2/(period+1);
  let ema;
  for (let i=0;i<values.length;i++){
    const v = values[i]; if (v==null) continue;
    ema = (ema==null) ? v : v*k + ema*(1-k);
    out[i] = ema;
  }
  return out;
}
export function RSI(values, period=14) {
  const out = Array(values.length).fill(undefined);
  let avgGain=0, avgLoss=0;
  for (let i=1;i<values.length;i++){
    const ch = values[i]-values[i-1]; const g = Math.max(ch,0), l = Math.max(-ch,0);
    if (i<=period){ avgGain+=g; avgLoss+=l; if (i===period){ avgGain/=period; avgLoss/=period; out[i]=toRSI(avgGain,avgLoss);} }
    else { avgGain=(avgGain*(period-1)+g)/period; avgLoss=(avgLoss*(period-1)+l)/period; out[i]=toRSI(avgGain,avgLoss); }
  }
  return out;
  function toRSI(g,l){ const rs=l===0?100:g/l; return 100-(100/(1+rs)); }
}
export function MACD(values, fast=12, slow=26, signal=9){
  const emaF = EMA(values, fast);
  const emaS = EMA(values, slow);
  const macd = values.map((_,i)=> (emaF[i]==null||emaS[i]==null)? undefined : emaF[i]-emaS[i]);
  const sig  = EMA(macd, signal);
  const hist = macd.map((v,i)=> (v==null||sig[i]==null)? undefined : v - sig[i]);
  return { macd, signal: sig, hist };
}
