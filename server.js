const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// ✅ ROOT FIX
app.get("/", (req, res) => {
  res.send("🔥 K-Drama Affiliate Server Running Successfully");
});

// ✅ TEST ROUTE
app.get("/test", (req, res) => {
  res.json({ status: "working" });
});
app.get("/generate", (req, res) => { const express = require("express");
const axios = require("axios");
const app = express();

const PORT = process.env.PORT || 3000;

// static UI
app.use(express.static("public"));

// helper
function amazonLink(q) {
  const tag = "yourtag-21"; // 🔁 yahan apna Amazon affiliate tag dalna
  return `https://www.amazon.in/s?k=${encodeURIComponent(q)}&tag=${tag}`;
}

app.get("/generate", async (req, res) => {
  const drama = (req.query.name || "").trim();
  if (!drama) return res.send("Missing ?name=");

  try {
    // 1) exact title
    let r = await axios.get("https://www.omdbapi.com/", {
      params: { apikey: process.env.OMDB_API_KEY, t: drama }
    });

    // 2) fallback: search list se first result
    if (r.data.Response === "False") {
      const s = await axios.get("https://www.omdbapi.com/", {
        params: { apikey: process.env.OMDB_API_KEY, s: drama }
      });
      if (s.data.Response === "True") {
        const first = s.data.Search[0];
        r = await axios.get("https://www.omdbapi.com/", {
          params: { apikey: process.env.OMDB_API_KEY, i: first.imdbID }
        });
      }
    }

    const d = r.data;
    if (d.Response === "False") return res.send("No result found");

    const poster = d.Poster && d.Poster !== "N/A"
      ? d.Poster
      : "https://via.placeholder.com/300x450?text=No+Image";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${d.Title}</title>
  <style>
    body{font-family:system-ui;background:#0f172a;color:#e5e7eb;margin:0;padding:16px}
    .card{max-width:720px;margin:auto;background:#111827;border-radius:16px;padding:16px}
    img{border-radius:12px}
    a{color:#22c55e;text-decoration:none}
    .row{display:flex;gap:16px;flex-wrap:wrap}
    .meta{opacity:.9}
    .btn{display:inline-block;margin:6px 8px 0 0;padding:10px 14px;background:#16a34a;color:#052e16;border-radius:10px}
  </style>
</head>
<body>
  <div class="card">
    <div class="row">
      <img src="${poster}" width="200"/>
      <div>
        <h1>🎬 ${d.Title}</h1>
        <div class="meta">⭐ ${d.imdbRating} • ${d.Year} • ${d.Genre || ""}</div>
        <p>${d.Plot}</p>

        <div>
          <a class="btn" href="${amazonLink(d.Title + " kdrama")}" target="_blank">Watch / Buy</a>
          <a class="btn" href="${amazonLink(d.Title + " outfit korean")}" target="_blank">Outfits</a>
          <a class="btn" href="${amazonLink(d.Title + " accessories")}" target="_blank">Accessories</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
    res.send(html);

  } catch (e) {
    res.send("Error fetching data");
  }
});

app.listen(PORT, () => console.log("Server running on " + PORT));
  const drama = req.query.name || "Unknown Drama";

  const html = `
    <h1>🎬 ${drama}</h1>
    <p>🔥 Watch ${drama} Online</p>

    <h2>🛍 Shop Inspired Products</h2>
    <ul>
      <li><a href="#">Korean Outfit</a></li>
      <li><a href="#">Accessories</a></li>
    </ul>

    <p>👉 Powered by KDrama Affiliate System</p>
  `;

  res.send(html);
});
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
