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

    res.send(`
      <h1>🎬 ${d.Title}</h1>
      <img src="${d.Poster}" width="200"/>
      <p>⭐ ${d.imdbRating}</p>
      <p>${d.Plot}</p>
    `);

  } catch (error) {
    console.log(error);
    res.send("⚠️ Error");
  }
});
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
