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
app.get("/generate", async (req, res) => {
  const drama = req.query.name;

  try {
    // STEP 1: search list
    const searchRes = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: process.env.OMDB_API_KEY,
        s: drama
      }
    });

    if (searchRes.data.Response === "False") {
      return res.send("❌ No result found");
    }

    // STEP 2: first result
    const first = searchRes.data.Search[0];

    // STEP 3: get full details
    const detailRes = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: process.env.OMDB_API_KEY,
        i: first.imdbID
      }
    });

    const d = detailRes.data;

    res.send(`
      <h1>🎬 ${d.Title}</h1>
      <img src="${d.Poster}" width="200"/>

      <p>⭐ Rating: ${d.imdbRating}</p>
      <p>${d.Plot}</p>
    `);

  } catch (error) {
    console.log(error);
    res.send("⚠️ Error fetching data");
  }
});
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
