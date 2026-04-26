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
  const drama = req.query.name;

  try {
    const url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${drama}`;
    
    const r = await fetch(url);
    const d = await r.json();

    if (d.Response === "False") {
      return res.send("No result found");
    }

    res.send(`
      <h1>🎬 ${d.Title}</h1>
      <img src="${d.Poster}" width="200"/>
      <p>⭐ ${d.imdbRating}</p>
      <p>${d.Plot}</p>
    `);

  } catch (e) {
    res.send("Error fetching data");
  }
});                                   
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
