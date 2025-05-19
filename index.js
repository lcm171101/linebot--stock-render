
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const USER_ID = process.env.USER_ID;

async function fetchYahooStockData(stockId) {
  const url = `https://tw.stock.yahoo.com/quote/${stockId}.TW`;
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(res.data);

  const name = $('h1.D\(ib\).Fz\(18px\)').text().trim();
  const price = $('span.Fw\(b\).Fz\(36px\)').text().trim();
  const change = $('span.Fz\(24px\).Fw\(600\)').first().text().trim();

  return { stockId, name, price, change };
}

// 模擬技術分析邏輯
function generateAnalysis(stockId, name, price, change) {
  // 假設模擬資料（可改為真實計算）
  const rsi = Math.floor(Math.random() * 50) + 30; // 30~80
  const k = Math.floor(Math.random() * 80);
  const d = Math.floor(Math.random() * 80);
  const macd = Math.random() > 0.5 ? "多頭趨勢" : "空頭趨勢";
  const foreignBuy = Math.floor(Math.random() * 3000 - 1500); // -1500~1500

  const signals = [];
  if (rsi > 70) signals.push("RSI 超買");
  else if (rsi < 30) signals.push("RSI 超賣");

  if (k > d + 10) signals.push("黃金交叉");
  else if (d > k + 10) signals.push("死亡交叉");

  signals.push(macd);

  if (foreignBuy > 1000) signals.push("外資大買");
  else if (foreignBuy < -1000) signals.push("外資大賣");

  const suggestion = signals.includes("黃金交叉") && foreignBuy > 0 ? "可考慮買進" : "觀望";

  return `${name} ${price}（${change}）→ ${suggestion}
📈 指標：RSI ${rsi}、K=${k} D=${d}、MACD=${macd}
📊 法人：外資買賣超 ${foreignBuy} 張
📌 評估：${signals.join("、")}`;
}

app.get('/push', async (req, res) => {
  const stockIds = ["2330", "2303", "2317"];
  const messages = [];

  for (const id of stockIds) {
    const info = await fetchYahooStockData(id);
    const analysis = generateAnalysis(info.stockId, info.name, info.price, info.change);
    messages.push(analysis);
  }

  const text = `【IC 類股技術分析】\n\n` + messages.join("\n\n");

  await axios.post("https://api.line.me/v2/bot/message/push", {
    to: USER_ID,
    messages: [{ type: 'text', text }]
  }, {
    headers: {
      Authorization: `Bearer ${LINE_TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  res.send("技術分析推播完成");
});

app.get('/', (req, res) => {
  res.send('LINE Bot 技術分析版運行中');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running...'));
