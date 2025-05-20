

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const serviceAccount = require('./firebaseKey.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const LINE_TOKEN = process.env.LINE_TOKEN;

// 儲存 ID
async function saveId(type, id) {
  const ref = db.collection(type === 'user' ? 'users' : 'groups').doc(id);
  await ref.set({ joined: true, timestamp: new Date() });
  console.log(`✅ 已儲存 ${type} ID: ${id}`);
}

// Webhook 記錄 ID
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

// 推播功能
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

// 管理頁面
app.get('/admin', async (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// JSON API
app.get('/api/users', async (req, res) => {
  const snapshot = await db.collection('users').get();
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(users);
});

app.get('/api/groups', async (req, res) => {
  const snapshot = await db.collection('groups').get();
  const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(groups);
});

// 推播 helper
async function pushMessage(to, text) {
  try {
    await axios.post(
      'https://api.line.me/v2/bot/message/push',
      { to, messages: [{ type: 'text', text }] },
      { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${LINE_TOKEN}` } }
    );
    console.log(`✅ 已推播給 ${to}`);
  } catch (e) {
    console.error(`❌ 推播失敗: ${to}`, e.response?.data || e);
  }
}

// 根目錄
app.get('/', (req, res) => {
  res.send('LINE Bot Firestore 推播系統已運行');
});

// 啟動
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('✅ Firebase 推播系統已啟動');
});


// 刪除指定 ID
app.post('/api/delete', async (req, res) => {
  const { type, id } = req.body;
  if (type !== 'user' && type !== 'group') {
    return res.status(400).send('Invalid type');
  }
  await db.collection(type === 'user' ? 'users' : 'groups').doc(id).delete();
  console.log(`🗑️ 已刪除 ${type}: ${id}`);
  res.sendStatus(200);
});



const basicAuth = require('basic-auth');

function protect(req, res, next) {
  const user = basicAuth(req);
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || '123456';

  if (!user || user.name !== adminUser || user.pass !== adminPass) {
    res.set('WWW-Authenticate', 'Basic realm="管理頁面需登入"');
    return res.status(401).send('❌ 權限不足，請登入');
  }
  next();
}


// 套用保護機制於 /admin 與 /api 路由
app.use('/admin', protect);
app.use('/api', protect);
