const express = require("express");
const axios = require("axios");

const app = express();   // ✅ must come first

app.get("/", (req, res) => {
  res.send("Server running");
});

app.get("/test", async (req, res) => {
  try {
    const r = await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.CHANNEL_ID,
        text: "🔥 Bot working!"
      }
    );

    res.send("OK: " + JSON.stringify(r.data));
  } catch (e) {
    res.send("ERR: " + JSON.stringify(e.response?.data || e.message));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
