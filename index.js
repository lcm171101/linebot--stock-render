
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const { appendStockData } = require('./google-sheet.service');

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const USER_ID = process.env.USER_ID;

// Yahoo 股價爬蟲
async function fetchYahooStockData(stockId) {
  const url = `https://tw.stock.yahoo.com/quote/${stockId}.TW`;
  const res = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const $ = cheerio.load(res.data);
  const name = $('h1.D\(ib\).Fz\(18px\)').text();
  const price = $('span.Fw\(b\).Fz\(36px\)').text();
  const change = $('span.Fz\(24px\).Fw\(600\)').first().text();
  return { stockId, name, price, change };
}

// 推播 + 寫入資料
app.get('/push', async (req, res) => {
  const stocks = ["2330", "2303", "2317"];
  const today = new Date().toISOString().split('T')[0];
  let message = `【Yahoo 股價快訊】\n`;
  const rows = [];

  for (const id of stocks) {
    const info = await fetchYahooStockData(id);
    rows.push([today, id, info.name, info.price, info.change]);
    message += `${info.name}：${info.price}（${info.change}）\n`;
  }

  await appendStockData(rows);

  await axios.post('https://api.line.me/v2/bot/message/push', {
    to: USER_ID,
    messages: [{ type: 'text', text: message + "\n報表：https://docs.google.com/spreadsheets/d/1RK9uzltVKRxeKfVyZS_I8eq564-JfKfanNCyi1vFvG0" }],
  }, {
    headers: {
      Authorization: `Bearer ${LINE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  res.send('Pushed and stored.');
});

app.get('/', (req, res) => {
  res.send('Yahoo Stock Bot is running.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Running on port', port);
});
