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
    const url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&t=${drama}`;

    const response = await axios.get(url);
    const data = response.data;

    if (data.Response === "False") {
      return res.send("❌ No result found");
    }

    res.send(`
      <h1>🎬 ${data.Title}</h1>
      <img src="${data.Poster}" width="200"/>

      <p>⭐ Rating: ${data.imdbRating}</p>
      <p>${data.Plot}</p>
    `);

  } catch (error) {
    console.log(error);
    res.send("⚠️ Error fetching data");
  }
});                                   
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
