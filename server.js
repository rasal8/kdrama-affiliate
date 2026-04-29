require("dotenv").config();

const express = require("express");
const app = express();

const TelegramBot = require("node-telegram-bot-api");

let bot;

if (!global.telegramBot) {
  bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: {
      autoStart: false
    }
  });

  bot.startPolling();

  global.telegramBot = bot;

  bot.on("polling_error", (error) => {
    console.log("Polling error:", error.message);
  });

} else {
  bot = global.telegramBot;
}

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
// 🔥 AMAZON API CONFIG
const crypto = require("crypto");

const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const PARTNER_TAG = process.env.PARTNER_TAG;

const HOST = "webservices.amazon.in";
const REGION = "eu-west-1";
const SERVICE = "ProductAdvertisingAPI";
const ENDPOINT = "https://webservices.amazon.in/paapi5/searchitems";

// ---------- intent ----------
function detectIntent(text){
  const t = (text || "").toLowerCase();

  if(t.includes("business") || t.includes("office"))
    return "korean office blazer women";

  if(t.includes("school"))
    return "korean college outfit women";

  if(t.includes("winter") || t.includes("coat"))
    return "korean wool coat women";

  return "korean fashion outfit women";
}

// ---------- signing ----------
function hmac(key, data){ return crypto.createHmac("sha256", key).update(data).digest(); }
function hash(data){ return crypto.createHash("sha256").update(data).digest("hex"); }

function getSignatureKey(key, dateStamp, regionName, serviceName){
  const kDate = hmac("AWS4" + key, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  return hmac(kService, "aws4_request");
}

// ---------- search ----------
async function searchAmazon(keywords){
  const payload = JSON.stringify({
    Keywords: keywords,
    SearchIndex: "Fashion",
    PartnerTag: PARTNER_TAG,
    PartnerType: "Associates",
    Marketplace: "www.amazon.in",
    Resources: [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "CustomerReviews.StarRating"
    ]
  });

  const amzdate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const datestamp = amzdate.slice(0,8);

  const canonicalHeaders =
    "content-type:application/json; charset=utf-8\n" +
    "host:" + HOST + "\n" +
    "x-amz-date:" + amzdate + "\n" +
    "x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems\n";

  const signedHeaders =
    "content-type;host;x-amz-date;x-amz-target";

  const canonicalRequest =
    "POST\n" +
    "/paapi5/searchitems\n" +
    "\n" +
    canonicalHeaders +
    signedHeaders + "\n" +
    require("crypto").createHash("sha256").update(payload).digest("hex");

  const stringToSign =
    "AWS4-HMAC-SHA256\n" +
    amzdate + "\n" +
    `${datestamp}/${REGION}/${SERVICE}/aws4_request\n` +
    require("crypto").createHash("sha256").update(canonicalRequest).digest("hex");

  const signingKey = getSignatureKey(SECRET_KEY, datestamp, REGION, SERVICE);

  const signature = require("crypto")
    .createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${datestamp}/${REGION}/${SERVICE}/aws4_request, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Encoding": "amz-1.0",
    "X-Amz-Date": amzdate,
    "X-Amz-Target": "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems",
    "Authorization": authorizationHeader,
    "Host": HOST
  };

  const res = await axios.post(ENDPOINT, payload, { headers });

  return (res.data.SearchResult?.Items || []).map(it => ({
    title: it.ItemInfo?.Title?.DisplayValue,
    price: it.Offers?.Listings?.[0]?.Price?.DisplayAmount,
    rating: it.CustomerReviews?.StarRating || 0,
    link: it.DetailPageURL
  }));
                                                   }

function pickBest(list){
  return list
    .filter(p => p.title && p.link)
    .sort((a,b) => (b.rating||0) - (a.rating||0))
    .slice(0,3);
  }
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
  t: searchName,
  type: "series"
      }
    });

    if (searchRes.data.Response === "False") {
      return res.send("❌ No result found");
    }

    const data = searchRes.data;

if (data.Response === "False") {
  return res.send("❌ No result found");
}

    // ✅ filter
    const filtered = results.filter(r =>
      r.Type === "series" || r.Type === "movie"
    );

    results = filtered.length ? filtered : results;

    // ✅ scoring
    const scored = results.map(item => ({
      ...item,
      score: similarity(searchName, item.Title)
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
app.get("/drama-products", async (req, res) => {
  try {
    const drama = req.query.drama || "";
    const scene = req.query.scene || "";

    const keywords = detectIntent(drama + " " + scene);
    const items = await searchAmazon(keywords);
    const best = pickBest(items);

    res.json(best);
  } catch (e) {
  console.log("STATUS:", e.response?.status);
  console.log("DATA:", JSON.stringify(e.response?.data, null, 2));
  console.log("MSG:", e.message);

  res.status(500).json({ error: "Amazon fetch failed" });
  }
});
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
function getOutfitKeyword(drama, genre = "") {
  const d = (drama || "").toLowerCase();
  const g = (genre || "").toLowerCase();

  if (d.includes("doctor") || d.includes("hospital"))
    return "korean doctor coat outfit";

  if (d.includes("business") || d.includes("office"))
    return "korean office blazer outfit";

  if (d.includes("school") || d.includes("college"))
    return "korean school uniform outfit";

  if (g.includes("romance"))
    return "korean romantic date outfit dress";

  if (g.includes("action"))
    return "korean street style outfit men";

  if (g.includes("fantasy"))
    return "korean winter coat aesthetic";

  return `${drama} korean outfit style`;
}

function shuffle(arr = []) {
  return arr.sort(() => 0.5 - Math.random());
}


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

// 1. Keyword (drama + genre)
const outfitKeyword = getOutfitKeyword(drama, d.Genre);

const intent = detectIntent(outfitKeyword);
const items = await searchAmazon(intent);
const products = pickBest(items);

const safeProducts = [
  products?.[0],
  products?.[1],
  products?.[2]
];
    const caption = `
✨ Inspired by ${d.Title || drama}

⭐ ${d.imdbRating || "8.5"}/10 | Korean Aesthetic  
🎭 Vibe: ${d.Genre || "Romance, Drama"}

💫 Steal Her Look 👇
💡 Style Match: ${outfitKeyword}
`;

    const buttons = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "🔥 Lead Coat", url: safeProducts[0].link },
        { text: "💖 Dress Look", url: safeProducts[1].link }
      ],
      [
        { text: "✨ Soft Sweater", url: safeProducts[2].link }
      ],
      [
        { text: "🛍 Full Outfit", url: safeProducts[0]?.link }
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
    console.log(err);
    console.log("FULL ERROR:", err.response?.data || err.message);

await bot.sendMessage(
  process.env.CHANNEL_ID,
  `❌ Error: ${err.message}`
);
  }
});
