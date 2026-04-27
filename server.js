require("dotenv").config();

const express = require("express");
const app = express();

const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

const PORT = process.env.PORT || 3000;
// ✅ ROOT FIX
app.get("/", (req, res) => {
  res.send(" K-Drama Affiliate Server Running Successfully");
});

// ✅ TEST ROUTE
app.get("/test", (req, res) => {
  res.json({ status: "working" });
});
const axios = require("axios");
function getOutfitKeyword(drama){
  const d = drama.toLowerCase();

  if(d.includes("goblin") || d.includes("guardian"))
    return "korean winter coat men women";

  if(d.includes("business"))
    return "korean office outfit women blazer";

  if(d.includes("love") || d.includes("romance"))
    return "korean date outfit women dress";

  if(d.includes("school"))
    return "korean school outfit women";

  return "korean fashion outfit";
}
const map = {
  "goblin": "Guardian: The Lonely and Great God",
  "guardian": "Guardian: The Lonely and Great God",
  "business proposal": "A Business Proposal",
  "true beauty": "True Beauty"
};


function similarity(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();

  let matches = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / Math.max(a.length, b.length);
}
function getAccessoryKeyword(drama) {
  const d = drama.toLowerCase();

  if (d.includes("goblin") || d.includes("guardian"))
    return "korean winter accessories women scarf gloves beanie";

  if (d.includes("business"))
    return "korean office accessories women watch handbag";

  if (d.includes("love") || d.includes("romance"))
    return "korean date accessories women necklace earrings";

  if (d.includes("school"))
    return "korean cute accessories women hair clips backpack";

  return "korean fashion accessories women stylish";
}
app.get("/generate", async (req, res) => {
  let drama = req.query.name;

  if (!drama) return res.send("❌ Enter drama name");

  // ✅ manual mapping
  let searchName = drama.toLowerCase().trim();

if (map[searchName]) {
  searchName = map[searchName];
}

  try {
    const searchRes = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: process.env.OMDB_API_KEY,
        s: drama
      }
    });

    if (searchRes.data.Response === "False") {
      return res.send("❌ No result found");
    }

    let results = searchRes.data.Search;

    // ✅ filter
    const filtered = results.filter(r =>
      r.Type === "series" || r.Type === "movie"
    );

    results = filtered.length ? filtered : results;

    // ✅ scoring
    const scored = results.map(item => ({
      ...item,
      score: similarity(drama, item.Title)
    }));

    scored.sort((a, b) => b.score - a.score);

    const best = scored[0];

    // ✅ suggestions
    if (best.score < 0.4) {
      const suggestions = scored.slice(0, 5)
        .map(i => `<li><a href="/generate?name=${i.Title}">${i.Title}</a></li>`)
        .join("");

      return res.send(`<h2>Did you mean:</h2><ul>${suggestions}</ul>`);
    }

    const detailRes = await axios.get("https://www.omdbapi.com/", {
      params: {
        apikey: process.env.OMDB_API_KEY,
        i: best.imdbID
      }
    });

    const d = detailRes.data;
    const poster = d.Poster !== "N/A"
  ? d.Poster
  : "https://via.placeholder.com/300x450?text=No+Image";

    res.send(`
  <html>
  <head>
    <title>${d.Title}</title>
    <style>
      body {
        font-family: Arial;
        background: #111;
        color: #fff;
        text-align: center;
        padding: 20px;
      }
      .card {
        background: #1c1c1c;
        padding: 20px;
        border-radius: 10px;
        max-width: 400px;
        margin: auto;
      }
      img {
        width: 100%;
        border-radius: 10px;
      }
      a {
  display: block;
  margin: 10px;
  padding: 12px;
  background: #ff3c3c;
  color: white;        /*  important */
  font-weight: bold;
  text-decoration: none;
  border-radius: 6px;
                                       }
    </style>
  </head>
  <body>

    <div class="card">
      <h2>🎬 ${d.Title}</h2>
      <img src="${poster}" />
      <p>⭐ ${d.imdbRating}</p>
      <p>${d.Plot}</p>

      <h3>🛍 Shop Inspired</h3>
      <a href="/outfit?name=${encodeURIComponent(d.Title)}" target="_blank" rel="noopener noreferrer"> Korean Outfit</a>

<a href="/accessories?name=${encodeURIComponent(d.Title)}" target="_blank" rel="noopener noreferrer"> Accessories</a>
    </div>

  </body>
  </html>
`);

  } catch (error) {
    console.log(error);
    res.send("⚠️ Error");
  }
});
app.get("/outfit", (req, res) => {
  const drama = req.query.name;

  const keyword = getOutfitKeyword(drama) || `${drama} korean outfit`;

  console.log("🔥 Outfit:", drama, "→", keyword);

  const link = `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&tag=rrasal-21&linkCode=ll1`;

  res.redirect(link);
});
app.get("/accessories", (req, res) => {
  const drama = req.query.name;

  const keyword = getAccessoryKeyword(drama);

  const link = `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}&tag=rrasal-21&linkCode=ll1`;

  res.redirect(link);
});
app.get("/products", async (req, res) => {
  const drama = req.query.name;

  const outfit = getOutfitKeyword(drama);
  const accessories = getAccessoryKeyword(drama);

  const query = outfit + " " + accessories;

  //  Fake “top products” using keyword blocks
  // (simple version without scraping/API)

  const products = [
  {
    title: "Korean Winter Coat",
    img: "https://images.unsplash.com/photo-1544441893-675973e31985",
    price: "₹1,499",
    link: `https://www.amazon.in/s?k=${encodeURIComponent(outfit)}&tag=rrasal-21&linkCode=ll1`
  },
  {
    title: "Korean Scarf & Gloves",
    img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf",
    price: "₹499",
    link: `https://www.amazon.in/s?k=${encodeURIComponent(accessories)}&tag=rrasal-21&linkCode=ll1`
  },
  {
    title: "Korean Accessories Set",
    img: "https://images.unsplash.com/photo-1585386959984-a41552231658",
    price: "₹599",
    link: `https://www.amazon.in/s?k=${encodeURIComponent(accessories + " set")}&tag=rrasal-21&linkCode=ll1`
  }
];

  res.send(`
  <html>
  <head>
    <title>Shop ${drama}</title>
    <style>
      body { background:#111; color:#fff; font-family:Arial; text-align:center; }
      .grid { display:flex; flex-wrap:wrap; justify-content:center; gap:15px; }
      .card {
        background:#1c1c1c;
        padding:15px;
        border-radius:10px;
        width:180px;
      }
      img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 10px;
}
      a {
        display:block;
        margin-top:10px;
        padding:10px;
        background:#ff3c3c;
        color:white;
        text-decoration:none;
        border-radius:6px;
      }
    </style>
  </head>
  <body>

    <h2>🛍 Shop Inspired by ${drama}</h2>

    <div class="grid">
      ${products.map(p => `
        <div class="card">
          <img src="${p.img}" onerror="this.src='https://via.placeholder.com/200x250?text=Product'">
          <h4>${p.title}</h4>
          <p>${p.price}</p>
          <a href="${p.link}" target="_blank" rel="noopener noreferrer">Buy Now</a>
        </div>
      `).join("")}
    </div>

  </body>
  </html>
  `);
});
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});


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

    const caption = `
🎬 ${d.Title || drama}
⭐ Rating: ${d.imdbRating || "8.5"}/10
🎭 ${d.Genre || "Romance, Drama"}

👉 Download: LINK_HERE
`;

    if (d.Poster && d.Poster !== "N/A") {
      await bot.sendPhoto(process.env.CHANNEL_ID, d.Poster, {
        caption
      });
    } else {
      await bot.sendMessage(process.env.CHANNEL_ID, caption);
    }

  } catch (err) {
    console.log(err);
    await bot.sendMessage(process.env.CHANNEL_ID, `❌ Error fetching data`);
  }
});
