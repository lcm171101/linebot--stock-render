
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const { appendStockData } = require('./google-sheet.service');

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const USER_ID = process.env.USER_ID;

// Yahoo 股價爬蟲（基本資料）
async function fetchYahooStockData(stockId) {
  const url = `https://tw.stock.yahoo.com/quote/${stockId}.TW`;
  const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const $ = cheerio.load(res.data);

  const name = $('h1.D\(ib\).Fz\(18px\)').text();
  const price = $('span.Fw\(b\).Fz\(36px\)').text();
  const change = $('span.Fz\(24px\).Fw\(600\)').first().text();
  return { stockId, name, price, change };
}

// 模擬技術指標資料
function mockAnalysis(stockId, name, price, change) {
  return [
    new Date().toISOString().split('T')[0],
    stockId, name, price, change, "2.3%", 25302, 20.3,
    920, 910, 905, "2.1%", 67.4, 78.5, 75.3, 1.2, 0.8,
    880, 950, 1200, 300, 100, 1600,
    "法人進場", "放量上漲", "買進", "10.2%", "9.3%"
  ];
}

app.get('/push', async (req, res) => {
  const stocks = ["2330", "2303", "2317"];
  const rows = [];
  let message = "【IC 技術分析摘要】\n";

  for (const id of stocks) {
    const info = await fetchYahooStockData(id);
    const row = mockAnalysis(info.stockId, info.name, info.price, info.change);
    rows.push(row);
    message += `${info.name} ${info.price}（${info.change}）→ ${row[26]}\n`;
  }

  await appendStockData(rows);

  await axios.post("https://api.line.me/v2/bot/message/push", {
    to: USER_ID,
    messages: [
      {
        type: "text",
        text: message + "\n📋 報表：https://docs.google.com/spreadsheets/d/1RK9uzltVKRxeKfVyZS_I8eq564-JfKfanNCyi1vFvG0"
      }
    ]
  }, {
    headers: {
      Authorization: `Bearer ${LINE_TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  res.send("分析推播完成並寫入 Sheets");
});

app.get('/', (req, res) => {
  res.send('LINE Bot with Technical Indicator Integration');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Running..."));
