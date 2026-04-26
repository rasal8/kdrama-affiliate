const express = require("express");
const axios = require("axios");

const app = express();   // ✅ THIS must come BEFORE any app.get

app.get("/", (req, res) => {
  res.send("UPDATED VERSION LIVE");
});

app.get("/test", async (req, res) => {
  try {
    await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.CHANNEL_ID,
      text: "🔥 Bot working!"
    });

    res.send("Message sent");
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.send("Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
