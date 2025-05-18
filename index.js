
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { appendStockData } = require('./google-sheet.service');
const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const USER_ID = process.env.USER_ID;

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

app.get('/push', async (req, res) => {
  const rows = [
    [ "2025-05-18", "台積電", "2330", 924, "+4.0", "2.3%", 25302, 20.3, 67.4, 78.5, "多頭", "買進", "法人進場" ]
  ];
  await appendStockData(rows);

  const msg = `【IC 類股推播】
台積電 924 元（+2.3%）PER: 20.3 → 法人進場訊號
📋 報表：https://docs.google.com/spreadsheets/d/1RK9uzltVKRxeKfVyZS_I8eq564-JfKfanNCyi1vFvG0`;

  await axios.post('https://api.line.me/v2/bot/message/push', {
    to: USER_ID,
    messages: [{ type: 'text', text: msg }],
  }, {
    headers: {
      Authorization: `Bearer ${LINE_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  res.send('Push sent and data written to Google Sheet.');
});

app.get('/', (req, res) => {
  res.send('LINE Bot with Google Sheets is running.');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Running on port', port);
});
