import http from "node:http";
import { URL } from "node:url";

// Helpers (same as before)
const json = (res, code, obj) => { res.writeHead(code, {"content-type":"application/json"}); res.end(JSON.stringify(obj)); };
const text = (res, code, body, ct="application/rss+xml; charset=UTF-8") => { res.writeHead(code, {"content-type":ct}); res.end(body); };
const UA = {"user-agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Safari/537.36"};
const fetchJson = async (url) => (await fetch(url, {headers:UA})).json();
const fetchText = async (url) => (await fetch(url, {headers:UA})).text();

// (keep your existing handler code for /api/ohlc, /api/quote, /api/overview, /api/news)
// For brevity keep implementation identical; ensure health route exists:

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, "http://localhost");
    res.setHeader("cache-control","no-store");

    if (u.pathname === "/api/healthz") return json(res, 200, {ok:true});

    // ... existing routes (paste your current route handlers here) ...

    json(res, 404, {error:"not found"});
  } catch (e) {
    json(res, 500, {error: String(e?.message||e)});
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, "0.0.0.0", () => console.log("API listening on", PORT));
