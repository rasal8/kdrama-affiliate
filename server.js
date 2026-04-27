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
const axios = require("axios");
function getOutfitKeyword(drama){
  const d = drama.toLowerCase();

  if(d.includes("goblin") || d.includes("guardian"))
    return "korean winter coat men women";

  if(d.includes("business"))
    return "korean office outfit women blazer";

  if(d.includes("love") || d.includes("romance"))
    return "korean date outfit women dress";

  if(d.includes("school"))
    return "korean school outfit women";

  return "korean fashion outfit";
}
const map = {
  "goblin": "Guardian The Lonely and Great God",
  "business proposal": "A Business Proposal"
};

function similarity(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();

  let matches = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / Math.max(a.length, b.length);
}

app.get("/generate", async (req, res) => {
  let drama = req.query.name;

  if (!drama) return res.send("❌ Enter drama name");

  // ✅ manual mapping
  if (map[drama.toLowerCase()]) {
    drama = map[drama.toLowerCase()];
  }

  try {
    const searchRes = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: process.env.OMDB_API_KEY,
        s: drama
      }
    });

    if (searchRes.data.Response === "False") {
      return res.send("❌ No result found");
    }

    let results = searchRes.data.Search;

    // ✅ filter
    const filtered = results.filter(r =>
      r.Type === "series" || r.Type === "movie"
    );

    results = filtered.length ? filtered : results;

    // ✅ scoring
    const scored = results.map(item => ({
      ...item,
      score: similarity(drama, item.Title)
    }));

    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];

    // ✅ suggestions
    if (best.score < 0.4) {
      const suggestions = scored.slice(0, 5)
        .map(i => `<li><a href="/generate?name=${i.Title}">${i.Title}</a></li>`)
        .join("");

      return res.send(`<h2>Did you mean:</h2><ul>${suggestions}</ul>`);
    }

    const detailRes = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: process.env.OMDB_API_KEY,
        i: best.imdbID
      }
    });

    const d = detailRes.data;
    const poster = d.Poster !== "N/A"
  ? d.Poster
  : "https://via.placeholder.com/300x450?text=No+Image";

    res.send(`
  <html>
  <head>
    <title>${d.Title}</title>
    <style>
      body {
        font-family: Arial;
        background: #111;
        color: #fff;
        text-align: center;
        padding: 20px;
      }
      .card {
        background: #1c1c1c;
        padding: 20px;
        border-radius: 10px;
        max-width: 400px;
        margin: auto;
      }
      img {
        width: 100%;
        border-radius: 10px;
      }
      a {
  display: block;
  margin: 10px;
  padding: 12px;
  background: #ff3c3c;
  color: white;        /* 🔥 important */
  font-weight: bold;
  text-decoration: none;
  border-radius: 6px;
                                       }
    </style>
  </head>
  <body>

    <div class="card">
      <h2>🎬 ${d.Title}</h2>
      <img src="${poster}" />
      <p>⭐ ${d.imdbRating}</p>
      <p>${d.Plot}</p>

      <h3>🛍 Shop Inspired</h3>
      <a href="/outfit?name=${d.Title}">
<a href="/accessories?name=${d.Title}">
    </div>

  </body>
  </html>
`);

  } catch (error) {
    console.log(error);
    res.send("⚠️ Error");
  }
});
app.get("/outfit", (req, res) => {
  const drama = req.query.name;

  const keyword = getOutfitKeyword(drama);

  console.log("🔥 Outfit:", drama, "→", keyword);

  const link = `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&tag=rrasal-21&linkCode=ll1`;

  res.redirect(link);
});
app.get("/accessories", (req, res) => {
  const drama = req.query.name;

  const keyword = "korean accessories fashion";

  const link = `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&tag=rrasal-21&linkCode=ll1`;

  res.redirect(link);
});
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
