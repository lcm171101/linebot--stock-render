const express = require('express');
const bodyParser = require('body-parser');
const db = require('./firebase');
const { analyzeStock } = require('./analyzer');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

async function getStockList() {
  const doc = await db.collection('config').doc('stocks').get();
  if (doc.exists && Array.isArray(doc.data().list)) {
    return doc.data().list;
  }
  return [];
}

async function saveStockList(list) {
  await db.collection('config').doc('stocks').set({ list });
}

async function analyzeAll() {
  const stockList = await getStockList();
  for (const stock of stockList) {
    const result = await analyzeStock(stock);
    await db.collection('stock_analysis').doc(stock).set(result);
  }
  console.log("✅ 股票分析完成");
}

app.get('/cron-analyze', async (req, res) => {
  await analyzeAll();
  res.send('✅ 外部排程觸發分析完成');
});

app.get('/stocks/list', async (req, res) => {
  const list = await getStockList();
  res.json({ list });
});

app.post('/stocks/add', async (req, res) => {
  const { stockId } = req.body;
  if (!stockId) return res.status(400).json({ error: '缺少 stockId' });
  const list = await getStockList();
  if (!list.includes(stockId)) {
    list.push(stockId);
    await saveStockList(list);
  }
  res.json({ success: true, list });
});

app.post('/stocks/remove', async (req, res) => {
  const { stockId } = req.body;
  if (!stockId) return res.status(400).json({ error: '缺少 stockId' });
  let list = await getStockList();
  list = list.filter(id => id !== stockId);
  await saveStockList(list);
  res.json({ success: true, list });
});

app.get('/', async (req, res) => {
  const snapshot = await db.collection('stock_analysis').get();
  const data = [];
  snapshot.forEach(doc => data.push(doc.data()));
  const html = `
  <html><head><title>分析結果</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head>
  <body class="p-4"><h2>📊 股票分析結果</h2>
  <table class="table table-bordered table-sm"><thead><tr>
    <th>股票代號</th><th>目前本益比</th><th>15年平均</th><th>15年最高</th><th>15年最低</th>
    <th>MA5</th><th>MA20</th><th>MA60</th><th>RSI</th><th>K</th><th>D</th><th>MACD DIF</th><th>MACD OSC</th>
    <th>更新時間</th></tr></thead><tbody>
    ${data.map(d => `<tr>
      <td>${d.stockId}</td><td>${d.pe.current}</td><td>${d.pe.avg15y}</td><td>${d.pe.max15y}</td><td>${d.pe.min15y}</td>
      <td>${d.tech.MA5}</td><td>${d.tech.MA20}</td><td>${d.tech.MA60}</td><td>${d.tech.RSI14}</td>
      <td>${d.tech.K}</td><td>${d.tech.D}</td><td>${d.tech.MACD_DIF}</td><td>${d.tech.MACD_OSC}</td><td>${d.timestamp}</td>
    </tr>`).join('')}</tbody></table>
  <a href="/analyze" class="btn btn-primary">手動分析</a>
  </body></html>`;
  res.send(html);
});

app.get('/analyze', async (req, res) => {
  await analyzeAll();
  res.redirect('/');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ 分析伺服器啟動於 http://localhost:${port}`);
});