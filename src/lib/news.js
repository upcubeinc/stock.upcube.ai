export async function fetchNews(symbol, limit=10){
  symbol = String(symbol||"").trim().toUpperCase();
  try{
    const txt = await fetch(`/api/news?symbol=${encodeURIComponent(symbol)}`).then(r=>r.text());
    const doc = new DOMParser().parseFromString(txt, "text/xml");
    const items = [...doc.querySelectorAll("item")].slice(0,limit).map(it=>({
      title: it.querySelector("title")?.textContent || "",
      link:  it.querySelector("link")?.textContent || "",
      pub:   it.querySelector("pubDate")?.textContent || "",
      src:   it.querySelector("source")?.textContent || ""
    }));
    return { items };
  }catch(e){
    return { items: [], error: "Failed to parse news." };
  }
}
