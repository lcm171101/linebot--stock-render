
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const USER_ID = process.env.USER_ID;

app.post('/callback', async (req, res) => {
  const event = req.body.events?.[0];
  if (event && event.type === 'message') {
    const replyToken = event.replyToken;
    const message = {
      type: 'text',
      text: '您剛傳的是：「' + event.message.text + '」\n這是自動回覆測試。',
    };
    await axios.post('https://api.line.me/v2/bot/message/reply', {
      replyToken,
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

app.get('/push', async (req, res) => {
  const message = {
    type: 'text',
    text: '【IC 類股推播範例】\n台積電 924 元（+4.00）\n完整報表：https://your-report-link',
  };
  await axios.post('https://api.line.me/v2/bot/message/push', {
    to: USER_ID,
    messages: [message],
  }, {
    headers: {
      Authorization: `Bearer ${LINE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  res.send('Push sent');
});

app.get('/', (req, res) => {
  res.send('LINE Bot is running.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
