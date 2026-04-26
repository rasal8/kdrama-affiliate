app.get("/test", async (req, res) => {
  const axios = require("axios");

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
