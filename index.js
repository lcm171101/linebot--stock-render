
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const USER_ID = process.env.USER_ID;

// Webhook 回覆
app.post('/callback', async (req, res) => {
  const event = req.body.events?.[0];
  if (event && event.type === 'message') {
    const message = {
      type: 'text',
      text: `您說的是：「${event.message.text}」`,
    };
    await axios.post('https://api.line.me/v2/bot/message/reply', {
      replyToken: event.replyToken,
      messages: [message],
    }, {
      headers: {
        Authorization: `Bearer ${LINE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  }
  res.sendStatus(200);
});

// /push：每日分析推播（模擬內容）
app.get('/push', async (req, res) => {
  const msg = `【IC 類股速報】
台積電 924 元（+2.3%）PER: 20.3 → 可考慮買進
聯發科 1285 元（-3.1%）PER: 19.2 → 法人出貨警示
報表：https://your-report-link`;

  await axios.post('https://api.line.me/v2/bot/message/push', {
    to: USER_ID,
    messages: [{ type: 'text', text: msg }],
  }, {
    headers: {
      Authorization: `Bearer ${LINE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  res.send('Push sent.');
});

// 基本測試
app.get('/', (req, res) => {
  res.send('LINE Stock Bot is running.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Running on port', port);
});
