export async function fetchNews(symbol, limit=10){
  const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`;
  try{
    const txt = await fetch(url).then(r=>r.text());
    const doc = new DOMParser().parseFromString(txt, "text/xml");
    const items = [...doc.querySelectorAll("item")].slice(0,limit).map(it=>({
      title: it.querySelector("title")?.textContent || "",
      link:  it.querySelector("link")?.textContent || "",
      pub:   it.querySelector("pubDate")?.textContent || "",
      src:   it.querySelector("source")?.textContent || ""
    }));
    return { items };
  }catch(e){
    return { items: [], error: "News feed blocked by CORS. Add a small /api proxy later." };
  }
}
