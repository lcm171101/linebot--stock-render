
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;

app.post('/callback', (req, res) => {
  console.log("✅ 收到 LINE Webhook！");
  console.log(JSON.stringify(req.body, null, 2)); // 顯示群組 ID 或 userId
  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('LINE Bot Callback 測試版運行中');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('✅ 伺服器啟動中（群組 ID 監聽中）...');
});
