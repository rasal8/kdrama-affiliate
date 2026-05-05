require("dotenv").config();

const express = require("express");
const app = express();

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("K-Drama Affiliate Server Running");
});

app.get("/test", (req, res) => {
  res.json({ status: "working" });
});

/* ================== AMAZON LINK ================== */
function getAmazonLink(keyword) {
  return `https://www.amazon.in/s?k=${encodeURIComponent(
    keyword
  )}&tag=${process.env.AMAZON_TAG}`;
}

/* ================== KEYWORDS ================== */
function getOutfitKeyword(drama) {
  const d = drama.toLowerCase();

  if (d.includes("goblin")) return "korean winter coat";
  if (d.includes("business")) return "korean office outfit";
  if (d.includes("love")) return "korean date dress";

  return "korean fashion outfit";
}

function getSkincareKeyword(drama) {
  const d = drama.toLowerCase();

  if (d.includes("love")) return "korean glass skin skincare set";
  if (d.includes("business")) return "korean clean skincare";

  return "korean skincare products";
}

function getMakeupKeyword(drama) {
  const d = drama.toLowerCase();

  if (d.includes("love")) return "korean soft glam makeup";
  return "korean makeup kit";
}

/* ================== PRODUCTS ================== */
function getTopProducts(keyword) {
  return [
    {
      title: "🔥 Korean Coat",
      link: getAmazonLink(keyword + " coat")
    },
    {
      title: "💖 Korean Dress",
      link: getAmazonLink(keyword + " dress")
    }
  ];
}

/* ================== TELEGRAM BOT ================== */
bot.on("message", async (msg) => {
  if (!msg.text || msg.chat.type !== "private") return;

  const drama = msg.text;

  try {
    const r = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: process.env.OMDB_API_KEY,
        t: drama
      }
    });

    const d = r.data;

    const outfitKeyword = getOutfitKeyword(drama);
    const skincareKeyword = getSkincareKeyword(drama);
    const makeupKeyword = getMakeupKeyword(drama);

    const outfitLink = getAmazonLink(outfitKeyword);
    const skincareLink = getAmazonLink(skincareKeyword);
    const makeupLink = getAmazonLink(makeupKeyword);

    const products = getTopProducts(outfitKeyword);

    const caption = `
✨ Inspired by ${d.Title || drama}

⭐ ${d.imdbRating || "8.5"}/10  
🎭 Korean Aesthetic  

💫 Steal The Look 👇
`;

    const buttons = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🔥 Lead Coat", url: products[0].link },
            { text: "💖 Dress Look", url: products[1].link }
          ],
          [
            { text: "🧴 Skincare", url: skincareLink },
            { text: "💄 Makeup", url: makeupLink }
          ]
        ]
      }
    };

    if (d.Poster && d.Poster !== "N/A") {
      await bot.sendPhoto(process.env.CHANNEL_ID, d.Poster, {
        caption,
        ...buttons
      });
    } else {
      await bot.sendMessage(process.env.CHANNEL_ID, caption, buttons);
    }

  } catch (err) {
    console.log(err.message);

    await bot.sendMessage(
      process.env.CHANNEL_ID,
      `❌ Error: ${err.message}`
    );
  }
});

/* ================== START SERVER ================== */
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
