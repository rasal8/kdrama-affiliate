app.get("/test", async (req, res) => {
  const axios = require("axios");

  try {
    await axios.post(`https://api.telegram.org/bot${process.env.8657422651:AAGWc-F1QO87VRXWp8szv1No37e8eNxBcxU}/sendMessage`, {
      chat_id: process.env.@kdramadaily,
      text: "🔥 Bot working!"
    });

    res.send("Message sent");
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.send("Error");
  }
});
