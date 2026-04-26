app.get("/test", async (req, res) => {
  const axios = require("axios");

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
