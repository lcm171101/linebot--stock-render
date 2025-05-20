
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// 初始化 Firebase Admin
const serviceAccount = require('./firebaseKey.json');
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

const LINE_TOKEN = process.env.LINE_TOKEN;

// 儲存使用者或群組 ID 到 Firestore
async function saveId(type, id) {
  const ref = db.collection(type === 'user' ? 'users' : 'groups').doc(id);
  await ref.set({
    joined: true,
    timestamp: new Date()
  });
  console.log(`✅ 已儲存 ${type} ID: ${id}`);
}

// Webhook 接收訊息，偵測是否要加入推播
app.post('/callback', async (req, res) => {
  const events = req.body.events || [];
  for (const event of events) {
    const message = event.message?.text || '';
    const source = event.source;

    if (message.includes('我想加入推播')) {
      if (source?.type === 'user' && source.userId) {
        await saveId('user', source.userId);
      } else if (source?.type === 'group' && source.groupId) {
        await saveId('group', source.groupId);
      }
    }
  }
  res.sendStatus(200);
});

// 從 Firestore 讀取並推播訊息
app.get('/push-users', async (req, res) => {
  const snapshot = await db.collection('users').get();
  for (const doc of snapshot.docs) {
    await pushMessage(doc.id, '這是對使用者的推播訊息');
  }
  res.send('✅ 已推播給所有使用者');
});

app.get('/push-groups', async (req, res) => {
  const snapshot = await db.collection('groups').get();
  for (const doc of snapshot.docs) {
    await pushMessage(doc.id, '這是對群組的推播訊息');
  }
  res.send('✅ 已推播給所有群組');
});

// 呼叫 LINE Push API
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

// 根目錄
app.get('/', (req, res) => {
  res.send('LINE Bot Firestore 推播系統已運行');
});

// 啟動伺服器
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('✅ Firebase 推播系統已啟動');
});
