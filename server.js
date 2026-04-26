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

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
