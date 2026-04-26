import express from "express";
import axios from "axios";
import { CONFIG } from "./config.js";
import { generateHTML } from "./template.js";

const app = express();

function getKeywords(drama) {
  return [
    `${drama} outfit`,
    `${drama} fashion`,
    "korean jacket women",
    "korean hoodie men",
    "korean dress korea style"
  ];
}

async function getProducts(keyword) {
  try {
    const url = `https://api.rainforestapi.com/request?api_key=${CONFIG.RAINFOREST_API}&type=search&amazon_domain=amazon.in&search_term=${encodeURIComponent(keyword)}`;
    const res = await axios.get(url);
    const items = res.data.search_results || [];

    return items.slice(0, 5).map(item => ({
      title: item.title,
      image: item.image,
      link: item.link
    }));

  } catch (err) {
    console.log("Product fetch error:", err.message);
    return [];
  }
}

async function convertLink(url) {
  try {
    const res = await axios.post("https://api.earnkaro.com/link", {
      url: url,
      api_key: CONFIG.EARNKARO_API
    });
    return res.data?.short_url || url;
  } catch {
    return url;
  }
}

async function postToBlogger(title, content) {
  try {
    const url = `https://www.googleapis.com/blogger/v3/blogs/${CONFIG.BLOG_ID}/posts/?key=${CONFIG.BLOGGER_API}`;
    await axios.post(url, {
      kind: "blogger#post",
      title,
      content
    });
  } catch (err) {
    console.log("Blogger error:", err.message);
  }
}

async function postToTelegram(text) {
  try {
    const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: CONFIG.CHANNEL_ID,
      text
    });
  } catch (err) {
    console.log("Telegram error:", err.message);
  }
}

app.get("/generate", async (req, res) => {
  const drama = req.query.drama;
  if (!drama) return res.send("Enter drama name like ?drama=Goblin");

  const keywords = getKeywords(drama);
  let allProducts = [];

  for (let keyword of keywords) {
    const products = await getProducts(keyword);
    for (let p of products) {
      p.link = await convertLink(p.link);
    }
    allProducts.push(...products);
  }

  const finalProducts = allProducts.slice(0, 10);
  const html = generateHTML(drama, finalProducts);

  await postToBlogger(`${drama} Fashion Collection`, html);
  await postToTelegram(`🔥 ${drama} Fashion Collection Live!`);

  res.send(html);
});

app.listen(CONFIG.PORT, () => {
  console.log(`Server running on port ${CONFIG.PORT}`);
});
