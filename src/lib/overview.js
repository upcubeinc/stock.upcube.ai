export async function fetchOverview(symbol){
  try{
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=assetProfile`;
    const j = await fetch(url).then(r=>r.json());
    const p = j?.quoteSummary?.result?.[0]?.assetProfile || {};
    return {
      summary: p.longBusinessSummary || "",
      website: p.website || "",
      industry: p.industry || "",
      sector: p.sector || "",
      city: p.city || "", country: p.country || ""
    };
  }catch{
    return { summary:"", website:"", industry:"", sector:"", city:"", country:"", error:"Overview blocked by CORS. Add a proxy later." };
  }
}
