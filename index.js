
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;

// 自動建立空白 JSON 檔案（如果不存在）
function ensureFileExists(file) {
  const filePath = path.resolve(__dirname, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
    console.log(`🆕 已建立 ${file}`);
  }
}

// 啟動時確保 JSON 檔存在
ensureFileExists('userIds.json');
ensureFileExists('groupIds.json');

// 儲存使用者或群組 ID
function saveId(type, id) {
  const filePath = path.resolve(__dirname, `${type}Ids.json`);
  let ids = [];
  if (fs.existsSync(filePath)) {
    ids = JSON.parse(fs.readFileSync(filePath));
  }
  if (!ids.includes(id)) {
    ids.push(id);
    fs.writeFileSync(filePath, JSON.stringify(ids, null, 2));
    console.log(`✅ 儲存 ${type} ID: ${id}`);
  }
}

// Webhook 接收訊息，偵測是否要加入推播
app.post('/callback', (req, res) => {
  const events = req.body.events || [];
  for (const event of events) {
    const message = event.message?.text || '';
    const source = event.source;

    if (message.includes('我想加入推播')) {
      if (source?.type === 'user' && source.userId) {
        saveId('user', source.userId);
      } else if (source?.type === 'group' && source.groupId) {
        saveId('group', source.groupId);
      }
    }
  }
  res.sendStatus(200);
});

// 推播訊息到使用者
app.get('/push-users', async (req, res) => {
  const userIds = JSON.parse(fs.readFileSync('./userIds.json'));
  for (const id of userIds) {
    await pushMessage(id, '這是對使用者的推播訊息');
  }
  res.send('✅ 已推播給所有使用者');
});

// 推播訊息到群組
app.get('/push-groups', async (req, res) => {
  const groupIds = JSON.parse(fs.readFileSync('./groupIds.json'));
  for (const id of groupIds) {
    await pushMessage(id, '這是對群組的推播訊息');
  }
  res.send('✅ 已推播給所有群組');
});

// 實際呼叫 LINE Push API
async function pushMessage(to, text) {
  try {
    await axios.post(
      'https://api.line.me/v2/bot/message/push',
      {
        to,
        messages: [{ type: 'text', text }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LINE_TOKEN}`
        }
      }
    );
    console.log(`✅ 已推播給 ${to}`);
  } catch (error) {
    console.error(`❌ 推播失敗: ${to}`, error.response?.data || error);
  }
}

// 根目錄說明
app.get('/', (req, res) => {
  res.send('LINE Bot 推播系統已運行');
});

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('✅ 伺服器啟動中...');
});
