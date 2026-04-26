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
app.get("/generate", (req, res) => {
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
